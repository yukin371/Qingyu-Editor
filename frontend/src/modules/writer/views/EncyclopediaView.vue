<template>
  <div class="assets-view" :class="{ 'assets-view--embedded': embedded }">
    <header v-if="!embedded" class="assets-view__header">
      <div>
        <p class="assets-view__eyebrow">Writer Workspace</p>
        <h2>资产总览</h2>
      </div>
      <p class="assets-view__header-copy">列表优先查看角色、地点、物件、组织与概念设定。</p>
    </header>

    <section class="assets-view__toolbar">
      <label class="assets-view__search">
        <QyIcon name="Search" :size="16" />
        <input v-model.trim="searchKeyword" type="search" placeholder="搜索资产名称、摘要或分类" />
      </label>
      <div class="assets-view__categories">
        <button
          v-for="category in categoryOptions"
          :key="category.id"
          type="button"
          class="assets-view__category-chip"
          :class="{ 'is-active': activeCategory === category.id }"
          @click="setActiveCategory(category.id)"
        >
          <span>{{ category.label }}</span>
          <strong>{{ category.count }}</strong>
        </button>
      </div>
    </section>

    <section class="assets-view__stats">
      <SystemStatCard
        v-for="category in categoryOptions"
        :key="`${category.id}-stat`"
        :label="category.label"
        :value="category.count"
        :hint="category.hint"
        :tone="category.tone"
      />
    </section>

    <section class="assets-view__content" :class="{ 'has-detail': !!selectedAsset }">
      <div class="assets-view__list">
        <div class="assets-view__section-head">
          <div>
            <p class="assets-view__section-eyebrow">{{ currentCategoryMeta.eyebrow }}</p>
            <h3>{{ currentCategoryMeta.title }}</h3>
          </div>
          <span class="assets-view__section-count">{{ filteredAssets.length }} 项</span>
        </div>
        <p class="assets-view__section-copy">{{ currentCategoryMeta.copy }}</p>
        <p class="assets-view__scope-note">{{ assetScopeHint }}</p>

        <div v-if="loading" class="assets-view__empty">
          <QyIcon name="Loading" :size="18" />
          <span>正在加载资产数据…</span>
        </div>
        <div v-else-if="filteredAssets.length === 0" class="assets-view__empty">
          <QyIcon name="Collection" :size="18" />
          <span>{{ emptyMessage }}</span>
        </div>
        <div v-else class="assets-view__cards">
          <button
            v-for="asset in filteredAssets"
            :key="asset.id"
            type="button"
            class="asset-card"
            :class="{ 'is-selected': selectedAsset?.id === asset.id }"
            @click="selectAsset(asset)"
          >
            <div class="asset-card__header">
              <div>
                <p class="asset-card__eyebrow">{{ asset.typeLabel }}</p>
                <h4>{{ asset.name }}</h4>
              </div>
              <span v-if="asset.badge" class="asset-card__badge">{{ asset.badge }}</span>
            </div>
            <p class="asset-card__summary">{{ asset.summary || '暂无摘要' }}</p>
            <div class="asset-card__meta">
              <span class="asset-card__meta-chip">
                最近章节
                <strong>{{ asset.latestChapterTitle || '待补' }}</strong>
              </span>
              <span class="asset-card__meta-chip">
                关联节点
                <strong>{{ asset.linkedNodeCount }}</strong>
              </span>
            </div>
          </button>
        </div>
      </div>

      <aside v-if="selectedAsset" class="assets-view__detail">
        <div class="assets-view__detail-header">
          <div>
            <p class="assets-view__detail-eyebrow">{{ selectedAsset.typeLabel }}</p>
            <h3>{{ selectedAsset.name }}</h3>
            <p class="assets-view__detail-summary">{{ selectedAsset.summary || '暂无摘要' }}</p>
          </div>
          <div class="assets-view__detail-actions">
            <button type="button" class="assets-view__ghost-btn" @click="handleOpenGraph">
              关系图谱
            </button>
            <button
              v-if="selectedAsset.latestChapterId"
              type="button"
              class="assets-view__ghost-btn"
              @click="emit('jump-to-chapter', selectedAsset.latestChapterId)"
            >
              前往章节
            </button>
            <button type="button" class="assets-view__ghost-btn" @click="selectedAsset = null">
              关闭
            </button>
          </div>
        </div>

        <dl v-if="selectedDetailFields.length" class="assets-view__detail-grid">
          <div
            v-for="field in selectedDetailFields"
            :key="field.label"
            class="assets-view__detail-row"
          >
            <dt>{{ field.label }}</dt>
            <dd>{{ field.value }}</dd>
          </div>
        </dl>

        <section v-if="selectedStateFields.length" class="assets-view__detail-section">
          <h4>状态字段</h4>
          <div class="assets-view__state-list">
            <div
              v-for="field in selectedStateFields"
              :key="field.key"
              class="assets-view__state-item"
            >
              <strong>{{ field.label }}</strong>
              <span>{{ field.value }}</span>
            </div>
          </div>
        </section>

        <section class="assets-view__detail-section">
          <h4>数据口径</h4>
          <p>{{ selectedDataHint }}</p>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import SystemStatCard from '@/modules/writer/components/system-design/SystemStatCard.vue'
import { useWriterStore } from '../stores/writerStore'
import { conceptApi } from '../api/concept'
import { listEntities, type EntitySummary } from '../api/entities'
import { loadWriterAssetRefState } from '../utils/writerAssetRefs'
import type { Character, Location } from '@/types/writer'
import type { Concept } from '../types/entity'
import type { EncyclopediaCategory, GraphFocusTarget } from '@/modules/writer/composables/types'
import type { ToolType } from '@/modules/writer/composables/useToolOverlay'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import type { OutlineNode } from '@/types/writer'

type AssetRecord = Character | Location | Concept | EntitySummary

interface AssetListItem {
  id: string
  name: string
  category: EncyclopediaCategory
  typeLabel: string
  summary: string
  badge?: string
  latestChapterId?: string
  latestChapterTitle?: string
  linkedNodeCount: number
  raw: AssetRecord
}

interface DetailField {
  label: string
  value: string
}

interface Props {
  embedded?: boolean
  projectId?: string
  activeCategory?: EncyclopediaCategory
  chapters?: SidebarChapterSummary[]
}

const props = withDefaults(defineProps<Props>(), {
  embedded: false,
  projectId: '',
  activeCategory: 'characters',
})

const emit = defineEmits<{
  'update:activeCategory': [value: EncyclopediaCategory]
  'switch-tool': [tool: ToolType]
  'focus-graph-asset': [target: GraphFocusTarget]
  'jump-to-chapter': [chapterId: string]
}>()

const writerStore = useWriterStore()
const loading = ref(false)
const searchKeyword = ref('')
const selectedAsset = ref<AssetListItem | null>(null)
const concepts = ref<Concept[]>([])
const items = ref<EntitySummary[]>([])
const organizations = ref<EntitySummary[]>([])
const activeCategory = ref<EncyclopediaCategory>(props.activeCategory)

const effectiveProjectId = computed(() => props.projectId || writerStore.currentProjectId || '')
const characters = computed<Character[]>(() => writerStore.characters.list ?? [])
const locations = computed<Location[]>(() => writerStore.locations.list ?? [])
const assetRefState = computed(() => loadWriterAssetRefState(effectiveProjectId.value))

const flattenOutlineNodes = (nodes: OutlineNode[] | undefined | null): OutlineNode[] => {
  if (!Array.isArray(nodes)) return []
  return nodes.flatMap((node) => [node, ...flattenOutlineNodes(node.children)])
}

const nodesByChapterId = computed(() => {
  const map = new Map<string, Set<string>>()
  for (const node of flattenOutlineNodes(writerStore.outline?.tree as OutlineNode[] | undefined)) {
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
  for (const chapter of props.chapters || []) {
    map.set(chapter.id, chapter.title)
  }
  return map
})

const createRefLookupKey = (assetType: string, assetId: string | undefined, assetName: string) =>
  `${assetType}:${assetId || assetName}`

const assetReferenceMetaByKey = computed(() => {
  const latestChapterByKey = new Map<string, { chapterId: string; updatedAt: string }>()
  const linkedNodeCountByKey = new Map<string, Set<string>>()

  for (const [chapterId, refs] of Object.entries(assetRefState.value.chapterRefs || {})) {
    const linkedNodes = nodesByChapterId.value.get(chapterId) || new Set<string>()
    for (const ref of refs) {
      const key = createRefLookupKey(ref.assetType, ref.assetId, ref.assetName)
      const existing = latestChapterByKey.get(key)
      if (!existing || existing.updatedAt < ref.updatedAt) {
        latestChapterByKey.set(key, { chapterId, updatedAt: ref.updatedAt })
      }
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
    latestChapterByKey,
    linkedNodeCountByKey,
  }
})

const enrichAssetMeta = (assetType: string, assetId: string | undefined, assetName: string) => {
  const key = createRefLookupKey(assetType, assetId, assetName)
  const latestChapter = assetReferenceMetaByKey.value.latestChapterByKey.get(key)
  const linkedNodeCount = assetReferenceMetaByKey.value.linkedNodeCountByKey.get(key)?.size || 0

  return {
    latestChapterId: latestChapter?.chapterId,
    latestChapterTitle: latestChapter?.chapterId
      ? chapterTitleById.value.get(latestChapter.chapterId) || latestChapter.chapterId
      : undefined,
    linkedNodeCount,
  }
}

const unwrapApiData = <T,>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return ((payload as Record<string, unknown>).data as T) ?? ([] as unknown as T)
  }
  return (payload as T) ?? ([] as unknown as T)
}

const normalizeSummary = (value: string | undefined | null) => String(value || '').trim()

const categoryOptions = computed(() => [
  {
    id: 'characters' as const,
    label: '角色',
    count: characters.value.length,
    hint: '角色卡与活跃人物',
    tone: 'info' as const,
  },
  {
    id: 'locations' as const,
    label: '地点',
    count: locations.value.length,
    hint: '场景与世界空间节点',
    tone: 'success' as const,
  },
  {
    id: 'items' as const,
    label: '物件',
    count: items.value.length,
    hint: '道具与关键物品',
    tone: 'warning' as const,
  },
  {
    id: 'organizations' as const,
    label: '组织',
    count: organizations.value.length,
    hint: '势力、公会与组织节点',
    tone: 'warning' as const,
  },
  {
    id: 'concepts' as const,
    label: '概念',
    count: concepts.value.length,
    hint: '概念、设定与规则',
    tone: 'info' as const,
  },
])

const currentCategoryMeta = computed(() => {
  switch (activeCategory.value) {
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

const assetCatalog = computed<Record<EncyclopediaCategory, AssetListItem[]>>(() => ({
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
  const keyword = searchKeyword.value.toLowerCase()
  const assets = assetCatalog.value[activeCategory.value] || []
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
  if (searchKeyword.value) {
    return `未找到与“${searchKeyword.value}”匹配的资产`
  }
  return `${currentCategoryMeta.value.title}暂时为空`
})

const assetScopeHint =
  '当前仅纳入已建档的角色、地点、物件、组织、概念；伏笔与未确认资产候选暂不进入资产总览。'

const selectedDetailFields = computed<DetailField[]>(() => {
  if (!selectedAsset.value) return []

  const raw = selectedAsset.value.raw
  const sharedFields: DetailField[] = [
    selectedAsset.value.latestChapterTitle
      ? { label: '最近章节', value: selectedAsset.value.latestChapterTitle }
      : null,
    { label: '关联结构节点', value: String(selectedAsset.value.linkedNodeCount) },
  ].filter(Boolean) as DetailField[]

  switch (selectedAsset.value.category) {
    case 'characters': {
      const character = raw as Character
      return [
        character.alias?.length ? { label: '别名', value: character.alias.join('、') } : null,
        character.traits?.length ? { label: '特征', value: character.traits.join('、') } : null,
        character.background ? { label: '背景', value: character.background } : null,
        ...sharedFields,
      ].filter(Boolean) as DetailField[]
    }
    case 'locations': {
      const location = raw as Location
      return [
        location.climate ? { label: '气候', value: location.climate } : null,
        location.culture ? { label: '文化', value: location.culture } : null,
        location.geography ? { label: '地理', value: location.geography } : null,
        location.atmosphere ? { label: '氛围', value: location.atmosphere } : null,
        ...sharedFields,
      ].filter(Boolean) as DetailField[]
    }
    case 'concepts': {
      const concept = raw as Concept
      return [
        concept.category ? { label: '分类', value: concept.category } : null,
        concept.alias?.length ? { label: '别名', value: concept.alias.join('、') } : null,
        concept.description ? { label: '描述', value: concept.description } : null,
        ...sharedFields,
      ].filter(Boolean) as DetailField[]
    }
    default:
      return [{ label: '类别', value: selectedAsset.value.typeLabel }, ...sharedFields].filter(
        Boolean,
      ) as DetailField[]
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
    return `最近章节与关联节点数来自现有章节资产引用和大纲 documentId 绑定关系，属于当前前端 Phase 4 的聚合口径。${assetScopeHint}`
  }
  if (
    selectedAsset.value.category === 'items' ||
    selectedAsset.value.category === 'organizations'
  ) {
    return `当前详情来自统一实体接口；最近出现章节、关联结构节点数等字段待后端进一步补齐。${assetScopeHint}`
  }
  return `当前详情来自现有角色/地点/概念数据源；若需要更多跨章节资产轨迹，可继续切到关系图谱或 Story Harness。${assetScopeHint}`
})

const buildGraphFocusTarget = (asset: AssetListItem): GraphFocusTarget => ({
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

const handleOpenGraph = () => {
  if (!selectedAsset.value) return
  emit('focus-graph-asset', buildGraphFocusTarget(selectedAsset.value))
  emit('switch-tool', 'relations')
}

const setActiveCategory = (category: EncyclopediaCategory) => {
  activeCategory.value = category
  emit('update:activeCategory', category)
}

const selectAsset = (asset: AssetListItem) => {
  selectedAsset.value = asset
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
    concepts.value = unwrapApiData<Concept[]>(conceptData)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.activeCategory,
  (value) => {
    activeCategory.value = value
  },
  { immediate: true },
)

watch(
  () => effectiveProjectId.value,
  (projectId) => {
    if (!projectId) return
    void loadAssetData(projectId)
  },
  { immediate: true },
)

watch([activeCategory, filteredAssets], ([category, assets]) => {
  if (selectedAsset.value?.category !== category) {
    selectedAsset.value = null
    return
  }
  if (selectedAsset.value && !assets.some((asset) => asset.id === selectedAsset.value?.id)) {
    selectedAsset.value = null
  }
})
</script>

<style scoped lang="scss">
.assets-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top right, rgba(8, 145, 178, 0.08), transparent 32%),
    linear-gradient(180deg, #f7fafc, #eef4f8 100%);
  color: var(--editor-text-primary, #0f172a);

  &--embedded {
    background:
      radial-gradient(circle at top right, rgba(8, 145, 178, 0.08), transparent 36%),
      linear-gradient(180deg, #fbfdff, #f1f6fb 100%);
  }

  &__header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 24px;
    padding: 20px 24px 8px;
  }

  &__eyebrow,
  &__section-eyebrow,
  &__detail-eyebrow,
  .asset-card__eyebrow {
    margin: 0 0 6px;
    color: #0f766e;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__header h2,
  &__section-head h3,
  &__detail-header h3 {
    margin: 0;
  }

  &__header-copy,
  &__section-copy,
  &__detail-summary {
    margin: 0;
    color: var(--editor-text-secondary, #475569);
    line-height: 1.5;
  }

  &__scope-note {
    margin: 10px 0 0;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: rgba(255, 255, 255, 0.68);
    color: var(--editor-text-secondary, #475569);
    font-size: 13px;
    line-height: 1.6;
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px 24px 12px;
  }

  &__search {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: min(360px, 100%);
    padding: 0 14px;
    height: 42px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(15, 118, 110, 0.12);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);

    input {
      width: 100%;
      border: none;
      background: transparent;
      color: inherit;
      outline: none;
      font: inherit;
    }
  }

  &__categories {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__category-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 42px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(15, 118, 110, 0.12);
    background: rgba(255, 255, 255, 0.9);
    color: var(--editor-text-secondary, #475569);
    cursor: pointer;

    strong {
      color: var(--editor-text-primary, #0f172a);
    }

    &.is-active {
      background: #0f766e;
      color: #f8fafc;

      strong {
        color: inherit;
      }
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
    padding: 0 24px 16px;
  }

  &__content {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
    padding: 0 24px 24px;

    &.has-detail {
      grid-template-columns: minmax(0, 1fr) 360px;
    }
  }

  &__list,
  &__detail {
    min-height: 0;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 12px 40px rgba(15, 23, 42, 0.06);
  }

  &__list {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__section-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 20px 8px;
  }

  &__section-count {
    align-self: start;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(15, 118, 110, 0.1);
    color: #0f766e;
    font-size: 12px;
    font-weight: 700;
  }

  &__section-copy {
    padding: 0 20px 16px;
  }

  &__cards {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: grid;
    gap: 12px;
    padding: 0 20px 20px;
    align-content: start;
  }

  &__empty {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 180px;
    color: var(--editor-text-secondary, #64748b);
    padding: 24px;
  }

  &__detail {
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: auto;
  }

  &__detail-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  }

  &__detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__ghost-btn {
    height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid rgba(15, 118, 110, 0.16);
    background: rgba(240, 253, 250, 0.92);
    color: #0f766e;
    cursor: pointer;
  }

  &__detail-grid {
    display: grid;
    gap: 12px;
    margin: 20px 0 0;
  }

  &__detail-row {
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(248, 250, 252, 0.92);

    dt {
      color: var(--editor-text-secondary, #64748b);
      font-size: 12px;
      margin-bottom: 6px;
    }

    dd {
      margin: 0;
      line-height: 1.6;
    }
  }

  &__detail-section {
    margin-top: 20px;

    h4 {
      margin: 0 0 10px;
    }

    p {
      margin: 0;
      line-height: 1.6;
      color: var(--editor-text-secondary, #475569);
    }
  }

  &__state-list {
    display: grid;
    gap: 10px;
  }

  &__state-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(240, 249, 255, 0.92);
  }
}

.asset-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.96));
  text-align: left;
  cursor: pointer;

  &.is-selected {
    border-color: rgba(15, 118, 110, 0.38);
    box-shadow: 0 10px 30px rgba(15, 118, 110, 0.12);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  &__header h4 {
    margin: 0;
    font-size: 16px;
  }

  &__badge {
    align-self: start;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(14, 165, 233, 0.12);
    color: #0369a1;
    font-size: 12px;
    font-weight: 600;
  }

  &__summary {
    margin: 0;
    color: var(--editor-text-secondary, #475569);
    line-height: 1.5;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: rgba(240, 249, 255, 0.92);
    color: #475569;
    font-size: 12px;

    strong {
      color: #0f172a;
      font-weight: 600;
    }
  }
}

@media (max-width: 1200px) {
  .assets-view {
    &__stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__content.has-detail {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .assets-view {
    &__header,
    &__toolbar,
    &__stats,
    &__content {
      padding-left: 16px;
      padding-right: 16px;
    }

    &__stats {
      grid-template-columns: 1fr;
    }
  }
}
</style>
