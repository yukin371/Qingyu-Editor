/**
 * useAIContext - AI 写作上下文构建 Composable
 *
 * 从 writerStore 中收集角色、地点、关系、大纲等作品设定数据，
 * 构建结构化的上下文字符串，附加到 AI 写作指令中，使 AI 能够理解
 * 作品的世界观设定并生成风格一致的内容。
 *
 * 特性：
 * - 按需包含角色、地点、关系、当前章节信息
 * - 基于 token 估算的智能裁剪策略（优先保留角色，其次地点）
 * - 支持刷新缓存数据
 */
import { computed } from 'vue'
import { useWriterStore } from '../stores/writerStore'
import type { Character, CharacterRelation } from '@/types/writer'

/** 上下文构建选项 */
export interface AIContextOptions {
  /** 是否包含角色信息（默认 true） */
  includeCharacters?: boolean
  /** 是否包含地点信息（默认 true） */
  includeLocations?: boolean
  /** 是否包含角色关系信息（默认 true） */
  includeRelations?: boolean
  /** 是否包含当前章节信息（默认 true） */
  includeCurrentChapter?: boolean
  /** 最大角色数量（默认 8） */
  maxCharacters?: number
  /** 最大地点数量（默认 5） */
  maxLocations?: number
  /** 最大 token 估算值（默认 2000） */
  maxTokenEstimate?: number
}

/** 默认配置 */
const DEFAULTS = {
  includeCharacters: true,
  includeLocations: true,
  includeRelations: true,
  includeCurrentChapter: true,
  maxCharacters: 8,
  maxLocations: 5,
  maxTokenEstimate: 2000,
} as const

/**
 * 估算文本的 token 数量
 *
 * 粗略估算规则：
 * - 中文字符约 1.5 token/字
 * - 英文单词约 0.25 token/词
 * - 标点符号约 0.5 token/个
 *
 * @param text 待估算的文本
 * @returns 估算的 token 数量
 */
function estimateTokens(text: string): number {
  if (!text) return 0

  let tokens = 0
  for (const char of text) {
    // CJK 统一汉字及扩展区
    if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(char)) {
      tokens += 1.5
    }
    // ASCII 字母/数字（按单词平均 4 字符估算为 1 token）
    else if (/[a-zA-Z0-9]/.test(char)) {
      tokens += 0.25
    }
    // 其他（标点、空格等）
    else {
      tokens += 0.5
    }
  }

  return Math.ceil(tokens)
}

/**
 * 构建角色描述摘要行
 *
 * 将角色的关键信息压缩为一行描述，包含：
 * 角色、性格标签、当前状态、与当前章节角色的关系摘要
 */
function buildCharacterLine(
  character: Character,
  relationMap: Map<string, CharacterRelation[]>,
): string {
  const parts: string[] = [character.name]

  // 性格标签
  if (character.traits && character.traits.length > 0) {
    parts.push(character.traits.slice(0, 3).join('、'))
  }

  // 当前状态
  if (character.currentState) {
    parts.push(`当前状态：${character.currentState}`)
  }

  // 关联的关系摘要（仅展示直接关系）
  const relations = relationMap.get(character.id)
  if (relations && relations.length > 0) {
    const relationSummaries = relations
      .slice(0, 2)
      .map(r => {
        const otherId = r.fromId === character.id ? r.toId : r.fromId
        // 关系对象名称将在外部通过 nameMap 解析后填充
        return `与${otherId}是${r.type}关系（强度${r.strength}）`
      })
    parts.push(relationSummaries.join('，'))
  }

  return parts.join('，')
}

export function useAIContext() {
  const store = useWriterStore()

  /** 角色 ID -> 名称映射表，用于关系展示 */
  const characterNameMap = computed(() => {
    const map = new Map<string, string>()
    for (const char of store.characters.list) {
      map.set(char.id, char.name)
    }
    return map
  })

  /** 角色 ID -> 关系列表映射表 */
  const characterRelationMap = computed(() => {
    const map = new Map<string, CharacterRelation[]>()
    for (const relation of store.characters.relations) {
      const fromList = map.get(relation.fromId) || []
      fromList.push(relation)
      map.set(relation.fromId, fromList)

      const toList = map.get(relation.toId) || []
      toList.push(relation)
      map.set(relation.toId, toList)
    }
    return map
  })

  /**
   * 构建角色上下文段落
   *
   * @param maxCount 最大角色数量（默认 8）
   * @returns 角色上下文字符串，如无角色返回空字符串
   */
  function buildCharacterContext(maxCount: number = DEFAULTS.maxCharacters): string {
    const characters = store.characters.list.slice(0, maxCount)
    if (characters.length === 0) return ''

    const relationMap = characterRelationMap.value
    const lines = characters.map(char => {
      let line = `- ${buildCharacterLine(char, relationMap)}`

      // 补充角色别名
      if (char.alias && char.alias.length > 0) {
        line += `（别名：${char.alias.join('、')}）`
      }

      // 补充简要背景（如果摘要较短则追加）
      if (char.summary && char.summary.length > 0) {
        line += `\n  ${char.summary}`
      }

      return line
    })

    return lines.join('\n')
  }

  /**
   * 构建地点上下文段落
   *
   * @param maxCount 最大地点数量（默认 5）
   * @returns 地点上下文字符串，如无地点返回空字符串
   */
  function buildLocationContext(maxCount: number = DEFAULTS.maxLocations): string {
    const locations = store.locations.list.slice(0, maxCount)
    if (locations.length === 0) return ''

    const lines = locations.map(loc => {
      const parts: string[] = [loc.name]

      if (loc.description) {
        parts.push(loc.description)
      }

      // 追加氛围描述
      if (loc.atmosphere) {
        parts.push(`氛围${loc.atmosphere}`)
      }

      return `- ${parts.join('，')}`
    })

    return lines.join('\n')
  }

  /**
   * 构建角色关系上下文段落
   *
   * 以双向箭头格式展示角色间的关系，例如：
   * - 张三 <-> 李四：朋友（强度80）
   *
   * @returns 关系上下文字符串，如无关系返回空字符串
   */
  function buildRelationContext(): string {
    const relations = store.characters.relations
    if (relations.length === 0) return ''

    const nameMap = characterNameMap.value

    // 去重：fromId <= toId 只保留一条（双向关系无需重复展示）
    const seen = new Set<string>()
    const uniqueRelations = relations.filter(r => {
      const key = [r.fromId, r.toId].sort().join('|')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const lines = uniqueRelations.map(r => {
      const fromName = nameMap.get(r.fromId) || r.fromId
      const toName = nameMap.get(r.toId) || r.toId
      let line = `- ${fromName} <-> ${toName}：${r.type}（强度${r.strength}）`
      if ((r as any).notes) {
        line += `，${(r as any).notes}`
      }
      else if (r.description) {
        line += `，${r.description}`
      }
      return line
    })

    return lines.join('\n')
  }

  /**
   * 构建当前章节上下文段落
   *
   * 从大纲的当前节点提取章节标题和摘要信息。
   *
   * @returns 章节上下文字符串，如无当前节点返回空字符串
   */
  function buildCurrentChapterContext(): string {
    const currentNode = store.outline.currentNode
    if (!currentNode) return ''

    const lines: string[] = []
    lines.push(`当前章节：${currentNode.title}`)

    if (currentNode.description) {
      lines.push(`章节摘要：${currentNode.description}`)
    }

    // content 字段可能由运行时数据提供，使用类型安全访问
    const nodeContent = (currentNode as Record<string, unknown>).content as string | undefined
    if (nodeContent) {
      // 截取前 200 字避免过长
      const content = nodeContent.length > 200
        ? nodeContent.slice(0, 200) + '...'
        : nodeContent
      lines.push(`章节内容摘要：${content}`)
    }

    return lines.join('\n')
  }

  /**
   * 构建完整的 AI 上下文字符串
   *
   * 按照指定选项收集各模块的上下文信息，组装为结构化的文本块。
   * 如果总 token 估算超过限制，按照以下优先级裁剪：
   * 1. 移除地点信息
   * 2. 减少角色数量
   * 3. 移除关系信息
   *
   * @param options 上下文构建选项
   * @returns 格式化的上下文字符串，可直接附加到 AI 指令中
   */
  function buildContextString(options?: AIContextOptions): string {
    const opts = { ...DEFAULTS, ...options }

    const sections: Array<{ label: string; content: string; priority: number }> = []

    // 按优先级收集各段落（priority 越低越重要，裁剪时优先移除高 priority）
    if (opts.includeCurrentChapter) {
      const content = buildCurrentChapterContext()
      if (content) {
        sections.push({ label: '当前章节', content, priority: 0 })
      }
    }

    if (opts.includeCharacters) {
      const content = buildCharacterContext(opts.maxCharacters)
      if (content) {
        sections.push({ label: '相关角色', content, priority: 1 })
      }
    }

    if (opts.includeRelations) {
      const content = buildRelationContext()
      if (content) {
        sections.push({ label: '角色关系', content, priority: 2 })
      }
    }

    if (opts.includeLocations) {
      const content = buildLocationContext(opts.maxLocations)
      if (content) {
        sections.push({ label: '相关地点', content, priority: 3 })
      }
    }

    if (sections.length === 0) return ''

    // 拼接完整文本
    function assemble(parts: typeof sections): string {
      const header = '【作品设定上下文】'
      const body = parts
        .map(s => `${s.label}：\n${s.content}`)
        .join('\n\n')
      return `${header}\n\n${body}`
    }

    const fullText = assemble(sections)
    const totalTokens = estimateTokens(fullText)

    // 如果未超限，直接返回
    if (totalTokens <= opts.maxTokenEstimate) {
      return fullText
    }

    // Token 超限，按优先级逐步裁剪
    let remaining = [...sections]

    // 第一步：移除地点（priority 3）
    remaining = remaining.filter(s => s.priority < 3)
    if (estimateTokens(assemble(remaining)) <= opts.maxTokenEstimate) {
      return assemble(remaining)
    }

    // 第二步：移除关系（priority 2）
    remaining = remaining.filter(s => s.priority < 2)
    if (estimateTokens(assemble(remaining)) <= opts.maxTokenEstimate) {
      return assemble(remaining)
    }

    // 第三步：逐步减少角色数量（priority 1）
    const characterSection = remaining.find(s => s.priority === 1)
    if (characterSection) {
      for (let count = opts.maxCharacters - 1; count >= 1; count--) {
        const reducedCharacters = buildCharacterContext(count)
        if (!reducedCharacters) break

        const newSections = remaining.map(s =>
          s.priority === 1
            ? { ...s, content: reducedCharacters }
            : s,
        )
        const tokens = estimateTokens(assemble(newSections))
        if (tokens <= opts.maxTokenEstimate) {
          return assemble(newSections)
        }
      }
    }

    // 最终兜底：仅保留章节信息（priority 0）
    const essential = remaining.filter(s => s.priority === 0)
    return essential.length > 0 ? assemble(essential) : fullText
  }

  /**
   * 刷新上下文数据
   *
   * 从服务端重新加载角色列表和地点列表，确保上下文信息最新。
   * 同时刷新角色关系数据。
   */
  async function refreshContext(): Promise<void> {
    const projectId = store.currentProjectId
    if (!projectId) return

    await Promise.all([
      store.loadCharacters(projectId),
      store.loadLocations(projectId),
      store.loadCharacterRelations(projectId),
    ])
  }

  return {
    buildContextString,
    buildCharacterContext,
    buildLocationContext,
    buildRelationContext,
    buildCurrentChapterContext,
    estimateTokens,
    refreshContext,
  }
}
