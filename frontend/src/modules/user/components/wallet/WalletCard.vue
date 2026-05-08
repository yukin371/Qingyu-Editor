<template>
  <div class="wallet-card">
    <div class="wallet-header">
      <h3 class="wallet-title">我的钱包</h3>
      <el-button :icon="Refresh" circle size="small" @click="handleRefresh" />
    </div>

    <div class="wallet-balance">
      <div class="balance-main">
        <span class="balance-label">可用余额</span>
        <div class="balance-value">
          <span class="currency">¥</span>
          <span class="amount">{{ formatAmount(availableAmount) }}</span>
        </div>
      </div>

      <div class="balance-info">
        <div class="info-item">
          <span class="info-label">总余额</span>
          <span class="info-value">¥{{ formatAmount(balance) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">冻结金额</span>
          <span class="info-value frozen">¥{{ formatAmount(frozenAmount) }}</span>
        </div>
      </div>
    </div>

    <div class="wallet-actions">
      <el-button type="primary" :icon="Plus" @click="handleRecharge">充值</el-button>
      <el-button :icon="Minus" @click="handleWithdraw">提现</el-button>
    </div>

    <div v-if="showExtra" class="wallet-extra">
      <div class="extra-item">
        <span class="extra-label">累计收入</span>
        <span class="extra-value income">+¥{{ formatAmount(totalIncome) }}</span>
      </div>
      <div class="extra-item">
        <span class="extra-label">累计支出</span>
        <span class="extra-value expense">-¥{{ formatAmount(totalExpense) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Refresh, Plus, Minus } from '@element-plus/icons-vue'
import { formatCurrency } from '@/utils/currency'

interface Props {
  balance?: number
  availableAmount?: number
  frozenAmount?: number
  totalIncome?: number
  totalExpense?: number
  showExtra?: boolean
}

interface Emits {
  (_e: 'refresh'): void
  (_e: 'recharge'): void
  (_e: 'withdraw'): void
}

withDefaults(defineProps<Props>(), {
  balance: 0,
  availableAmount: 0,
  frozenAmount: 0,
  totalIncome: 0,
  totalExpense: 0,
  showExtra: false
})

const emit = defineEmits<Emits>()

// 格式化金额
// 注意：amount 参数单位是分（后端返回），需要转换为元显示
const formatAmount = (amount: number): string => {
  return formatCurrency(amount).replace('¥', '')
}

// 事件处理
const handleRefresh = () => {
  emit('refresh')
}

const handleRecharge = () => {
  emit('recharge')
}

const handleWithdraw = () => {
  emit('withdraw')
}
</script>

<style scoped lang="scss">
.wallet-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.wallet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.wallet-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.wallet-balance {
  margin-bottom: 24px;
}

.balance-main {
  margin-bottom: 16px;
}

.balance-label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.balance-value {
  display: flex;
  align-items: baseline;
  gap: 4px;

  .currency {
    font-size: 28px;
    font-weight: 600;
  }

  .amount {
    font-size: 42px;
    font-weight: bold;
    line-height: 1;
  }
}

.balance-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.info-value {
  font-size: 16px;
  font-weight: 600;

  &.frozen {
    color: #ffd666;
  }
}

.wallet-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  :deep(.el-button) {
    flex: 1;
    border: none;

    &.el-button--primary {
      background: #fff;
      color: #667eea;

      &:hover {
        background: #f5f5f5;
      }
    }

    &:not(.el-button--primary) {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.wallet-extra {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.extra-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.extra-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.extra-value {
  font-size: 16px;
  font-weight: 600;

  &.income {
    color: #95de64;
  }

  &.expense {
    color: #ff9c6e;
  }
}
</style>
