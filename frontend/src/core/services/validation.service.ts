/**
 * Validation Service
 * Common validation logic for forms and data
 */

import { REGEX } from '../config/constants'

export interface ValidationResult {
  valid: boolean
  message?: string
}

class ValidationService {
  /**
   * Validate email address
   */
  public validateEmail(email: string): ValidationResult {
    if (!email) {
      return { valid: false, message: '请输入邮箱地址' }
    }

    if (!REGEX.EMAIL.test(email)) {
      return { valid: false, message: '请输入有效的邮箱地址' }
    }

    return { valid: true }
  }

  /**
   * Validate phone number
   */
  public validatePhone(phone: string): ValidationResult {
    if (!phone) {
      return { valid: false, message: '请输入手机号' }
    }

    if (!REGEX.PHONE.test(phone)) {
      return { valid: false, message: '请输入有效的手机号' }
    }

    return { valid: true }
  }

  /**
   * Validate password
   */
  public validatePassword(password: string): ValidationResult {
    if (!password) {
      return { valid: false, message: '请输入密码' }
    }

    if (password.length < 8) {
      return { valid: false, message: '密码长度至少为8位' }
    }

    if (!REGEX.PASSWORD.test(password)) {
      return {
        valid: false,
        message: '密码必须包含大小写字母和数字'
      }
    }

    return { valid: true }
  }

  /**
   * Validate username
   */
  public validateUsername(username: string): ValidationResult {
    if (!username) {
      return { valid: false, message: '请输入用户名' }
    }

    if (!REGEX.USERNAME.test(username)) {
      return {
        valid: false,
        message: '用户名只能包含字母、数字和下划线，长度3-20位'
      }
    }

    return { valid: true }
  }

  /**
   * Validate required field
   */
  public validateRequired(value: any, fieldName: string = '此项'): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return { valid: false, message: `${fieldName}不能为空` }
    }

    return { valid: true }
  }

  /**
   * Validate string length
   */
  public validateLength(
    value: string,
    min?: number,
    max?: number,
    fieldName: string = '此项'
  ): ValidationResult {
    if (min !== undefined && value.length < min) {
      return { valid: false, message: `${fieldName}长度不能少于${min}位` }
    }

    if (max !== undefined && value.length > max) {
      return { valid: false, message: `${fieldName}长度不能超过${max}位` }
    }

    return { valid: true }
  }

  /**
   * Validate number range
   */
  public validateRange(
    value: number,
    min?: number,
    max?: number,
    fieldName: string = '此项'
  ): ValidationResult {
    if (min !== undefined && value < min) {
      return { valid: false, message: `${fieldName}不能小于${min}` }
    }

    if (max !== undefined && value > max) {
      return { valid: false, message: `${fieldName}不能大于${max}` }
    }

    return { valid: true }
  }

  /**
   * Validate URL
   */
  public validateUrl(url: string): ValidationResult {
    if (!url) {
      return { valid: false, message: '请输入URL地址' }
    }

    try {
      new URL(url)
      return { valid: true }
    } catch {
      return { valid: false, message: '请输入有效的URL地址' }
    }
  }

  /**
   * Validate file size
   */
  public validateFileSize(
    file: File,
    maxSize: number
  ): ValidationResult {
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
      return {
        valid: false,
        message: `文件大小不能超过${maxSizeMB}MB`
      }
    }

    return { valid: true }
  }

  /**
   * Validate file type
   */
  public validateFileType(
    file: File,
    allowedTypes: string[]
  ): ValidationResult {
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: '不支持的文件类型'
      }
    }

    return { valid: true }
  }

  /**
   * Validate custom pattern
   */
  public validatePattern(
    value: string,
    pattern: RegExp,
    message: string = '格式不正确'
  ): ValidationResult {
    if (!pattern.test(value)) {
      return { valid: false, message }
    }

    return { valid: true }
  }
}

// Export singleton instance
export const validationService = new ValidationService()

export default validationService

