/**
 * Wallet Service
 * Business logic for wallet management
 */

import { walletAPI } from '@/modules/finance/api/wallet'
import type {
  WalletBalance,
  Transaction,
  RechargeParams,
  WithdrawParams
} from '../types/user.types'

class WalletService {
  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<WalletBalance> {
    const response = await walletAPI.getBalance()
    return {
      balance: response.balance,
      userId: '',
      frozenBalance: 0,
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(page: number = 1, size: number = 20): Promise<Transaction[]> {
    const response = await walletAPI.getTransactions({ page, pageSize: size })
    return response.items as any
  }

  /**
   * Recharge wallet
   */
  async recharge(params: RechargeParams): Promise<void> {
    // Validate amount
    if (params.amount <= 0) {
      throw new Error('充值金额必须大于0')
    }

    if (params.amount > 10000) {
      throw new Error('单次充值金额不能超过10000')
    }

    await walletAPI.recharge({
      amount: params.amount,
      method: params.payment_method === 'card' ? 'bank' : params.payment_method,
    })
  }

  /**
   * Withdraw from wallet
   */
  async withdraw(params: WithdrawParams): Promise<void> {
    // Validate amount
    if (params.amount <= 0) {
      throw new Error('提现金额必须大于0')
    }

    const balance = await this.getWalletBalance()
    if (params.amount > balance.balance) {
      throw new Error('提现金额不能超过可用余额')
    }

    await walletAPI.submitWithdraw({
      amount: params.amount,
      method: params.account_type === 'bank' ? 'bank' : 'alipay',
      account: params.account,
      password: (params as any).password || '',
    })
  }

  /**
   * Format transaction type
   */
  formatTransactionType(type: string): string {
    const typeMap: Record<string, string> = {
      recharge: '充值',
      purchase: '购买',
      reward: '打赏',
      withdraw: '提现',
      refund: '退款',
      income: '收入'
    }
    return typeMap[type] || type
  }

  /**
   * Format transaction status
   */
  formatTransactionStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '处理中',
      completed: '已完成',
      failed: '失败',
      cancelled: '已取消'
    }
    return statusMap[status] || status
  }

  /**
   * Format amount with currency
   */
  formatAmount(amount: number): string {
    return `¥${amount.toFixed(2)}`
  }

  /**
   * Calculate transaction fee
   */
  calculateWithdrawFee(amount: number, feeRate: number = 0.01): number {
    return Math.max(amount * feeRate, 0.1) // Minimum fee: 0.1
  }
}

export const walletService = new WalletService()
export default walletService
