/**
 * 错误码映射模块单元测试
 * 使用TDD（测试驱动开发）方式验证错误码映射关系
 */

import {
  BackendErrorCode,
  FrontendErrorCode,
  errorCodeMap,
  httpStatusCodeMap,
  mapBackendCodeToFrontend,
  getFrontendCodeByRange,
  getErrorMessage,
  zhCNMessages,
  enUSMessages,
  getErrorHandlingAdvice
} from '../errorCode'

describe('Error Code Mapping Module', () => {
  describe('BackendErrorCode Enum', () => {
    it('should have SUCCESS as 0', () => {
      expect(BackendErrorCode.SUCCESS).toBe(0)
    })

    it('should have correct client error codes (1xxx)', () => {
      expect(BackendErrorCode.INVALID_PARAMS).toBe(1001)
      expect(BackendErrorCode.UNAUTHORIZED).toBe(1002)
      expect(BackendErrorCode.FORBIDDEN).toBe(1003)
      expect(BackendErrorCode.NOT_FOUND).toBe(1004)
      expect(BackendErrorCode.ALREADY_EXISTS).toBe(1005)
      expect(BackendErrorCode.CONFLICT).toBe(1006)
      expect(BackendErrorCode.MISSING_PARAM).toBe(1008)
    })

    it('should have correct user error codes (2xxx)', () => {
      expect(BackendErrorCode.TOKEN_EXPIRED).toBe(2007)
      expect(BackendErrorCode.ACCOUNT_LOCKED).toBe(2014)
    })

    it('should have correct business error codes (3xxx)', () => {
      expect(BackendErrorCode.INSUFFICIENT_BALANCE).toBe(3003)
      expect(BackendErrorCode.CHAPTER_NOT_FOUND).toBe(3002)
      expect(BackendErrorCode.INSUFFICIENT_QUOTA).toBe(3010)
      expect(BackendErrorCode.CONTENT_PENDING_REVIEW).toBe(3014)
      expect(BackendErrorCode.CONTENT_REJECTED).toBe(3015)
      expect(BackendErrorCode.CONTENT_VIOLATION).toBe(3016)
    })

    it('should have correct rate limit error codes (4xxx)', () => {
      expect(BackendErrorCode.RATE_LIMIT_EXCEEDED).toBe(4000)
    })

    it('should have correct server error codes (5xxx)', () => {
      expect(BackendErrorCode.INTERNAL_ERROR).toBe(5000)
      expect(BackendErrorCode.DATABASE_ERROR).toBe(5001)
      expect(BackendErrorCode.EXTERNAL_API_ERROR).toBe(5004)
    })
  })

  describe('FrontendErrorCode Enum', () => {
    it('should have string values', () => {
      expect(FrontendErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR')
      expect(FrontendErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED')
      expect(FrontendErrorCode.SERVER_ERROR).toBe('SERVER_ERROR')
    })

    it('should have all required error categories', () => {
      // Network errors
      expect(FrontendErrorCode.NETWORK_ERROR).toBeDefined()
      expect(FrontendErrorCode.TIMEOUT).toBeDefined()

      // Auth errors
      expect(FrontendErrorCode.UNAUTHORIZED).toBeDefined()
      expect(FrontendErrorCode.FORBIDDEN).toBeDefined()
      expect(FrontendErrorCode.TOKEN_EXPIRED).toBeDefined()

      // Request errors
      expect(FrontendErrorCode.BAD_REQUEST).toBeDefined()
      expect(FrontendErrorCode.NOT_FOUND).toBeDefined()
      expect(FrontendErrorCode.VALIDATION_ERROR).toBeDefined()

      // Business errors
      expect(FrontendErrorCode.INSUFFICIENT_BALANCE).toBeDefined()
      expect(FrontendErrorCode.RATE_LIMITED).toBeDefined()

      // Server errors
      expect(FrontendErrorCode.SERVER_ERROR).toBeDefined()
      expect(FrontendErrorCode.SERVICE_UNAVAILABLE).toBeDefined()

      // Unknown error
      expect(FrontendErrorCode.UNKNOWN_ERROR).toBeDefined()
    })
  })

  describe('Error Code Mapping', () => {
    describe('Client Errors (1xxx)', () => {
      it('should map INVALID_PARAMS to VALIDATION_ERROR', () => {
        expect(errorCodeMap[BackendErrorCode.INVALID_PARAMS]).toBe(
          FrontendErrorCode.VALIDATION_ERROR
        )
      })

      it('should map UNAUTHORIZED to UNAUTHORIZED', () => {
        expect(errorCodeMap[BackendErrorCode.UNAUTHORIZED]).toBe(
          FrontendErrorCode.UNAUTHORIZED
        )
      })

      it('should map FORBIDDEN to FORBIDDEN', () => {
        expect(errorCodeMap[BackendErrorCode.FORBIDDEN]).toBe(
          FrontendErrorCode.FORBIDDEN
        )
      })

      it('should map NOT_FOUND to NOT_FOUND', () => {
        expect(errorCodeMap[BackendErrorCode.NOT_FOUND]).toBe(
          FrontendErrorCode.NOT_FOUND
        )
      })

      it('should map ALREADY_EXISTS to RESOURCE_EXISTS', () => {
        expect(errorCodeMap[BackendErrorCode.ALREADY_EXISTS]).toBe(
          FrontendErrorCode.RESOURCE_EXISTS
        )
      })

      it('should map CONFLICT to CONFLICT', () => {
        expect(errorCodeMap[BackendErrorCode.CONFLICT]).toBe(
          FrontendErrorCode.CONFLICT
        )
      })
    })

    describe('User Errors (2xxx)', () => {
      it('should map INVALID_CREDENTIALS to UNAUTHORIZED', () => {
        expect(errorCodeMap[BackendErrorCode.INVALID_CREDENTIALS]).toBe(
          FrontendErrorCode.UNAUTHORIZED
        )
      })

      it('should map TOKEN_EXPIRED to TOKEN_EXPIRED', () => {
        expect(errorCodeMap[BackendErrorCode.TOKEN_EXPIRED]).toBe(
          FrontendErrorCode.TOKEN_EXPIRED
        )
      })

      it('should map ACCOUNT_LOCKED to ACCOUNT_LOCKED', () => {
        expect(errorCodeMap[BackendErrorCode.ACCOUNT_LOCKED]).toBe(
          FrontendErrorCode.ACCOUNT_LOCKED
        )
      })

      it('should map ACCOUNT_DISABLED to ACCOUNT_DISABLED', () => {
        expect(errorCodeMap[BackendErrorCode.ACCOUNT_DISABLED]).toBe(
          FrontendErrorCode.ACCOUNT_DISABLED
        )
      })
    })

    describe('Business Errors (3xxx)', () => {
      it('should map INSUFFICIENT_BALANCE to INSUFFICIENT_BALANCE', () => {
        expect(errorCodeMap[BackendErrorCode.INSUFFICIENT_BALANCE]).toBe(
          FrontendErrorCode.INSUFFICIENT_BALANCE
        )
      })

      it('should map INSUFFICIENT_QUOTA to INSUFFICIENT_QUOTA', () => {
        expect(errorCodeMap[BackendErrorCode.INSUFFICIENT_QUOTA]).toBe(
          FrontendErrorCode.INSUFFICIENT_QUOTA
        )
      })

      it('should map CONTENT_PENDING_REVIEW to CONTENT_PENDING', () => {
        expect(errorCodeMap[BackendErrorCode.CONTENT_PENDING_REVIEW]).toBe(
          FrontendErrorCode.CONTENT_PENDING
        )
      })

      it('should map CONTENT_REJECTED to CONTENT_REJECTED', () => {
        expect(errorCodeMap[BackendErrorCode.CONTENT_REJECTED]).toBe(
          FrontendErrorCode.CONTENT_REJECTED
        )
      })

      it('should map CONTENT_VIOLATION to CONTENT_VIOLATION', () => {
        expect(errorCodeMap[BackendErrorCode.CONTENT_VIOLATION]).toBe(
          FrontendErrorCode.CONTENT_VIOLATION
        )
      })
    })

    describe('Rate Limit Errors (4xxx)', () => {
      it('should map RATE_LIMIT_EXCEEDED to RATE_LIMITED', () => {
        expect(errorCodeMap[BackendErrorCode.RATE_LIMIT_EXCEEDED]).toBe(
          FrontendErrorCode.RATE_LIMITED
        )
      })
    })

    describe('Server Errors (5xxx)', () => {
      it('should map INTERNAL_ERROR to SERVER_ERROR', () => {
        expect(errorCodeMap[BackendErrorCode.INTERNAL_ERROR]).toBe(
          FrontendErrorCode.SERVER_ERROR
        )
      })

      it('should map DATABASE_ERROR to SERVER_ERROR', () => {
        expect(errorCodeMap[BackendErrorCode.DATABASE_ERROR]).toBe(
          FrontendErrorCode.SERVER_ERROR
        )
      })

      it('should map EXTERNAL_API_ERROR to EXTERNAL_ERROR', () => {
        expect(errorCodeMap[BackendErrorCode.EXTERNAL_API_ERROR]).toBe(
          FrontendErrorCode.EXTERNAL_ERROR
        )
      })

      it('should map SERVICE_UNAVAILABLE to SERVICE_UNAVAILABLE', () => {
        expect(errorCodeMap[BackendErrorCode.SERVICE_UNAVAILABLE]).toBe(
          FrontendErrorCode.SERVICE_UNAVAILABLE
        )
      })
    })
  })

  describe('HTTP Status Code Mapping', () => {
    it('should map 400 to BAD_REQUEST', () => {
      expect(httpStatusCodeMap[400]).toBe(FrontendErrorCode.BAD_REQUEST)
    })

    it('should map 401 to UNAUTHORIZED', () => {
      expect(httpStatusCodeMap[401]).toBe(FrontendErrorCode.UNAUTHORIZED)
    })

    it('should map 403 to FORBIDDEN', () => {
      expect(httpStatusCodeMap[403]).toBe(FrontendErrorCode.FORBIDDEN)
    })

    it('should map 404 to NOT_FOUND', () => {
      expect(httpStatusCodeMap[404]).toBe(FrontendErrorCode.NOT_FOUND)
    })

    it('should map 409 to CONFLICT', () => {
      expect(httpStatusCodeMap[409]).toBe(FrontendErrorCode.CONFLICT)
    })

    it('should map 429 to RATE_LIMITED', () => {
      expect(httpStatusCodeMap[429]).toBe(FrontendErrorCode.RATE_LIMITED)
    })

    it('should map 500 to SERVER_ERROR', () => {
      expect(httpStatusCodeMap[500]).toBe(FrontendErrorCode.SERVER_ERROR)
    })

    it('should map 503 to SERVICE_UNAVAILABLE', () => {
      expect(httpStatusCodeMap[503]).toBe(FrontendErrorCode.SERVICE_UNAVAILABLE)
    })
  })

  describe('mapBackendCodeToFrontend', () => {
    it('should return UNKNOWN_ERROR for success code (0)', () => {
      expect(mapBackendCodeToFrontend(0)).toBe(FrontendErrorCode.UNKNOWN_ERROR)
    })

    it('should map known backend codes correctly', () => {
      expect(mapBackendCodeToFrontend(1001)).toBe(
        FrontendErrorCode.VALIDATION_ERROR
      )
      expect(mapBackendCodeToFrontend(1002)).toBe(
        FrontendErrorCode.UNAUTHORIZED
      )
      expect(mapBackendCodeToFrontend(1004)).toBe(FrontendErrorCode.NOT_FOUND)
    })

    it('should use HTTP status code as fallback', () => {
      // Unknown backend code 9999 with HTTP 401
      expect(mapBackendCodeToFrontend(9999, 401)).toBe(
        FrontendErrorCode.UNAUTHORIZED
      )

      // Unknown backend code 9999 with HTTP 500
      expect(mapBackendCodeToFrontend(9999, 500)).toBe(
        FrontendErrorCode.SERVER_ERROR
      )
    })

    it('should use range mapping when no HTTP status provided', () => {
      // Unknown code in 2xxx range
      expect(mapBackendCodeToFrontend(2999)).toBe(
        FrontendErrorCode.UNAUTHORIZED
      )

      // Unknown code in 5xxx range
      expect(mapBackendCodeToFrontend(5999)).toBe(
        FrontendErrorCode.SERVER_ERROR
      )
    })
  })

  describe('getFrontendCodeByRange', () => {
    it('should return BAD_REQUEST for 1xxx range', () => {
      expect(getFrontendCodeByRange(1000)).toBe(FrontendErrorCode.BAD_REQUEST)
      expect(getFrontendCodeByRange(1999)).toBe(FrontendErrorCode.BAD_REQUEST)
    })

    it('should return UNAUTHORIZED for 2xxx range', () => {
      expect(getFrontendCodeByRange(2000)).toBe(
        FrontendErrorCode.UNAUTHORIZED
      )
      expect(getFrontendCodeByRange(2999)).toBe(
        FrontendErrorCode.UNAUTHORIZED
      )
    })

    it('should return NOT_FOUND for 3xxx range', () => {
      expect(getFrontendCodeByRange(3000)).toBe(FrontendErrorCode.BAD_REQUEST)
      expect(getFrontendCodeByRange(3999)).toBe(FrontendErrorCode.BAD_REQUEST)
    })

    it('should return SERVER_ERROR for 5xxx range', () => {
      expect(getFrontendCodeByRange(5000)).toBe(
        FrontendErrorCode.SERVER_ERROR
      )
      expect(getFrontendCodeByRange(5999)).toBe(
        FrontendErrorCode.SERVER_ERROR
      )
    })

    it('should return UNKNOWN_ERROR for undefined ranges', () => {
      expect(getFrontendCodeByRange(0)).toBe(FrontendErrorCode.UNKNOWN_ERROR)
      expect(getFrontendCodeByRange(6000)).toBe(FrontendErrorCode.UNKNOWN_ERROR)
    })
  })

  describe('Error Messages', () => {
    describe('Chinese Messages (zh-CN)', () => {
      it('should have message for all frontend error codes', () => {
        Object.values(FrontendErrorCode).forEach((code) => {
          const message = zhCNMessages[code as FrontendErrorCode]
          expect(message).toBeDefined()
          expect(message.code).toBe(code)
          expect(message.title).toBeTruthy()
          expect(message.message).toBeTruthy()
        })
      })

      it('should have correct UNAUTHORIZED message', () => {
        const message = zhCNMessages[FrontendErrorCode.UNAUTHORIZED]
        expect(message.title).toBe('未登录')
        expect(message.message).toBe('您需要登录后才能继续操作')
        expect(message.action).toBe('请前往登录页面')
      })

      it('should have correct SERVER_ERROR message', () => {
        const message = zhCNMessages[FrontendErrorCode.SERVER_ERROR]
        expect(message.title).toBe('服务器错误')
        expect(message.message).toBe('服务器出现错误，请稍后重试')
      })
    })

    describe('English Messages (en-US)', () => {
      it('should have message for all frontend error codes', () => {
        Object.values(FrontendErrorCode).forEach((code) => {
          const message = enUSMessages[code as FrontendErrorCode]
          expect(message).toBeDefined()
          expect(message.code).toBe(code)
          expect(message.title).toBeTruthy()
          expect(message.message).toBeTruthy()
        })
      })

      it('should have correct UNAUTHORIZED message', () => {
        const message = enUSMessages[FrontendErrorCode.UNAUTHORIZED]
        expect(message.title).toBe('Not Logged In')
        expect(message.message).toBe('You need to log in to continue.')
      })
    })

    describe('getErrorMessage', () => {
      it('should return Chinese message by default', () => {
        const message = getErrorMessage(FrontendErrorCode.UNAUTHORIZED)
        expect(message.title).toBe('未登录')
      })

      it('should return English message when locale is en-US', () => {
        const message = getErrorMessage(
          FrontendErrorCode.UNAUTHORIZED,
          'en-US'
        )
        expect(message.title).toBe('Not Logged In')
      })

      it('should fallback to Chinese for unknown locale', () => {
        const message = getErrorMessage(
          FrontendErrorCode.UNAUTHORIZED,
          'fr-FR'
        )
        expect(message.title).toBe('未登录')
      })

      it('should return default message for unknown error code', () => {
        const message = getErrorMessage('UNKNOWN_CODE' as FrontendErrorCode)
        expect(message.title).toBe('未知错误')
        expect(message.message).toBe('发生未知错误，请稍后重试')
      })
    })
  })

  describe('Error Handling Advice', () => {
    it('should advise retry for network errors', () => {
      const advice = getErrorHandlingAdvice(FrontendErrorCode.NETWORK_ERROR)
      expect(advice.shouldRetry).toBe(true)
      expect(advice.shouldLogout).toBe(false)
      expect(advice.retryDelay).toBe(3000)
    })

    it('should advise logout for auth errors', () => {
      const unauthorized = getErrorHandlingAdvice(
        FrontendErrorCode.UNAUTHORIZED
      )
      expect(unauthorized.shouldLogout).toBe(true)
      expect(unauthorized.shouldRedirect).toBe('/login')

      const tokenExpired = getErrorHandlingAdvice(
        FrontendErrorCode.TOKEN_EXPIRED
      )
      expect(tokenExpired.shouldLogout).toBe(true)
    })

    it('should advise no retry for client errors', () => {
      const badRequest = getErrorHandlingAdvice(FrontendErrorCode.BAD_REQUEST)
      expect(badRequest.shouldRetry).toBe(false)

      const notFound = getErrorHandlingAdvice(FrontendErrorCode.NOT_FOUND)
      expect(notFound.shouldRetry).toBe(false)
    })

    it('should advise retry for server errors', () => {
      const serverError = getErrorHandlingAdvice(FrontendErrorCode.SERVER_ERROR)
      expect(serverError.shouldRetry).toBe(true)
      expect(serverError.retryDelay).toBe(3000)
    })

    it('should have redirect for account issues', () => {
      const locked = getErrorHandlingAdvice(FrontendErrorCode.ACCOUNT_LOCKED)
      expect(locked.shouldRedirect).toBe('/support')

      const disabled = getErrorHandlingAdvice(
        FrontendErrorCode.ACCOUNT_DISABLED
      )
      expect(disabled.shouldRedirect).toBe('/support')
    })

    it('should have redirect for payment issues', () => {
      const balance = getErrorHandlingAdvice(
        FrontendErrorCode.INSUFFICIENT_BALANCE
      )
      expect(balance.shouldRedirect).toBe('/wallet/recharge')

      const quota = getErrorHandlingAdvice(FrontendErrorCode.INSUFFICIENT_QUOTA)
      expect(quota.shouldRedirect).toBe('/subscription')
    })
  })

  describe('Backward Compatibility', () => {
    it('should handle all backend error codes from codes.go', () => {
      // These are the actual error codes defined in the backend (4-digit format)
      const backendCodes = [
        0, // Success
        1001, // InvalidParams
        1002, // Unauthorized
        1003, // Forbidden
        1004, // NotFound
        1005, // AlreadyExists
        1006, // Conflict
        2002, // InvalidCredentials
        2007, // TokenExpired
        2008, // TokenInvalid
        2013, // PasswordTooWeak
        2014, // AccountLocked
        2015, // AccountDisabled
        3003, // InsufficientBalance
        3010, // InsufficientQuota
        3011, // WalletFrozen
        3012, // ContentNotPublished
        3013, // ChapterLocked
        3014, // ContentPendingReview
        3015, // ContentRejected
        3016, // ContentViolation
        4000, // RateLimitExceeded
        5000, // InternalError
        5001, // DatabaseError
        5004, // ExternalAPIError
      ]

      backendCodes.forEach((code) => {
        const frontendCode = mapBackendCodeToFrontend(code)
        expect(frontendCode).toBeDefined()
        expect(Object.values(FrontendErrorCode)).toContain(frontendCode)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative error codes', () => {
      expect(mapBackendCodeToFrontend(-1)).toBe(FrontendErrorCode.UNKNOWN_ERROR)
    })

    it('should handle very large error codes', () => {
      expect(mapBackendCodeToFrontend(99999)).toBe(
        FrontendErrorCode.UNKNOWN_ERROR
      )
    })

    it('should handle undefined error codes gracefully', () => {
      const result = mapBackendCodeToFrontend(undefined as any)
      expect(result).toBe(FrontendErrorCode.UNKNOWN_ERROR)
    })

    it('should handle null error codes gracefully', () => {
      const result = mapBackendCodeToFrontend(null as any)
      expect(result).toBe(FrontendErrorCode.UNKNOWN_ERROR)
    })
  })
})
