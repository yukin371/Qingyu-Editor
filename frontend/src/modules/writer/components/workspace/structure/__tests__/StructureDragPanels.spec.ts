import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { OutlineNode } from '@/types/writer'
import { matchesStructureNodeGraphFilter } from '../structureNodeTypes'
import OutlineTreePanel from '../OutlineTreePanel.vue'
import OutlineTreeRow from '../OutlineTreeRow.vue'
import BeatBoardPanel from '../BeatBoardPanel.vue'

function createDragEvent(clientY: number) {
  return {
    clientY,
    preventDefault: () => undefined,
    currentTarget: {
      getBoundingClientRect: () => ({
        top: 0,
        height: 100,
      }),
    },
    dataTransfer: {
      effectAllowed: '',
      dropEffect: '',
      setData: () => undefined,
    },
  } as unknown as DragEvent
}

describe('Structure drag panels', () => {
  it('matchesStructureNodeGraphFilter recognizes missing and graphed states', () => {
    const node = {
      id: 'node-a',
      title: '主干 A',
      level: 1,
      order: 0,
      documentId: 'chapter-1',
      tags: [],
    } as unknown as OutlineNode

    expect(matchesStructureNodeGraphFilter(node, [], 'missing')).toBe(true)
    expect(matchesStructureNodeGraphFilter(node, [], 'graphed')).toBe(false)
    expect(
      matchesStructureNodeGraphFilter(
        node,
        [
          {
            id: 'chapter-graph-chapter-1',
            projectId: 'project-1',
            chapterId: 'chapter-1',
            chapterTitle: '第一章',
            createdAt: '2026-03-25T00:00:00.000Z',
            updatedAt: '2026-03-25T00:00:00.000Z',
          },
        ],
        'graphed',
      ),
    ).toBe(true)
  })

  it('OutlineTreePanel emits reorder for same-parent drag sorting', async () => {
    const nodes = [
      {
        id: 'node-a',
        parentId: '',
        title: '主干 A',
        level: 1,
        status: 'planned',
        order: 0,
        children: [],
      },
      {
        id: 'node-b',
        parentId: '',
        title: '主干 B',
        level: 1,
        status: 'planned',
        order: 1,
        children: [],
      },
    ] as unknown as OutlineNode[]

    const wrapper = mount(OutlineTreePanel, {
      props: {
        nodes,
        selectedNodeId: '',
        expandedNodeIds: [],
        chapters: [],
        currentChapterId: '',
      },
    })

    const rows = wrapper.findAllComponents(OutlineTreeRow)
    await rows[0].vm.$emit('dragStart', nodes[0])
    await rows[1].vm.$emit('dragOver', { node: nodes[1], event: createDragEvent(80) })
    await rows[1].vm.$emit('dropNode', { node: nodes[1], event: createDragEvent(80) })

    expect(wrapper.emitted('reorder')).toBeTruthy()
    expect(wrapper.emitted('reorder')?.[0]).toEqual([
      {
        draggedNodeId: 'node-a',
        targetNodeId: 'node-b',
        position: 'after',
      },
    ])
  })

  it('OutlineTreePanel shows chapter graph state for bound nodes', () => {
    const nodes = [
      {
        id: 'node-a',
        parentId: '',
        title: '主干 A',
        level: 1,
        status: 'planned',
        order: 0,
        documentId: 'chapter-1',
        tags: [],
        children: [],
      },
    ] as unknown as OutlineNode[]

    const wrapper = mount(OutlineTreePanel, {
      props: {
        nodes,
        selectedNodeId: '',
        expandedNodeIds: [],
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter' as const,
            wordCount: 0,
            updatedAt: '2026-03-25T00:00:00Z',
            status: 'draft' as const,
          },
        ],
        chapterGraphs: [
          {
            id: 'chapter-graph-chapter-1',
            projectId: 'project-1',
            chapterId: 'chapter-1',
            chapterTitle: '第一章',
            parentGraphId: 'global-graph',
            createdAt: '2026-03-25T00:00:00.000Z',
            updatedAt: '2026-03-25T00:00:00.000Z',
          },
        ],
        currentChapterId: '',
      },
    })

    expect(wrapper.text()).toContain('继承图谱')
  })

  it('OutlineTreePanel shows asset summary for bound chapter nodes', () => {
    const nodes = [
      {
        id: 'node-a',
        parentId: '',
        title: '主干 A',
        level: 1,
        status: 'planned',
        order: 0,
        documentId: 'chapter-1',
        tags: [],
        children: [],
      },
    ] as unknown as OutlineNode[]

    const wrapper = mount(OutlineTreePanel, {
      props: {
        nodes,
        selectedNodeId: '',
        expandedNodeIds: [],
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter' as const,
            wordCount: 0,
            updatedAt: '2026-03-25T00:00:00Z',
            status: 'draft' as const,
          },
        ],
        assetSummaryByChapterId: {
          'chapter-1': { total: 3, characters: 2, locations: 1, items: 0 },
        },
        currentChapterId: '',
      },
    })

    expect(wrapper.text()).toContain('资产 2角 1地')
  })

  it('OutlineTreePanel emits openGraph for bound nodes', async () => {
    const nodes = [
      {
        id: 'node-a',
        parentId: '',
        title: '主干 A',
        level: 1,
        status: 'planned',
        order: 0,
        documentId: 'chapter-1',
        tags: [],
        children: [],
      },
    ] as unknown as OutlineNode[]

    const wrapper = mount(OutlineTreePanel, {
      props: {
        nodes,
        selectedNodeId: '',
        expandedNodeIds: [],
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter' as const,
            wordCount: 0,
            updatedAt: '2026-03-25T00:00:00Z',
            status: 'draft' as const,
          },
        ],
        chapterGraphs: [],
        currentChapterId: '',
      },
    })

    await wrapper.find('.outline-tree-row__graph-action').trigger('click')

    expect(wrapper.emitted('openGraph')?.[0]).toEqual(['chapter-1'])
  })

  it('OutlineTreePanel blocks cross-parent drag sorting', async () => {
    const nodes = [
      {
        id: 'node-a',
        parentId: '',
        title: '主干 A',
        level: 1,
        status: 'planned',
        order: 0,
        children: [
          {
            id: 'child-a1',
            parentId: 'node-a',
            title: '细纲 A1',
            level: 2,
            status: 'planned',
            order: 0,
            children: [],
          },
        ],
      },
      {
        id: 'node-b',
        parentId: '',
        title: '主干 B',
        level: 1,
        status: 'planned',
        order: 1,
        children: [],
      },
    ] as unknown as OutlineNode[]

    const wrapper = mount(OutlineTreePanel, {
      props: {
        nodes,
        selectedNodeId: '',
        expandedNodeIds: ['node-a'],
        chapters: [],
        currentChapterId: '',
      },
    })

    const rows = wrapper.findAllComponents(OutlineTreeRow)
    const childRow = rows.find((row) => row.props('node').id === 'child-a1')
    const rootBRow = rows.find((row) => row.props('node').id === 'node-b')

    await childRow?.vm.$emit('dragStart', nodes[0].children?.[0])
    await rootBRow?.vm.$emit('dragOver', { node: nodes[1], event: createDragEvent(20) })
    await rootBRow?.vm.$emit('dropNode', { node: nodes[1], event: createDragEvent(20) })

    expect(wrapper.emitted('reorder')).toBeFalsy()
  })

  it('BeatBoardPanel emits reorder for same-lane same-parent drag sorting', async () => {
    const beats = [
      {
        id: 'beat-a',
        parentId: 'root-1',
        title: '节点 A',
        level: 2,
        status: 'planned',
        order: 0,
      },
      {
        id: 'beat-b',
        parentId: 'root-1',
        title: '节点 B',
        level: 2,
        status: 'planned',
        order: 1,
      },
    ] as unknown as OutlineNode[]

    const wrapper = mount(BeatBoardPanel, {
      props: {
        beats,
        selectedNodeId: '',
        chapters: [],
        currentChapterId: '',
      },
    })

    const cards = wrapper.findAll('.beat-card')
    await cards[0].trigger('dragstart', { dataTransfer: createDragEvent(20).dataTransfer })
    await cards[1].trigger('dragover', {
      clientY: 80,
      dataTransfer: createDragEvent(80).dataTransfer,
    })
    await cards[1].trigger('drop', { clientY: 80, dataTransfer: createDragEvent(80).dataTransfer })

    expect(wrapper.emitted('reorder')).toBeTruthy()
    expect(wrapper.emitted('reorder')?.[0]).toEqual([
      {
        draggedNodeId: 'beat-a',
        targetNodeId: 'beat-b',
        position: 'after',
      },
    ])
  })

  it('BeatBoardPanel blocks cross-lane drag sorting', async () => {
    const beats = [
      {
        id: 'beat-a',
        parentId: 'root-1',
        title: '节点 A',
        level: 2,
        status: 'planned',
        order: 0,
      },
      {
        id: 'beat-b',
        parentId: 'root-1',
        title: '节点 B',
        level: 2,
        status: 'writing',
        order: 1,
      },
    ] as unknown as OutlineNode[]

    const wrapper = mount(BeatBoardPanel, {
      props: {
        beats,
        selectedNodeId: '',
        chapters: [],
        currentChapterId: '',
      },
    })

    const cards = wrapper.findAll('.beat-card')
    await cards[0].trigger('dragstart', { dataTransfer: createDragEvent(20).dataTransfer })
    await cards[1].trigger('dragover', {
      clientY: 20,
      dataTransfer: createDragEvent(20).dataTransfer,
    })
    await cards[1].trigger('drop', { clientY: 20, dataTransfer: createDragEvent(20).dataTransfer })

    expect(wrapper.emitted('reorder')).toBeFalsy()
  })

  it('BeatBoardPanel shows independent graph state for bound beats', () => {
    const beats = [
      {
        id: 'beat-a',
        parentId: 'root-1',
        title: '节点 A',
        level: 2,
        status: 'planned',
        order: 0,
        documentId: 'chapter-1',
        tags: [],
      },
    ] as unknown as OutlineNode[]

    const wrapper = mount(BeatBoardPanel, {
      props: {
        beats,
        selectedNodeId: '',
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter' as const,
            wordCount: 0,
            updatedAt: '2026-03-25T00:00:00Z',
            status: 'draft' as const,
          },
        ],
        chapterGraphs: [
          {
            id: 'chapter-graph-chapter-1',
            projectId: 'project-1',
            chapterId: 'chapter-1',
            chapterTitle: '第一章',
            createdAt: '2026-03-25T00:00:00.000Z',
            updatedAt: '2026-03-25T00:00:00.000Z',
          },
        ],
        currentChapterId: '',
      },
    })

    expect(wrapper.text()).toContain('独立图谱')
  })

  it('BeatBoardPanel shows asset summary for bound beats', () => {
    const beats = [
      {
        id: 'beat-a',
        parentId: 'root-1',
        title: '节点 A',
        level: 2,
        status: 'planned',
        order: 0,
        documentId: 'chapter-1',
        tags: [],
      },
    ] as unknown as OutlineNode[]

    const wrapper = mount(BeatBoardPanel, {
      props: {
        beats,
        selectedNodeId: '',
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter' as const,
            wordCount: 0,
            updatedAt: '2026-03-25T00:00:00Z',
            status: 'draft' as const,
          },
        ],
        assetSummaryByChapterId: {
          'chapter-1': { total: 4, characters: 2, locations: 1, items: 1 },
        },
        currentChapterId: '',
      },
    })

    expect(wrapper.text()).toContain('2角 1地 1物')
  })

  it('BeatBoardPanel emits openGraph for bound beats', async () => {
    const beats = [
      {
        id: 'beat-a',
        parentId: 'root-1',
        title: '节点 A',
        level: 2,
        status: 'planned',
        order: 0,
        documentId: 'chapter-1',
        tags: [],
      },
    ] as unknown as OutlineNode[]

    const wrapper = mount(BeatBoardPanel, {
      props: {
        beats,
        selectedNodeId: '',
        chapters: [
          {
            id: 'chapter-1',
            projectId: 'project-1',
            chapterNum: 1,
            title: '第一章',
            nodeType: 'chapter' as const,
            wordCount: 0,
            updatedAt: '2026-03-25T00:00:00Z',
            status: 'draft' as const,
          },
        ],
        chapterGraphs: [],
        currentChapterId: '',
      },
    })

    await wrapper.find('.beat-card__action--graph').trigger('click')

    expect(wrapper.emitted('openGraph')?.[0]).toEqual(['chapter-1'])
  })
})
