import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  extractWriterAssetCandidates,
  loadWriterAssetRefState,
  removeScopeAssetRef,
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
})
