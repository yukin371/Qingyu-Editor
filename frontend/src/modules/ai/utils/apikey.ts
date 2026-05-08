/**
 * API密钥安全处理工具
 * 前端只存储和显示掩码，密钥仅在创建/更新时传输
 */

// 常见的API密钥前缀
const API_KEY_PREFIXES = ['sk-', 'gpt-', 'claude-', 'anthropic-', 'bearer-']

/**
 * 生成API密钥掩码
 * @param apiKey 原始API密钥
 * @returns 掩码后的密钥，格式：前缀-****...****
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || typeof apiKey !== 'string') return ''

  const trimmed = apiKey.trim()
  if (trimmed.length === 0) return ''

  // 提取前缀（通常是 sk- 或类似）
  let prefix = ''
  for (const p of API_KEY_PREFIXES) {
    if (trimmed.startsWith(p)) {
      prefix = p
      break
    }
  }

  // 如果没有识别到前缀，使用前3个字符作为前缀
  if (!prefix && trimmed.length > 3) {
    prefix = trimmed.substring(0, 3) + '-'
  } else if (!prefix) {
    prefix = '***-'
  }

  return `${prefix}****...****`
}

/**
 * 检查密钥是否已被掩码
 * @param apiKey API密钥
 * @returns 是否已掩码
 */
export function isApiKeyMasked(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') return false

  return apiKey.includes('****') || apiKey.includes('•••')
}

/**
 * 验证API密钥格式是否有效
 * @param apiKey API密钥
 * @returns 是否有效
 */
export function hasValidApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') return false

  const trimmed = apiKey.trim()

  // 检查是否是掩码
  if (isApiKeyMasked(trimmed)) {
    return false
  }

  // 检查长度（API密钥通常至少20个字符）
  if (trimmed.length < 20) return false

  // 检查是否包含有效的前缀（有前缀就直接通过）
  const hasValidPrefix = API_KEY_PREFIXES.some((p) => trimmed.startsWith(p))
  if (hasValidPrefix) {
    return true
  }

  // 检查基本格式：包含字母、数字、下划线、连字符的组合
  // 移除前缀后检查剩余部分的格式
  const hasValidFormat = /^[a-zA-Z0-9_-]+$/.test(trimmed)
  return hasValidFormat
}

/**
 * 格式化API密钥用于UI显示
 * @param apiKey API密钥（可以是原始或掩码）
 * @returns 格式化后的显示文本
 */
export function formatApiKeyDisplay(apiKey: string): string {
  if (!apiKey || apiKey.trim() === '') {
    return '未设置'
  }

  // 如果已经是掩码格式，直接返回
  if (isApiKeyMasked(apiKey)) {
    return apiKey
  }

  // 对原始密钥进行掩码显示（使用圆点更友好）
  const masked = maskApiKey(apiKey)
  return masked.replace(/\*/g, '•')
}

/**
 * 清理敏感的密钥信息（用于日志输出）
 * @param data 可能包含密钥的数据对象
 * @param keyName 密钥字段名
 * @returns 清理后的数据
 */
export function sanitizeApiKey<T extends Record<string, any>>(
  data: T,
  keyName: string = 'apiKey'
): T {
  if (!data || typeof data !== 'object') return data

  const sanitized: any = { ...data }

  if (keyName in sanitized && typeof sanitized[keyName] === 'string') {
    const key = sanitized[keyName]
    if (!isApiKeyMasked(key)) {
      sanitized[keyName] = maskApiKey(key)
    }
  }

  return sanitized as T
}
