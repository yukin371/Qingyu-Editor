/**
 * validation.ts 单元测试
 * 测试输入验证功能
 * TDD流程：先写测试，后写实现
 */

import { describe, it, expect } from 'vitest'
import {
  validateInputLength,
  validateAndSanitize,
  validateComment,
  validateMessage,
  validateAIInput,
  validateAmount
} from '../validation'

describe('validateInputLength', () => {
  it('应该验证正常长度输入', () => {
    expect(validateInputLength('Hello', 10)).toBe(true)
    expect(validateInputLength('Hello World', 10)).toBe(false)
  })

  it('应该处理边界情况', () => {
    expect(validateInputLength('', 10)).toBe(true)
    expect(validateInputLength('a'.repeat(100), 100)).toBe(true)
    expect(validateInputLength('a'.repeat(101), 100)).toBe(false)
  })

  it('应该拒绝非字符串输入', () => {
    expect(validateInputLength(null as any, 10)).toBe(false)
    expect(validateInputLength(undefined as any, 10)).toBe(false)
    expect(validateInputLength(123 as any, 10)).toBe(false)
  })
})

describe('validateAndSanitize', () => {
  it('应该移除控制字符', () => {
    const input = 'Hello\x00\x1FWorld'
    const result = validateAndSanitize(input, 100)
    expect(result).toBe('HelloWorld')
  })

  it('应该限制长度', () => {
    const input = 'a'.repeat(200)
    const result = validateAndSanitize(input, 100)
    expect(result.length).toBe(100)
  })

  it('应该修剪首尾空格', () => {
    const result = validateAndSanitize('  Hello  ', 100)
    expect(result).toBe('Hello')
  })

  it('应该处理空输入', () => {
    expect(validateAndSanitize('', 100)).toBe('')
    expect(validateAndSanitize(null as any, 100)).toBe('')
  })

  it('应该保留换行符和制表符', () => {
    const input = 'Hello\nWorld\tTest'
    const result = validateAndSanitize(input, 100)
    expect(result).toContain('\n')
    expect(result).toContain('\t')
  })
})

describe('validateComment', () => {
  const MAX_COMMENT_LENGTH = 500

  it('应该验证正常评论', () => {
    const result = validateComment('This is a great book!')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('This is a great book!')
  })

  it('应该拒绝空评论', () => {
    const result = validateComment('   ')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('不能为空')
  })

  it('应该限制评论长度', () => {
    const longComment = 'a'.repeat(MAX_COMMENT_LENGTH + 1)
    const result = validateComment(longComment)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('长度')
  })

  it('应该移除恶意内容', () => {
    const result = validateComment('<script>alert("xss")</script>Hello')
    expect(result.sanitized).not.toContain('<script>')
  })

  it('应该移除控制字符', () => {
    const result = validateComment('Hello\x00World')
    expect(result.valid).toBe(true)
    expect(result.sanitized).not.toContain('\x00')
  })
})

describe('validateMessage', () => {
  const MAX_MESSAGE_LENGTH = 1000

  it('应该验证正常消息', () => {
    const result = validateMessage('Hi, how are you?')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('Hi, how are you?')
  })

  it('应该限制消息长度', () => {
    const longMessage = 'a'.repeat(MAX_MESSAGE_LENGTH + 1)
    const result = validateMessage(longMessage)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('长度')
  })

  it('应该拒绝空消息', () => {
    const result = validateMessage('   ')
    expect(result.valid).toBe(false)
  })

  it('应该修剪消息', () => {
    const result = validateMessage('  Hello World  ')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('Hello World')
  })
})

describe('validateAIInput', () => {
  const MAX_AI_INPUT_LENGTH = 10000

  it('应该验证AI输入', () => {
    const result = validateAIInput('请帮我写一段故事')
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBe('请帮我写一段故事')
  })

  it('应该限制AI输入长度', () => {
    const longInput = 'a'.repeat(MAX_AI_INPUT_LENGTH + 1)
    const result = validateAIInput(longInput)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('长度')
  })

  it('应该拒绝空输入', () => {
    const result = validateAIInput('')
    expect(result.valid).toBe(false)
  })

  it('应该处理多行AI输入', () => {
    const input = '第一行\n第二行\n第三行'
    const result = validateAIInput(input)
    expect(result.valid).toBe(true)
    expect(result.sanitized).toContain('\n')
  })
})

describe('validateAmount', () => {
  it('应该验证正常金额', () => {
    expect(validateAmount('100.50')).toBe(true)
    expect(validateAmount('0.01')).toBe(true)
    expect(validateAmount('9999.99')).toBe(true)
  })

  it('应该拒绝无效金额', () => {
    expect(validateAmount('')).toBe(false)
    expect(validateAmount('abc')).toBe(false)
    expect(validateAmount('-10')).toBe(false)
    expect(validateAmount('0')).toBe(false)
  })

  it('应该验证金额精度', () => {
    expect(validateAmount('100.999')).toBe(false)
    expect(validateAmount('100.1')).toBe(true)
    expect(validateAmount('100.12')).toBe(true)
  })

  it('应该接受数字类型金额', () => {
    expect(validateAmount(100.50)).toBe(true)
    expect(validateAmount(0.01)).toBe(true)
    expect(validateAmount(0)).toBe(false)
  })

  it('应该拒绝超出范围的金额', () => {
    expect(validateAmount('1000000')).toBe(false)
    expect(validateAmount('-0.01')).toBe(false)
  })

  it('应该拒绝非数字输入', () => {
    expect(validateAmount(null as any)).toBe(false)
    expect(validateAmount(undefined as any)).toBe(false)
    expect(validateAmount(true as any)).toBe(false)
  })
})
