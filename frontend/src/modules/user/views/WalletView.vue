<template>
  <Container maxWidth="lg" padding>
    <Section title="我的钱包" spacing="lg">
      <template #extra>
        <div class="header-actions">
          <QyButton variant="primary" @click="showRechargeDialog = true">
            <QyIcon name="Plus" />
            充值
          </QyButton>
          <QyButton @click="goToTransfer">
            <QyIcon name="Sort" />
            转账
          </QyButton>
          <QyButton @click="showWithdrawDialog = true">
            <QyIcon name="Minus" />
            提现
          </QyButton>
        </div>
      </template>

      <!-- 钱包余额 -->
      <Grid :cols="{ md: 3, sm: 1 }" gap="lg" class="wallet-stats">
        <QyCard shadow="hover" class="stat-card balance-card">
          <div class="stat-content">
            <div class="stat-icon balance-icon">
              <QyIcon name="Wallet" :size="32" />
            </div>
            <div class="stat-info">
              <div class="stat-label">账户余额</div>
              <div class="stat-value primary">¥{{ formatAmount(walletInfo.balance) }}</div>
            </div>
          </div>
        </QyCard>

        <QyCard shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon income-icon">
              <QyIcon name="TrendCharts" :size="32" />
            </div>
            <div class="stat-info">
              <div class="stat-label">累计收入</div>
              <div class="stat-value success">¥{{ formatAmount(walletInfo.totalIncome || 0) }}</div>
            </div>
          </div>
        </QyCard>

        <QyCard shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon expense-icon">
              <QyIcon name="ShoppingCart" :size="32" />
            </div>
            <div class="stat-info">
              <div class="stat-label">累计消费</div>
              <div class="stat-value danger">¥{{ formatAmount(walletInfo.totalExpense || 0) }}</div>
            </div>
          </div>
        </QyCard>
      </Grid>

      <!-- 交易记录 -->
      <QyCard shadow="hover" class="transaction-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">交易记录</span>
            <el-select
              v-model="transactionType"
              placeholder="交易类型"
              style="width: 120px"
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="充值" value="recharge" />
              <el-option label="消费" value="consume" />
              <el-option label="收入" value="income" />
              <el-option label="提现" value="withdraw" />
            </el-select>
          </div>
        </template>

        <el-table :data="transactions" v-loading="loading" stripe empty-text="暂无交易记录">
          <el-table-column prop="created_at" label="时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <Tag :variant="getTypeTagColor(row.type)">
                {{ getTypeLabel(row.type) }}
              </Tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" min-width="200" />
          <el-table-column prop="amount" label="金额" width="150" align="right">
            <template #default="{ row }">
              <span :class="row.amount > 0 ? 'amount-income' : 'amount-outcome'">
                {{ row.amount > 0 ? '+' : '' }}¥{{ formatAmount(Math.abs(row.amount)) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="balance" label="余额" width="150" align="right">
            <template #default="{ row }"> ¥{{ formatAmount(row.balance || 0) }} </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <QyPagination
            v-model="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            :layout="['total', 'sizes', 'prev', 'pager', 'next', 'jumper']"
            @change="loadTransactions"
          />
        </div>
      </QyCard>
    </Section>

    <!-- 充值对话框 -->
    <QyModal
      v-model:visible="showRechargeDialog"
      title="账户充值"
      width="520px"
      :mask-closable="false"
    >
      <FormSection label="选择金额" required>
        <div class="amount-grid">
          <div
            v-for="amount in rechargeAmounts"
            :key="amount"
            class="amount-item"
            :class="{ active: rechargeAmount === amount && !customAmount }"
            @click="selectRechargeAmount(amount)"
          >
            <div class="amount-value">¥{{ amount }}</div>
          </div>
        </div>
      </FormSection>

      <FormSection label="自定义金额" hint="最低充值金额为10元">
        <Input v-model="customAmount" placeholder="请输入充值金额" type="number">
          <template #prefix>¥</template>
        </Input>
      </FormSection>

      <FormSection label="支付方式" required>
        <QyRadioGroup v-model="paymentMethod" class="payment-methods">
          <QyRadio value="alipay" variant="border">
            <div class="payment-option">
              <QyIcon name="CreditCard" :size="20" />
              <span>支付宝</span>
            </div>
          </QyRadio>
          <QyRadio value="wechat" variant="border">
            <div class="payment-option">
              <QyIcon name="ChatDotSquare" :size="20" />
              <span>微信支付</span>
            </div>
          </QyRadio>
        </QyRadioGroup>
      </FormSection>

      <template #footer>
        <QyButton @click="showRechargeDialog = false">取消</QyButton>
        <QyButton variant="primary" @click="submitRecharge" :loading="recharging">
          确认充值
        </QyButton>
      </template>
    </QyModal>

    <!-- 提现对话框 -->
    <QyModal
      v-model:visible="showWithdrawDialog"
      title="申请提现"
      width="520px"
      :mask-closable="false"
    >
      <QyForm v-model="withdrawForm" :rules="withdrawRules" ref="withdrawFormRef">
        <FormSection label="可提现余额">
          <div class="available-balance">¥{{ formatAmount(walletInfo.availableAmount) }}</div>
        </FormSection>

        <QyFormItem prop="amount" label="提现金额" required>
          <div class="form-hint">单笔提现最低10元，最高10000元</div>
          <Input v-model="withdrawForm.amount" placeholder="请输入提现金额" type="number">
            <template #prefix>¥</template>
          </Input>
        </QyFormItem>

        <QyFormItem prop="account" label="提现账号" required>
          <div class="form-hint">请填写您的支付宝账号或银行卡号</div>
          <Input v-model="withdrawForm.account" placeholder="请输入提现账号" />
        </QyFormItem>

        <QyFormItem prop="method" label="提现方式" required>
          <QyRadioGroup v-model="withdrawForm.method" class="payment-methods">
            <QyRadio value="alipay" variant="border">支付宝</QyRadio>
            <QyRadio value="wechat" variant="border">微信</QyRadio>
            <QyRadio value="bank" variant="border">银行卡</QyRadio>
          </QyRadioGroup>
        </QyFormItem>

        <QyFormItem prop="password" label="支付密码" required>
          <Input v-model="withdrawForm.password" placeholder="请输入支付密码" type="password" />
        </QyFormItem>
      </QyForm>

      <template #footer>
        <QyButton @click="showWithdrawDialog = false">取消</QyButton>
        <QyButton variant="primary" @click="submitWithdraw" :loading="withdrawing">
          确认提现
        </QyButton>
      </template>
    </QyModal>

    <LoadingOverlay :visible="pageLoading" text="加载中..." />
  </Container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from '@/design-system/services'
import type { FormRules } from '@/design-system/form/Form/types'
import { message } from '@/design-system/services'
import {
  QyIcon,
  QyButton,
  QyCard,
  QyPagination,
  QyModal,
  QyForm,
  QyFormItem,
  QyRadioGroup,
  QyRadio,
} from '@/design-system/components'
import { Tag, Input } from '@/design-system/base'
import {
  Container,
  Section,
  Grid,
  FormSection,
  LoadingOverlay,
} from '@/shared/components/design-system'
import { walletAPI } from '@/modules/finance/api/wallet'
import type {
  WalletInfo,
  WalletPaymentMethod,
  WalletTransaction as Transaction,
} from '@/modules/finance/api'

const router = useRouter()

// 加载状态
const loading = ref(false)
const pageLoading = ref(false)
const recharging = ref(false)
const withdrawing = ref(false)

// 对话框状态
const showRechargeDialog = ref(false)
const showWithdrawDialog = ref(false)

// 钱包信息
const walletInfo = ref<WalletInfo>({
  userId: '',
  balance: 0,
  balanceCents: 0,
  availableAmount: 0,
  availableAmountCents: 0,
  frozenAmount: 0,
  frozenAmountCents: 0,
  totalIncome: 0,
  totalExpense: 0,
  totalIncomeCents: 0,
  totalExpenseCents: 0,
  frozen: false,
})

// 交易记录
const transactions = ref<Transaction[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const transactionType = ref('')

// 充值相关
const rechargeAmounts = [10, 50, 100, 200, 500, 1000]
const rechargeAmount = ref(0)
const customAmount = ref(0)
const paymentMethod = ref<WalletPaymentMethod>('alipay')

// 提现相关
const withdrawFormRef = ref<FormInstance>()
const withdrawForm = reactive({
  amount: 0,
  account: '',
  method: 'alipay' as WalletPaymentMethod,
  password: '',
})

const withdrawRules: FormRules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    {
      min: 10,
      max: 10000,
      message: '提现金额应在10-10000元之间',
      trigger: 'blur',
      validator: (_rule, value) => {
        if (typeof value !== 'number') return false
        return value >= 10 && value <= 10000
      },
    },
  ],
  account: [
    { required: true, message: '请输入提现账号', trigger: 'blur' },
    { min: 5, max: 50, message: '账号长度应在5-50个字符之间', trigger: 'blur' },
  ],
  method: [{ required: true, message: '请选择提现方式', trigger: 'change' }],
  password: [{ required: true, message: '请输入支付密码', trigger: 'blur' }],
}

// 格式化金额
function formatAmount(amount: number): string {
  return amount ? amount.toFixed(2) : '0.00'
}

// 格式化日期
function formatDate(date: string): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 获取交易类型颜色
function getTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    recharge: 'success',
    consume: 'danger',
    income: 'success',
    withdraw: 'warning',
    transfer: 'info',
  }
  return colorMap[type] || 'info'
}

// 获取交易类型标签颜色（带类型）
function getTypeTagColor(type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  return getTypeColor(type) as 'primary' | 'success' | 'warning' | 'info' | 'danger'
}

// 获取交易类型标签
function getTypeLabel(type: string): string {
  const labelMap: Record<string, string> = {
    recharge: '充值',
    consume: '消费',
    income: '收入',
    withdraw: '提现',
    transfer: '转账',
    transfer_in: '转入',
    transfer_out: '转出',
  }
  return labelMap[type] || type
}

// 选择充值金额
function selectRechargeAmount(amount: number) {
  rechargeAmount.value = amount
  customAmount.value = 0
}

// 加载钱包信息
async function loadWalletInfo(): Promise<void> {
  try {
    walletInfo.value = await walletAPI.getWallet()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载钱包信息失败')
  }
}

// 加载交易记录
async function loadTransactions(): Promise<void> {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      type: transactionType.value || undefined,
    }

    const response = await walletAPI.getTransactions({
      page: params.page,
      pageSize: params.page_size,
      type: params.type,
    })

    transactions.value = response.items
    total.value = response.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '加载交易记录失败')
  } finally {
    loading.value = false
  }
}

// 筛选变化处理
function handleFilterChange() {
  currentPage.value = 1
  loadTransactions()
}

// 提交充值
async function submitRecharge(): Promise<void> {
  const amount = customAmount.value || rechargeAmount.value

  if (!amount || amount < 10) {
    message.warning('请选择或输入充值金额，最低充值10元')
    return
  }

  if (!paymentMethod.value) {
    message.warning('请选择支付方式')
    return
  }

  recharging.value = true
  try {
    await walletAPI.recharge({
      amount,
      method: paymentMethod.value,
    })
    message.success('充值成功')
    showRechargeDialog.value = false

    rechargeAmount.value = 0
    customAmount.value = 0

    await loadWalletInfo()
    await loadTransactions()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '充值失败，请稍后重试')
  } finally {
    recharging.value = false
  }
}

// 提交提现
async function submitWithdraw(): Promise<void> {
  if (!withdrawFormRef.value) return

  try {
    await withdrawFormRef.value.validate()
  } catch {
    return
  }

  if (withdrawForm.amount > walletInfo.value.availableAmount) {
    message.error('提现金额不能超过可用余额')
    return
  }

  withdrawing.value = true
  try {
    await walletAPI.submitWithdraw({
      amount: withdrawForm.amount,
      method: withdrawForm.method,
      account: withdrawForm.account,
      password: withdrawForm.password,
    })
    message.success('提现申请已提交，预计1-3个工作日到账')
    showWithdrawDialog.value = false

    withdrawForm.amount = 0
    withdrawForm.account = ''
    withdrawForm.method = 'alipay'
    withdrawForm.password = ''
    withdrawFormRef.value?.resetFields()

    await loadWalletInfo()
    await loadTransactions()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '提现申请失败，请稍后重试')
  } finally {
    withdrawing.value = false
  }
}

// 跳转到转账页面
function goToTransfer() {
  router.push('/user/transfer')
}

// 页面初始化
onMounted(async () => {
  pageLoading.value = true
  try {
    await Promise.all([loadWalletInfo(), loadTransactions()])
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped lang="scss">
// 页面头部操作
.header-actions {
  display: flex;
  gap: 0.75rem;
}

// 钱包统计卡片
.wallet-stats {
  margin-bottom: 1.5rem;
}

.stat-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;

  &.balance-icon {
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    color: #fff;
  }

  &.income-icon {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
    color: #fff;
  }

  &.expense-icon {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    color: #fff;
  }
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #757575;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;

  &.primary {
    color: #2196f3;
  }

  &.success {
    color: #4caf50;
  }

  &.danger {
    color: #f44336;
  }
}

// 交易记录卡片
.transaction-card {
  margin-top: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #212121;
}

.amount-income {
  color: #4caf50;
  font-weight: 600;
}

.amount-outcome {
  color: #f44336;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

// 充值对话框
.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.amount-item {
  padding: 1rem;
  text-align: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;

  &:hover {
    border-color: #2196f3;
    background: #f5f5f5;
    transform: translateY(-2px);
  }

  &.active {
    border-color: #2196f3;
    background: #e3f2fd;

    .amount-value {
      color: #2196f3;
    }
  }
}

.amount-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212121;
}

// 支付方式
.payment-methods {
  display: flex;
  gap: 1rem;

  :deep(.el-radio) {
    margin-right: 0;
    flex: 1;
  }

  :deep(.el-radio.is-bordered) {
    padding: 12px 16px;
  }
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

// 提现相关
.available-balance {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4caf50;
}

// 响应式设计
@media (max-width: 768px) {
  .wallet-stats {
    :deep(.qy-grid) {
      grid-template-columns: 1fr;
    }
  }

  .amount-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .payment-methods {
    flex-direction: column;
  }
}
</style>
