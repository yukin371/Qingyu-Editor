/**
 * 字段命名格式转换工具
 * 用于在snake_case（后端）和camelCase（前端）之间转换
 */

/**
 * 将snake_case转换为camelCase
 * @example snake_to_camel('word_count') => 'wordCount'
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 将camelCase转换为snake_case
 * @example camel_to_snake('wordCount') => 'word_count'
 */
export function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

/**
 * 递归转换对象的键从snake_case到camelCase
 */
export function convertObjectKeysToCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj as T
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => convertObjectKeysToCamelCase(item)) as T
  }

  // 处理基本类型
  if (typeof obj !== 'object') {
    return obj as T
  }

  // 处理Date对象
  if (obj instanceof Date) {
    return obj as T
  }

  // 递归转换对象
  const result: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = snakeToCamel(key)
      result[camelKey] = convertObjectKeysToCamelCase(obj[key])
    }
  }
  return result as T
}

/**
 * 递归转换对象的键从camelCase到snake_case
 */
export function convertObjectKeysToSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj as T
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => convertObjectKeysToSnakeCase(item)) as T
  }

  // 处理基本类型
  if (typeof obj !== 'object') {
    return obj as T
  }

  // 处理Date对象
  if (obj instanceof Date) {
    return obj as T
  }

  // 递归转换对象
  const result: any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = camelToSnake(key)
      result[snakeKey] = convertObjectKeysToSnakeCase(obj[key])
    }
  }
  return result as T
}
