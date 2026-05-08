// src/types/error.types.ts

/**
 * 统一错误响应接口 (UER - Unified Error Response)
 *
 * NOTE: This interface is used for the NEW unified error handling system.
 * The old ErrorResponse in src/types/api.ts is for backward compatibility.
 *
 * Key differences from api.ts ErrorResponse:
 * - error field is required (not optional)
 * - timestamp is ISO 8601 string (not Unix number)
 * - includes details field for additional error context
 */
export interface UnifiedErrorResponse {
  code: number
  message: string
  error: string
  details?: Record<string, unknown>
  timestamp: string
}

// Type alias for clearer usage in the unified system
export type ErrorResponse = UnifiedErrorResponse

/**
 * 模块码枚举
 */
export enum ModuleCode {
  SUCCESS = 0,
  GENERAL = 1,      // 通用/基础
  AUTH = 2,         // 认证授权
  BOOKSTORE = 3,    // 书城模块
  READER = 4,       // 阅读器模块
  WRITER = 5,       // 写作模块
  USER = 6,         // 用户模块
  SOCIAL = 7,       // 社交模块
}

/**
 * 错误类别枚举
 */
export enum ErrorCategory {
  SUCCESS = 0,      // 成功
  PARAM = 1,        // 参数错误
  PERMISSION = 2,   // 权限错误
  NOT_FOUND = 3,    // 资源不存在
  BUSINESS = 4,     // 业务逻辑错误
  SYSTEM = 5,       // 系统错误
}

/**
 * 构建错误码
 */
export function buildErrorCode(module: ModuleCode, category: ErrorCategory, specific: number): number {
  return module * 1000 + category * 100 + specific
}
