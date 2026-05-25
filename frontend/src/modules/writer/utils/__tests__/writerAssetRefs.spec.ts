import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  WRITER_ASSET_REFS_UPDATED_EVENT,
  buildWriterAssetSummaryItems,
  buildWriterAssetReferenceProjection,
  buildWriterAssetSummaryByChapterId,
  extractWriterAssetCandidates,
  loadWriterAssetRefState,
  mergeWriterAssetRefs,
  removeScopeAssetRef,
  replaceProjectChapterAssetRefs,
  upsertScopeAssetRef,
} from '../writerAssetRefs'

describe('writerAssetRefs', () => {
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

  it('应从正文中提取可绑定的角色和地点候选', () => {
    const candidates = extractWriterAssetCandidates({
      text: '夜里，@沈砚 再次踏进 #雾港。阿砚知道雾港已经失守，%铜钥匙 还在身上。',
      characters: [
        {
          id: 'char-1',
          name: '沈砚',
          alias: ['阿砚'],
        },
      ],
      locations: [
        {
          id: 'loc-1',
          name: '雾港',
        },
      ],
      items: [
        {
          id: 'item-1',
          name: '铜钥匙',
          alias: ['仓库钥匙'],
        },
      ],
    })

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetType: 'character',
          assetId: 'char-1',
          assetName: '沈砚',
        }),
        expect.objectContaining({
          assetType: 'location',
          assetId: 'loc-1',
          assetName: '雾港',
        }),
        expect.objectContaining({
          assetType: 'item',
          assetId: 'item-1',
          assetName: '铜钥匙',
          unresolved: false,
        }),
      ]),
    )
  })

  it('应优先复用 smart keyword 的已解析类型提取概念和组织候选', () => {
    const candidates = extractWriterAssetCandidates({
      text: '@巡夜司 正在追查 @禁术回响。',
      characters: [],
      locations: [],
      items: [],
      organizations: [
        {
          id: 'org-1',
          name: '巡夜司',
        },
      ],
      concepts: [
        {
          id: 'concept-1',
          name: '禁术回响',
          alias: ['回响术'],
        },
      ],
      entityReferences: [
        { id: 'org-1', name: '巡夜司', type: 'organization' },
        { id: 'concept-1', name: '禁术回响', type: 'concept' },
      ],
    })

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetType: 'organization',
          assetId: 'org-1',
          assetName: '巡夜司',
          unresolved: false,
        }),
        expect.objectContaining({
          assetType: 'concept',
          assetId: 'concept-1',
          assetName: '禁术回响',
          unresolved: false,
        }),
      ]),
    )
  })

  it('应在纯文本 @ 引用下识别已建档组织与概念，不依赖 smart keyword mark', () => {
    const candidates = extractWriterAssetCandidates({
      text: '@巡夜司 封锁城门，@禁术回响 也再次出现。',
      characters: [],
      locations: [],
      items: [],
      organizations: [
        {
          id: 'org-1',
          name: '巡夜司',
          alias: ['巡夜人'],
        },
      ],
      concepts: [
        {
          id: 'concept-1',
          name: '禁术回响',
          alias: ['回响术'],
        },
      ],
    })

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetType: 'organization',
          assetId: 'org-1',
          assetName: '巡夜司',
          unresolved: false,
        }),
        expect.objectContaining({
          assetType: 'concept',
          assetId: 'concept-1',
          assetName: '禁术回响',
          unresolved: false,
        }),
      ]),
    )
  })

  it('未建档 @ 引用只进入待确认候选，不直接当作已推断角色', () => {
    const candidates = extractWriterAssetCandidates({
      text: '@新势力 需要后续整理。',
      characters: [],
      locations: [],
      items: [],
      organizations: [],
      concepts: [],
    })

    expect(candidates).toEqual([
      expect.objectContaining({
        assetName: '新势力',
        unresolved: true,
        requiresTypeSelection: true,
      }),
    ])
  })

  it('应持久化并移除章节绑定资产', () => {
    const projectId = 'project-1'
    upsertScopeAssetRef({
      projectId,
      scopeType: 'chapter',
      scopeId: 'chapter-1',
      assetType: 'character',
      assetId: 'char-1',
      assetName: '沈砚',
      source: 'mention',
    })

    let state = loadWriterAssetRefState(projectId)
    expect(state.chapterRefs['chapter-1']).toHaveLength(1)
    expect(state.chapterRefs['chapter-1'][0]).toMatchObject({
      assetType: 'character',
      assetId: 'char-1',
      assetName: '沈砚',
      scopeType: 'chapter',
      scopeId: 'chapter-1',
    })

    state = removeScopeAssetRef(
      projectId,
      'chapter',
      'chapter-1',
      state.chapterRefs['chapter-1'][0].id,
    )
    expect(state.chapterRefs['chapter-1']).toEqual([])
  })

  it('写入资产引用后应广播刷新事件', () => {
    const projectId = 'project-event'
    const listener = vi.fn()
    window.addEventListener(WRITER_ASSET_REFS_UPDATED_EVENT, listener)

    upsertScopeAssetRef({
      projectId,
      scopeType: 'chapter',
      scopeId: 'chapter-1',
      assetType: 'character',
      assetId: 'char-1',
      assetName: '沈砚',
      source: 'mention',
    })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent)
    expect((listener.mock.calls[0]?.[0] as CustomEvent).detail).toMatchObject({
      projectId,
    })

    window.removeEventListener(WRITER_ASSET_REFS_UPDATED_EVENT, listener)
  })

  it('应持久化组织与概念绑定', () => {
    const projectId = 'project-1'
    upsertScopeAssetRef({
      projectId,
      scopeType: 'chapter',
      scopeId: 'chapter-2',
      assetType: 'organization',
      assetId: 'org-1',
      assetName: '巡夜司',
      source: 'manual',
    })
    upsertScopeAssetRef({
      projectId,
      scopeType: 'chapter',
      scopeId: 'chapter-2',
      assetType: 'concept',
      assetId: 'concept-1',
      assetName: '禁术回响',
      source: 'mention',
    })

    const state = loadWriterAssetRefState(projectId)
    expect(state.chapterRefs['chapter-2']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetType: 'organization',
          assetId: 'org-1',
          assetName: '巡夜司',
        }),
        expect.objectContaining({
          assetType: 'concept',
          assetId: 'concept-1',
          assetName: '禁术回响',
        }),
      ]),
    )
  })

  it('应合并章节与卷级引用并按资产去重', () => {
    const merged = mergeWriterAssetRefs({
      chapterRefs: [
        {
          id: 'chapter-ref-1',
          assetType: 'character',
          assetId: 'char-1',
          assetName: '沈砚',
          scopeType: 'chapter',
          scopeId: 'chapter-1',
          source: 'mention',
          createdAt: '2026-05-15T10:00:00.000Z',
          updatedAt: '2026-05-15T10:00:00.000Z',
        },
      ],
      volumeRefs: [
        {
          id: 'volume-ref-1',
          assetType: 'character',
          assetId: 'char-1',
          assetName: '沈砚',
          scopeType: 'volume',
          scopeId: 'volume-1',
          source: 'chapter_rollup',
          createdAt: '2026-05-15T09:00:00.000Z',
          updatedAt: '2026-05-15T09:00:00.000Z',
        },
        {
          id: 'volume-ref-2',
          assetType: 'location',
          assetId: 'loc-1',
          assetName: '雾港',
          scopeType: 'volume',
          scopeId: 'volume-1',
          source: 'chapter_rollup',
          createdAt: '2026-05-15T09:30:00.000Z',
          updatedAt: '2026-05-15T09:30:00.000Z',
        },
      ],
    })

    expect(merged).toHaveLength(2)
    expect(merged.map((item) => item.assetName)).toEqual(['沈砚', '雾港'])
  })

  it('应按章节生成统一资产摘要并继承卷级引用', () => {
    const projectId = 'project-2'
    upsertScopeAssetRef({
      projectId,
      scopeType: 'volume',
      scopeId: 'volume-1',
      assetType: 'location',
      assetId: 'loc-1',
      assetName: '雾港',
      source: 'chapter_rollup',
    })
    upsertScopeAssetRef({
      projectId,
      scopeType: 'chapter',
      scopeId: 'chapter-1',
      assetType: 'character',
      assetId: 'char-1',
      assetName: '沈砚',
      source: 'mention',
    })

    const summaryByChapter = buildWriterAssetSummaryByChapterId(loadWriterAssetRefState(projectId), [
      { id: 'chapter-1', parentId: 'volume-1' },
    ])

    expect(summaryByChapter['chapter-1']).toMatchObject({
      total: 2,
      characters: 1,
      locations: 1,
    })
  })

  it('应把资产摘要格式化为稳定顺序的展示项', () => {
    expect(
      buildWriterAssetSummaryItems({
        total: 4,
        characters: 1,
        locations: 1,
        items: 2,
        organizations: 0,
        concepts: 0,
      }),
    ).toEqual([
      { type: 'character', label: '角色', count: 1 },
      { type: 'location', label: '地点', count: 1 },
      { type: 'item', label: '物品', count: 2 },
    ])
  })

  it('应构建资产引用投影以支持右栏影响面提示', () => {
    const projectId = 'project-3'
    upsertScopeAssetRef({
      projectId,
      scopeType: 'chapter',
      scopeId: 'chapter-1',
      assetType: 'character',
      assetId: 'char-1',
      assetName: '沈砚',
      source: 'mention',
    })
    upsertScopeAssetRef({
      projectId,
      scopeType: 'chapter',
      scopeId: 'chapter-2',
      assetType: 'character',
      assetId: 'char-1',
      assetName: '沈砚',
      source: 'mention',
    })
    upsertScopeAssetRef({
      projectId,
      scopeType: 'volume',
      scopeId: 'volume-1',
      assetType: 'character',
      assetId: 'char-1',
      assetName: '沈砚',
      source: 'chapter_rollup',
    })

    const projection = buildWriterAssetReferenceProjection(loadWriterAssetRefState(projectId)).get(
      'character:char-1',
    )

    expect(projection).toMatchObject({
      totalReferenceCount: 3,
      chapterReferenceCount: 2,
      volumeReferenceCount: 1,
      chapterIds: ['chapter-1', 'chapter-2'],
      volumeIds: ['volume-1'],
      latestChapterId: 'chapter-2',
    })
  })

  it('应批量写入章节资产引用以支持验证样本预索引', () => {
    const projectId = 'project-bulk'

    const state = replaceProjectChapterAssetRefs({
      projectId,
      entries: [
        {
          chapterId: 'chapter-1',
          candidates: [
            {
              key: 'character:char-1',
              assetType: 'character',
              assetId: 'char-1',
              assetName: '沈砚',
              source: 'mention',
            },
          ],
        },
        {
          chapterId: 'chapter-2',
          candidates: [
            {
              key: 'character:char-1',
              assetType: 'character',
              assetId: 'char-1',
              assetName: '沈砚',
              source: 'mention',
            },
            {
              key: 'item:item-1',
              assetType: 'item',
              assetId: 'item-1',
              assetName: '铜钥匙',
              source: 'mention',
            },
          ],
        },
      ],
    })

    expect(state.chapterRefs['chapter-1']).toHaveLength(1)
    expect(state.chapterRefs['chapter-2']).toHaveLength(2)
    expect(buildWriterAssetReferenceProjection(state).get('character:char-1')).toMatchObject({
      chapterReferenceCount: 2,
      chapterIds: ['chapter-1', 'chapter-2'],
    })
  })
})
