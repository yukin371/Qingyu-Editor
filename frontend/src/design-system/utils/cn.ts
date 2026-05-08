/**
 * Tailwind className 合并工具
 *
 * 使用 tailwind-merge 和 clsx 来智能合并 Tailwind 类名
 * 避免样式冲突和重复
 */

import { clsx, type ClassValue as ClsxClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 className 的工具函数
 *
 * @param inputs - 类名（可以是字符串、对象、数组等）
 * @returns 合并后的类名字符串
 *
 * @example
 * cn('px-2', 'py-1', { 'bg-blue-500': true }, ['text-white'])
 * // => 'px-2 py-1 bg-blue-500 text-white'
 */
export function cn(...inputs: ClsxClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 导出类型供组件使用
 */
export type ClassValue = ClsxClassValue
