<template>
  <div class="transaction-list">
    <div class="list-header">
      <h3 class="list-title">交易记录</h3>
      <el-select v-model="selectedType" placeholder="全部类型" size="small" @change="handleTypeChange">
        <el-option label="全部类型" value="" />
        <el-option label="充值" value="recharge" />
        <el-option label="消费" value="consume" />
        <el-option label="转账" value="transfer" />
        <el-option label="提现" value="withdraw" />
      </el-select>
    </div>

    <div v-if="loading" class="list-loading">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="transactions.length === 0" class="list-empty">
      <el-empty description="暂无交易记录" />
    </div>

    <div v-else class="list-content">
      <div
        v-for="transaction in transactions"
        :key="transaction.id"
        class="transaction-item"
      >
        <div class="transaction-icon" :class="`type-${transaction.type}`">
          <i :class="getTypeIcon(transaction.type)"></i>
        </div>
        <div class="transaction-info">
          <div class="transaction-desc">{{ getTypeText(transaction.type) }}</div>
          <div class="transaction-time">{{ formatTime(transaction.createdAt) }}</div>
          <div v-if="transaction.description" class="transaction-detail">
            {{ transaction.description }}
          </div>
        </div>
        <div class="transaction-amount" :class="getAmountClass(transaction.type)">
          {{ formatAmount(transaction.amount, transaction.type) }}
        </div>
      </div>
    </div>

    <div v-if="showPagination && total > pageSize" class="list-pagination">
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Transaction } from '@/types/shared'
import { formatRelativeTime } from '@/utils/format.ts'
import { formatTransactionAmount } from '@/utils/currency'

interface Props {
  transactions: Transaction[]
  loading?: boolean
  total?: number
  page?: number
  pageSize?: number
  showPagination?: boolean
}

interface Emits {
  (e: 'typeChange', type: string): void
  (e: 'pageChange', page: number): void
  (e: 'sizeChange', size: number): void
}

withDefaults(defineProps<Props>(), {
  loading: false,
  total: 0,
  page: 1,
  pageSize: 20,
  showPagination: true
})

const emit = defineEmits<Emits>()

const selectedType = ref('')

// 获取交易类型图标
const getTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    recharge: 'el-icon-plus',
    consume: 'el-icon-shopping-cart-2',
    transfer: 'el-icon-sort',
    withdraw: 'el-icon-minus'
  }
  return iconMap[type] || 'el-icon-document'
}

// 获取交易类型文本
const getTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    recharge: '充值',
    consume: '消费',
    transfer: '转账',
    withdraw: '提现'
  }
  return textMap[type] || type
}

// 获取金额样式类
const getAmountClass = (type: string): string => {
  return type === 'recharge' ? 'amount-income' : 'amount-expense'
}

// 格式化金额
// 注意：amount 参数单位是分（后端返回），formatTransactionAmount 会自动处理
const formatAmount = (amount: number, type: string): string => {
  return formatTransactionAmount(amount, type)
}

// 格式化时间
const formatTime = (time: string): string => {
  try {
    return formatRelativeTime(time)
  } catch {
    return time
  }
}

// 事件处理
const handleTypeChange = () => {
  emit('typeChange', selectedType.value)
}

const handlePageChange = (page: number) => {
  emit('pageChange', page)
}

const handleSizeChange = (size: number) => {
  emit('sizeChange', size)
}
</script>

<style scoped lang="scss">
.transaction-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.list-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.list-loading,
.list-empty {
  padding: 40px 0;
  text-align: center;
  color: #909399;
}

.list-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .el-icon {
    font-size: 32px;
  }
}

.list-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #f5f5f5;
  }
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    font-size: 20px;
    color: #fff;
  }

  &.type-recharge {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  }

  &.type-consume {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  }

  &.type-transfer {
    background: linear-gradient(135deg, #e6a23c 0%, #f5ba5b 100%);
  }

  &.type-withdraw {
    background: linear-gradient(135deg, #f56c6c 0%, #f89898 100%);
  }
}

.transaction-info {
  flex: 1;
  min-width: 0;
}

.transaction-desc {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.transaction-time {
  font-size: 12px;
  color: #909399;
}

.transaction-detail {
  font-size: 13px;
  color: #606266;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-amount {
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;

  &.amount-income {
    color: #67c23a;
  }

  &.amount-expense {
    color: #f56c6c;
  }
}

.list-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .transaction-amount {
    align-self: flex-end;
  }
}
</style>

