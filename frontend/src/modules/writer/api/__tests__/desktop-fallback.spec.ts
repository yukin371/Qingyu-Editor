import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Storage } from '@/utils/storage'

const requestMock = vi.fn()
const httpGetMock = vi.fn()
const httpPostMock = vi.fn()
const httpPutMock = vi.fn()
const httpDeleteMock = vi.fn()
const memoryStorage = new Map<string, unknown>()

vi.mock('@/utils/request-adapter', () => ({
  request: (...args: unknown[]) => requestMock(...args),
}))

vi.mock('@/core/services/http.service', () => ({
  default: {
    get: (...args: unknown[]) => httpGetMock(...args),
    post: (...args: unknown[]) => httpPostMock(...args),
    put: (...args: unknown[]) => httpPutMock(...args),
    delete: (...args: unknown[]) => httpDeleteMock(...args),
  },
}))

vi.mock('@/utils/storage', () => {
  const storage: Partial<Storage> = {
    get<T = any>(key: string, defaultValue?: T) {
      return memoryStorage.has(key) ? (structuredClone(memoryStorage.get(key)) as T) : (defaultValue ?? null)
    },
    set(key: string, value: unknown) {
      memoryStorage.set(key, structuredClone(value))
    },
    remove(key: string) {
      memoryStorage.delete(key)
    },
    clear() {
      memoryStorage.clear()
    },
    has(key: string) {
      return memoryStorage.has(key)
    },
  }

  return {
    default: storage,
  }
})

import { conceptApi } from '../concept'
import { createLocalEntity, getEntityGraph, listEntities, updateEntityStateFields } from '../entities'
import { characterApi } from '../character'
import { locationApi } from '../location'
import { timelineApi } from '../timeline'
import { projectApi } from '../project'
import { documentApi } from '../document'
import { editorApi } from '../editor'
import { searchProjectKeywords } from '../wrapper'

describe('writer desktop api fallback', () => {
  beforeEach(() => {
    requestMock.mockReset()
    httpGetMock.mockReset()
    httpPostMock.mockReset()
    httpPutMock.mockReset()
    httpDeleteMock.mockReset()
    memoryStorage.clear()
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    delete (window as Window & { go?: unknown }).go
    memoryStorage.clear()
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('returns local empty entities in desktop runtime', async () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    await expect(listEntities('project-1', 'item')).resolves.toEqual([])
    await expect(getEntityGraph('project-1')).resolves.toEqual({ nodes: [], edges: [] })
    expect(requestMock).not.toHaveBeenCalled()
  })

  it('uses local entity state owner in desktop runtime', async () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    await expect(
      updateEntityStateFields('entity-1', { mood: { current: 'steady' } }),
    ).resolves.toBeUndefined()
    expect(requestMock).not.toHaveBeenCalled()
  })

  it('uses local organization owner in desktop runtime', async () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    const created = await createLocalEntity({
      projectId: 'project-1',
      type: 'organization',
      name: '云港商会',
      summary: '地方势力',
    })

    await expect(listEntities('project-1', 'organization')).resolves.toEqual([
      expect.objectContaining({ id: created.id, name: '云港商会', entityType: 'organization' }),
    ])
    expect(requestMock).not.toHaveBeenCalled()
  })

  it('uses local item owner in desktop runtime', async () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    const created = await createLocalEntity({
      projectId: 'project-1',
      type: 'item',
      name: '碎星匕首',
      alias: ['匕首'],
      summary: '主角初始装备',
    })

    await expect(listEntities('project-1', 'item')).resolves.toEqual([
      expect.objectContaining({
        id: created.id,
        name: '碎星匕首',
        alias: ['匕首'],
        entityType: 'item',
      }),
    ])
    expect(requestMock).not.toHaveBeenCalled()
  })

  it('uses local concept owner in desktop runtime', async () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    const created = (await conceptApi.create('project-1', {
      projectId: 'project-1',
      name: '灵脉潮汐',
      summary: '世界规则',
    })) as any
    await expect(conceptApi.list('project-1')).resolves.toEqual([
      expect.objectContaining({ id: created.id, name: '灵脉潮汐' }),
    ])

    expect(httpGetMock).not.toHaveBeenCalled()
    expect(httpPostMock).not.toHaveBeenCalled()
  })

  it('uses local timeline owner in desktop runtime', async () => {
    const [timeline] = (await timelineApi.list('project-1')) as any[]
    expect(timeline).toEqual(expect.objectContaining({ name: '主时间线' }))

    const event = (await timelineApi.createEvent(timeline.id, 'project-1', {
        timelineId: timeline.id,
        title: '转折点',
        eventType: 'plot',
        importance: 8,
      } as any)) as any
    await expect(timelineApi.listEvents(timeline.id)).resolves.toEqual([
      expect.objectContaining({ id: event.id, title: '转折点' }),
    ])

    expect(httpGetMock).not.toHaveBeenCalled()
    expect(httpPostMock).not.toHaveBeenCalled()
  })

  it('uses local wails character owner in desktop runtime', async () => {
    const listCharactersMock = vi.fn().mockResolvedValue([
      {
        id: 'char-1',
        projectId: 'project-1',
        name: '林舟',
        alias: ['阿舟'],
        summary: '主角',
        traits: ['冷静'],
        background: '',
        avatarUrl: '',
        personalityPrompt: '',
        speechPattern: '',
        currentState: '',
        customStatus: {},
        createdAt: '2026-05-10T00:00:00Z',
        updatedAt: '2026-05-10T00:00:00Z',
      },
    ])
    const listRelationsMock = vi.fn().mockResolvedValue([
      {
        id: 'rel-1',
        projectId: 'project-1',
        fromId: 'char-1',
        toId: 'char-2',
        type: '朋友',
        strength: 75,
        notes: '旧识',
        validFromChapterId: '',
        validUntilChapterId: '',
        createdAt: '2026-05-10T00:00:00Z',
        updatedAt: '2026-05-10T00:00:00Z',
      },
    ])
    const createCharacterMock = vi.fn().mockResolvedValue({
      id: 'char-3',
      projectId: 'project-1',
      name: '苏岚',
      alias: [],
      summary: '',
      traits: [],
      background: '',
      avatarUrl: '',
      personalityPrompt: '',
      speechPattern: '',
      currentState: '',
      customStatus: {},
      createdAt: '2026-05-10T00:00:00Z',
      updatedAt: '2026-05-10T00:00:00Z',
    })

    ;(window as Window & { go?: unknown }).go = {
      main: {
        App: {
          ListCharacters: listCharactersMock,
          ListCharacterRelations: listRelationsMock,
          CreateCharacter: createCharacterMock,
        },
      },
    }

    await expect(characterApi.list('project-1')).resolves.toEqual([
      expect.objectContaining({ id: 'char-1', name: '林舟' }),
    ])
    await expect(characterApi.listRelations('project-1')).resolves.toEqual([
      expect.objectContaining({ id: 'rel-1', type: '朋友' }),
    ])
    await expect(characterApi.getGraph('project-1')).resolves.toEqual({
      characters: [expect.objectContaining({ id: 'char-1' })],
      relations: [expect.objectContaining({ id: 'rel-1' })],
    })
    await expect(
      characterApi.create('project-1', {
        projectId: 'project-1',
        name: '苏岚',
      }),
    ).resolves.toEqual(expect.objectContaining({ id: 'char-3', name: '苏岚' }))

    expect(httpGetMock).not.toHaveBeenCalled()
    expect(httpPostMock).not.toHaveBeenCalled()
  })

  it('uses local wails location owner in desktop runtime', async () => {
    const listLocationsMock = vi.fn().mockResolvedValue([
      {
        id: 'loc-root',
        projectId: 'project-1',
        name: '云港',
        description: '港口',
        climate: '',
        culture: '',
        geography: '',
        atmosphere: '',
        parentId: '',
        imageUrl: '',
        createdAt: '2026-05-10T00:00:00Z',
        updatedAt: '2026-05-10T00:00:00Z',
      },
      {
        id: 'loc-child',
        projectId: 'project-1',
        name: '旧码头',
        description: '支线场景',
        climate: '',
        culture: '',
        geography: '',
        atmosphere: '',
        parentId: 'loc-root',
        imageUrl: '',
        createdAt: '2026-05-10T00:00:00Z',
        updatedAt: '2026-05-10T00:00:00Z',
      },
    ])
    const listLocationRelationsMock = vi.fn().mockResolvedValue([
      {
        id: 'loc-rel-1',
        projectId: 'project-1',
        fromId: 'loc-root',
        toId: 'loc-child',
        type: 'contains',
        distance: '',
        notes: '',
        createdAt: '2026-05-10T00:00:00Z',
        updatedAt: '2026-05-10T00:00:00Z',
      },
    ])
    const createLocationMock = vi.fn().mockResolvedValue({
      id: 'loc-3',
      projectId: 'project-1',
      name: '望海塔',
      description: '',
      climate: '',
      culture: '',
      geography: '',
      atmosphere: '',
      parentId: '',
      imageUrl: '',
      createdAt: '2026-05-10T00:00:00Z',
      updatedAt: '2026-05-10T00:00:00Z',
    })

    ;(window as Window & { go?: unknown }).go = {
      main: {
        App: {
          ListLocations: listLocationsMock,
          ListLocationRelations: listLocationRelationsMock,
          CreateLocation: createLocationMock,
        },
      },
    }

    await expect(locationApi.list('project-1')).resolves.toEqual([
      expect.objectContaining({ id: 'loc-root', name: '云港' }),
      expect.objectContaining({ id: 'loc-child', name: '旧码头' }),
    ])
    await expect(locationApi.getTree('project-1')).resolves.toEqual([
      expect.objectContaining({
        id: 'loc-root',
        children: [expect.objectContaining({ id: 'loc-child' })],
      }),
    ])
    await expect(locationApi.listRelations('project-1')).resolves.toEqual([
      expect.objectContaining({ id: 'loc-rel-1', type: 'contains' }),
    ])
    await expect(
      locationApi.create('project-1', {
        projectId: 'project-1',
        name: '望海塔',
      }),
    ).resolves.toEqual(expect.objectContaining({ id: 'loc-3', name: '望海塔' }))

    expect(httpGetMock).not.toHaveBeenCalled()
    expect(httpPostMock).not.toHaveBeenCalled()
  })

  it('uses local document duplicate and reorder owner in browser standalone runtime', async () => {
    const project = (await projectApi.create({
      title: '本地文档项目',
      summary: '用于复制与重排',
    })) as any
    const projectId = project.id

    const volume = await documentApi.create(projectId, {
      projectId,
      title: '卷一',
      type: 'volume',
      order: 0,
    } as any)
    const chapterA = await documentApi.create(projectId, {
      projectId,
      parentId: volume.id,
      title: '第一章',
      type: 'chapter',
      order: 0,
    } as any)
    const chapterB = await documentApi.create(projectId, {
      projectId,
      parentId: volume.id,
      title: '第二章',
      type: 'chapter',
      order: 1,
    } as any)

    await editorApi.replaceContents(chapterA.id, [{ order: 1, content: '风起云涌' }])

    const duplicated = await documentApi.duplicate(chapterA.id, {
      targetParentId: volume.id,
      targetDocumentId: chapterB.id,
      position: 'before',
      copyContent: true,
    })

    const duplicatedContent = await editorApi.getContent(duplicated.documentId)
    expect(duplicatedContent).toEqual(expect.objectContaining({ content: '风起云涌' }))

    const treeAfterDuplicate = (await documentApi.getTree(projectId)) as any[]
    expect(treeAfterDuplicate[0]?.children?.map((item: any) => item.title)).toEqual([
      '第一章',
      '第一章（副本）',
      '第二章',
    ])

    await documentApi.reorder(projectId, {
      parentId: volume.id,
      documentIds: [chapterB.id, duplicated.documentId, chapterA.id],
    })

    const treeAfterReorder = (await documentApi.getTree(projectId)) as any[]
    expect(treeAfterReorder[0]?.children?.map((item: any) => item.id)).toEqual([
      chapterB.id,
      duplicated.documentId,
      chapterA.id,
    ])

    const appendedChapter = await documentApi.create(projectId, {
      projectId,
      parentId: volume.id,
      title: '压栈追加章节',
      type: 'chapter',
    } as any)

    const treeAfterAppend = await documentApi.getTree(projectId)
    const appendedSiblings = treeAfterAppend[0]?.children || []
    expect(appendedSiblings[appendedSiblings.length - 1]?.id).toBe(appendedChapter.id)

    expect(httpGetMock).not.toHaveBeenCalled()
    expect(httpPostMock).not.toHaveBeenCalled()
    expect(httpPutMock).not.toHaveBeenCalled()
  })

  it('uses local keyword search with text and pinyin in browser standalone runtime', async () => {
    const project = (await projectApi.create({
      title: '检索项目',
      summary: '',
    })) as any
    const projectId = project.id

    await characterApi.create(projectId, {
      projectId,
      name: '林舟',
      summary: '主角',
    } as any)
    await documentApi.create(projectId, {
      projectId,
      title: '第一章 起风',
      type: 'chapter',
      order: 0,
    } as any)

    const textMatch = (await searchProjectKeywords(projectId, '起风', 10)) as any
    expect(textMatch.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'chapter',
          name: '第一章 起风',
          matchMode: 'fuzzy',
        }),
      ]),
    )

    const pinyinMatch = (await searchProjectKeywords(projectId, 'lz', 10)) as any
    expect(pinyinMatch.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'character',
          name: '林舟',
          matchMode: 'pinyin_prefix',
        }),
      ]),
    )

    const atMentionMatch = (await searchProjectKeywords(projectId, '@林', 10)) as any
    expect(atMentionMatch.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'character',
          name: '林舟',
        }),
      ]),
    )

    expect(httpGetMock).not.toHaveBeenCalled()
  })

  it('routes keyword search to remote api only when remote=true is explicit', async () => {
    window.history.replaceState({}, '', '/?remote=true')
    httpGetMock.mockResolvedValue({
      query: 'linzhou',
      suggestions: [
        {
          type: 'character',
          id: 'char-1',
          name: '林舟',
          matchMode: 'pinyin_prefix',
        },
      ],
    })

    await expect(searchProjectKeywords('project-remote', 'linzhou', 5)).resolves.toEqual({
      query: 'linzhou',
      suggestions: [
        {
          type: 'character',
          id: 'char-1',
          name: '林舟',
          matchMode: 'pinyin_prefix',
        },
      ],
    })

    expect(httpGetMock).toHaveBeenCalledWith('/writer/projects/project-remote/keywords/search', {
      params: { q: 'linzhou', limit: 5 },
    })
  })

  it('uses local word count and project statistics owner in browser standalone runtime', async () => {
    await expect(
      editorApi.calculateWordCount('doc-local', {
        content: '山河 湖海',
        filterMarkdown: false,
      } as any),
    ).resolves.toEqual({
      wordCount: 4,
      charCount: 5,
    })

    await expect(projectApi.refreshStatistics('project-local')).resolves.toBeUndefined()
    expect(httpPostMock).not.toHaveBeenCalled()
    expect(httpPutMock).not.toHaveBeenCalled()
  })
})
