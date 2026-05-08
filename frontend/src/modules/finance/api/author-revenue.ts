import { httpService } from '@/core/services/http.service'

export interface AuthorEarning {
  id: string
  authorId: string
  bookId?: string
  bookTitle?: string
  chapterId?: string
  chapterTitle?: string
  type: string
  amount: number
  amountCents: number
  grossAmount: number
  grossAmountCents: number
  platformFee: number
  platformFeeCents: number
  status: 'pending' | 'confirmed' | 'completed' | 'paid'
  isSettled: boolean
  createdAt: string
  updatedAt?: string
}

export interface WithdrawalRequest {
  id: string
  userId: string
  amount: number
  amountCents: number
  fee: number
  feeCents: number
  actualAmount: number
  actualAmountCents: number
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed'
  method: string
  accountType: string
  accountName: string
  accountNo: string
  bankName?: string
  branchName?: string
  rejectReason?: string
  approvedAt?: string
  completedAt?: string
  transactionId?: string
  note?: string
  createdAt: string
  updatedAt?: string
}

export interface Settlement {
  id: string
  authorId: string
  authorNickname?: string
  period: string
  totalRevenue: number
  totalRevenueCents: number
  platformFee: number
  platformFeeCents: number
  actualIncome: number
  actualIncomeCents: number
  taxFee: number
  taxFeeCents: number
  finalIncome: number
  finalIncomeCents: number
  earningCount: number
  status: string
  processedAt?: string
  transactionId?: string
  note?: string
  createdAt: string
  updatedAt?: string
}

export interface RevenueStatistics {
  authorId: string
  period: string
  periodStart?: string
  periodEnd?: string
  totalRevenue: number
  totalRevenueCents: number
  chapterIncome: number
  chapterIncomeCents: number
  rewardIncome: number
  rewardIncomeCents: number
  vipReadingIncome: number
  vipReadingIncomeCents: number
  transactionCount: number
  readerCount: number
  bookCount: number
  createdAt?: string
  updatedAt?: string
}

export interface RevenueDetail {
  id: string
  authorId: string
  bookId: string
  bookTitle: string
  type: string
  totalAmount: number
  totalAmountCents: number
  totalIncome: number
  totalIncomeCents: number
  transactionCount: number
  firstEarningAt?: string
  lastEarningAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface TaxInfo {
  id: string
  userId: string
  idType: string
  idNumber: string
  name: string
  taxType?: string
  taxRate?: number
  isVerified?: boolean
  verifiedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface RevenueOverview {
  totalEarnings: number
  pendingEarnings: number
  paidAmount: number
  withdrawableAmount: number
  monthEarnings: number
  todayEarnings: number
  totalReaders: number
  totalTransactions: number
  totalBooks: number
}

export interface PaginatedFinanceResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface CreateAuthorWithdrawalPayload {
  amount: number
  method: 'alipay' | 'wechat' | 'bank'
  account_type: string
  account_name: string
  account_no: string
  bank_name?: string
  branch_name?: string
}

const toCents = (value?: number | null) => Number(value ?? 0)
const toYuan = (value?: number | null) => Number((toCents(value) / 100).toFixed(2))

function extractItems(raw: any): any[] {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  return []
}

function extractPagination(raw: any, page: number, pageSize: number) {
  return {
    total: Number(raw?.pagination?.total ?? extractItems(raw).length),
    page: Number(raw?.pagination?.page ?? page),
    pageSize: Number(raw?.pagination?.pageSize ?? pageSize),
  }
}

function normalizePagedResult<T>(
  raw: any,
  page: number,
  pageSize: number,
  mapper: (item: any) => T,
): PaginatedFinanceResult<T> {
  const pagination = extractPagination(raw, page, pageSize)
  return {
    items: extractItems(raw).map(mapper),
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.pageSize,
  }
}

function normalizeAuthorEarning(raw: any): AuthorEarning {
  const amountCents = toCents(raw?.author_income_cents ?? raw?.author_income ?? raw?.amount)
  const grossAmountCents = toCents(
    raw?.amount_cents ?? raw?.gross_amount_cents ?? raw?.gross_amount,
  )
  const platformFeeCents = toCents(raw?.platform_fee_cents ?? raw?.platform_fee)

  return {
    id: raw?.id ?? '',
    authorId: raw?.author_id ?? raw?.authorId ?? '',
    bookId: raw?.book_id ?? raw?.bookId,
    bookTitle: raw?.book_title ?? raw?.bookTitle,
    chapterId: raw?.chapter_id ?? raw?.chapterId,
    chapterTitle: raw?.chapter_title ?? raw?.chapterTitle,
    type: raw?.type ?? '',
    amount: toYuan(amountCents),
    amountCents,
    grossAmount: toYuan(grossAmountCents),
    grossAmountCents,
    platformFee: toYuan(platformFeeCents),
    platformFeeCents,
    status: raw?.status ?? (raw?.is_settled ? 'paid' : 'pending'),
    isSettled: Boolean(raw?.is_settled ?? raw?.isSettled),
    createdAt: raw?.created_at ?? raw?.createdAt ?? '',
    updatedAt: raw?.updated_at ?? raw?.updatedAt,
  }
}

function normalizeWithdrawalRequest(raw: any): WithdrawalRequest {
  const accountInfo = raw?.account_info ?? {}
  const amountCents = toCents(raw?.amount_cents ?? raw?.amount)
  const feeCents = toCents(raw?.fee_cents ?? raw?.fee)
  const actualAmountCents = toCents(raw?.actual_amount_cents ?? raw?.actual_amount)

  return {
    id: raw?.id ?? '',
    userId: raw?.user_id ?? raw?.userId ?? '',
    amount: toYuan(amountCents),
    amountCents,
    fee: toYuan(feeCents),
    feeCents,
    actualAmount: toYuan(actualAmountCents),
    actualAmountCents,
    status: raw?.status ?? 'pending',
    method: raw?.method ?? 'alipay',
    accountType: accountInfo?.account_type ?? raw?.account_type ?? raw?.accountType ?? '',
    accountName: accountInfo?.account_name ?? raw?.account_name ?? raw?.accountName ?? '',
    accountNo: accountInfo?.account_no ?? raw?.account_no ?? raw?.account ?? '',
    bankName: accountInfo?.bank_name ?? raw?.bank_name,
    branchName: accountInfo?.branch_name ?? raw?.branch_name,
    rejectReason: raw?.reject_reason ?? raw?.rejectReason,
    approvedAt: raw?.approved_at ?? raw?.approvedAt,
    completedAt: raw?.completed_at ?? raw?.completedAt,
    transactionId: raw?.transaction_id ?? raw?.transactionId,
    note: raw?.note,
    createdAt: raw?.created_at ?? raw?.createdAt ?? '',
    updatedAt: raw?.updated_at ?? raw?.updatedAt,
  }
}

function normalizeSettlement(raw: any): Settlement {
  const totalRevenueCents = toCents(raw?.total_revenue_cents ?? raw?.total_revenue)
  const platformFeeCents = toCents(raw?.platform_fee_cents ?? raw?.platform_fee)
  const actualIncomeCents = toCents(raw?.actual_income_cents ?? raw?.actual_income)
  const taxFeeCents = toCents(raw?.tax_fee_cents ?? raw?.tax_fee)
  const finalIncomeCents = toCents(raw?.final_income_cents ?? raw?.final_income)

  return {
    id: raw?.id ?? '',
    authorId: raw?.author_id ?? raw?.authorId ?? '',
    authorNickname: raw?.author_nickname ?? raw?.authorNickname,
    period:
      raw?.period ??
      [raw?.period_start ?? raw?.periodStart, raw?.period_end ?? raw?.periodEnd]
        .filter(Boolean)
        .join(' - '),
    totalRevenue: toYuan(totalRevenueCents),
    totalRevenueCents,
    platformFee: toYuan(platformFeeCents),
    platformFeeCents,
    actualIncome: toYuan(actualIncomeCents),
    actualIncomeCents,
    taxFee: toYuan(taxFeeCents),
    taxFeeCents,
    finalIncome: toYuan(finalIncomeCents),
    finalIncomeCents,
    earningCount: Number(raw?.earning_count ?? raw?.earningCount ?? 0),
    status: raw?.status ?? '',
    processedAt: raw?.processed_at ?? raw?.processedAt,
    transactionId: raw?.transaction_id ?? raw?.transactionId,
    note: raw?.note,
    createdAt: raw?.created_at ?? raw?.createdAt ?? '',
    updatedAt: raw?.updated_at ?? raw?.updatedAt,
  }
}

function normalizeRevenueStatistics(raw: any): RevenueStatistics {
  const totalRevenueCents = toCents(raw?.total_revenue_cents ?? raw?.total_revenue)
  const chapterIncomeCents = toCents(raw?.chapter_income_cents ?? raw?.chapter_income)
  const rewardIncomeCents = toCents(raw?.reward_income_cents ?? raw?.reward_income)
  const vipReadingIncomeCents = toCents(raw?.vip_reading_income_cents ?? raw?.vip_reading_income)

  return {
    authorId: raw?.author_id ?? raw?.authorId ?? '',
    period: raw?.period ?? '',
    periodStart: raw?.period_start ?? raw?.periodStart,
    periodEnd: raw?.period_end ?? raw?.periodEnd,
    totalRevenue: toYuan(totalRevenueCents),
    totalRevenueCents,
    chapterIncome: toYuan(chapterIncomeCents),
    chapterIncomeCents,
    rewardIncome: toYuan(rewardIncomeCents),
    rewardIncomeCents,
    vipReadingIncome: toYuan(vipReadingIncomeCents),
    vipReadingIncomeCents,
    transactionCount: Number(raw?.transaction_count ?? raw?.transactionCount ?? 0),
    readerCount: Number(raw?.reader_count ?? raw?.readerCount ?? 0),
    bookCount: Number(raw?.book_count ?? raw?.bookCount ?? 0),
    createdAt: raw?.created_at ?? raw?.createdAt,
    updatedAt: raw?.updated_at ?? raw?.updatedAt,
  }
}

function normalizeRevenueDetail(raw: any): RevenueDetail {
  const totalAmountCents = toCents(raw?.total_amount_cents ?? raw?.total_amount)
  const totalIncomeCents = toCents(raw?.total_income_cents ?? raw?.total_income)

  return {
    id: raw?.id ?? '',
    authorId: raw?.author_id ?? raw?.authorId ?? '',
    bookId: raw?.book_id ?? raw?.bookId ?? '',
    bookTitle: raw?.book_title ?? raw?.bookTitle ?? '',
    type: raw?.type ?? '',
    totalAmount: toYuan(totalAmountCents),
    totalAmountCents,
    totalIncome: toYuan(totalIncomeCents),
    totalIncomeCents,
    transactionCount: Number(raw?.transaction_count ?? raw?.transactionCount ?? 0),
    firstEarningAt: raw?.first_earning_at ?? raw?.firstEarningAt,
    lastEarningAt: raw?.last_earning_at ?? raw?.lastEarningAt,
    createdAt: raw?.created_at ?? raw?.createdAt,
    updatedAt: raw?.updated_at ?? raw?.updatedAt,
  }
}

function normalizeTaxInfo(raw: any): TaxInfo {
  return {
    id: raw?.id ?? '',
    userId: raw?.user_id ?? raw?.userId ?? '',
    idType: raw?.id_type ?? raw?.idType ?? '',
    idNumber: raw?.id_number ?? raw?.idNumber ?? '',
    name: raw?.name ?? '',
    taxType: raw?.tax_type ?? raw?.taxType,
    taxRate: Number(raw?.tax_rate ?? raw?.taxRate ?? 0),
    isVerified: Boolean(raw?.is_verified ?? raw?.isVerified),
    verifiedAt: raw?.verified_at ?? raw?.verifiedAt,
    createdAt: raw?.created_at ?? raw?.createdAt,
    updatedAt: raw?.updated_at ?? raw?.updatedAt,
  }
}

export async function getAuthorEarnings(
  params: {
    page?: number
    page_size?: number
    book_id?: string
    type?: string
    status?: string
  } = {},
): Promise<PaginatedFinanceResult<AuthorEarning>> {
  const page = params.page ?? 1
  const pageSize = params.page_size ?? 20
  const raw = await httpService.get<any>('/api/v1/finance/author/earnings', {
    params: {
      page,
      page_size: pageSize,
      book_id: params.book_id,
      type: params.type,
      status: params.status,
    },
  })

  return normalizePagedResult(raw, page, pageSize, normalizeAuthorEarning)
}

export async function getRevenueStatistics(
  params: {
    period?: string
    limit?: number
  } = {},
): Promise<RevenueStatistics[]> {
  const raw = await httpService.get<any>('/api/v1/finance/author/revenue-statistics', {
    params,
  })

  return extractItems(raw).map(normalizeRevenueStatistics)
}

export async function getRevenueDetails(
  params: {
    page?: number
    page_size?: number
  } = {},
): Promise<PaginatedFinanceResult<RevenueDetail>> {
  const page = params.page ?? 1
  const pageSize = params.page_size ?? 20
  const raw = await httpService.get<any>('/api/v1/finance/author/revenue-details', {
    params: { page, page_size: pageSize },
  })

  return normalizePagedResult(raw, page, pageSize, normalizeRevenueDetail)
}

export async function getWithdrawalRequests(
  params: {
    page?: number
    page_size?: number
    status?: string
  } = {},
): Promise<PaginatedFinanceResult<WithdrawalRequest>> {
  const page = params.page ?? 1
  const pageSize = params.page_size ?? 20
  const raw = await httpService.get<any>('/api/v1/finance/author/withdrawals', {
    params: {
      page,
      page_size: pageSize,
      status: params.status,
    },
  })

  return normalizePagedResult(raw, page, pageSize, normalizeWithdrawalRequest)
}

export async function createWithdrawal(
  data: CreateAuthorWithdrawalPayload,
): Promise<WithdrawalRequest> {
  const raw = await httpService.post<any>('/api/v1/finance/author/withdraw', data)
  return normalizeWithdrawalRequest(raw)
}

export async function getSettlements(
  params: {
    page?: number
    page_size?: number
  } = {},
): Promise<PaginatedFinanceResult<Settlement>> {
  const page = params.page ?? 1
  const pageSize = params.page_size ?? 20
  const raw = await httpService.get<any>('/api/v1/finance/author/settlements', {
    params: { page, page_size: pageSize },
  })

  return normalizePagedResult(raw, page, pageSize, normalizeSettlement)
}

export async function getSettlementDetail(settlementId: string): Promise<Settlement> {
  const raw = await httpService.get<any>(`/api/v1/finance/author/settlements/${settlementId}`)
  return normalizeSettlement(raw)
}

export async function getTaxInfo(): Promise<TaxInfo> {
  const raw = await httpService.get<any>('/api/v1/finance/author/tax-info')
  return normalizeTaxInfo(raw)
}

export async function updateTaxInfo(data: {
  id_type: string
  id_number: string
  name: string
  tax_type: string
}): Promise<TaxInfo> {
  const raw = await httpService.put<any>('/api/v1/finance/author/tax-info', data)
  return normalizeTaxInfo(raw)
}

export async function getRevenueOverview(): Promise<RevenueOverview> {
  const [earnings, withdrawals, monthlyStatistics, dailyStatistics] = await Promise.all([
    getAuthorEarnings({ page: 1, page_size: 100 }),
    getWithdrawalRequests({ page: 1, page_size: 100 }),
    getRevenueStatistics({ period: 'monthly' }),
    getRevenueStatistics({ period: 'daily', limit: 1 }),
  ])

  const totalEarnings = earnings.items.reduce((sum, item) => sum + item.amount, 0)
  const pendingEarnings = earnings.items
    .filter((item) => !item.isSettled && item.status !== 'paid')
    .reduce((sum, item) => sum + item.amount, 0)
  const paidAmount = withdrawals.items
    .filter((item) => item.status === 'completed' || item.status === 'approved')
    .reduce((sum, item) => sum + item.actualAmount, 0)
  const monthEarnings = monthlyStatistics[0]?.totalRevenue ?? 0
  const todayEarnings = dailyStatistics[0]?.totalRevenue ?? 0
  const totalReaders = Math.max(...monthlyStatistics.map((item) => item.readerCount), 0)
  const totalBooks = Math.max(...monthlyStatistics.map((item) => item.bookCount), 0)

  return {
    totalEarnings: Number(totalEarnings.toFixed(2)),
    pendingEarnings: Number(pendingEarnings.toFixed(2)),
    paidAmount: Number(paidAmount.toFixed(2)),
    withdrawableAmount: Number(Math.max(totalEarnings - paidAmount, 0).toFixed(2)),
    monthEarnings: Number(monthEarnings.toFixed(2)),
    todayEarnings: Number(todayEarnings.toFixed(2)),
    totalReaders,
    totalTransactions: earnings.total,
    totalBooks,
  }
}

export async function getDailyEarnings(
  params: {
    limit?: number
  } = {},
): Promise<Array<{ date: string; amount: number; orders: number }>> {
  const statistics = await getRevenueStatistics({ period: 'daily', limit: params.limit })
  return statistics.map((item) => ({
    date: item.periodStart ?? item.period,
    amount: item.totalRevenue,
    orders: item.transactionCount,
  }))
}

export async function getMonthlyEarnings(
  params: {
    limit?: number
  } = {},
): Promise<Array<{ month: string; amount: number; orders: number }>> {
  const statistics = await getRevenueStatistics({ period: 'monthly', limit: params.limit })
  return statistics.map((item) => ({
    month: item.periodStart ?? item.period,
    amount: item.totalRevenue,
    orders: item.transactionCount,
  }))
}

export const withdrawEarnings = createWithdrawal
export const getWithdrawalHistory = getWithdrawalRequests
