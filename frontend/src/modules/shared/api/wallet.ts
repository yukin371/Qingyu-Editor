/**
 * 钱包服务API模块 (v1.3)
 * 基于 doc/api/frontend/共享服务API参考.md
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'
import type {
  WalletInfo,
  Transaction,
  RechargeParams,
  ConsumeParams,
  TransferParams,
  WithdrawRequest,
  WithdrawParams
} from '@/types/shared'

/**
 * 钱包API接口 (v1.3)
 */
export const walletAPI = {
  /**
   * 查询余额
   */
  async getBalance(): Promise<APIResponse<{ balance: number }>> {
    const response = await httpService.get<APIResponse<{ balance: number }>>('/shared/wallet/balance')
    return response as unknown as APIResponse<{ balance: number }>
  },

  /**
   * 获取钱包信息
   */
  async getWallet(): Promise<APIResponse<WalletInfo>> {
    const response = await httpService.get<APIResponse<WalletInfo>>('/shared/wallet')
    return response as unknown as APIResponse<WalletInfo>
  },

  /**
   * 充值
   */
  async recharge(params: RechargeParams): Promise<APIResponse<Transaction>> {
    const response = await httpService.post<APIResponse<Transaction>>('/shared/wallet/recharge', params)
    return response as unknown as APIResponse<Transaction>
  },

  /**
   * 消费
   */
  async consume(params: ConsumeParams): Promise<APIResponse<Transaction>> {
    const response = await httpService.post<APIResponse<Transaction>>('/shared/wallet/consume', params)
    return response as unknown as APIResponse<Transaction>
  },

  /**
   * 转账
   */
  async transfer(params: TransferParams): Promise<APIResponse<Transaction>> {
    const response = await httpService.post<APIResponse<Transaction>>('/shared/wallet/transfer', params)
    return response as unknown as APIResponse<Transaction>
  },

  /**
   * 获取交易历史
   */
  async getTransactions(params?: {
    page?: number
    pageSize?: number
    type?: string
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await httpService.get<PaginatedResponse<Transaction>>('/shared/wallet/transactions', { params })
    return response as unknown as PaginatedResponse<Transaction>
  },

  /**
   * 提交提现申请
   */
  async submitWithdraw(params: WithdrawParams): Promise<APIResponse<WithdrawRequest>> {
    const response = await httpService.post<APIResponse<WithdrawRequest>>('/shared/wallet/withdraw', params)
    return response as unknown as APIResponse<WithdrawRequest>
  },

  /**
   * 获取提现申请列表
   */
  async getWithdrawRequests(params?: {
    page?: number
    pageSize?: number
    status?: string
  }): Promise<PaginatedResponse<WithdrawRequest>> {
    const response = await httpService.get<PaginatedResponse<WithdrawRequest>>('/shared/wallet/withdraw-requests', { params })
    return response as unknown as PaginatedResponse<WithdrawRequest>
  }
}

// 向后兼容：导出旧的函数名
export const getBalance = () => walletAPI.getBalance()
export const getWallet = () => walletAPI.getWallet()
export const recharge = (params: RechargeParams) => walletAPI.recharge(params)
export const consume = (params: ConsumeParams) => walletAPI.consume(params)
export const transfer = (params: TransferParams) => walletAPI.transfer(params)
export const getTransactions = (params?: any) => walletAPI.getTransactions(params)
export const submitWithdraw = (params: WithdrawParams) => walletAPI.submitWithdraw(params)
export const getWithdrawRequests = (params?: any) => walletAPI.getWithdrawRequests(params)

export default walletAPI


