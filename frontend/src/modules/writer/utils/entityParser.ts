/**
 * 实体引用解析工具
 *
 * 支持：
 * - 统一 @ 格式：@角色名 @地点名 @物品名 @概念名
 * - 向后兼容旧格式：#地点名 %物品名
 */

import type { EntityReference, EntityType } from '../types/entity'

// 实体引用正则表达式
// 统一格式：@名称（支持中英文、数字、下划线、连字符）
const UNIFIED_ENTITY_PATTERN = /@([\u4e00-\u9fa5\w-]{1,30})/g

// 旧格式：#地点 %物品（向后兼容）
const LEGACY_LOCATION_PATTERN = /#([\u4e00-\u9fa5\w-]{1,30})/g
const LEGACY_ITEM_PATTERN = /%([\u4e00-\u9fa5\w-]{1,30})/g

// HTML 标记中的实体引用
const HTML_ENTITY_PATTERN = /data-keyword-type="([^"]+)"[^>]*data-keyword-name="([^"]+)"/g

/**
 * 解析文本中的实体引用
 *
 * @param text - 要解析的文本内容
 * @param options - 解析选项
 * @returns 实体引用列表
 */
export function parseEntityReferences(
  text: string,
  options: {
    includePosition?: boolean
    dedupe?: boolean
  } = {},
): EntityReference[] {
  const { includePosition = true, dedupe = true } = options
  const references: EntityReference[] = []
  const seen = new Set<string>()

  // 解析 HTML 标记中的实体（优先级最高）
  if (text.includes('data-smart-keyword')) {
    let match: RegExpExecArray | null
    HTML_ENTITY_PATTERN.lastIndex = 0
    while ((match = HTML_ENTITY_PATTERN.exec(text)) !== null) {
      const type = match[1] as EntityType
      const name = match[2]
      const key = `${type}:${name}`

      if (dedupe && seen.has(key)) continue
      seen.add(key)

      references.push({
        id: '', // ID 需要从其他属性获取或后续查询
        name,
        type: normalizeEntityType(type),
        position: includePosition
          ? { start: match.index, end: match.index + match[0].length }
          : { start: 0, end: 0 },
      })
    }
  }

  // 解析统一 @ 格式
  let match: RegExpExecArray | null
  UNIFIED_ENTITY_PATTERN.lastIndex = 0
  while ((match = UNIFIED_ENTITY_PATTERN.exec(text)) !== null) {
    const name = match[1]
    // 检查是否已经在 HTML 标记中处理过
    const contextStart = Math.max(0, match.index - 50)
    const context = text.substring(contextStart, match.index)
    if (context.includes('data-smart-keyword')) continue

    const key = `character:${name}` // @ 默认为角色，实际类型需要查询
    if (dedupe && seen.has(key)) continue
    seen.add(key)

    references.push({
      id: '',
      name,
      type: 'character', // @ 格式默认角色，后续可通过名称匹配确定类型
      position: includePosition
        ? { start: match.index, end: match.index + match[0].length }
        : { start: 0, end: 0 },
    })
  }

  // 向后兼容：解析旧格式 # 地点
  LEGACY_LOCATION_PATTERN.lastIndex = 0
  while ((match = LEGACY_LOCATION_PATTERN.exec(text)) !== null) {
    const name = match[1]
    const key = `location:${name}`
    if (dedupe && seen.has(key)) continue
    seen.add(key)

    references.push({
      id: '',
      name,
      type: 'location',
      position: includePosition
        ? { start: match.index, end: match.index + match[0].length }
        : { start: 0, end: 0 },
    })
  }

  // 向后兼容：解析旧格式 % 物品
  LEGACY_ITEM_PATTERN.lastIndex = 0
  while ((match = LEGACY_ITEM_PATTERN.exec(text)) !== null) {
    const name = match[1]
    const key = `item:${name}`
    if (dedupe && seen.has(key)) continue
    seen.add(key)

    references.push({
      id: '',
      name,
      type: 'item',
      position: includePosition
        ? { start: match.index, end: match.index + match[0].length }
        : { start: 0, end: 0 },
    })
  }

  return references
}

/**
 * 从 TipTap JSON 内容中提取实体引用
 *
 * @param content - TipTap JSON 内容
 * @returns 实体引用列表
 */
export function extractEntitiesFromTipTapContent(content: unknown): EntityReference[] {
  const references: EntityReference[] = []
  const seen = new Set<string>()

  function walkNode(node: unknown, _position: number = 0): void {
    if (!node || typeof node !== 'object') return

    const n = node as Record<string, unknown>

    // 检查 marks 中的 smartKeyword
    if (Array.isArray(n.marks)) {
      for (const mark of n.marks) {
        if (mark && typeof mark === 'object') {
          const m = mark as Record<string, unknown>
          if (m.type === 'smartKeyword') {
            const attrs = m.attrs as Record<string, unknown> | undefined
            if (attrs) {
              const type = String(attrs.keywordType || 'character') as EntityType
              const name = String(attrs.keywordName || '')
              const id = String(attrs.keywordId || '')
              const key = `${type}:${name}:${id}`

              if (!seen.has(key) && name) {
                seen.add(key)
                references.push({
                  id,
                  name,
                  type: normalizeEntityType(type),
                  position: { start: 0, end: 0 },
                })
              }
            }
          }
        }
      }
    }

    // 递归处理子节点
    if (Array.isArray(n.content)) {
      for (const child of n.content) {
        walkNode(child)
      }
    }
  }

  walkNode(content)
  return references
}

/**
 * 统计实体引用出现次数
 *
 * @param references - 实体引用列表
 * @returns 按名称和类型统计的出现次数
 */
export function countEntityReferences(
  references: EntityReference[],
): Map<string, { name: string; type: EntityType; count: number }> {
  const counter = new Map<string, { name: string; type: EntityType; count: number }>()

  for (const ref of references) {
    const key = `${ref.type}:${ref.name}`
    const existing = counter.get(key)
    if (existing) {
      existing.count++
    } else {
      counter.set(key, { name: ref.name, type: ref.type, count: 1 })
    }
  }

  return counter
}

/**
 * 按类型分组实体引用
 *
 * @param references - 实体引用列表
 * @returns 按类型分组的实体引用
 */
export function groupEntitiesByType(
  references: EntityReference[],
): Record<EntityType, EntityReference[]> {
  const groups: Record<EntityType, EntityReference[]> = {
    character: [],
    location: [],
    item: [],
    concept: [],
    organization: [],
    foreshadowing: [],
  }

  for (const ref of references) {
    const type = normalizeEntityType(ref.type)
    groups[type].push(ref)
  }

  return groups
}

/**
 * 规范化实体类型
 *
 * @param type - 原始类型字符串
 * @returns 规范化的实体类型
 */
function normalizeEntityType(type: string): EntityType {
  const typeMap: Record<string, EntityType> = {
    character: 'character',
    location: 'location',
    item: 'item',
    concept: 'concept',
    organization: 'organization',
    foreshadowing: 'foreshadowing',
    // 兼容旧的类型名称
    角色: 'character',
    地点: 'location',
    物品: 'item',
    概念: 'concept',
    组织: 'organization',
    伏笔: 'foreshadowing',
  }
  return typeMap[type] || 'character'
}

/**
 * 从文本中提取所有实体名称（用于关键词高亮）
 *
 * @param text - 文本内容
 * @returns 实体名称列表（去重）
 */
export function extractEntityNames(text: string): string[] {
  const names = new Set<string>()

  // 提取 @ 名称
  let match: RegExpExecArray | null
  UNIFIED_ENTITY_PATTERN.lastIndex = 0
  while ((match = UNIFIED_ENTITY_PATTERN.exec(text)) !== null) {
    names.add(match[1])
  }

  // 提取 # 名称（向后兼容）
  LEGACY_LOCATION_PATTERN.lastIndex = 0
  while ((match = LEGACY_LOCATION_PATTERN.exec(text)) !== null) {
    names.add(match[1])
  }

  // 提取 % 名称（向后兼容）
  LEGACY_ITEM_PATTERN.lastIndex = 0
  while ((match = LEGACY_ITEM_PATTERN.exec(text)) !== null) {
    names.add(match[1])
  }

  return Array.from(names)
}

/**
 * 将实体引用转换为搜索关键词
 *
 * @param reference - 实体引用
 * @returns 搜索关键词格式
 */
export function referenceToSearchQuery(reference: EntityReference): string {
  return `@${reference.name}`
}

/**
 * 批量解析多个文本的实体引用
 *
 * @param texts - 文本列表
 * @returns 合并后的实体引用列表（去重）
 */
export function parseMultipleTexts(texts: string[]): EntityReference[] {
  const allReferences: EntityReference[] = []
  const seen = new Set<string>()

  for (const text of texts) {
    const refs = parseEntityReferences(text, { includePosition: false, dedupe: false })
    for (const ref of refs) {
      const key = `${ref.type}:${ref.name}`
      if (!seen.has(key)) {
        seen.add(key)
        allReferences.push(ref)
      }
    }
  }

  return allReferences
}
