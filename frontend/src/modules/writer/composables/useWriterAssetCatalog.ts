import { computed, ref, unref, watch, type ComputedRef, type Ref } from 'vue'
import {
  createCharacter,
  deleteCharacter,
  updateCharacter,
} from '@/modules/writer/api/character'
import { conceptApi } from '@/modules/writer/api/concept'
import {
  createLocalEntity,
  deleteLocalEntity,
  listEntities,
  type EntitySummary,
  updateLocalEntity,
} from '@/modules/writer/api/entities'
import { locationApi } from '@/modules/writer/api/location'
import type { EncyclopediaCategory, GraphFocusTarget, SidebarChapterSummary } from './types'
import { useWriterAssetRefState } from '@/modules/writer/composables/useWriterAssetRefState'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import {
  buildWriterAssetReferenceProjection,
  createWriterAssetRefKey,
  type WriterAssetType,
} from '@/modules/writer/utils/writerAssetRefs'
import type { Concept } from '@/modules/writer/types/entity'
import type { Character, Location, OutlineNode } from '@/types/writer'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>
type AssetRecord = Character | Location | Concept | EntitySummary

export interface WriterAssetListItem {
  id: string
  name: string
  category: EncyclopediaCategory
  typeLabel: string
  summary: string
  badge?: string
  latestChapterId?: string
  latestChapterTitle?: string
  linkedNodeCount: number
  chapterReferenceCount: number
  volumeReferenceCount: number
  totalReferenceCount: number
  raw: AssetRecord
}

export interface WriterAssetCategoryOption {
  id: EncyclopediaCategory
  label: string
  count: number
  hint: string
  tone: 'info' | 'success' | 'warning'
}

export interface WriterAssetDetailField {
  label: string
  value: string
}

export interface WriterAssetMutationInput {
  category: EncyclopediaCategory
  name: string
  summary?: string
  alias?: string[]
  traits?: string[]
  background?: string
  climate?: string
  culture?: string
  geography?: string
  atmosphere?: string
  conceptCategory?: string
}

const ASSET_SCOPE_HINT =
  '当前仅纳入已建档的角色、地点、物件、组织、概念；伏笔与未确认资产候选暂不进入资产总览。'

const flattenOutlineNodes = (nodes: OutlineNode[] | undefined | null): OutlineNode[] => {
  if (!Array.isArray(nodes)) return []
  return nodes.flatMap((node) => [node, ...flattenOutlineNodes(node.children)])
}

const unwrapApiData = <T,>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return ((payload as Record<string, unknown>).data as T) ?? ([] as unknown as T)
  }
  return (payload as T) ?? ([] as unknown as T)
}

const normalizeSummary = (value: string | undefined | null) => String(value || '').trim()
const unwrapConceptList = (payload: unknown) => unwrapApiData<Concept[]>(payload)
const extractAssetId = (payload: unknown) => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return String(
      ((payload as Record<string, unknown>).data as Record<string, unknown> | undefined)?.id || '',
    )
  }
  return String((payload as Record<string, unknown> | undefined)?.id || '')
}

export function useWriterAssetCatalog(options: {
  projectId: MaybeRef<string>
  chapters?: MaybeRef<SidebarChapterSummary[] | undefined>
  activeCategory: Ref<EncyclopediaCategory>
  searchKeyword: Ref<string>
}) {
  const writerStore = useWriterStore()
  const loading = ref(false)
  const selectedAsset = ref<WriterAssetListItem | null>(null)
  const concepts = ref<Concept[]>([])
  const items = ref<EntitySummary[]>([])
  const organizations = ref<EntitySummary[]>([])

  const effectiveProjectId = computed(
    () => String(unref(options.projectId) || writerStore.currentProjectId || ''),
  )
  const chapters = computed<SidebarChapterSummary[]>(() => unref(options.chapters) || [])
  const characters = computed<Character[]>(() => writerStore.characters.list ?? [])
  const locations = computed<Location[]>(() => writerStore.locations.list ?? [])
  const { assetRefState } = useWriterAssetRefState(effectiveProjectId)

  const nodesByChapterId = computed(() => {
    const map = new Map<string, Set<string>>()
    for (const node of flattenOutlineNodes(writerStore.outline.tree as OutlineNode[] | undefined)) {
      if (!node.documentId) continue
      if (!map.has(node.documentId)) {
        map.set(node.documentId, new Set<string>())
      }
      map.get(node.documentId)?.add(node.id)
    }
    return map
  })

  const chapterTitleById = computed(() => {
    const map = new Map<string, string>()
    for (const chapter of chapters.value) {
      map.set(chapter.id, chapter.title)
    }
    return map
  })

  const assetReferenceMetaByKey = computed(() => {
    const linkedNodeCountByKey = new Map<string, Set<string>>()
    const projectionByKey = buildWriterAssetReferenceProjection(assetRefState.value)

    for (const [chapterId, refs] of Object.entries(assetRefState.value.chapterRefs || {})) {
      const linkedNodes = nodesByChapterId.value.get(chapterId) || new Set<string>()
      for (const ref of refs) {
        const key = createWriterAssetRefKey(ref.assetType, ref.assetId, ref.assetName)
        if (!linkedNodeCountByKey.has(key)) {
          linkedNodeCountByKey.set(key, new Set<string>())
        }
        const bucket = linkedNodeCountByKey.get(key)
        for (const nodeId of linkedNodes) {
          bucket?.add(nodeId)
        }
      }
    }

    return {
      projectionByKey,
      linkedNodeCountByKey,
    }
  })

  const enrichAssetMeta = (assetType: WriterAssetType, assetId: string | undefined, assetName: string) => {
    const key = createWriterAssetRefKey(assetType, assetId, assetName)
    const projection = assetReferenceMetaByKey.value.projectionByKey.get(key)
    const linkedNodeCount = assetReferenceMetaByKey.value.linkedNodeCountByKey.get(key)?.size || 0

    return {
      latestChapterId: projection?.latestChapterId,
      latestChapterTitle: projection?.latestChapterId
        ? chapterTitleById.value.get(projection.latestChapterId) || projection.latestChapterId
        : undefined,
      linkedNodeCount,
      chapterReferenceCount: projection?.chapterIds.length || 0,
      volumeReferenceCount: projection?.volumeIds.length || 0,
      totalReferenceCount: projection?.totalReferenceCount || 0,
    }
  }

  const categoryOptions = computed<WriterAssetCategoryOption[]>(() => [
    {
      id: 'characters',
      label: '角色',
      count: characters.value.length,
      hint: '角色卡与活跃人物',
      tone: 'info',
    },
    {
      id: 'locations',
      label: '地点',
      count: locations.value.length,
      hint: '场景与世界空间节点',
      tone: 'success',
    },
    {
      id: 'items',
      label: '物件',
      count: items.value.length,
      hint: '道具与关键物品',
      tone: 'warning',
    },
    {
      id: 'organizations',
      label: '组织',
      count: organizations.value.length,
      hint: '势力、公会与组织节点',
      tone: 'warning',
    },
    {
      id: 'concepts',
      label: '概念',
      count: concepts.value.length,
      hint: '概念、设定与规则',
      tone: 'info',
    },
  ])

  const currentCategoryMeta = computed(() => {
    switch (options.activeCategory.value) {
      case 'locations':
        return {
          title: '地点总览',
          eyebrow: 'World Spaces',
          copy: '查看世界中的地点与空间节点，帮助你快速切回场景和空间设定。',
        }
      case 'items':
        return {
          title: '物件总览',
          eyebrow: 'Story Objects',
          copy: '查看关键物件与道具，确认哪些资产已经沉淀到统一实体口径。',
        }
      case 'organizations':
        return {
          title: '组织总览',
          eyebrow: 'Factions',
          copy: '查看宗门、公会、国家等组织节点，避免关系图谱兼任资产后台。',
        }
      case 'concepts':
        return {
          title: '概念总览',
          eyebrow: 'World Rules',
          copy: '查看概念、世界规则和设定卡片，便于统一维护世界观资产。',
        }
      default:
        return {
          title: '角色总览',
          eyebrow: 'Story Characters',
          copy: '查看角色卡与当前已沉淀的主角/配角资产，快速切回角色关系分析。',
        }
    }
  })

  const assetCatalog = computed<Record<EncyclopediaCategory, WriterAssetListItem[]>>(() => ({
    characters: characters.value.map((character) => ({
      id: character.id,
      name: character.name,
      category: 'characters',
      typeLabel: '角色',
      summary: normalizeSummary(character.summary),
      badge: character.alias?.length ? `别名 ${character.alias.length}` : undefined,
      ...enrichAssetMeta('character', character.id, character.name),
      raw: character,
    })),
    locations: locations.value.map((location) => ({
      id: location.id,
      name: location.name,
      category: 'locations',
      typeLabel: '地点',
      summary: normalizeSummary(location.description),
      badge: location.atmosphere || location.climate || undefined,
      ...enrichAssetMeta('location', location.id, location.name),
      raw: location,
    })),
    items: items.value.map((item) => ({
      id: item.id,
      name: item.name,
      category: 'items',
      typeLabel: '物件',
      summary: normalizeSummary(item.summary),
      ...enrichAssetMeta('item', item.id, item.name),
      raw: item,
    })),
    organizations: organizations.value.map((organization) => ({
      id: organization.id,
      name: organization.name,
      category: 'organizations',
      typeLabel: '组织',
      summary: normalizeSummary(organization.summary),
      ...enrichAssetMeta('organization', organization.id, organization.name),
      raw: organization,
    })),
    concepts: concepts.value.map((concept) => ({
      id: concept.id,
      name: concept.name,
      category: 'concepts',
      typeLabel: '概念',
      summary: normalizeSummary(concept.summary || concept.description),
      badge: concept.category || undefined,
      ...enrichAssetMeta('concept', concept.id, concept.name),
      raw: concept,
    })),
  }))

  const filteredAssets = computed(() => {
    const keyword = options.searchKeyword.value.toLowerCase()
    const assets = assetCatalog.value[options.activeCategory.value] || []
    if (!keyword) return assets

    return assets.filter((asset) => {
      const searchableParts = [asset.name, asset.summary, asset.badge, asset.latestChapterTitle]
      const raw = asset.raw as Partial<Character & Location & Concept & EntitySummary>
      if ('alias' in raw && Array.isArray(raw.alias)) {
        searchableParts.push(raw.alias.join(' '))
      }
      if ('background' in raw && typeof raw.background === 'string') {
        searchableParts.push(raw.background)
      }
      if ('description' in raw && typeof raw.description === 'string') {
        searchableParts.push(raw.description)
      }
      return searchableParts.join(' ').toLowerCase().includes(keyword)
    })
  })

  const emptyMessage = computed(() => {
    if (options.searchKeyword.value) {
      return `未找到与“${options.searchKeyword.value}”匹配的资产`
    }
    return `${currentCategoryMeta.value.title}暂时为空`
  })

  const selectedDetailFields = computed<WriterAssetDetailField[]>(() => {
    if (!selectedAsset.value) return []

    const raw = selectedAsset.value.raw
    const sharedFields: WriterAssetDetailField[] = [
      selectedAsset.value.latestChapterTitle
        ? { label: '最近章节', value: selectedAsset.value.latestChapterTitle }
        : null,
      { label: '提及章节', value: `${selectedAsset.value.chapterReferenceCount} 章` },
      { label: '涉及卷', value: `${selectedAsset.value.volumeReferenceCount} 卷` },
      { label: '关联结构节点', value: String(selectedAsset.value.linkedNodeCount) },
    ].filter(Boolean) as WriterAssetDetailField[]

    switch (selectedAsset.value.category) {
      case 'characters': {
        const character = raw as Character
        return [
          character.alias?.length ? { label: '别名', value: character.alias.join('、') } : null,
          character.traits?.length ? { label: '特征', value: character.traits.join('、') } : null,
          character.background ? { label: '背景', value: character.background } : null,
          ...sharedFields,
        ].filter(Boolean) as WriterAssetDetailField[]
      }
      case 'locations': {
        const location = raw as Location
        return [
          location.climate ? { label: '气候', value: location.climate } : null,
          location.culture ? { label: '文化', value: location.culture } : null,
          location.geography ? { label: '地理', value: location.geography } : null,
          location.atmosphere ? { label: '氛围', value: location.atmosphere } : null,
          ...sharedFields,
        ].filter(Boolean) as WriterAssetDetailField[]
      }
      case 'concepts': {
        const concept = raw as Concept
        return [
          concept.category ? { label: '分类', value: concept.category } : null,
          concept.alias?.length ? { label: '别名', value: concept.alias.join('、') } : null,
          concept.description ? { label: '描述', value: concept.description } : null,
          ...sharedFields,
        ].filter(Boolean) as WriterAssetDetailField[]
      }
      case 'items':
      case 'organizations': {
        const entity = raw as EntitySummary
        return [
          entity.alias?.length ? { label: '别名', value: entity.alias.join('、') } : null,
          entity.summary ? { label: '摘要', value: entity.summary } : null,
          ...sharedFields,
        ].filter(Boolean) as WriterAssetDetailField[]
      }
      default:
        return [{ label: '类别', value: selectedAsset.value.typeLabel }, ...sharedFields]
    }
  })

  const selectedStateFields = computed(() => {
    if (!selectedAsset.value) return []
    const raw = selectedAsset.value.raw as EntitySummary
    const stateFields = raw.stateFields || {}
    return Object.entries(stateFields).map(([key, value]) => ({
      key,
      label: key,
      value:
        typeof value?.current === 'object'
          ? JSON.stringify(value.current)
          : String(value?.current ?? '未设置'),
    }))
  })

  const selectedDataHint = computed(() => {
    if (!selectedAsset.value) return ''
    if (selectedAsset.value.latestChapterTitle) {
      return `最近章节、提及章节数、涉及卷数与关联节点数来自现有章节资产引用和大纲 documentId 绑定关系，属于当前前端聚合口径。${ASSET_SCOPE_HINT}`
    }
    if (
      selectedAsset.value.category === 'items' ||
      selectedAsset.value.category === 'organizations'
    ) {
      return `当前详情来自统一实体接口；最近出现章节、关联结构节点数等字段待后端进一步补齐。${ASSET_SCOPE_HINT}`
    }
    return `当前详情来自现有角色/地点/概念数据源；若需要更多跨章节资产轨迹，可继续切到关系图谱或 Story Harness。${ASSET_SCOPE_HINT}`
  })

  const buildGraphFocusTarget = (asset: WriterAssetListItem): GraphFocusTarget => ({
    assetType:
      asset.category === 'characters'
        ? 'character'
        : asset.category === 'locations'
          ? 'location'
          : asset.category === 'items'
            ? 'item'
            : asset.category === 'organizations'
              ? 'organization'
              : 'concept',
    assetId: asset.id,
    assetName: asset.name,
    latestChapterId: asset.latestChapterId,
  })

  const selectAsset = (asset: WriterAssetListItem | null) => {
    selectedAsset.value = asset
  }

  const ensureSelectedAsset = (assetId?: string | null) => {
    if (!assetId) return false
    const asset = filteredAssets.value.find((item) => item.id === assetId)
    if (!asset) return false
    selectedAsset.value = asset
    return true
  }

  const loadAssetData = async (projectId: string) => {
    if (!projectId) return

    loading.value = true
    try {
      const [itemData, organizationData, conceptData] = await Promise.all([
        listEntities(projectId, 'item'),
        listEntities(projectId, 'organization'),
        conceptApi.list(projectId),
        writerStore.loadCharacters(projectId),
        writerStore.loadLocations(projectId),
      ])

      items.value = itemData
      organizations.value = organizationData
      concepts.value = unwrapConceptList(conceptData)
    } finally {
      loading.value = false
    }
  }

  const reloadAssetData = async (targetAssetId?: string | null) => {
    const projectId = effectiveProjectId.value
    if (!projectId) return

    const preferredAssetId = targetAssetId || selectedAsset.value?.id || null
    await loadAssetData(projectId)

    if (preferredAssetId) {
      ensureSelectedAsset(preferredAssetId)
    }
  }

  const createAsset = async (payload: WriterAssetMutationInput) => {
    const projectId = effectiveProjectId.value
    if (!projectId) {
      throw new Error('当前项目不存在，无法创建资产')
    }

    let nextId = ''
    if (payload.category === 'characters') {
      const created = await createCharacter(projectId, {
        projectId,
        name: payload.name,
        alias: payload.alias,
        summary: payload.summary,
        traits: payload.traits,
        background: payload.background,
      })
      nextId = extractAssetId(created)
      await writerStore.loadCharacters(projectId)
    } else if (payload.category === 'locations') {
      const created = await locationApi.create(projectId, {
        projectId,
        name: payload.name,
        description: payload.summary,
        climate: payload.climate,
        culture: payload.culture,
        geography: payload.geography,
        atmosphere: payload.atmosphere,
      })
      nextId = extractAssetId(created)
      await writerStore.loadLocations(projectId)
    } else if (payload.category === 'concepts') {
      const created = await conceptApi.create(projectId, {
        projectId,
        name: payload.name,
        alias: payload.alias,
        summary: payload.summary,
        category: payload.conceptCategory,
      })
      nextId = extractAssetId(created)
    } else {
      const created = await createLocalEntity({
        projectId,
        type: payload.category === 'items' ? 'item' : 'organization',
        name: payload.name,
        alias: payload.alias,
        summary: payload.summary,
      })
      nextId = extractAssetId(created)
    }

    await reloadAssetData(nextId)
    return selectedAsset.value
  }

  const updateAsset = async (asset: WriterAssetListItem, payload: WriterAssetMutationInput) => {
    const projectId = effectiveProjectId.value
    if (!projectId) {
      throw new Error('当前项目不存在，无法更新资产')
    }

    if (asset.category === 'characters') {
      await updateCharacter(asset.id, projectId, {
        name: payload.name,
        alias: payload.alias,
        summary: payload.summary,
        traits: payload.traits,
        background: payload.background,
      })
      await writerStore.loadCharacters(projectId)
    } else if (asset.category === 'locations') {
      await locationApi.update(asset.id, projectId, {
        projectId,
        name: payload.name,
        description: payload.summary,
        climate: payload.climate,
        culture: payload.culture,
        geography: payload.geography,
        atmosphere: payload.atmosphere,
      })
      await writerStore.loadLocations(projectId)
    } else if (asset.category === 'concepts') {
      await conceptApi.update(asset.id, projectId, {
        name: payload.name,
        alias: payload.alias,
        summary: payload.summary,
        category: payload.conceptCategory,
      })
    } else {
      await updateLocalEntity({
        entityId: asset.id,
        projectId,
        name: payload.name,
        alias: payload.alias,
        summary: payload.summary,
      })
    }

    await reloadAssetData(asset.id)
    return selectedAsset.value
  }

  const deleteAsset = async (asset: WriterAssetListItem) => {
    const projectId = effectiveProjectId.value
    if (!projectId) {
      throw new Error('当前项目不存在，无法删除资产')
    }

    if (asset.category === 'characters') {
      await deleteCharacter(asset.id, projectId)
      await writerStore.loadCharacters(projectId)
    } else if (asset.category === 'locations') {
      await locationApi.delete(asset.id, projectId)
      await writerStore.loadLocations(projectId)
    } else if (asset.category === 'concepts') {
      await conceptApi.delete(asset.id, projectId)
    } else {
      await deleteLocalEntity(asset.id, projectId)
    }

    const currentAssets = assetCatalog.value[asset.category] || []
    const deletedIndex = currentAssets.findIndex((item) => item.id === asset.id)
    await reloadAssetData()
    const nextAssets = assetCatalog.value[asset.category] || []
    selectedAsset.value =
      nextAssets[deletedIndex] || nextAssets[Math.max(0, deletedIndex - 1)] || null
  }

  watch(
    () => effectiveProjectId.value,
    (projectId) => {
      if (!projectId) return
      void loadAssetData(projectId)
    },
    { immediate: true },
  )

  watch([options.activeCategory, filteredAssets], ([category, assets]) => {
    if (selectedAsset.value?.category !== category) {
      selectedAsset.value = null
      return
    }
    if (!selectedAsset.value) {
      return
    }

    const latestSelectedAsset = assets.find((asset) => asset.id === selectedAsset.value?.id)
    if (!latestSelectedAsset) {
      selectedAsset.value = null
      return
    }

    if (latestSelectedAsset !== selectedAsset.value) {
      selectedAsset.value = latestSelectedAsset
    }
  })

  return {
    loading,
    categoryOptions,
    currentCategoryMeta,
    filteredAssets,
    emptyMessage,
    assetScopeHint: ASSET_SCOPE_HINT,
    selectedAsset,
    selectedDetailFields,
    selectedStateFields,
    selectedDataHint,
    selectAsset,
    ensureSelectedAsset,
    buildGraphFocusTarget,
    reloadAssetData,
    createAsset,
    updateAsset,
    deleteAsset,
  }
}
