import type { KeywordInfo } from './extensions/SmartKeyword'

export function hasExactCompletionMatch(query: string, items: KeywordInfo[]): boolean {
  const normalized = query.trim()
  if (!normalized) return false
  return items.some((item) => item.name === normalized)
}

export function shouldShowCompletionCreateAction(query: string, items: KeywordInfo[]): boolean {
  const normalized = query.trim()
  if (!normalized) return true
  return !hasExactCompletionMatch(normalized, items)
}

export function getCompletionOptionCount(query: string, items: KeywordInfo[]): number {
  return items.length + (shouldShowCompletionCreateAction(query, items) ? 1 : 0)
}

export function getDefaultCompletionActiveIndex(query: string, items: KeywordInfo[]): number {
  if (shouldShowCompletionCreateAction(query, items)) {
    return items.length
  }
  return 0
}
