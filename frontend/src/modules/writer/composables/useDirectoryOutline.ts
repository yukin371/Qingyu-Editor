/**
 * useDirectoryOutline - 目录大纲构建 Composable
 *
 * 从 ProjectWorkspace.vue 提取的目录大纲构建逻辑
 */
import { type ComputedRef } from 'vue'
import { DocumentType, type Document } from '@/modules/writer/types/document'
import type { MockProjectData } from './types'

// =======================
// Types
// =======================

/** useDirectoryOutline 参数 */
export interface UseDirectoryOutlineOptions {
  /** 可用文档映射 */
  availableDocMap: ComputedRef<Map<string, Document>>
  /** Mock 项目数据 */
  mockProject: ComputedRef<MockProjectData | null>
}

/** useDirectoryOutline 返回值 */
export interface UseDirectoryOutlineReturn {
  /** 构建目录大纲内容 */
  buildDirectoryOutline: (directoryId: string) => string
}

// =======================
// Composable
// =======================

/**
 * 目录大纲构建
 *
 * @param options 配置选项
 * @returns 构建方法
 */
export function useDirectoryOutline(options: UseDirectoryOutlineOptions): UseDirectoryOutlineReturn {
  const { availableDocMap, mockProject } = options

  /**
   * 将 Markdown 文本转换为 tiptap JSON 格式
   */
  const markdownToTipTap = (markdown: string): string => {
    const lines = markdown.split('\n')
    const content: any[] = []

    for (const line of lines) {
      if (line.trim() === '') {
        // 空行
        content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: '' }]
        })
      } else if (line.startsWith('# ')) {
        // 一级标题
        const text = line.substring(2)
        content.push({
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text }]
        })
      } else if (line.startsWith('## ')) {
        // 二级标题
        const text = line.substring(3)
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text }]
        })
      } else if (line.startsWith('### ')) {
        // 三级标题
        const text = line.substring(4)
        content.push({
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text }]
        })
      } else if (line.startsWith('- ')) {
        // 列表项
        const text = line.substring(2)
        content.push({
          type: 'bulletList',
          content: [{
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text }]
            }]
          }]
        })
      } else {
        // 普通段落
        content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: line }]
        })
      }
    }

    return JSON.stringify({
      type: 'doc',
      content
    })
  }

  /**
   * 构建目录大纲内容
   *
   * @param directoryId 目录 ID
   * @returns 大纲内容（tiptap JSON 格式）
   */
  const buildDirectoryOutline = (directoryId: string): string => {
    const directory = availableDocMap.value.get(directoryId)
    if (!directory) return ''

    // 优先使用 mock 数据
    if (mockProject.value?.contentByDocId?.[directoryId]) {
      const mockContent = mockProject.value.contentByDocId[directoryId]
      // 如果 mock 内容已经是 JSON 格式，直接返回
      try {
        JSON.parse(mockContent)
        return mockContent
      } catch {
        // 否则转换为 tiptap JSON
        return markdownToTipTap(mockContent)
      }
    }

    // 获取目录下的章节
    const children = Array.from(availableDocMap.value.values())
      .filter((doc) => doc.parentId === directoryId && doc.type === DocumentType.CHAPTER)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    const chapterLines = children.length > 0
      ? children.map((chapter, index) => `- ${index + 1}. ${chapter.title}`).join('\n')
      : '- 暂无章节，请在右上角新增章节。'

    const markdown = `# ${directory.title} 细纲

## 目录目标
- 待补充此目录核心冲突与推进目标。

## 章节推进
${chapterLines}`

    return markdownToTipTap(markdown)
  }

  return {
    buildDirectoryOutline,
  }
}
