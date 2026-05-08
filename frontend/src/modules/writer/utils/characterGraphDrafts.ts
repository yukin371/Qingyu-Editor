import type {
  ChapterGraph,
  ChapterRelation,
  RelationType,
  VolumeGraph,
  VolumeRelation,
} from '../types/character'

const STORAGE_PREFIX = 'qingyu_writer_character_graph_drafts'
type GraphScopeType = 'chapter' | 'volume'

export interface CharacterGraphDraftState {
  globalGraphInitialized: boolean
  chapterGraphs: ChapterGraph[]
  chapterRelations: Record<string, ChapterRelation[]>
  volumeGraphs: VolumeGraph[]
  volumeRelations: Record<string, VolumeRelation[]>
}

const createDefaultState = (): CharacterGraphDraftState => ({
  globalGraphInitialized: false,
  chapterGraphs: [],
  chapterRelations: {},
  volumeGraphs: [],
  volumeRelations: {},
})

const getStorageKey = (projectId: string) => `${STORAGE_PREFIX}:${projectId}`

export function loadCharacterGraphDraftState(projectId: string): CharacterGraphDraftState {
  if (!projectId) return createDefaultState()

  try {
    const raw = localStorage.getItem(getStorageKey(projectId))
    if (!raw) return createDefaultState()

    const parsed = JSON.parse(raw) as Partial<CharacterGraphDraftState>
      return {
        globalGraphInitialized: Boolean(parsed.globalGraphInitialized),
        chapterGraphs: Array.isArray(parsed.chapterGraphs) ? parsed.chapterGraphs : [],
        chapterRelations:
          parsed.chapterRelations && typeof parsed.chapterRelations === 'object'
            ? (parsed.chapterRelations as Record<string, ChapterRelation[]>)
            : {},
        volumeGraphs: Array.isArray(parsed.volumeGraphs) ? parsed.volumeGraphs : [],
        volumeRelations:
          parsed.volumeRelations && typeof parsed.volumeRelations === 'object'
            ? (parsed.volumeRelations as Record<string, VolumeRelation[]>)
            : {},
      }
  } catch {
    return createDefaultState()
  }
}

export function saveCharacterGraphDraftState(projectId: string, state: CharacterGraphDraftState) {
  if (!projectId) return

  localStorage.setItem(getStorageKey(projectId), JSON.stringify(state))
}

export function updateCharacterGraphDraftState(
  projectId: string,
  updater: (state: CharacterGraphDraftState) => CharacterGraphDraftState,
) {
  const nextState = updater(loadCharacterGraphDraftState(projectId))
  saveCharacterGraphDraftState(projectId, nextState)
  return nextState
}

export function createChapterGraphDraft(params: {
  projectId: string
  chapterId: string
  chapterTitle?: string
  parentGraphId?: string
  globalRelations?: ChapterRelation[]
}) {
  const { projectId, chapterId, chapterTitle, parentGraphId, globalRelations } = params

  return createScopedGraphDraft(projectId, 'chapter', chapterId, chapterTitle, parentGraphId, globalRelations)
}

export function createVolumeGraphDraft(params: {
  projectId: string
  volumeId: string
  volumeTitle?: string
  parentGraphId?: string
  globalRelations?: VolumeRelation[]
}) {
  const { projectId, volumeId, volumeTitle, parentGraphId, globalRelations } = params

  return createScopedGraphDraft(projectId, 'volume', volumeId, volumeTitle, parentGraphId, globalRelations)
}

function createScopedGraphDraft(
  projectId: string,
  scopeType: GraphScopeType,
  scopeId: string,
  scopeTitle?: string,
  parentGraphId?: string,
  globalRelations?: ChapterRelation[] | VolumeRelation[],
) {
  return updateCharacterGraphDraftState(projectId, (state) => {
    const now = new Date().toISOString()
    if (scopeType === 'volume') {
      const existing = state.volumeGraphs.find((graph) => graph.volumeId === scopeId)
      
      // 获取父图谱的关系数据用于继承
      let inheritedRelations: VolumeRelation[] = []
      const needsInheritance = parentGraphId && (!existing || existing.parentGraphId !== parentGraphId)
      if (needsInheritance) {
        if (parentGraphId === 'global' && globalRelations) {
          // 继承全局关系
          inheritedRelations = globalRelations as VolumeRelation[]
        } else if (parentGraphId !== 'global') {
          // 继承章节/卷图谱的关系
          inheritedRelations = getInheritedVolumeRelations(state, parentGraphId)
        }
      }
      
      const nextGraph: VolumeGraph = existing
        ? {
            ...existing,
            volumeTitle: scopeTitle || existing.volumeTitle,
            parentGraphId,
            updatedAt: now,
          }
        : {
            id: `volume-graph-${scopeId}`,
            projectId,
            volumeId: scopeId,
            volumeTitle: scopeTitle,
            parentGraphId,
            createdAt: now,
            updatedAt: now,
          }

      return {
        ...state,
        volumeGraphs: existing
          ? state.volumeGraphs.map((graph) => (graph.volumeId === scopeId ? nextGraph : graph))
          : [...state.volumeGraphs, nextGraph],
        volumeRelations: {
          ...state.volumeRelations,
          [scopeId]: (!existing || needsInheritance)
            ? [...inheritedRelations]
            : state.volumeRelations[scopeId] || [],
        },
      }
    }

    const existing = state.chapterGraphs.find((graph) => graph.chapterId === scopeId)
    
    // 获取父图谱的关系数据用于继承
    let inheritedRelations: ChapterRelation[] = []
    const needsInheritance = parentGraphId && (!existing || existing.parentGraphId !== parentGraphId)
    if (needsInheritance) {
      if (parentGraphId === 'global' && globalRelations) {
        // 继承全局关系
        inheritedRelations = globalRelations as ChapterRelation[]
      } else if (parentGraphId !== 'global') {
        // 继承章节/卷图谱的关系
        inheritedRelations = getInheritedChapterRelations(state, parentGraphId)
      }
    }
    
    const nextGraph: ChapterGraph = existing
      ? {
          ...existing,
          chapterTitle: scopeTitle || existing.chapterTitle,
          parentGraphId,
          updatedAt: now,
        }
      : {
          id: `chapter-graph-${scopeId}`,
          projectId,
          chapterId: scopeId,
          chapterTitle: scopeTitle,
          parentGraphId,
          createdAt: now,
          updatedAt: now,
        }

    return {
      ...state,
      chapterGraphs: existing
        ? state.chapterGraphs.map((graph) => (graph.chapterId === scopeId ? nextGraph : graph))
        : [...state.chapterGraphs, nextGraph],
      chapterRelations: {
        ...state.chapterRelations,
        [scopeId]: (!existing || needsInheritance)
          ? [...inheritedRelations]
          : state.chapterRelations[scopeId] || [],
      },
    }
  })
}

/**
 * 递归获取章节图谱继承的关系数据
 */
function getInheritedChapterRelations(
  state: CharacterGraphDraftState,
  parentGraphId: string,
): ChapterRelation[] {
  // 查找父章节图谱
  const parentChapterGraph = state.chapterGraphs.find(g => g.chapterId === parentGraphId)
  if (parentChapterGraph) {
    const parentRelations = state.chapterRelations[parentGraphId] || []
    // 如果父图谱也有parentGraphId，递归查找
    if (parentChapterGraph.parentGraphId && parentChapterGraph.parentGraphId !== 'global') {
      const grandParentRelations = getInheritedChapterRelations(state, parentChapterGraph.parentGraphId)
      return [...grandParentRelations, ...parentRelations]
    }
    return parentRelations
  }
  
  // 尝试查找卷图谱
  const parentVolumeGraph = state.volumeGraphs.find(g => g.volumeId === parentGraphId)
  if (parentVolumeGraph) {
    const volumeRelations = state.volumeRelations[parentGraphId] || []
    // 如果卷图谱也有parentGraphId，递归查找
    if (parentVolumeGraph.parentGraphId && parentVolumeGraph.parentGraphId !== 'global') {
      const grandParentRelations = getInheritedVolumeRelations(state, parentVolumeGraph.parentGraphId)
      return [...grandParentRelations, ...volumeRelations]
    }
    return volumeRelations as ChapterRelation[]
  }
  
  return []
}

/**
 * 递归获取卷图谱继承的关系数据
 */
function getInheritedVolumeRelations(
  state: CharacterGraphDraftState,
  parentGraphId: string,
): VolumeRelation[] {
  const parentVolumeGraph = state.volumeGraphs.find(g => g.volumeId === parentGraphId)
  if (parentVolumeGraph) {
    const parentRelations = state.volumeRelations[parentGraphId] || []
    // 如果父图谱也有parentGraphId，递归查找
    if (parentVolumeGraph.parentGraphId && parentVolumeGraph.parentGraphId !== 'global') {
      const grandParentRelations = getInheritedVolumeRelations(state, parentVolumeGraph.parentGraphId)
      return [...grandParentRelations, ...parentRelations]
    }
    return parentRelations
  }
  
  return []
}

export function setGlobalGraphInitialized(projectId: string, initialized = true) {
  return updateCharacterGraphDraftState(projectId, (state) => ({
    ...state,
    globalGraphInitialized: initialized,
  }))
}

export function appendChapterRelationDraft(params: {
  projectId: string
  chapterId: string
  graphId: string
  fromId: string
  toId: string
  type: RelationType | string
  strength: number
  notes?: string
}) {
  const { projectId, chapterId, graphId, fromId, toId, type, strength, notes } = params

  return appendScopedRelationDraft(projectId, 'chapter', chapterId, graphId, fromId, toId, type, strength, notes)
}

export function appendVolumeRelationDraft(params: {
  projectId: string
  volumeId: string
  graphId: string
  fromId: string
  toId: string
  type: RelationType | string
  strength: number
  notes?: string
}) {
  const { projectId, volumeId, graphId, fromId, toId, type, strength, notes } = params

  return appendScopedRelationDraft(projectId, 'volume', volumeId, graphId, fromId, toId, type, strength, notes)
}

function appendScopedRelationDraft(
  projectId: string,
  scopeType: GraphScopeType,
  scopeId: string,
  graphId: string,
  fromId: string,
  toId: string,
  type: RelationType | string,
  strength: number,
  notes?: string,
) {
  return updateCharacterGraphDraftState(projectId, (state) => {
    const timestamp = new Date().toISOString()
    if (scopeType === 'volume') {
      const existing = state.volumeRelations[scopeId] || []
      const nextRelation: VolumeRelation = {
        id: `draft-relation-${scopeId}-${Date.now()}`,
        graphId,
        fromId,
        toId,
        type,
        strength,
        notes,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      return {
        ...state,
        volumeRelations: {
          ...state.volumeRelations,
          [scopeId]: [...existing, nextRelation],
        },
      }
    }

    const existing = state.chapterRelations[scopeId] || []
    const nextRelation: ChapterRelation = {
      id: `draft-relation-${scopeId}-${Date.now()}`,
      graphId,
      fromId,
      toId,
      type,
      strength,
      notes,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    return {
      ...state,
      chapterRelations: {
        ...state.chapterRelations,
        [scopeId]: [...existing, nextRelation],
      },
    }
  })
}

export function deleteChapterRelationDraft(projectId: string, chapterId: string, relationId: string) {
  return deleteScopedRelationDraft(projectId, 'chapter', chapterId, relationId)
}

export function deleteVolumeRelationDraft(projectId: string, volumeId: string, relationId: string) {
  return deleteScopedRelationDraft(projectId, 'volume', volumeId, relationId)
}

function deleteScopedRelationDraft(
  projectId: string,
  scopeType: GraphScopeType,
  scopeId: string,
  relationId: string,
) {
  return updateCharacterGraphDraftState(projectId, (state) => {
    if (scopeType === 'volume') {
      return {
        ...state,
        volumeRelations: {
          ...state.volumeRelations,
          [scopeId]: (state.volumeRelations[scopeId] || []).filter((relation) => relation.id !== relationId),
        },
      }
    }

    return {
      ...state,
      chapterRelations: {
        ...state.chapterRelations,
        [scopeId]: (state.chapterRelations[scopeId] || []).filter((relation) => relation.id !== relationId),
      },
    }
  })
}

export function deleteChapterRelationsByNode(projectId: string, chapterId: string, nodeId: string) {
  return deleteScopedRelationsByNode(projectId, 'chapter', chapterId, nodeId)
}

export function deleteVolumeRelationsByNode(projectId: string, volumeId: string, nodeId: string) {
  return deleteScopedRelationsByNode(projectId, 'volume', volumeId, nodeId)
}

function deleteScopedRelationsByNode(
  projectId: string,
  scopeType: GraphScopeType,
  scopeId: string,
  nodeId: string,
) {
  return updateCharacterGraphDraftState(projectId, (state) => {
    if (scopeType === 'volume') {
      return {
        ...state,
        volumeRelations: {
          ...state.volumeRelations,
          [scopeId]: (state.volumeRelations[scopeId] || []).filter(
            (relation) => relation.fromId !== nodeId && relation.toId !== nodeId,
          ),
        },
      }
    }

    return {
      ...state,
      chapterRelations: {
        ...state.chapterRelations,
        [scopeId]: (state.chapterRelations[scopeId] || []).filter(
          (relation) => relation.fromId !== nodeId && relation.toId !== nodeId,
        ),
      },
    }
  })
}
