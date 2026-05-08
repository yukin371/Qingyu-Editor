<template>
  <el-dialog
    v-model="dialogVisible"
    title="申请提现"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="可用余额">
        <div class="available-balance">¥{{ availableAmountDisplay.toFixed(2) }}</div>
      </el-form-item>

      <el-form-item label="提现金额" prop="amount">
        <el-input-number
          v-model="form.amount"
          :min="1"
          :max="availableAmountDisplay"
          :precision="2"
          :step="100"
          style="width: 100%"
          placeholder="请输入提现金额"
        />
        <el-button type="text" @click="withdrawAll" style="margin-top: 8px">
          全部提现
        </el-button>
      </el-form-item>

      <el-form-item label="提现账户" prop="account">
        <el-input
          v-model="form.account"
          placeholder="请输入支付宝账号或银行卡号"
          maxlength="100"
          show-word-limit
        />
        <div class="account-tips">
          支持支付宝账号或银行卡号，格式如：支付宝:user@example.com
        </div>
      </el-form-item>

      <el-alert
        title="提现规则"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      >
        <template #default>
          <ul style="margin: 0; padding-left: 20px">
            <li>最低提现金额：1元</li>
            <li>提现申请需要管理员审核</li>
            <li>审核通过后1-3个工作日到账</li>
            <li>每天最多申请3次提现</li>
          </ul>
        </template>
      </el-alert>

      <div class="withdraw-summary">
        <div class="summary-item">
          <span>提现金额</span>
          <span class="amount">¥{{ form.amount.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span>手续费</span>
          <span class="fee">¥{{ fee.toFixed(2) }}</span>
        </div>
        <div class="summary-item total">
          <span>实际到账</span>
          <span class="actual-amount">¥{{ actualAmount.toFixed(2) }}</span>
        </div>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确认提现
      </el-button>
    </template>
  </el-dialog>

  <!-- 二次确认对话框 -->
  <QyConfirmDialog
    v-model:visible="confirmDialogVisible"
    title="确认提现"
    message="请确认提现信息"
    type="warning"
    :details="confirmDetails"
    :loading="loading"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { WithdrawParams } from '@/types/shared'
import { yuanToCents, centsToYuan } from '@/utils/currency'
import { QyConfirmDialog } from '@/design-system/components'
import type { ConfirmDetail } from '@/design-system/components'

interface Props {
  modelValue: boolean
  availableAmount: number
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: WithdrawParams): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  availableAmount: 0 // 单位：分
})

const emit = defineEmits<Emits>()

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const confirmDialogVisible = ref(false)

// 表单数据（用户输入，单位：元）
const form = ref<WithdrawParams>({
  amount: 0,
  account: '',
  accountType: 'alipay'
})

// 手续费率 (1%)
const feeRate = 0.01

// 可用余额显示（分转元）
const availableAmountDisplay = computed(() => {
  return centsToYuan(props.availableAmount)
})

// 计算手续费
const fee = computed(() => {
  return form.value.amount * feeRate
})

// 计算实际到账金额
const actualAmount = computed(() => {
  return Math.max(0, form.value.amount - fee.value)
})

// 表单验证规则
const rules: FormRules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    {
      type: 'number',
      min: 1,
      message: '提现金额不能少于1元',
      trigger: 'blur'
    },
    {
      validator: (_rule, value, callback) => {
        if (value > availableAmountDisplay.value) {
          callback(new Error('提现金额不能超过可用余额'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  account: [
    { required: true, message: '请输入提现账户', trigger: 'blur' },
    { min: 5, max: 100, message: '账户信息长度在5-100个字符', trigger: 'blur' }
  ]
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
    if (val) {
      // 重置表单
      form.value.amount = 0
      form.value.account = ''
    }
  },
  { immediate: true }
)

// 全部提现
const withdrawAll = () => {
  form.value.amount = availableAmountDisplay.value
}

// 确认详情
const confirmDetails = computed<ConfirmDetail[]>(() => [
  {
    label: '提现金额',
    value: `¥${form.value.amount.toFixed(2)}`
  },
  {
    label: '手续费',
    value: `¥${fee.value.toFixed(2)}`
  },
  {
    label: '实际到账',
    value: `¥${actualAmount.value.toFixed(2)}`
  },
  {
    label: '提现账户',
    value: form.value.account
  }
])

// 提交提现（显示二次确认）
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      confirmDialogVisible.value = true
    }
  })
}

// 确认提现（二次确认后）
const handleConfirm = () => {
  // 将元转换为分后再提交
  const data: WithdrawParams = {
    amount: yuanToCents(form.value.amount),
    account: form.value.account,
    accountType: form.value.accountType
  }
  emit('confirm', data)
  confirmDialogVisible.value = false
}

// 关闭对话框
const handleClose = () => {
  emit('update:modelValue', false)
  formRef.value?.resetFields()
}
</script>

<style scoped lang="scss">
.available-balance {
  font-size: 24px;
  font-weight: bold;
  color: #67c23a;
}

.account-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.withdraw-summary {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: #606266;

  &:not(:last-child) {
    border-bottom: 1px solid #ebeef5;
  }

  &.total {
    margin-top: 8px;
    padding-top: 16px;
    font-size: 16px;
    font-weight: bold;
    color: #303133;
  }

  .amount {
    color: #f56c6c;
    font-weight: 600;
  }

  .fee {
    color: #e6a23c;
  }

  .actual-amount {
    color: #67c23a;
    font-size: 20px;
  }
}
</style>

