import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  appendVolumeRelationDraft,
  buildCharacterGraphAutoScopeIds,
  createVolumeGraphDraft,
  loadCharacterGraphDraftState,
} from '../characterGraphDrafts'

describe('characterGraphDrafts', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => {
        store.clear()
      },
    })
    localStorage.clear()
  })

  it('应持久化卷级图谱和卷级关系草稿', () => {
    const projectId = 'project-1'
    const volumeId = 'volume-1'

    const nextState = createVolumeGraphDraft({
      projectId,
      volumeId,
      volumeTitle: '第一卷',
      parentGraphId: 'global',
    })
    expect(nextState.volumeGraphs).toHaveLength(1)
    expect(localStorage.getItem(`qingyu_writer_character_graph_drafts:${projectId}`)).toContain('volume-1')

    const createdState = loadCharacterGraphDraftState(projectId)
    expect(createdState.volumeGraphs).toHaveLength(1)
    expect(createdState.volumeGraphs[0]).toMatchObject({
      projectId,
      volumeId,
      volumeTitle: '第一卷',
      parentGraphId: 'global',
    })
    expect(createdState.volumeRelations[volumeId]).toEqual([])

    appendVolumeRelationDraft({
      projectId,
      volumeId,
      graphId: createdState.volumeGraphs[0].id,
      fromId: 'char-a',
      toId: 'char-b',
      type: '朋友',
      strength: 80,
      notes: '卷内首次结盟',
    })

    const updatedState = loadCharacterGraphDraftState(projectId)
    expect(updatedState.volumeRelations[volumeId]).toHaveLength(1)
    expect(updatedState.volumeRelations[volumeId][0]).toMatchObject({
      graphId: createdState.volumeGraphs[0].id,
      fromId: 'char-a',
      toId: 'char-b',
      type: '朋友',
      strength: 80,
      notes: '卷内首次结盟',
    })
  })

  it('应从资产引用投影推导全局、卷级和章节级角色节点', () => {
    const scopeIds = buildCharacterGraphAutoScopeIds({
      chapterId: 'chapter-1',
      volumeId: 'volume-1',
      volumeChapterIds: ['chapter-1', 'chapter-2'],
      globalRelations: [
        {
          id: 'rel-1',
          projectId: 'project-1',
          fromId: 'char-global-a',
          toId: 'char-global-b',
          type: '朋友',
          strength: 80,
          createdAt: '',
          updatedAt: '',
        },
      ],
      assetRefState: {
        chapterRefs: {
          'chapter-1': [
            {
              id: 'ref-1',
              assetType: 'character',
              assetId: 'char-chapter',
              assetName: '章角色',
              scopeType: 'chapter',
              scopeId: 'chapter-1',
              source: 'mention',
              createdAt: '',
              updatedAt: '',
            },
          ],
          'chapter-2': [
            {
              id: 'ref-2',
              assetType: 'character',
              assetId: 'char-volume-rollup',
              assetName: '卷角色',
              scopeType: 'chapter',
              scopeId: 'chapter-2',
              source: 'mention',
              createdAt: '',
              updatedAt: '',
            },
          ],
        },
        volumeRefs: {
          'volume-1': [
            {
              id: 'ref-3',
              assetType: 'character',
              assetId: 'char-volume',
              assetName: '卷绑定角色',
              scopeType: 'volume',
              scopeId: 'volume-1',
              source: 'chapter_rollup',
              createdAt: '',
              updatedAt: '',
            },
            {
              id: 'ref-4',
              assetType: 'character',
              assetName: '未建档',
              scopeType: 'volume',
              scopeId: 'volume-1',
              source: 'mention',
              unresolved: true,
              createdAt: '',
              updatedAt: '',
            },
          ],
        },
      },
    })

    expect([...scopeIds.globalIds]).toEqual(
      expect.arrayContaining([
        'char-global-a',
        'char-global-b',
        'char-chapter',
        'char-volume-rollup',
        'char-volume',
      ]),
    )
    expect([...scopeIds.volumeIds]).toEqual(
      expect.arrayContaining(['char-chapter', 'char-volume-rollup', 'char-volume']),
    )
    expect([...scopeIds.chapterIds]).toEqual(['char-chapter'])
    expect(scopeIds.globalIds.has('未建档')).toBe(false)
  })
})
