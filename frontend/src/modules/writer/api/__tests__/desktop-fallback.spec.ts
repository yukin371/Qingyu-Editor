import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()
const httpGetMock = vi.fn()
const httpPostMock = vi.fn()

vi.mock('@/utils/request-adapter', () => ({
  request: (...args: unknown[]) => requestMock(...args),
}))

vi.mock('@/core/services/http.service', () => ({
  default: {
    get: (...args: unknown[]) => httpGetMock(...args),
    post: (...args: unknown[]) => httpPostMock(...args),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { conceptApi } from '../concept'
import { getEntityGraph, listEntities, updateEntityStateFields } from '../entities'
import { characterApi } from '../character'
import { locationApi } from '../location'
import { timelineApi } from '../timeline'

describe('writer desktop api fallback', () => {
  beforeEach(() => {
    requestMock.mockReset()
    httpGetMock.mockReset()
    httpPostMock.mockReset()
  })

  afterEach(() => {
    delete (window as Window & { go?: unknown }).go
  })

  it('returns local empty entities in desktop runtime', async () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    await expect(listEntities('project-1', 'item')).resolves.toEqual([])
    await expect(getEntityGraph('project-1')).resolves.toEqual({ nodes: [], edges: [] })
    expect(requestMock).not.toHaveBeenCalled()
  })

  it('throws explicit desktop TODO errors for unsupported entity writes', async () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    await expect(updateEntityStateFields('entity-1', { mood: { current: 'steady' } })).rejects.toThrow(
      '桌面端暂未接入统一实体写入',
    )
    expect(requestMock).not.toHaveBeenCalled()
  })

  it('returns local empty concepts in desktop runtime and blocks remote writes', async () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    await expect(conceptApi.list('project-1')).resolves.toEqual([])
    expect(
      () =>
      conceptApi.create('project-1', {
        projectId: 'project-1',
        name: '灵脉潮汐',
        summary: '世界规则',
      }),
    ).toThrow('桌面端暂未接入概念资产本地持久化')

    expect(httpGetMock).not.toHaveBeenCalled()
    expect(httpPostMock).not.toHaveBeenCalled()
  })

  it('returns local empty timelines in desktop runtime and blocks remote writes', async () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    await expect(timelineApi.list('project-1')).resolves.toEqual([])
    await expect(timelineApi.listEvents('timeline-1')).resolves.toEqual([])
    expect(() =>
      timelineApi.createEvent('timeline-1', 'project-1', {
        timelineId: 'timeline-1',
        title: '转折点',
        eventType: 'plot',
        importance: 8,
      } as any),
    ).toThrow('桌面端暂未接入时间线本地持久化')

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
})
