<template>
  <QyModal
    v-model:visible="dialogVisible"
    title="充值"
    width="500px"
    :mask-closable="false"
    @close="handleClose"
  >
    <QyForm v-model="form" :rules="rules" ref="formRef" label-width="80px">
      <QyFormItem label="充值金额" prop="amount">
        <el-input-number
          v-model="form.amount"
          :min="1"
          :max="10000"
          :precision="2"
          :step="100"
          style="width: 100%"
        />
        <div class="amount-tips">
          <Tag
            v-for="item in quickAmounts"
            :key="item"
            size="sm"
            @click="selectAmount(item)"
            style="cursor: pointer; margin-right: 8px; margin-top: 8px"
          >
            ¥{{ item }}
          </Tag>
        </div>
      </QyFormItem>

      <QyFormItem label="支付方式" prop="method">
        <QyRadioGroup v-model="form.method">
          <QyRadio value="alipay">
            <span class="payment-option">
              <i class="el-icon-money"></i>
              支付宝
            </span>
          </QyRadio>
          <QyRadio value="wechat">
            <span class="payment-option">
              <i class="el-icon-chat-dot-round"></i>
              微信支付
            </span>
          </QyRadio>
          <QyRadio value="bank">
            <span class="payment-option">
              <i class="el-icon-bank-card"></i>
              银行卡
            </span>
          </QyRadio>
        </QyRadioGroup>
      </QyFormItem>

      <QyAlert title="充值说明" type="info" :closable="false" show-icon style="margin-bottom: 16px">
        <template #default>
          <ul style="margin: 0; padding-left: 20px">
            <li>单笔充值金额：1-10000元</li>
            <li>充值后余额实时到账</li>
            <li>充值金额不支持退款</li>
          </ul>
        </template>
      </QyAlert>
    </QyForm>

    <template #footer>
      <QyButton @click="handleClose">取消</QyButton>
      <QyButton variant="primary" :loading="loading" @click="handleSubmit"> 确认充值 </QyButton>
    </template>
  </QyModal>

  <!-- 二次确认对话框 -->
  <QyConfirmDialog
    v-model:visible="confirmDialogVisible"
    title="确认充值"
    message="请确认充值信息"
    type="warning"
    :details="confirmDetails"
    :loading="loading"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { FormRules } from '@/design-system/form/Form/types'
import type { RechargeParams } from '@/types/shared'
import { yuanToCents } from '@/utils/currency'
import {
  QyConfirmDialog,
  QyModal,
  QyForm,
  QyFormItem,
  QyRadioGroup,
  QyRadio,
  QyAlert,
  QyButton,
} from '@/design-system/components'
import { Tag } from '@/design-system/base'
import type { ConfirmDetail } from '@/design-system/components'

interface Props {
  modelValue: boolean
  loading?: boolean
}

interface Emits {
  (_e: 'update:modelValue', value: boolean): void
  (_e: 'confirm', data: RechargeParams): void
}

const emit = defineEmits<Emits>()

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const confirmDialogVisible = ref(false)

// 快速充值金额
const quickAmounts = [10, 50, 100, 200, 500, 1000]

// 表单数据（用户输入，单位：元）
const form = ref<RechargeParams>({
  amount: 100,
  method: 'alipay',
})

// 表单验证规则
const rules: FormRules = {
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    {
      min: 1,
      max: 10000,
      message: '充值金额必须在1-10000之间',
      trigger: 'blur',
      validator: (_rule, value) => {
        if (typeof value !== 'number') return false
        return value >= 1 && value <= 10000
      },
    },
  ],
  method: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
  },
  { immediate: true },
)

// 选择快速金额
const selectAmount = (amount: number) => {
  form.value.amount = amount
}

// 支付方式名称映射
const paymentMethodMap: Record<string, string> = {
  alipay: '支付宝',
  wechat: '微信支付',
  bank: '银行卡',
}

// 确认详情
const confirmDetails = computed<ConfirmDetail[]>(() => [
  {
    label: '充值金额',
    value: `¥${form.value.amount.toFixed(2)}`,
  },
  {
    label: '支付方式',
    value: paymentMethodMap[form.value.method] || form.value.method,
  },
])

// 提交充值（显示二次确认）
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      confirmDialogVisible.value = true
    }
  })
}

// 确认充值（二次确认后）
const handleConfirm = () => {
  // 将元转换为分后再提交
  const data: RechargeParams = {
    amount: yuanToCents(form.value.amount),
    method: form.value.method,
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
.amount-tips {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.payment-option {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.el-radio) {
  margin-right: 0;
  height: auto;
}
</style>
