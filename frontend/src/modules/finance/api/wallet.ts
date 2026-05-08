import { httpService } from '@/core/services/http.service'

export type WalletPaymentMethod = 'alipay' | 'wechat' | 'bank'

export interface WalletInfo {
  userId: string
  balance: number
  balanceCents: number
  availableAmount: number
  availableAmountCents: number
  frozenAmount: number
  frozenAmountCents: number
  totalIncome: number
  totalIncomeCents: number
  totalExpense: number
  totalExpenseCents: number
  frozen: boolean
  createdAt?: string
  updatedAt?: string
}

export interface WalletTransaction {
  id: string
  userId: string
  type: string
  amount: number
  amountCents: number
  balance: number
  balanceCents: number
  description: string
  reason?: string
  status: string
  method?: string
  relatedUserId?: string
  transactionTime?: string
  createdAt?: string
}

export interface WalletWithdrawal {
  id: string
  userId: string
  amount: number
  amountCents: number
  status: string
  account: string
  accountType: string
  accountName?: string
  reviewedBy?: string
  reviewedAt?: string
  rejectReason?: string
  processedAt?: string
  transactionId?: string
  createdAt?: string
  updatedAt?: string
}

export interface WalletListResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface WalletRechargePayload {
  amount: number
  method: WalletPaymentMethod
}

export interface WalletConsumePayload {
  amount: number
  reason: string
}

export interface WalletTransferPayload {
  toUserId: string
  amount: number
  reason?: string
}

export interface WalletWithdrawPayload {
  amount: number
  method: WalletPaymentMethod
  account: string
  password: string
}

const toCents = (value?: number | null) => Number(value ?? 0)
const toYuan = (value?: number | null) => Number((toCents(value) / 100).toFixed(2))

function normalizeWallet(raw: any): WalletInfo {
  const balanceCents = toCents(raw?.balance)
  const frozenAmountCents = toCents(raw?.frozenAmount ?? raw?.frozen_balance ?? 0)
  const availableAmountCents = toCents(raw?.availableAmount ?? balanceCents - frozenAmountCents)
  const totalIncomeCents = toCents(raw?.totalIncome)
  const totalExpenseCents = toCents(raw?.totalExpense)

  return {
    userId: raw?.user_id ?? raw?.userId ?? '',
    balance: toYuan(balanceCents),
    balanceCents,
    availableAmount: toYuan(availableAmountCents),
    availableAmountCents,
    frozenAmount: toYuan(frozenAmountCents),
    frozenAmountCents,
    totalIncome: toYuan(totalIncomeCents),
    totalIncomeCents,
    totalExpense: toYuan(totalExpenseCents),
    totalExpenseCents,
    frozen: Boolean(raw?.frozen),
    createdAt: raw?.created_at ?? raw?.createdAt,
    updatedAt: raw?.updated_at ?? raw?.updatedAt,
  }
}

function normalizeTransaction(raw: any): WalletTransaction {
  const amountCents = toCents(raw?.amount)
  const balanceCents = toCents(raw?.balance ?? raw?.balance_after)

  return {
    id: raw?.id ?? '',
    userId: raw?.user_id ?? raw?.userId ?? '',
    type: raw?.type ?? '',
    amount: toYuan(amountCents),
    amountCents,
    balance: toYuan(balanceCents),
    balanceCents,
    description: raw?.description ?? raw?.reason ?? '',
    reason: raw?.reason,
    status: raw?.status ?? '',
    method: raw?.method,
    relatedUserId: raw?.related_user_id ?? raw?.relatedUserId,
    transactionTime: raw?.transaction_time ?? raw?.transactionTime,
    createdAt: raw?.created_at ?? raw?.createdAt ?? raw?.transaction_time ?? raw?.transactionTime,
  }
}

function normalizeWithdrawal(raw: any): WalletWithdrawal {
  const amountCents = toCents(raw?.amount)

  return {
    id: raw?.id ?? '',
    userId: raw?.user_id ?? raw?.userId ?? '',
    amount: toYuan(amountCents),
    amountCents,
    status: raw?.status ?? '',
    account: raw?.account ?? '',
    accountType: raw?.account_type ?? raw?.accountType ?? raw?.method ?? 'alipay',
    accountName: raw?.account_name ?? raw?.accountName,
    reviewedBy: raw?.reviewed_by ?? raw?.reviewedBy,
    reviewedAt: raw?.reviewed_at ?? raw?.reviewedAt,
    rejectReason: raw?.reject_reason ?? raw?.rejectReason,
    processedAt: raw?.processed_at ?? raw?.processedAt,
    transactionId: raw?.transaction_id ?? raw?.transactionId,
    createdAt: raw?.created_at ?? raw?.createdAt,
    updatedAt: raw?.updated_at ?? raw?.updatedAt,
  }
}

function normalizeList<T>(
  raw: any,
  page: number,
  pageSize: number,
  mapper: (item: any) => T,
): WalletListResult<T> {
  const source = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
  const pagination = raw?.pagination

  return {
    items: source.map(mapper),
    total: Number(pagination?.total ?? source.length ?? 0),
    page: Number(pagination?.page ?? page),
    pageSize: Number(pagination?.pageSize ?? pageSize),
  }
}

export const walletAPI = {
  async getBalance(): Promise<Pick<WalletInfo, 'balance' | 'balanceCents'>> {
    const raw = await httpService.get<number | { balance?: number }>(
      '/api/v1/finance/wallet/balance',
    )
    const balanceCents =
      typeof raw === 'number' ? toCents(raw) : toCents((raw as { balance?: number })?.balance)

    return {
      balance: toYuan(balanceCents),
      balanceCents,
    }
  },

  async getWallet(): Promise<WalletInfo> {
    const raw = await httpService.get<any>('/api/v1/finance/wallet/detail')
    return normalizeWallet(raw)
  },

  async recharge(payload: WalletRechargePayload): Promise<WalletTransaction> {
    const raw = await httpService.post<any>('/api/v1/finance/wallet/recharge', payload)
    return normalizeTransaction(raw)
  },

  async consume(payload: WalletConsumePayload): Promise<WalletTransaction> {
    const raw = await httpService.post<any>('/api/v1/finance/wallet/consume', payload)
    return normalizeTransaction(raw)
  },

  async transfer(payload: WalletTransferPayload): Promise<WalletTransaction> {
    const raw = await httpService.post<any>('/api/v1/finance/wallet/transfer', {
      to_user_id: payload.toUserId,
      amount: payload.amount,
      reason: payload.reason,
    })
    return normalizeTransaction(raw)
  },

  async getTransactions(params?: {
    page?: number
    pageSize?: number
    type?: string
  }): Promise<WalletListResult<WalletTransaction>> {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 20
    const raw = await httpService.get<any>('/api/v1/finance/wallet/transactions', {
      params: {
        page,
        page_size: pageSize,
        type: params?.type,
      },
    })

    return normalizeList(raw, page, pageSize, normalizeTransaction)
  },

  async submitWithdraw(payload: WalletWithdrawPayload): Promise<WalletWithdrawal> {
    const raw = await httpService.post<any>('/api/v1/finance/wallet/withdraw', {
      amount: payload.amount,
      method: payload.method,
      account: payload.account,
      password: payload.password,
    })
    return normalizeWithdrawal(raw)
  },

  async getWithdrawRequests(params?: {
    page?: number
    pageSize?: number
    status?: string
  }): Promise<WalletListResult<WalletWithdrawal>> {
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? 20
    const raw = await httpService.get<any>('/api/v1/finance/wallet/withdraws', {
      params: {
        page,
        page_size: pageSize,
        status: params?.status,
      },
    })

    return normalizeList(raw, page, pageSize, normalizeWithdrawal)
  },
}

export default walletAPI
