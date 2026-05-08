<template>
  <Container maxWidth="md" padding>
    <Section title="转账" spacing="lg">
      <!-- 转账表单 -->
      <Card shadow="hover" class="transfer-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">向其他用户转账</span>
            <QyButton variant="text" @click="showHistory = !showHistory">
              {{ showHistory ? '隐藏' : '查看' }}转账记录
            </QyButton>
          </div>
        </template>

        <QyForm
          ref="transferFormRef"
          v-model="transferForm"
          :rules="transferRules"
          label-width="120px"
          @submit.prevent="handleTransfer"
        >
          <!-- 可用余额 -->
          <QyFormItem label="可用余额">
            <div class="balance-display">
              <span class="balance-amount">¥{{ formatAmount(walletInfo.balance) }}</span>
              <QyButton variant="text" @click="loadWalletInfo">刷新</QyButton>
            </div>
          </QyFormItem>

          <!-- 收款人 -->
          <QyFormItem label="收款人" prop="targetUser">
            <el-autocomplete
              v-model="transferForm.targetUser"
              :fetch-suggestions="searchUsers"
              placeholder="输入用户名或用户ID"
              :trigger-on-focus="false"
              style="width: 100%"
              @select="handleUserSelect"
            >
              <template #default="{ item }">
                <div class="user-suggestion">
                  <div class="user-name">{{ item.value }}</div>
                  <div class="user-info" v-if="item.nickname">{{ item.nickname }}</div>
                </div>
              </template>
            </el-autocomplete>
            <div class="form-hint">支持输入用户名或用户ID</div>
          </QyFormItem>

          <!-- 转账金额 -->
          <QyFormItem label="转账金额" prop="amount">
            <Input v-model="transferForm.amount" type="number" placeholder="请输入转账金额">
              <template #prefix>¥</template>
            </Input>
            <div class="quick-amounts">
              <QyButton
                v-for="amount in quickAmounts"
                :key="amount"
                size="sm"
                @click="setAmount(amount)"
              >
                ¥{{ amount }}
              </QyButton>
            </div>
          </QyFormItem>

          <!-- 转账备注 -->
          <QyFormItem label="转账备注" prop="reason">
            <Textarea
              v-model="transferForm.reason"
              :rows="3"
              placeholder="请输入转账备注（可选）"
              :maxlength="200"
              show-count
            />
          </QyFormItem>

          <!-- 转账按钮 -->
          <QyFormItem>
            <QyButton
              variant="primary"
              size="lg"
              :loading="transferring"
              @click="handleTransfer"
              style="width: 100%"
            >
              确认转账
            </QyButton>
          </QyFormItem>
        </QyForm>
      </Card>

      <!-- 转账记录 -->
      <Card v-if="showHistory" shadow="hover" class="history-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">转账记录</span>
            <QyButton variant="text" @click="loadTransferHistory">刷新</QyButton>
          </div>
        </template>

        <el-table
          :data="transferHistory"
          v-loading="loadingHistory"
          stripe
          empty-text="暂无转账记录"
        >
          <el-table-column prop="createdAt" label="时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column prop="relatedUserId" label="收款人" width="150">
            <template #default="{ row }">
              {{ row.relatedUserId || '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="amount" label="金额" width="120" align="right">
            <template #default="{ row }">
              <span class="amount-out">-¥{{ formatAmount(Math.abs(row.amount)) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="description" label="备注" min-width="200" />

          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <Tag :variant="getStatusTagType(row.status)">
                {{ getStatusText(row.status) }}
              </Tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <QyPagination
            v-model="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            :layout="['total', 'sizes', 'prev', 'pager', 'next']"
            @change="loadTransferHistory"
          />
        </div>
      </Card>

      <!-- 转账确认对话框 -->
      <QyModal
        v-model:visible="showConfirmDialog"
        title="确认转账"
        width="480px"
        :mask-closable="false"
      >
        <div class="confirm-content">
          <div class="confirm-icon">
            <QyIcon name="Warning" :size="48" />
          </div>
          <div class="confirm-details">
            <div class="confirm-item">
              <span class="confirm-label">收款人：</span>
              <span class="confirm-value">{{ transferForm.targetUser }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">转账金额：</span>
              <span class="confirm-value amount-highlight"
                >¥{{ formatAmount(transferForm.amount) }}</span
              >
            </div>
            <div class="confirm-item" v-if="transferForm.reason">
              <span class="confirm-label">转账备注：</span>
              <span class="confirm-value">{{ transferForm.reason }}</span>
            </div>
            <div class="confirm-warning">
              <QyIcon name="Warning" />
              <span>转账操作不可撤销，请确认收款人信息正确</span>
            </div>
          </div>
        </div>

        <template #footer>
          <QyButton @click="showConfirmDialog = false">取消</QyButton>
          <QyButton variant="primary" @click="confirmTransfer" :loading="transferring">
            确认转账
          </QyButton>
        </template>
      </QyModal>

      <!-- 转账结果对话框 -->
      <QyModal
        v-model:visible="showResultDialog"
        :title="transferResult.success ? '转账成功' : '转账失败'"
        width="420px"
      >
        <el-result
          :icon="transferResult.success ? 'success' : 'error'"
          :title="transferResult.success ? '转账成功' : '转账失败'"
        >
          <template #sub-title>
            <div>{{ transferResult.message }}</div>
            <div v-if="transferResult.transactionId" class="result-transaction-id">
              交易ID: {{ transferResult.transactionId }}
            </div>
          </template>
        </el-result>

        <template #footer>
          <QyButton variant="primary" @click="showResultDialog = false">关闭</QyButton>
        </template>
      </QyModal>
    </Section>

    <LoadingOverlay :visible="pageLoading" text="加载中..." />
  </Container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance } from '@/design-system/services'
import type { FormRules } from '@/design-system/form/Form/types'
import {
  QyIcon,
  QyButton,
  QyPagination,
  QyModal,
  QyForm,
  QyFormItem,
} from '@/design-system/components'
import { Tag, Textarea, Card, Input } from '@/design-system/base'
import { Container, Section, LoadingOverlay } from '@/shared/components/design-system'
import { walletAPI } from '@/modules/finance/api/wallet'
import type { WalletInfo, WalletTransaction as Transaction } from '@/modules/finance/api'

// 加载状态
const pageLoading = ref(false)
const transferring = ref(false)
const loadingHistory = ref(false)

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

// 转账表单
const transferFormRef = ref<FormInstance>()
const transferForm = reactive({
  targetUser: '',
  amount: 0,
  reason: '',
})

const transferRules: FormRules = {
  targetUser: [
    { required: true, message: '请输入收款人', trigger: 'blur' },
    { min: 2, max: 50, message: '收款人长度应在2-50个字符之间', trigger: 'blur' },
  ],
  amount: [
    { required: true, message: '请输入转账金额', trigger: 'blur' },
    {
      validator: (_rule, value) => {
        if (typeof value !== 'number' || value < 0.01) {
          return false
        }
        return true
      },
      message: '转账金额不能小于0.01元',
      trigger: 'blur',
    },
    {
      validator: (_rule, value) => {
        if (value > walletInfo.value.balance) {
          return '转账金额不能超过可用余额'
        } else if (value > 10000) {
          return '单笔转账金额不能超过10000元'
        }
        return true
      },
      trigger: 'blur',
    },
  ],
}

// 快捷金额
const quickAmounts = [10, 50, 100, 200, 500]

// 转账记录
const showHistory = ref(false)
const transferHistory = ref<Transaction[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 确认对话框
const showConfirmDialog = ref(false)

// 结果对话框
const showResultDialog = ref(false)
const transferResult = ref({
  success: false,
  message: '',
  transactionId: '',
})

// 格式化函数
function formatAmount(amount: number): string {
  return amount ? amount.toFixed(2) : '0.00'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('zh-CN')
}

function getStatusType(status: string): string {
  const typeMap: Record<string, string> = {
    success: 'success',
    pending: 'warning',
    failed: 'danger',
  }
  return typeMap[status] || 'info'
}

function getStatusTagType(status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  return getStatusType(status) as 'primary' | 'success' | 'warning' | 'info' | 'danger'
}

function getStatusText(status: string): string {
  const textMap: Record<string, string> = {
    success: '成功',
    pending: '处理中',
    failed: '失败',
  }
  return textMap[status] || status
}

// 设置金额
function setAmount(amount: number) {
  transferForm.amount = amount
}

// 搜索用户（模拟）

async function searchUsers(
  queryString: string,
  cb: (results: Array<{ value: string; nickname: string }>) => void,
) {
  // 这里应该调用API搜索用户
  // 暂时返回模拟数据
  cb(queryString ? [{ value: queryString, nickname: '' }] : [])
}

// 选择用户
function handleUserSelect(item: { value: string; nickname: string }) {
  transferForm.targetUser = item.value
}

// 加载钱包信息
async function loadWalletInfo() {
  try {
    walletInfo.value = await walletAPI.getWallet()
  } catch (error) {
    console.error('加载钱包信息失败:', error)
  }
}

// 加载转账记录
async function loadTransferHistory() {
  loadingHistory.value = true
  try {
    const response = await walletAPI.getTransactions({
      page: currentPage.value,
      pageSize: pageSize.value,
      type: 'transfer_out',
    })
    transferHistory.value = response.items
    total.value = response.total
  } catch (error) {
    console.error('加载转账记录失败:', error)
  } finally {
    loadingHistory.value = false
  }
}

// 处理转账
async function handleTransfer() {
  if (!transferFormRef.value) return

  try {
    await transferFormRef.value.validate()
  } catch {
    return
  }

  showConfirmDialog.value = true
}

// 确认转账
async function confirmTransfer() {
  transferring.value = true
  try {
    const response = await walletAPI.transfer({
      toUserId: transferForm.targetUser,
      amount: transferForm.amount,
      reason: transferForm.reason || '用户转账',
    })
    transferResult.value = {
      success: true,
      message: '转账成功',
      transactionId: response.id || '',
    }

    await Promise.all([loadWalletInfo(), loadTransferHistory()])
    transferFormRef.value?.resetFields()
  } catch (error) {
    transferResult.value = {
      success: false,
      message: error instanceof Error ? error.message : '转账失败，请稍后重试',
      transactionId: '',
    }
  } finally {
    transferring.value = false
    showConfirmDialog.value = false
    showResultDialog.value = true
  }
}

// 初始化
onMounted(async () => {
  pageLoading.value = true
  try {
    await loadWalletInfo()
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped lang="scss">
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

.transfer-card {
  margin-bottom: 1.5rem;
}

.balance-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.balance-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2196f3;
}

.form-hint {
  font-size: 0.75rem;
  color: #9e9e9e;
  margin-top: 0.25rem;
}

.user-suggestion {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #212121;
}

.user-info {
  font-size: 0.75rem;
  color: #757575;
}

.quick-amounts {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.history-card {
  margin-top: 1.5rem;
}

.amount-out {
  color: #f44336;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
}

.confirm-icon {
  flex-shrink: 0;
}

.confirm-details {
  flex: 1;
  width: 100%;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.confirm-label {
  color: #757575;
}

.confirm-value {
  color: #212121;
  font-weight: 500;
}

.amount-highlight {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2196f3;
}

.confirm-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  color: #faad14;
  font-size: 0.875rem;
}

.result-transaction-id {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875rem;
  color: #616161;
}
</style>
