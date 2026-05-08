import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  appendVolumeRelationDraft,
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
})
