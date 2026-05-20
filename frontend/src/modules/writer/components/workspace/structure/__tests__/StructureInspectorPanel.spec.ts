import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { OutlineNode } from '@/types/writer'
import StructureInspectorPanel from '../StructureInspectorPanel.vue'

describe('StructureInspectorPanel', () => {
  it('应支持将当前结构节点交给 AI', async () => {
    const selectedNode = {
      id: 'node-1',
      title: '主线冲突',
      description: '主角第一次与反派正面交锋',
      level: 1,
      status: 'writing',
      wordCount: 2800,
      children: [{ id: 'node-1-1' }],
      documentId: 'chapter-1',
      tags: [],
    } as unknown as OutlineNode

    const wrapper = mount(StructureInspectorPanel, {
      props: {
        selectedNode,
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter',
            wordCount: 0,
            updatedAt: '2026-04-09T00:00:00.000Z',
            status: 'draft',
          },
        ],
        chapterGraphs: [],
        activeEntities: [
          { id: 'char-1', name: '林舟', type: 'character', summary: '警惕' },
          { id: 'item-1', name: '巡夜令牌', type: 'item' },
        ],
        workflowContext: {
          signature: 'ctx-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一章 / 夜巡冲突',
          activeCharacters: [{ id: 'char-1', name: '林舟', currentState: '警惕' }],
          activeRelations: [{ id: 'rel-1', fromName: '林舟', toName: '沈曜', type: '对立' }],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 0,
        },
        currentChapterId: 'chapter-1',
        currentChapterTitle: '第一章',
        draftBindingChapterId: 'chapter-1',
        boundChapter: {
          id: 'chapter-1',
          projectId: 'project-1',
          chapterNum: 1,
          title: '第一章',
          nodeType: 'chapter',
          wordCount: 0,
          updatedAt: '2026-04-09T00:00:00.000Z',
          status: 'draft',
        },
        loading: false,
      },
    })

    await wrapper.get('[data-testid="structure-send-to-ai"]').trigger('click')

    expect(wrapper.text()).not.toContain('下一步')
    expect(wrapper.text()).not.toContain('Inspector')
    expect(wrapper.text()).not.toContain('结构建议')
    const aiEvents = wrapper.emitted('trigger-ai-action') as unknown[][] | undefined
    const aiPayload = aiEvents?.[0]?.[0] as { text?: string } | undefined
    expect(aiPayload).toMatchObject({
      source: 'workspace',
      action: 'add_to_chat',
      title: '结构节点分析：主线冲突',
    })
    expect(aiPayload?.text).toContain('已绑定章节：第一章')
    expect(aiPayload?.text).toContain(
      '当前活跃实体：角色：林舟（警惕）；物品：巡夜令牌',
    )
    expect(aiPayload?.text).toContain(
      '场景作用域：第一章 / 夜巡冲突',
    )
    expect(aiPayload?.text).toContain(
      '节点描述：主角第一次与反派正面交锋',
    )
  })

  it('应提供跳到全局资产总览的次入口', async () => {
    const selectedNode = {
      id: 'node-1',
      title: '主线冲突',
      description: '主角第一次与反派正面交锋',
      level: 1,
      status: 'writing',
      wordCount: 2800,
      children: [{ id: 'node-1-1' }],
      documentId: 'chapter-1',
      tags: [],
    } as unknown as OutlineNode

    const wrapper = mount(StructureInspectorPanel, {
      props: {
        selectedNode,
        chapters: [],
        chapterGraphs: [],
        activeEntities: [],
        workflowContext: undefined,
        currentChapterId: 'chapter-1',
        currentChapterTitle: '第一章',
        draftBindingChapterId: 'chapter-1',
        boundChapter: null,
        loading: false,
      },
    })

    await wrapper.get('[data-testid="structure-open-assets"]').trigger('click')

    expect(wrapper.emitted('switch-tool')?.[0]).toEqual(['assets'])
  })
})
