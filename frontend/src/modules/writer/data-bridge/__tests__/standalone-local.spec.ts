import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RelationType } from '../../types/character'
import { LocationRelationType } from '../../types/location'
import { EventType } from '../../types/timeline'
import type { Storage } from '@/utils/storage'

const memoryStorage = new Map<string, unknown>()

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

import { standaloneLocalBridge } from '../standalone-local'

describe('standaloneLocalBridge entity owners', () => {
  beforeEach(() => {
    memoryStorage.clear()
    const browserStorage = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => browserStorage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        browserStorage.set(key, value)
      },
      removeItem: (key: string) => {
        browserStorage.delete(key)
      },
      clear: () => {
        browserStorage.clear()
      },
      key: (index: number) => Array.from(browserStorage.keys())[index] ?? null,
      get length() {
        return browserStorage.size
      },
    })
    localStorage.clear()
  })

  it('provides a rich validation sample when standalone storage is empty', async () => {
    const projectList = await standaloneLocalBridge.project.list()
    const sampleProject = projectList.projects?.find((project) => project.id === 'local-validation-yunlan')

    expect(sampleProject).toEqual(
      expect.objectContaining({
        title: '云岚验证样本',
        chapterCount: 4,
      }),
    )

    const detail = await standaloneLocalBridge.project.get('local-validation-yunlan')
    const characters = await standaloneLocalBridge.character.list('local-validation-yunlan')
    const relations = await standaloneLocalBridge.character.listRelations('local-validation-yunlan')
    const locations = await standaloneLocalBridge.location.list('local-validation-yunlan')
    const assets = await standaloneLocalBridge.entity.list('local-validation-yunlan')
    const [timeline] = await standaloneLocalBridge.timeline.list('local-validation-yunlan')
    const events = await standaloneLocalBridge.timeline.listEvents(timeline.id)
    const chapter = await standaloneLocalBridge.editor.getContent('local-validation-yunlan-chapter-1')

    expect(detail.documents).toHaveLength(5)
    expect(characters).toHaveLength(4)
    expect(relations).toHaveLength(3)
    expect(locations).toHaveLength(3)
    expect(assets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ entityType: 'item', name: '青铜潮铃' }),
        expect.objectContaining({ entityType: 'organization', name: '听潮司' }),
        expect.objectContaining({ entityType: 'concept', name: '潮声回路' }),
      ]),
    )
    expect(events).toHaveLength(4)
    expect(chapter.content).toContain('@沈奕')
    expect(chapter.content).toContain('%青铜潮铃')
  })

  it('persists characters and relations in local storage', async () => {
    const first = await standaloneLocalBridge.character.create('project-1', {
      projectId: 'project-1',
      name: '林舟',
      summary: '主角',
    })
    const second = await standaloneLocalBridge.character.create('project-1', {
      projectId: 'project-1',
      name: '苏岚',
    })

    const relation = await standaloneLocalBridge.character.createRelation('project-1', {
      fromId: first.id,
      toId: second.id,
      type: RelationType.FRIEND,
      strength: 80,
      notes: '旧识',
    })

    await expect(standaloneLocalBridge.character.list('project-1')).resolves.toEqual([
      expect.objectContaining({ id: first.id, name: '林舟' }),
      expect.objectContaining({ id: second.id, name: '苏岚' }),
    ])
    await expect(standaloneLocalBridge.character.listRelations('project-1')).resolves.toEqual([
      expect.objectContaining({ id: relation.id, type: RelationType.FRIEND }),
    ])
    await expect(standaloneLocalBridge.character.getGraph('project-1')).resolves.toEqual({
      characters: [
        expect.objectContaining({ id: first.id }),
        expect.objectContaining({ id: second.id }),
      ],
      relations: [expect.objectContaining({ id: relation.id })],
    })

    await standaloneLocalBridge.character.delete(second.id)

    await expect(standaloneLocalBridge.character.list('project-1')).resolves.toEqual([
      expect.objectContaining({ id: first.id, name: '林舟' }),
    ])
    await expect(standaloneLocalBridge.character.listRelations('project-1')).resolves.toEqual([])
  })

  it('persists locations, trees and relations in local storage', async () => {
    const root = await standaloneLocalBridge.location.create('project-1', {
      projectId: 'project-1',
      name: '云港',
      description: '港口',
    })
    const child = await standaloneLocalBridge.location.create('project-1', {
      projectId: 'project-1',
      name: '旧码头',
      parentId: root.id,
    })

    const relation = await standaloneLocalBridge.location.createRelation('project-1', {
      projectId: 'project-1',
      fromId: root.id,
      toId: child.id,
      type: LocationRelationType.CONTAINS,
      notes: '主场景到支线场景',
    })

    await expect(standaloneLocalBridge.location.list('project-1')).resolves.toEqual([
      expect.objectContaining({ id: root.id, name: '云港' }),
      expect.objectContaining({ id: child.id, name: '旧码头' }),
    ])
    await expect(standaloneLocalBridge.location.getTree('project-1')).resolves.toEqual([
      expect.objectContaining({
        id: root.id,
        children: [expect.objectContaining({ id: child.id })],
      }),
    ])
    await expect(standaloneLocalBridge.location.listRelations('project-1')).resolves.toEqual([
      expect.objectContaining({ id: relation.id, type: LocationRelationType.CONTAINS }),
    ])

    await standaloneLocalBridge.location.delete(root.id)

    await expect(standaloneLocalBridge.location.list('project-1')).resolves.toEqual([])
    await expect(standaloneLocalBridge.location.listRelations('project-1')).resolves.toEqual([])
  })

  it('persists concepts, timelines and local entity summaries in local storage', async () => {
    const concept = await standaloneLocalBridge.concept.create('project-1', {
      projectId: 'project-1',
      name: '灵脉潮汐',
      summary: '世界规则',
    })
    const [defaultTimeline] = await standaloneLocalBridge.timeline.list('project-1')
    const event = await standaloneLocalBridge.timeline.createEvent(defaultTimeline.id, 'project-1', {
      timelineId: defaultTimeline.id,
      title: '港口异变',
      eventType: EventType.PLOT,
      importance: 7,
      description: '第一章主冲突',
    })
    const item = await standaloneLocalBridge.entity.create({
      projectId: 'project-1',
      type: 'item',
      name: '碎星匕首',
      summary: '主角初始装备',
    })
    await standaloneLocalBridge.entity.updateStateFields(concept.id, {
      heat: { current: 'high', description: '讨论热度' },
    })
    const organization = await standaloneLocalBridge.entity.create({
      projectId: 'project-1',
      type: 'organization',
      name: '云港商会',
      summary: '地方势力',
    })

    await expect(standaloneLocalBridge.concept.list('project-1')).resolves.toEqual([
      expect.objectContaining({ id: concept.id, name: '灵脉潮汐' }),
    ])
    await expect(standaloneLocalBridge.timeline.list('project-1')).resolves.toEqual([
      expect.objectContaining({ id: defaultTimeline.id, name: '主时间线' }),
    ])
    await expect(standaloneLocalBridge.timeline.listEvents(defaultTimeline.id)).resolves.toEqual([
      expect.objectContaining({ id: event.id, title: '港口异变' }),
    ])
    await expect(standaloneLocalBridge.entity.list('project-1')).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: item.id, entityType: 'item', name: '碎星匕首' }),
        expect.objectContaining({ id: concept.id, entityType: 'concept' }),
        expect.objectContaining({ id: organization.id, entityType: 'organization' }),
      ]),
    )
    await expect(standaloneLocalBridge.entity.getGraph('project-1')).resolves.toEqual(
      expect.objectContaining({
        nodes: expect.arrayContaining([
          expect.objectContaining({ id: item.id, entityType: 'item' }),
          expect.objectContaining({ id: concept.id }),
          expect.objectContaining({ id: organization.id }),
        ]),
      }),
    )
  })

  it('migrates legacy writer items into local entity owner on first project access', async () => {
    localStorage.setItem(
      'qingyu_writer_items:project-legacy',
      JSON.stringify([
        {
          id: 'writer-item-legacy-1',
          projectId: 'project-legacy',
          name: '旧铜钥匙',
          alias: ['仓库钥匙'],
          summary: '历史项目中的旧物件存储',
          createdAt: '2026-05-11T00:00:00Z',
          updatedAt: '2026-05-11T00:00:00Z',
        },
      ]),
    )

    await expect(standaloneLocalBridge.entity.list('project-legacy', 'item')).resolves.toEqual([
      expect.objectContaining({
        id: 'writer-item-legacy-1',
        name: '旧铜钥匙',
        alias: ['仓库钥匙'],
        entityType: 'item',
      }),
    ])

    const persistedState = memoryStorage.get('writer_standalone_local_state') as
      | { genericEntities?: Array<{ id: string; projectId: string; entityType: string }> }
      | undefined

    expect(persistedState?.genericEntities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'writer-item-legacy-1',
          projectId: 'project-legacy',
          entityType: 'item',
        }),
      ]),
    )
  })
})
