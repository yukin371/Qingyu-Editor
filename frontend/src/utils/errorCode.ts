/**
 * 错误码映射模块
 * 将后端4位数字错误码映射为前端字符串错误码
 * 支持国际化错误消息
 */

// ============================================
// i18n 支持（可选依赖）
// ============================================

// 声明 useI18n 类型
type UseI18nFunction = () => { locale: { value: string } }

// 尝试获取 useI18n，如果不可用则返回 null
function getUseI18n(): UseI18nFunction | null {
  try {
    // 在运行时动态检查 vue-i18n
    const vueI18n = (window as any).__VUE_I18N__
    if (vueI18n && vueI18n.useI18n) {
      return vueI18n.useI18n as UseI18nFunction
    }
  } catch {
    // 忽略错误
  }
  return null
}

// ============================================
// 后端错误码定义（与后端 pkg/response/codes.go 保持一致）
// ============================================

/**
 * 后端错误码枚举
 * 格式：4位数字
 * 分类规则：
 *   0       - 成功
 *   1xxx    - 通用客户端错误 (1000-1999)
 *   2xxx    - 用户相关错误 (2000-2999)
 *   3xxx    - 业务逻辑错误 (3000-3999)
 *   4xxx    - 频率限制错误 (4000-4999)
 *   5xxx    - 服务端错误 (5000-5999)
 */
export enum BackendErrorCode {
  // 成功
  SUCCESS = 0,

  // ========== 通用客户端错误 (1000-1099) ==========
  // 参数验证错误 (1000-1019)
  INVALID_PARAMS = 1001, // 参数错误
  MISSING_PARAM = 1008, // 缺少必填参数
  INVALID_FORMAT = 1009, // 参数格式无效
  INVALID_LENGTH = 1010, // 参数长度无效
  INVALID_TYPE = 1011, // 参数类型无效
  OUT_OF_RANGE = 1012, // 参数超出范围
  DUPLICATE_FIELD = 1013, // 字段重复
  UNKNOWN_FIELD = 1014, // 未知字段
  VALIDATION_FAILED = 1015, // 验证失败
  INVALID_VALUE = 1016, // 值无效
  INVALID_OPERATION = 1007, // 无效操作

  // 认证授权错误 (1020-1039)
  UNAUTHORIZED = 1002, // 未授权
  FORBIDDEN = 1003, // 禁止访问

  // 资源相关错误 (1040-1059)
  NOT_FOUND = 1004, // 资源不存在（通用）
  ALREADY_EXISTS = 1005, // 资源已存在
  CONFLICT = 1006, // 资源冲突
  RESOURCE_GONE = 1018, // 资源已删除

  // 请求相关错误 (1060-1079)
  METHOD_NOT_ALLOWED = 1019, // 方法不允许
  REQUEST_TIMEOUT = 1020, // 请求超时

  // ========== 用户相关错误 (2000-2199) ==========
  // 用户认证 (2000-2019)
  USER_NOT_FOUND = 2001, // 用户不存在
  INVALID_CREDENTIALS = 2002, // 用户名或密码错误
  EMAIL_ALREADY_USED = 2003, // 邮箱已被使用
  EMAIL_SEND_FAILED = 2004, // 邮件发送失败
  INVALID_CODE = 2005, // 验证码无效
  CODE_EXPIRED = 2006, // 验证码过期
  TOKEN_EXPIRED = 2007, // Token过期
  TOKEN_INVALID = 2008, // Token无效
  TOKEN_FORMAT_ERROR = 2009, // Token格式错误
  TOKEN_MISSING = 2010, // Token缺失
  REFRESH_TOKEN_EXPIRED = 2011, // Refresh Token过期
  REFRESH_TOKEN_INVALID = 2012, // Refresh Token无效
  PASSWORD_TOO_WEAK = 2013, // 密码强度不足
  ACCOUNT_LOCKED = 2014, // 账户已锁定
  ACCOUNT_DISABLED = 2015, // 账户已禁用
  TOKEN_REVOKED = 2016, // Token已被撤销
  SESSION_EXPIRED = 2017, // 会话过期
  TOO_MANY_ATTEMPTS = 2018, // 尝试次数过多
  ACCOUNT_NOT_VERIFIED = 2019, // 账户未验证

  // 邮箱和手机 (2020-2039)
  PHONE_ALREADY_USED = 2020, // 手机号已使用
  INVALID_PHONE_FORMAT = 2021, // 手机号格式无效
  EMAIL_NOT_VERIFIED = 2022, // 邮箱未验证
  PHONE_NOT_VERIFIED = 2023, // 手机号未验证
  SMS_SEND_FAILED = 2024, // 短信发送失败
  EMAIL_SEND_TOO_FREQUENT = 2025, // 邮件发送过于频繁
  SMS_SEND_TOO_FREQUENT = 2026, // 短信发送过于频繁

  // 评分相关 (2500-2599)
  RATING_NOT_FOUND = 2501, // 评分不存在
  RATING_INVALID = 2502, // 评分值无效（不在1-5范围）
  RATING_ALREADY_EXISTS = 2503, // 用户已评分
  RATING_UNAUTHORIZED = 2504, // 无权操作此评分
  RATING_TARGET_NOT_FOUND = 2505, // 评分目标不存在

  // ========== 业务逻辑错误 (3000-3199) ==========
  // 书籍相关 (3000-3039)
  BOOK_NOT_FOUND = 3001, // 书籍不存在
  BOOK_ALREADY_EXISTS = 3004, // 书籍已存在
  INVALID_BOOK_STATUS = 3005, // 书籍状态无效
  BOOK_DELETED = 3006, // 书籍已删除

  // 章节相关 (3040-3069)
  CHAPTER_NOT_FOUND = 3002, // 章节不存在
  CHAPTER_ALREADY_EXISTS = 3007, // 章节已存在
  INVALID_CHAPTER_STATUS = 3008, // 章节状态无效
  CHAPTER_DELETED = 3009, // 章节已删除

  // 财务相关 (3070-3099)
  INSUFFICIENT_BALANCE = 3003, // 余额不足
  INSUFFICIENT_QUOTA = 3010, // 配额不足
  WALLET_FROZEN = 3011, // 钱包已冻结
  TRANSACTION_FAILED = 3017, // 交易失败

  // 内容相关 (3100-3129)
  CONTENT_NOT_PUBLISHED = 3012, // 内容未发布
  CHAPTER_LOCKED = 3013, // 章节已锁定
  CONTENT_LOCKED = 3018, // 内容已锁定
  CONTENT_DELETED = 3019, // 内容已删除

  // 内容审核 (3130-3159)
  CONTENT_PENDING_REVIEW = 3014, // 内容待审核
  CONTENT_REJECTED = 3015, // 内容被拒绝
  CONTENT_VIOLATION = 3016, // 内容违规

  // 角色相关 (3160-3179)
  CHARACTER_NOT_FOUND = 3020, // 角色不存在
  INVALID_CHARACTER_DATA = 3021, // 角色数据无效

  // 评论相关 (3180-3199)
  REVIEW_NOT_FOUND = 3022, // 评论不存在

  // 收藏和关注 (3200-3219)
  COLLECTION_NOT_FOUND = 3023, // 收藏不存在
  ALREADY_COLLECTED = 3024, // 已收藏
  ALREADY_FOLLOWED = 3025, // 已关注

  // ========== 限流和配额错误 (4000-4099) ==========
  RATE_LIMIT_EXCEEDED = 4000, // 频率限制超出
  DAILY_LIMIT_EXCEEDED = 4001, // 每日限制超出
  HOURLY_LIMIT_EXCEEDED = 4002, // 每小时限制超出
  MINUTE_LIMIT_EXCEEDED = 4003, // 每分钟限制超出
  UPLOAD_LIMIT_EXCEEDED = 4004, // 上传限制超出
  STORAGE_LIMIT_EXCEEDED = 4005, // 存储限制超出
  API_QUOTA_EXCEEDED = 4006, // API配额超出
  CONCURRENT_LIMIT_EXCEEDED = 4007, // 并发限制超出
  RATE_LIMIT_LOGIN = 4008, // 登录频率限制
  RATE_LIMIT_EMAIL_SEND = 4009, // 邮件发送频率限制
  RATE_LIMIT_SMS_SEND = 4010, // 短信发送频率限制
  HOURLY_LIMIT_EXCEEDED_OLD = 4291, // 小时级限制超出（旧版，保留兼容）

  // ========== 服务端错误 (5000-5099) ==========
  // 系统错误 (5000-5019)
  INTERNAL_ERROR = 5000, // 内部错误
  DATABASE_ERROR = 5001, // 数据库错误
  SERVICE_UNAVAILABLE = 5002, // 服务不可用
  REDIS_ERROR = 5003, // Redis错误
  EXTERNAL_API_ERROR = 5004, // 外部API错误
  CACHE_ERROR = 5005, // 缓存错误
  QUEUE_ERROR = 5006, // 队列错误
  STORAGE_ERROR = 5007, // 存储错误
  NETWORK_ERROR = 5008, // 网络错误
  CONFIGURATION_ERROR = 5009, // 配置错误
  DEPENDENCY_ERROR = 5010, // 依赖错误
  TIMEOUT_ERROR = 5011, // 超时错误
  OVERLOADED_ERROR = 5012, // 过载错误
  MAINTENANCE_ERROR = 5013, // 维护中

  // 数据库详细错误 (5040-5059)
  DATABASE_CONNECTION_FAILED = 5014, // 数据库连接失败
  DATABASE_QUERY_TIMEOUT = 5015, // 数据库查询超时
  DATABASE_TRANSACTION_FAILED = 5016, // 数据库事务失败
}

// ============================================
// 前端错误码定义
// ============================================

/**
 * 前端错误类型枚举
 * 使用字符串常量，便于理解和维护
 */
export enum FrontendErrorCode {
  // 网络层错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  // 认证授权错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',

  // 请求错误
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RESOURCE_EXISTS = 'RESOURCE_EXISTS',
  RESOURCE_GONE = 'RESOURCE_GONE',

  // 业务错误
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_QUOTA = 'INSUFFICIENT_QUOTA',
  WALLET_FROZEN = 'WALLET_FROZEN',
  CONTENT_LOCKED = 'CONTENT_LOCKED',
  RATE_LIMITED = 'RATE_LIMITED',

  // 内容审核错误
  CONTENT_PENDING = 'CONTENT_PENDING',
  CONTENT_REJECTED = 'CONTENT_REJECTED',
  CONTENT_VIOLATION = 'CONTENT_VIOLATION',

  // 服务器错误
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_ERROR = 'EXTERNAL_ERROR',

  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// ============================================
// 错误码映射表
// ============================================

/**
 * 后端错误码到前端错误码的映射关系
 */
export const errorCodeMap: Record<number, FrontendErrorCode> = {
  // 通用客户端错误 (1000-1999)
  [BackendErrorCode.INVALID_PARAMS]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.MISSING_PARAM]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.INVALID_FORMAT]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.INVALID_LENGTH]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.INVALID_TYPE]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.OUT_OF_RANGE]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.DUPLICATE_FIELD]: FrontendErrorCode.CONFLICT,
  [BackendErrorCode.UNKNOWN_FIELD]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.VALIDATION_FAILED]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.INVALID_VALUE]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.INVALID_OPERATION]: FrontendErrorCode.BAD_REQUEST,
  [BackendErrorCode.UNAUTHORIZED]: FrontendErrorCode.UNAUTHORIZED,
  [BackendErrorCode.FORBIDDEN]: FrontendErrorCode.FORBIDDEN,
  [BackendErrorCode.NOT_FOUND]: FrontendErrorCode.NOT_FOUND,
  [BackendErrorCode.ALREADY_EXISTS]: FrontendErrorCode.RESOURCE_EXISTS,
  [BackendErrorCode.CONFLICT]: FrontendErrorCode.CONFLICT,
  [BackendErrorCode.RESOURCE_GONE]: FrontendErrorCode.RESOURCE_GONE,
  [BackendErrorCode.METHOD_NOT_ALLOWED]: FrontendErrorCode.BAD_REQUEST,
  [BackendErrorCode.REQUEST_TIMEOUT]: FrontendErrorCode.TIMEOUT,

  // 用户相关错误 (2000-2999)
  [BackendErrorCode.USER_NOT_FOUND]: FrontendErrorCode.NOT_FOUND,
  [BackendErrorCode.INVALID_CREDENTIALS]: FrontendErrorCode.UNAUTHORIZED,
  [BackendErrorCode.EMAIL_ALREADY_USED]: FrontendErrorCode.RESOURCE_EXISTS,
  [BackendErrorCode.EMAIL_SEND_FAILED]: FrontendErrorCode.EXTERNAL_ERROR,
  [BackendErrorCode.INVALID_CODE]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.CODE_EXPIRED]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.TOKEN_EXPIRED]: FrontendErrorCode.TOKEN_EXPIRED,
  [BackendErrorCode.TOKEN_INVALID]: FrontendErrorCode.TOKEN_INVALID,
  [BackendErrorCode.TOKEN_FORMAT_ERROR]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.TOKEN_MISSING]: FrontendErrorCode.UNAUTHORIZED,
  [BackendErrorCode.REFRESH_TOKEN_EXPIRED]: FrontendErrorCode.TOKEN_EXPIRED,
  [BackendErrorCode.REFRESH_TOKEN_INVALID]: FrontendErrorCode.TOKEN_INVALID,
  [BackendErrorCode.PASSWORD_TOO_WEAK]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.ACCOUNT_LOCKED]: FrontendErrorCode.ACCOUNT_LOCKED,
  [BackendErrorCode.ACCOUNT_DISABLED]: FrontendErrorCode.ACCOUNT_DISABLED,
  [BackendErrorCode.TOKEN_REVOKED]: FrontendErrorCode.TOKEN_INVALID,
  [BackendErrorCode.SESSION_EXPIRED]: FrontendErrorCode.TOKEN_EXPIRED,
  [BackendErrorCode.TOO_MANY_ATTEMPTS]: FrontendErrorCode.RATE_LIMITED,
  [BackendErrorCode.ACCOUNT_NOT_VERIFIED]: FrontendErrorCode.FORBIDDEN,
  [BackendErrorCode.PHONE_ALREADY_USED]: FrontendErrorCode.RESOURCE_EXISTS,
  [BackendErrorCode.INVALID_PHONE_FORMAT]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.EMAIL_NOT_VERIFIED]: FrontendErrorCode.FORBIDDEN,
  [BackendErrorCode.PHONE_NOT_VERIFIED]: FrontendErrorCode.FORBIDDEN,
  [BackendErrorCode.SMS_SEND_FAILED]: FrontendErrorCode.EXTERNAL_ERROR,
  [BackendErrorCode.EMAIL_SEND_TOO_FREQUENT]: FrontendErrorCode.RATE_LIMITED,
  [BackendErrorCode.SMS_SEND_TOO_FREQUENT]: FrontendErrorCode.RATE_LIMITED,

  // 评分相关错误 (2500-2599)
  [BackendErrorCode.RATING_NOT_FOUND]: FrontendErrorCode.NOT_FOUND,
  [BackendErrorCode.RATING_INVALID]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.RATING_ALREADY_EXISTS]: FrontendErrorCode.RESOURCE_EXISTS,
  [BackendErrorCode.RATING_UNAUTHORIZED]: FrontendErrorCode.FORBIDDEN,
  [BackendErrorCode.RATING_TARGET_NOT_FOUND]: FrontendErrorCode.NOT_FOUND,

  // 业务逻辑错误 (3000-3999)
  [BackendErrorCode.BOOK_NOT_FOUND]: FrontendErrorCode.NOT_FOUND,
  [BackendErrorCode.BOOK_ALREADY_EXISTS]: FrontendErrorCode.RESOURCE_EXISTS,
  [BackendErrorCode.INVALID_BOOK_STATUS]: FrontendErrorCode.BAD_REQUEST,
  [BackendErrorCode.BOOK_DELETED]: FrontendErrorCode.RESOURCE_GONE,
  [BackendErrorCode.CHAPTER_NOT_FOUND]: FrontendErrorCode.NOT_FOUND,
  [BackendErrorCode.CHAPTER_ALREADY_EXISTS]: FrontendErrorCode.RESOURCE_EXISTS,
  [BackendErrorCode.INVALID_CHAPTER_STATUS]: FrontendErrorCode.BAD_REQUEST,
  [BackendErrorCode.CHAPTER_DELETED]: FrontendErrorCode.RESOURCE_GONE,
  [BackendErrorCode.INSUFFICIENT_BALANCE]: FrontendErrorCode.INSUFFICIENT_BALANCE,
  [BackendErrorCode.INSUFFICIENT_QUOTA]: FrontendErrorCode.INSUFFICIENT_QUOTA,
  [BackendErrorCode.WALLET_FROZEN]: FrontendErrorCode.WALLET_FROZEN,
  [BackendErrorCode.TRANSACTION_FAILED]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.CONTENT_NOT_PUBLISHED]: FrontendErrorCode.CONTENT_LOCKED,
  [BackendErrorCode.CHAPTER_LOCKED]: FrontendErrorCode.CONTENT_LOCKED,
  [BackendErrorCode.CONTENT_LOCKED]: FrontendErrorCode.CONTENT_LOCKED,
  [BackendErrorCode.CONTENT_DELETED]: FrontendErrorCode.RESOURCE_GONE,
  [BackendErrorCode.CONTENT_PENDING_REVIEW]: FrontendErrorCode.CONTENT_PENDING,
  [BackendErrorCode.CONTENT_REJECTED]: FrontendErrorCode.CONTENT_REJECTED,
  [BackendErrorCode.CONTENT_VIOLATION]: FrontendErrorCode.CONTENT_VIOLATION,
  [BackendErrorCode.CHARACTER_NOT_FOUND]: FrontendErrorCode.NOT_FOUND,
  [BackendErrorCode.INVALID_CHARACTER_DATA]: FrontendErrorCode.VALIDATION_ERROR,
  [BackendErrorCode.REVIEW_NOT_FOUND]: FrontendErrorCode.NOT_FOUND,
  [BackendErrorCode.COLLECTION_NOT_FOUND]: FrontendErrorCode.NOT_FOUND,
  [BackendErrorCode.ALREADY_COLLECTED]: FrontendErrorCode.RESOURCE_EXISTS,
  [BackendErrorCode.ALREADY_FOLLOWED]: FrontendErrorCode.RESOURCE_EXISTS,

  // 频率限制错误 (4000-4999)
  [BackendErrorCode.RATE_LIMIT_EXCEEDED]: FrontendErrorCode.RATE_LIMITED,
  [BackendErrorCode.DAILY_LIMIT_EXCEEDED]: FrontendErrorCode.RATE_LIMITED,
  [BackendErrorCode.HOURLY_LIMIT_EXCEEDED]: FrontendErrorCode.RATE_LIMITED,
  [BackendErrorCode.MINUTE_LIMIT_EXCEEDED]: FrontendErrorCode.RATE_LIMITED,
  [BackendErrorCode.UPLOAD_LIMIT_EXCEEDED]: FrontendErrorCode.RATE_LIMITED,
  [BackendErrorCode.STORAGE_LIMIT_EXCEEDED]: FrontendErrorCode.INSUFFICIENT_QUOTA,
  [BackendErrorCode.API_QUOTA_EXCEEDED]: FrontendErrorCode.INSUFFICIENT_QUOTA,
  [BackendErrorCode.CONCURRENT_LIMIT_EXCEEDED]: FrontendErrorCode.RATE_LIMITED,
  [BackendErrorCode.RATE_LIMIT_LOGIN]: FrontendErrorCode.RATE_LIMITED,
  [BackendErrorCode.RATE_LIMIT_EMAIL_SEND]: FrontendErrorCode.RATE_LIMITED,
  [BackendErrorCode.RATE_LIMIT_SMS_SEND]: FrontendErrorCode.RATE_LIMITED,
  [BackendErrorCode.HOURLY_LIMIT_EXCEEDED_OLD]: FrontendErrorCode.RATE_LIMITED,

  // 服务端错误 (5000-5999)
  [BackendErrorCode.INTERNAL_ERROR]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.DATABASE_ERROR]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.SERVICE_UNAVAILABLE]: FrontendErrorCode.SERVICE_UNAVAILABLE,
  [BackendErrorCode.REDIS_ERROR]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.EXTERNAL_API_ERROR]: FrontendErrorCode.EXTERNAL_ERROR,
  [BackendErrorCode.CACHE_ERROR]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.QUEUE_ERROR]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.STORAGE_ERROR]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.NETWORK_ERROR]: FrontendErrorCode.NETWORK_ERROR,
  [BackendErrorCode.CONFIGURATION_ERROR]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.DEPENDENCY_ERROR]: FrontendErrorCode.EXTERNAL_ERROR,
  [BackendErrorCode.TIMEOUT_ERROR]: FrontendErrorCode.TIMEOUT,
  [BackendErrorCode.OVERLOADED_ERROR]: FrontendErrorCode.SERVICE_UNAVAILABLE,
  [BackendErrorCode.MAINTENANCE_ERROR]: FrontendErrorCode.SERVICE_UNAVAILABLE,
  [BackendErrorCode.DATABASE_CONNECTION_FAILED]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.DATABASE_QUERY_TIMEOUT]: FrontendErrorCode.SERVER_ERROR,
  [BackendErrorCode.DATABASE_TRANSACTION_FAILED]: FrontendErrorCode.SERVER_ERROR,
}

// ============================================
// HTTP状态码兜底映射
// ============================================

/**
 * HTTP状态码到前端错误码的兜底映射
 * 当后端错误码未在映射表中找到时使用
 */
export const httpStatusCodeMap: Record<number, FrontendErrorCode> = {
  400: FrontendErrorCode.BAD_REQUEST,
  401: FrontendErrorCode.UNAUTHORIZED,
  403: FrontendErrorCode.FORBIDDEN,
  404: FrontendErrorCode.NOT_FOUND,
  409: FrontendErrorCode.CONFLICT,
  422: FrontendErrorCode.VALIDATION_ERROR,
  429: FrontendErrorCode.RATE_LIMITED,
  500: FrontendErrorCode.SERVER_ERROR,
  502: FrontendErrorCode.EXTERNAL_ERROR,
  503: FrontendErrorCode.SERVICE_UNAVAILABLE,
  504: FrontendErrorCode.TIMEOUT
}

// ============================================
// 错误码范围映射（向后兼容）
// ============================================

/**
 * 根据错误码范围获取前端错误码
 * 用于处理未明确定义的后端错误码
 */
export function getFrontendCodeByRange(backendCode: number): FrontendErrorCode {
  // 成功
  if (backendCode === 0) {
    return FrontendErrorCode.UNKNOWN_ERROR // 成功不应该调用此函数
  }

  // 通用客户端错误 (1000-1999)
  if (backendCode >= 1000 && backendCode < 2000) {
    return FrontendErrorCode.BAD_REQUEST
  }

  // 用户相关错误 (2000-2999)
  if (backendCode >= 2000 && backendCode < 3000) {
    return FrontendErrorCode.UNAUTHORIZED
  }

  // 业务逻辑错误 (3000-3999)
  if (backendCode >= 3000 && backendCode < 4000) {
    return FrontendErrorCode.BAD_REQUEST
  }

  // 频率限制错误 (4000-4999)
  if (backendCode >= 4000 && backendCode < 5000) {
    return FrontendErrorCode.RATE_LIMITED
  }

  // 服务端错误 (5000-5999)
  if (backendCode >= 5000 && backendCode < 6000) {
    return FrontendErrorCode.SERVER_ERROR
  }

  return FrontendErrorCode.UNKNOWN_ERROR
}

// ============================================
// 错误码转换函数
// ============================================

/**
 * 将后端错误码转换为前端错误码
 * @param backendCode - 后端4位数字错误码
 * @param httpStatus - HTTP状态码（可选，用于兜底）
 * @returns 前端错误码
 */
export function mapBackendCodeToFrontend(
  backendCode: number,
  httpStatus?: number
): FrontendErrorCode {
  // 成功
  if (backendCode === 0) {
    return FrontendErrorCode.UNKNOWN_ERROR // 成功不应该调用此函数
  }

  // 优先使用精确映射
  if (errorCodeMap[backendCode]) {
    return errorCodeMap[backendCode]
  }

  // 使用HTTP状态码兜底
  if (httpStatus && httpStatusCodeMap[httpStatus]) {
    return httpStatusCodeMap[httpStatus]
  }

  // 根据错误码范围兜底
  return getFrontendCodeByRange(backendCode)
}

// ============================================
// 错误消息定义
// ============================================

/**
 * 错误消息结构
 */
export interface ErrorMessage {
  code: FrontendErrorCode
  title: string
  message: string
  description?: string
  action?: string
}

/**
 * 中文错误消息
 */
export const zhCNMessages: Record<FrontendErrorCode, ErrorMessage> = {
  [FrontendErrorCode.NETWORK_ERROR]: {
    code: FrontendErrorCode.NETWORK_ERROR,
    title: '网络错误',
    message: '网络连接失败，请检查网络设置',
    action: '请检查网络连接后重试'
  },
  [FrontendErrorCode.TIMEOUT]: {
    code: FrontendErrorCode.TIMEOUT,
    title: '请求超时',
    message: '请求超时，请稍后重试',
    action: '请稍后重试'
  },
  [FrontendErrorCode.CONNECTION_REFUSED]: {
    code: FrontendErrorCode.CONNECTION_REFUSED,
    title: '连接被拒绝',
    message: '无法连接到服务器',
    action: '请稍后重试或联系客服'
  },
  [FrontendErrorCode.UNAUTHORIZED]: {
    code: FrontendErrorCode.UNAUTHORIZED,
    title: '未登录',
    message: '您需要登录后才能继续操作',
    action: '请前往登录页面'
  },
  [FrontendErrorCode.FORBIDDEN]: {
    code: FrontendErrorCode.FORBIDDEN,
    title: '权限不足',
    message: '您没有权限执行此操作',
    action: '请联系管理员获取权限'
  },
  [FrontendErrorCode.TOKEN_EXPIRED]: {
    code: FrontendErrorCode.TOKEN_EXPIRED,
    title: '登录已过期',
    message: '您的登录状态已过期，请重新登录',
    action: '点击重新登录'
  },
  [FrontendErrorCode.TOKEN_INVALID]: {
    code: FrontendErrorCode.TOKEN_INVALID,
    title: '登录无效',
    message: '您的登录凭证无效，请重新登录',
    action: '点击重新登录'
  },
  [FrontendErrorCode.ACCOUNT_LOCKED]: {
    code: FrontendErrorCode.ACCOUNT_LOCKED,
    title: '账户已锁定',
    message: '您的账户已被锁定，暂时无法使用',
    action: '请联系客服解锁账户'
  },
  [FrontendErrorCode.ACCOUNT_DISABLED]: {
    code: FrontendErrorCode.ACCOUNT_DISABLED,
    title: '账户已禁用',
    message: '您的账户已被禁用',
    action: '请联系客服了解详情'
  },
  [FrontendErrorCode.BAD_REQUEST]: {
    code: FrontendErrorCode.BAD_REQUEST,
    title: '请求错误',
    message: '请求参数有误，请检查后重试',
    action: '请检查输入内容'
  },
  [FrontendErrorCode.NOT_FOUND]: {
    code: FrontendErrorCode.NOT_FOUND,
    title: '内容不存在',
    message: '您请求的内容不存在或已被删除',
    action: '请确认链接是否正确'
  },
  [FrontendErrorCode.CONFLICT]: {
    code: FrontendErrorCode.CONFLICT,
    title: '资源冲突',
    message: '操作冲突，请稍后重试',
    action: '请刷新页面后重试'
  },
  [FrontendErrorCode.VALIDATION_ERROR]: {
    code: FrontendErrorCode.VALIDATION_ERROR,
    title: '验证失败',
    message: '输入数据验证失败，请检查后重试',
    action: '请检查输入内容'
  },
  [FrontendErrorCode.RESOURCE_EXISTS]: {
    code: FrontendErrorCode.RESOURCE_EXISTS,
    title: '资源已存在',
    message: '您要创建的资源已存在',
    action: '请使用其他名称或编辑现有资源'
  },
  [FrontendErrorCode.RESOURCE_GONE]: {
    code: FrontendErrorCode.RESOURCE_GONE,
    title: '资源已删除',
    message: '该资源已被永久删除',
    action: '请联系管理员'
  },
  [FrontendErrorCode.INSUFFICIENT_BALANCE]: {
    code: FrontendErrorCode.INSUFFICIENT_BALANCE,
    title: '余额不足',
    message: '您的账户余额不足，无法完成操作',
    action: '请充值后重试'
  },
  [FrontendErrorCode.INSUFFICIENT_QUOTA]: {
    code: FrontendErrorCode.INSUFFICIENT_QUOTA,
    title: '配额不足',
    message: '您的使用配额已用完',
    action: '请升级套餐或等待配额重置'
  },
  [FrontendErrorCode.WALLET_FROZEN]: {
    code: FrontendErrorCode.WALLET_FROZEN,
    title: '钱包已冻结',
    message: '您的钱包已被冻结，暂时无法使用',
    action: '请联系客服解冻'
  },
  [FrontendErrorCode.CONTENT_LOCKED]: {
    code: FrontendErrorCode.CONTENT_LOCKED,
    title: '内容已锁定',
    message: '该内容已被锁定，暂时无法访问',
    action: '请购买或解锁后查看'
  },
  [FrontendErrorCode.RATE_LIMITED]: {
    code: FrontendErrorCode.RATE_LIMITED,
    title: '请求过于频繁',
    message: '您的操作过于频繁，请稍后再试',
    action: '请等待一段时间后重试'
  },
  [FrontendErrorCode.CONTENT_PENDING]: {
    code: FrontendErrorCode.CONTENT_PENDING,
    title: '内容审核中',
    message: '您的内容正在审核中，请耐心等待',
    action: '审核通过后将自动发布'
  },
  [FrontendErrorCode.CONTENT_REJECTED]: {
    code: FrontendErrorCode.CONTENT_REJECTED,
    title: '内容未通过审核',
    message: '您的内容未通过审核，请修改后重试',
    action: '请根据审核意见修改'
  },
  [FrontendErrorCode.CONTENT_VIOLATION]: {
    code: FrontendErrorCode.CONTENT_VIOLATION,
    title: '内容违规',
    message: '您的内容违反相关规定，已被处理',
    action: '请遵守社区规范'
  },
  [FrontendErrorCode.SERVER_ERROR]: {
    code: FrontendErrorCode.SERVER_ERROR,
    title: '服务器错误',
    message: '服务器出现错误，请稍后重试',
    action: '请稍后重试或联系客服'
  },
  [FrontendErrorCode.SERVICE_UNAVAILABLE]: {
    code: FrontendErrorCode.SERVICE_UNAVAILABLE,
    title: '服务不可用',
    message: '服务暂时不可用，请稍后再试',
    action: '请稍后重试'
  },
  [FrontendErrorCode.EXTERNAL_ERROR]: {
    code: FrontendErrorCode.EXTERNAL_ERROR,
    title: '外部服务错误',
    message: '外部服务出现错误，请稍后重试',
    action: '请稍后重试'
  },
  [FrontendErrorCode.UNKNOWN_ERROR]: {
    code: FrontendErrorCode.UNKNOWN_ERROR,
    title: '未知错误',
    message: '发生未知错误，请稍后重试',
    action: '请稍后重试或联系客服'
  }
}

/**
 * 英文错误消息
 */
export const enUSMessages: Record<FrontendErrorCode, ErrorMessage> = {
  [FrontendErrorCode.NETWORK_ERROR]: {
    code: FrontendErrorCode.NETWORK_ERROR,
    title: 'Network Error',
    message: 'Network connection failed. Please check your network settings.',
    action: 'Please check your connection and try again'
  },
  [FrontendErrorCode.TIMEOUT]: {
    code: FrontendErrorCode.TIMEOUT,
    title: 'Request Timeout',
    message: 'Request timed out. Please try again later.',
    action: 'Please try again later'
  },
  [FrontendErrorCode.CONNECTION_REFUSED]: {
    code: FrontendErrorCode.CONNECTION_REFUSED,
    title: 'Connection Refused',
    message: 'Unable to connect to the server.',
    action: 'Please try again later or contact support'
  },
  [FrontendErrorCode.UNAUTHORIZED]: {
    code: FrontendErrorCode.UNAUTHORIZED,
    title: 'Not Logged In',
    message: 'You need to log in to continue.',
    action: 'Please go to the login page'
  },
  [FrontendErrorCode.FORBIDDEN]: {
    code: FrontendErrorCode.FORBIDDEN,
    title: 'Access Denied',
    message: 'You do not have permission to perform this action.',
    action: 'Please contact your administrator'
  },
  [FrontendErrorCode.TOKEN_EXPIRED]: {
    code: FrontendErrorCode.TOKEN_EXPIRED,
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again.',
    action: 'Click to log in again'
  },
  [FrontendErrorCode.TOKEN_INVALID]: {
    code: FrontendErrorCode.TOKEN_INVALID,
    title: 'Invalid Session',
    message: 'Your session is invalid. Please log in again.',
    action: 'Click to log in again'
  },
  [FrontendErrorCode.ACCOUNT_LOCKED]: {
    code: FrontendErrorCode.ACCOUNT_LOCKED,
    title: 'Account Locked',
    message: 'Your account has been locked and is temporarily unavailable.',
    action: 'Please contact support to unlock'
  },
  [FrontendErrorCode.ACCOUNT_DISABLED]: {
    code: FrontendErrorCode.ACCOUNT_DISABLED,
    title: 'Account Disabled',
    message: 'Your account has been disabled.',
    action: 'Please contact support for more information'
  },
  [FrontendErrorCode.BAD_REQUEST]: {
    code: FrontendErrorCode.BAD_REQUEST,
    title: 'Bad Request',
    message: 'Invalid request parameters. Please check and try again.',
    action: 'Please check your input'
  },
  [FrontendErrorCode.NOT_FOUND]: {
    code: FrontendErrorCode.NOT_FOUND,
    title: 'Not Found',
    message: 'The requested content does not exist or has been deleted.',
    action: 'Please verify the link is correct'
  },
  [FrontendErrorCode.CONFLICT]: {
    code: FrontendErrorCode.CONFLICT,
    title: 'Conflict',
    message: 'Operation conflict. Please try again later.',
    action: 'Please refresh the page and try again'
  },
  [FrontendErrorCode.VALIDATION_ERROR]: {
    code: FrontendErrorCode.VALIDATION_ERROR,
    title: 'Validation Failed',
    message: 'Input validation failed. Please check and try again.',
    action: 'Please check your input'
  },
  [FrontendErrorCode.RESOURCE_EXISTS]: {
    code: FrontendErrorCode.RESOURCE_EXISTS,
    title: 'Resource Exists',
    message: 'The resource you are creating already exists.',
    action: 'Please use a different name or edit the existing resource'
  },
  [FrontendErrorCode.RESOURCE_GONE]: {
    code: FrontendErrorCode.RESOURCE_GONE,
    title: 'Resource Gone',
    message: 'This resource has been permanently deleted.',
    action: 'Please contact your administrator'
  },
  [FrontendErrorCode.INSUFFICIENT_BALANCE]: {
    code: FrontendErrorCode.INSUFFICIENT_BALANCE,
    title: 'Insufficient Balance',
    message: 'Your account balance is insufficient to complete this operation.',
    action: 'Please recharge and try again'
  },
  [FrontendErrorCode.INSUFFICIENT_QUOTA]: {
    code: FrontendErrorCode.INSUFFICIENT_QUOTA,
    title: 'Insufficient Quota',
    message: 'You have used up your quota.',
    action: 'Please upgrade your plan or wait for quota reset'
  },
  [FrontendErrorCode.WALLET_FROZEN]: {
    code: FrontendErrorCode.WALLET_FROZEN,
    title: 'Wallet Frozen',
    message: 'Your wallet has been frozen and is temporarily unavailable.',
    action: 'Please contact support to unfreeze'
  },
  [FrontendErrorCode.CONTENT_LOCKED]: {
    code: FrontendErrorCode.CONTENT_LOCKED,
    title: 'Content Locked',
    message: 'This content is locked and temporarily unavailable.',
    action: 'Please purchase or unlock to view'
  },
  [FrontendErrorCode.RATE_LIMITED]: {
    code: FrontendErrorCode.RATE_LIMITED,
    title: 'Too Many Requests',
    message: 'You are making requests too frequently. Please try again later.',
    action: 'Please wait a while before trying again'
  },
  [FrontendErrorCode.CONTENT_PENDING]: {
    code: FrontendErrorCode.CONTENT_PENDING,
    title: 'Content Under Review',
    message: 'Your content is under review. Please be patient.',
    action: 'It will be published automatically after approval'
  },
  [FrontendErrorCode.CONTENT_REJECTED]: {
    code: FrontendErrorCode.CONTENT_REJECTED,
    title: 'Content Rejected',
    message: 'Your content was not approved. Please modify and resubmit.',
    action: 'Please modify according to the review feedback'
  },
  [FrontendErrorCode.CONTENT_VIOLATION]: {
    code: FrontendErrorCode.CONTENT_VIOLATION,
    title: 'Content Violation',
    message: 'Your content violates relevant regulations and has been processed.',
    action: 'Please follow community guidelines'
  },
  [FrontendErrorCode.SERVER_ERROR]: {
    code: FrontendErrorCode.SERVER_ERROR,
    title: 'Server Error',
    message: 'A server error occurred. Please try again later.',
    action: 'Please try again later or contact support'
  },
  [FrontendErrorCode.SERVICE_UNAVAILABLE]: {
    code: FrontendErrorCode.SERVICE_UNAVAILABLE,
    title: 'Service Unavailable',
    message: 'The service is temporarily unavailable. Please try again later.',
    action: 'Please try again later'
  },
  [FrontendErrorCode.EXTERNAL_ERROR]: {
    code: FrontendErrorCode.EXTERNAL_ERROR,
    title: 'External Service Error',
    message: 'An external service error occurred. Please try again later.',
    action: 'Please try again later'
  },
  [FrontendErrorCode.UNKNOWN_ERROR]: {
    code: FrontendErrorCode.UNKNOWN_ERROR,
    title: 'Unknown Error',
    message: 'An unknown error occurred. Please try again later.',
    action: 'Please try again later or contact support'
  }
}

// ============================================
// 错误消息获取函数
// ============================================

/**
 * 语言消息映射
 */
const messagesMap: Record<string, Record<FrontendErrorCode, ErrorMessage>> = {
  'zh-CN': zhCNMessages,
  'en-US': enUSMessages
}

/**
 * 获取错误消息
 * @param code - 前端错误码
 * @param locale - 语言代码（可选，默认中文）
 * @returns 错误消息对象
 */
export function getErrorMessage(
  code: FrontendErrorCode,
  locale: string = 'zh-CN'
): ErrorMessage {
  const messages = messagesMap[locale] || messagesMap['zh-CN']
  return (
    messages[code] || {
      code,
      title: '未知错误',
      message: '发生未知错误，请稍后重试',
      action: '请稍后重试或联系客服'
    }
  )
}

/**
 * 使用i18n获取错误消息（在Vue组件中使用）
 * @param code - 前端错误码
 * @returns 错误消息对象
 */
export function useErrorMessage(code: FrontendErrorCode): ErrorMessage {
  try {
    const useI18nFn = getUseI18n()
    if (useI18nFn) {
      const { locale } = useI18nFn()
      return getErrorMessage(code, locale.value)
    }
  } catch {
    // i18n 未初始化或出错，使用默认中文
  }
  // 默认使用中文
  return getErrorMessage(code, 'zh-CN')
}

// ============================================
// 错误处理建议
// ============================================

/**
 * 错误处理建议
 */
export interface ErrorHandlingAdvice {
  shouldRetry: boolean
  shouldLogout: boolean
  shouldRedirect?: string
  retryDelay?: number
}

/**
 * 获取错误处理建议
 * @param code - 前端错误码
 * @returns 处理建议
 */
export function getErrorHandlingAdvice(code: FrontendErrorCode): ErrorHandlingAdvice {
  const adviceMap: Record<FrontendErrorCode, ErrorHandlingAdvice> = {
    [FrontendErrorCode.NETWORK_ERROR]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 3000
    },
    [FrontendErrorCode.TIMEOUT]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 2000
    },
    [FrontendErrorCode.CONNECTION_REFUSED]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 5000
    },
    [FrontendErrorCode.UNAUTHORIZED]: {
      shouldRetry: false,
      shouldLogout: true,
      shouldRedirect: '/login'
    },
    [FrontendErrorCode.FORBIDDEN]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.TOKEN_EXPIRED]: {
      shouldRetry: false,
      shouldLogout: true,
      shouldRedirect: '/login'
    },
    [FrontendErrorCode.TOKEN_INVALID]: {
      shouldRetry: false,
      shouldLogout: true,
      shouldRedirect: '/login'
    },
    [FrontendErrorCode.ACCOUNT_LOCKED]: {
      shouldRetry: false,
      shouldLogout: false,
      shouldRedirect: '/support'
    },
    [FrontendErrorCode.ACCOUNT_DISABLED]: {
      shouldRetry: false,
      shouldLogout: false,
      shouldRedirect: '/support'
    },
    [FrontendErrorCode.BAD_REQUEST]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.NOT_FOUND]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.CONFLICT]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 1000
    },
    [FrontendErrorCode.VALIDATION_ERROR]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.RESOURCE_EXISTS]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.RESOURCE_GONE]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.INSUFFICIENT_BALANCE]: {
      shouldRetry: false,
      shouldLogout: false,
      shouldRedirect: '/wallet/recharge'
    },
    [FrontendErrorCode.INSUFFICIENT_QUOTA]: {
      shouldRetry: false,
      shouldLogout: false,
      shouldRedirect: '/subscription'
    },
    [FrontendErrorCode.WALLET_FROZEN]: {
      shouldRetry: false,
      shouldLogout: false,
      shouldRedirect: '/support'
    },
    [FrontendErrorCode.CONTENT_LOCKED]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.RATE_LIMITED]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 5000
    },
    [FrontendErrorCode.CONTENT_PENDING]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.CONTENT_REJECTED]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.CONTENT_VIOLATION]: {
      shouldRetry: false,
      shouldLogout: false
    },
    [FrontendErrorCode.SERVER_ERROR]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 3000
    },
    [FrontendErrorCode.SERVICE_UNAVAILABLE]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 5000
    },
    [FrontendErrorCode.EXTERNAL_ERROR]: {
      shouldRetry: true,
      shouldLogout: false,
      retryDelay: 3000
    },
    [FrontendErrorCode.UNKNOWN_ERROR]: {
      shouldRetry: false,
      shouldLogout: false
    }
  }

  return (
    adviceMap[code] || {
      shouldRetry: false,
      shouldLogout: false
    }
  )
}

// ============================================
// 便捷导出
// ============================================

export default {
  BackendErrorCode,
  FrontendErrorCode,
  errorCodeMap,
  httpStatusCodeMap,
  mapBackendCodeToFrontend,
  getFrontendCodeByRange,
  getErrorMessage,
  useErrorMessage,
  getErrorHandlingAdvice,
  zhCNMessages,
  enUSMessages
}
