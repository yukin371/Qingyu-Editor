<template>
  <div class="character-graph-view">
    <!-- 主内容区 -->
    <div class="graph-content">
      <!-- 图谱区域 -->
      <div class="graph-canvas" ref="graphCanvasRef">
        <div v-if="writerStore.characters.loading" class="graph-loading-overlay">
          <QyIcon name="Loading" class="animate-spin" :size="18" />
          <span>图谱加载中...</span>
        </div>
        <CharacterGraphAssetBindingStrip
          v-if="!isGlobalGraph"
          :current-scope-type="currentScopeType === 'volume' ? 'volume' : 'chapter'"
          :show-bound-assets-panel="showBoundAssetsPanel"
          :show-candidate-panel="showCandidatePanel"
          :scope-bindable-characters-count="scopeBindableCharacters.length"
          :bound-scope-asset-refs="boundScopeAssetRefs"
          :scope-asset-candidates="scopeAssetCandidates"
          :bindable-scope-asset-candidates="bindableScopeAssetCandidates"
          :unresolved-scope-asset-candidates="unresolvedScopeAssetCandidates"
          :binding-all-candidates="bindingAllCandidates"
          :chapter-candidate-hint="chapterCandidateHint"
          :format-asset-type="formatAssetType"
          :format-asset-source="formatAssetSource"
          @toggle-bound-panel="showBoundAssetsPanel = !showBoundAssetsPanel"
          @toggle-candidate-panel="showCandidatePanel = !showCandidatePanel"
          @bind-existing-characters="handleBindExistingCharactersToScope"
          @bind-all-candidates="handleBindAllAssetCandidates"
          @remove-bound-asset="handleRemoveBoundAsset"
          @create-and-bind-candidate="handleCreateAndBindCandidate"
          @bind-candidate="handleBindAssetCandidate"
        />

        <!-- 角色关系图谱画布 -->
        <div class="graph-visualization">
          <CharacterGraphToolbar
            :view-mode="viewMode"
            :entity-scope-tab="entityScopeTab"
            :show-entity-scope-tabs="Boolean(currentChapterId)"
            :show-legend="!isGlobalGraph"
            @update:view-mode="viewMode = $event"
            @update:entity-scope-tab="entityScopeTab = $event"
          />

          <!-- 图谱视图 -->
          <div v-if="viewMode === 'graph'" class="graph-view-content">
            <!-- 全局图谱 -->
            <CharacterGraphStagePanel
              v-if="!currentChapterId"
              title="全局关系图谱"
              :tag-text="globalGraphTitleTag"
              :tag-type="isGlobalGraphCreatedEmpty ? 'warning' : 'info'"
              tone="global"
              :banner-text="graphFocusBannerText"
              :banner-missing="graphFocusFeedback?.missing"
            >
              <CharacterGraphActionStateCard
                v-if="isGlobalGraphCreatedEmpty"
                mode="empty"
                icon-name="Connection"
                :icon-size="28"
                title="全局图谱暂时为空"
                description="图谱会自动接入已建档角色和正文检出的角色引用。也可以先新建角色，再用 Shift 拖拽连线补关系。"
                test-id="global-empty-graph-state"
                :actions="globalEmptyStateActions"
                @action="handleGlobalEmptyStateAction"
              />
              <RelationshipGraph
                v-else
                :nodes="graphNodes"
                :links="graphLinks"
                :focused-node-id="focusedGraphNodeId"
                @create-link="handleGraphCreateLink"
                @node-click="handleNodeClick"
                @delete-node="handleDeleteNode"
                @add-node="handleAddNodeAt"
              />
            </CharacterGraphStagePanel>

            <!-- 卷/章节图谱 -->
            <CharacterGraphStagePanel
              v-else-if="currentChapterId"
              :title="currentScopeGraphTitle"
              :tag-text="currentChapterGraphTag"
              :tag-type="currentChapterGraphTagType"
              header-test-id="chapter-graph-header"
              :banner-text="graphFocusBannerText"
              :banner-missing="graphFocusFeedback?.missing"
            >
              <CharacterGraphActionStateCard
                v-if="isCurrentChapterGraphEmpty"
                mode="empty"
                icon-name="Document"
                :icon-size="28"
                :title="currentScopeType === 'volume' ? '卷级空图谱已创建' : '章节空图谱已创建'"
                :description="currentScopeEmptyDescription"
                test-id="chapter-empty-graph-state"
                :actions="currentScopeEmptyStateActions"
                @action="handleCurrentScopeEmptyStateAction"
              />
              <RelationshipGraph
                v-else
                :nodes="graphNodes"
                :links="graphLinks"
                :focused-node-id="focusedGraphNodeId"
                @create-link="handleGraphCreateLink"
                @node-click="handleNodeClick"
                @delete-node="handleDeleteNode"
                @add-node="handleAddNodeAt"
              />
            </CharacterGraphStagePanel>
          </div>

          <!-- 故事线视图 -->
          <CharacterStoryLine
            v-if="viewMode === 'storyline'"
            :outline-tree="writerStore.outline.tree"
            :characters="writerStore.characters.list"
            :relations="writerStore.characters.relations"
            :scope-type="currentScopeType"
            :scope-id="currentChapterId ?? ''"
            :loading="writerStore.characters.loading"
            @chapter-click="handleOutlineNodeClick"
          />
        </div>
      </div>

      <!-- 详情侧边栏 -->
      <transition name="slide-left">
        <CharacterGraphDetailSidebar
          v-if="selectedCharacter"
          :character="selectedCharacter"
          :relations="selectedCharacterRelationItems"
          @close="selectedCharacter = null"
          @send-to-ai="sendSelectedCharacterToAI"
          @edit="handleEditCharacter(selectedCharacter)"
          @manage-relations="handleManageRelations(selectedCharacter)"
        />
      </transition>
    </div>

    <!-- 角色编辑卡片 -->
    <transition name="fade-slide">
      <div v-if="dialogVisible" class="character-edit-card-container">
        <CharacterGraphCharacterFormCard
          :is-edit="isEdit"
          :submitting="submitting"
          :character-form="characterForm"
          :character-form-errors="characterFormErrors"
          :show-alias-input="showAliasInput"
          :show-trait-input="showTraitInput"
          :new-alias="newAlias"
          :new-trait="newTrait"
          @close="dialogVisible = false"
          @submit="handleSubmit"
          @confirm-alias-input="handleAliasInputConfirm"
          @confirm-trait-input="handleTraitInputConfirm"
          @update:show-alias-input="showAliasInput = $event"
          @update:show-trait-input="showTraitInput = $event"
          @update:new-alias="newAlias = $event"
          @update:new-trait="newTrait = $event"
        />
      </div>
    </transition>

    <!-- 关系管理对话框 -->
    <transition name="fade-slide">
      <CharacterGraphRelationDialog
        v-if="relationDialogVisible"
        :selected-character="selectedCharacter"
        :relations="selectedCharacterRelationItems"
        :relation-form="relationForm"
        :relation-form-errors="relationFormErrors"
        :relation-target-options="relationTargetOptions"
        :relation-type-options="relationTypeOptions"
        :relation-submitting="relationSubmitting"
        @close="relationDialogVisible = false"
        @submit="handleCreateRelation"
        @delete-relation="handleDeleteRelationFromDialog"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useProjectStore } from '../stores/projectStore'
import { useWriterStore } from '../stores/writerStore'
import { useEditorStore } from '../stores/editorStore'
import type { Character, CharacterRelation, RelationType } from '@/types/writer'
import type { Concept } from '../types/entity'
import {
  buildWriterWorkflowContextPrompt,
  type WriterWorkflowActionRequest,
  type WriterWorkflowContext,
} from '@/modules/writer/types/workflow'
import {
  formatActiveEntitiesPrompt,
  type ActiveEntitySummary,
} from '@/modules/writer/composables/useWorkflowContext'
import type {
  ChapterGraph,
  ChapterRelation,
  CreateCharacterRequest,
  VolumeGraph,
  VolumeRelation,
} from '../types/character'
import { RELATION_TYPE_OPTIONS } from '../types/character'
import type {
  GraphFocusAssetType,
  GraphFocusTarget,
  SidebarChapterSummary,
} from '@/modules/writer/composables/types'
import {
  QyIcon,
} from '@/design-system/components'
import { extractPlainTextFromEditorContent } from '@/modules/writer/utils/editorContent'
import CharacterGraphActionStateCard from './character-graph/CharacterGraphActionStateCard.vue'
import CharacterGraphAssetBindingStrip from './character-graph/CharacterGraphAssetBindingStrip.vue'
import CharacterGraphCharacterFormCard from './character-graph/CharacterGraphCharacterFormCard.vue'
import CharacterGraphDetailSidebar from './character-graph/CharacterGraphDetailSidebar.vue'
import CharacterGraphRelationDialog from './character-graph/CharacterGraphRelationDialog.vue'
import CharacterGraphStagePanel from './character-graph/CharacterGraphStagePanel.vue'
import CharacterGraphToolbar from './character-graph/CharacterGraphToolbar.vue'
import RelationshipGraph, {
  type GraphNode,
  type GraphLink,
} from '../components/RelationshipGraph.vue'
import CharacterStoryLine from '../components/editor/CharacterStoryLine.vue'
import {
  appendChapterRelationDraft,
  appendVolumeRelationDraft,
  buildCharacterGraphAutoScopeIds,
  createChapterGraphDraft,
  createVolumeGraphDraft,
  deleteChapterRelationDraft,
  deleteChapterRelationsByNode,
  deleteVolumeRelationDraft,
  deleteVolumeRelationsByNode,
  loadCharacterGraphDraftState,
  setGlobalGraphInitialized,
  type CharacterGraphDraftState,
} from '../utils/characterGraphDrafts'
import {
  createWriterAssetRefKey,
  extractWriterAssetCandidates,
  loadWriterAssetRefState,
  mergeWriterAssetRefs,
  removeScopeAssetRef,
  upsertScopeAssetRef,
  type WriterAssetCandidate,
  type WriterAssetRef,
  type WriterAssetRefState,
} from '../utils/writerAssetRefs'
import { extractEntitiesFromTipTapContent } from '../utils/entityParser'
import { createCharacter, updateCharacter } from '../api/character'
import { locationApi } from '../api/location'
import { conceptApi } from '../api/concept'
import { createLocalEntity, listEntities, type EntitySummary } from '../api/entities'
import { message, messageBox } from '@/design-system/services'
const writerStore = useWriterStore()
const projectStore = useProjectStore()
const editorStore = useEditorStore()
type VisibleRelation = (CharacterRelation | ChapterRelation | VolumeRelation) & {
  isInherited?: boolean
}
type GraphScopeType = 'global' | 'volume' | 'chapter'
type RelationSeed = {
  id: string
  fromId: string
  toId: string
  type: RelationType | string
  strength: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// Props
interface Props {
  chapterId?: string
  chapters?: SidebarChapterSummary[]
  workflowContext?: WriterWorkflowContext
  activeEntities?: ActiveEntitySummary[]
  focusedAsset?: GraphFocusTarget | null
}

const props = withDefaults(defineProps<Props>(), {
  chapterId: '',
  chapters: () => [],
  workflowContext: undefined,
  activeEntities: () => [],
  focusedAsset: null,
})
const emit = defineEmits<{
  (e: 'status-change', chips: string[]): void
  (e: 'trigger-ai-action', payload: WriterWorkflowActionRequest): void
  (e: 'graph-focus-consumed'): void
}>()

const selectedCharacter = ref<Character | null>(null)
const selectedGraphNodeId = ref<string | null>(null)
const focusedGraphNodeId = ref<string | null>(null)
const graphFocusFeedback = ref<{ typeLabel: string; name: string; missing: boolean } | null>(null)
const concepts = ref<Concept[]>([])
const items = ref<EntitySummary[]>([])
const organizations = ref<EntitySummary[]>([])
const dialogVisible = ref(false)
const viewMode = ref<'graph' | 'storyline'>('graph')
const entityScopeTab = ref<'all' | 'volume' | 'chapter'>('all') // 实体作用域 tab：全部 / 卷级 / 章节级
const isEdit = ref(false)
const submitting = ref(false)
const showAliasInput = ref(false)
const showTraitInput = ref(false)
const newAlias = ref('')
const newTrait = ref('')
const characterFormErrors = ref({
  name: '',
})

const mapToScopedRelations = <TRelation extends ChapterRelation | VolumeRelation>(
  relations: CharacterRelation[] | undefined,
  graphId: string,
): TRelation[] | undefined => {
  if (!relations?.length) return undefined
  return relations.map((relation) => {
    const rawRelation = relation as CharacterRelation & {
      description?: string
      notes?: string
      createdAt?: string
      updatedAt?: string
    }
    const timestamp = new Date().toISOString()
    const seeded: RelationSeed = {
      id: relation.id,
      fromId: relation.fromId,
      toId: relation.toId,
      type: relation.type,
      strength: relation.strength,
      notes: rawRelation.notes || rawRelation.description,
      createdAt: rawRelation.createdAt || timestamp,
      updatedAt: rawRelation.updatedAt || timestamp,
    }
    return {
      ...seeded,
      graphId,
    } as TRelation
  }) as TRelation[]
}

// 关系管理对话框状态
const relationDialogVisible = ref(false)
const relationSubmitting = ref(false)
const relationForm = ref({
  fromId: '',
  toId: '',
  type: '' as RelationType,
  strength: 50,
  notes: '',
})
const relationFormErrors = ref({
  toId: '',
  type: '',
  strength: '',
})

const characterForm = ref({
  name: '',
  alias: [] as string[],
  summary: '',
  traits: [] as string[],
  background: '',
  personalityPrompt: '',
  speechPattern: '',
  currentState: '',
})

const graphDraftState = ref<CharacterGraphDraftState>({
  globalGraphInitialized: false,
  chapterGraphs: [],
  chapterRelations: {},
  volumeGraphs: [],
  volumeRelations: {},
})
const assetRefState = ref<WriterAssetRefState>({
  chapterRefs: {},
  volumeRefs: {},
})
const bindingAllCandidates = ref(false)
const showBoundAssetsPanel = ref(false)
const showCandidatePanel = ref(false)

// 已自动绑定过的章节ID集合，防止重复自动绑定
const autoBoundChapterIds = ref(new Set<string>())

const activeProjectId = computed(() => projectStore.currentProjectId || '')

function reloadGraphDraftState() {
  graphDraftState.value = loadCharacterGraphDraftState(activeProjectId.value)
}

function reloadAssetRefState() {
  assetRefState.value = loadWriterAssetRefState(activeProjectId.value)
}

// 当前选中的图谱ID
const currentGraphId = ref<string | null>(null)
const currentChapterId = ref<string | null>(null)
const currentScopeType = computed<GraphScopeType>(() => {
  if (!currentChapterId.value) return 'global'
  const matched = props.chapters.find((item) => item.id === currentChapterId.value)
  return matched?.nodeType === 'directory' ? 'volume' : 'chapter'
})
const currentScopeTitle = computed(() => {
  if (!currentChapterId.value) return '全局关系图谱'
  return (
    props.chapters.find((item) => item.id === currentChapterId.value)?.title ||
    currentChapterId.value
  )
})
const currentScopeSummary = computed(() => {
  if (!currentChapterId.value) return null
  return props.chapters.find((item) => item.id === currentChapterId.value) || null
})
const currentScopeVolumeId = computed(() => {
  if (!currentChapterId.value) return ''
  if (currentScopeType.value === 'volume') return currentChapterId.value
  return currentScopeSummary.value?.parentId || ''
})
const currentVolumeChapterIds = computed(() => {
  const volumeId = currentScopeVolumeId.value
  if (!volumeId) return []
  return props.chapters
    .filter((item) => item.nodeType !== 'directory' && item.parentId === volumeId)
    .map((item) => item.id)
})
const currentEditorPlainText = computed(() =>
  extractPlainTextFromEditorContent(editorStore.editorContent || editorStore.content || ''),
)
const editorEntityReferences = computed(() => {
  const rawContent = editorStore.editorContent || editorStore.content || ''
  try {
    return extractEntitiesFromTipTapContent(JSON.parse(rawContent))
  } catch {
    return []
  }
})
const unwrapApiData = <T,>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return ((payload as Record<string, unknown>).data as T) ?? ([] as unknown as T)
  }
  return (payload as T) ?? ([] as unknown as T)
}

// 监听外部 chapterId 变化，同步内部状态
watch(
  () => props.chapterId,
  (newChapterId) => {
    if (newChapterId) {
      currentChapterId.value = newChapterId
      currentGraphId.value = hasScopeGraph(newChapterId, currentScopeType.value)
        ? newChapterId
        : null
    } else {
      currentChapterId.value = null
      currentGraphId.value = null
    }
  },
  { immediate: true },
)

// 判断是否为全局图谱模式（没有选中章节时为全局图谱）
const isGlobalGraph = computed(() => {
  return !currentChapterId.value
})

const globalRelations = computed<CharacterRelation[]>(() => writerStore.characters.relations || [])
const currentVolumeGraph = computed<VolumeGraph | null>(() => {
  if (currentScopeType.value !== 'volume' || !currentChapterId.value) return null
  return (
    graphDraftState.value.volumeGraphs.find((graph) => graph.volumeId === currentChapterId.value) ||
    null
  )
})
const currentChapterGraph = computed<ChapterGraph | null>(() => {
  if (currentScopeType.value !== 'chapter' || !currentChapterId.value) return null
  return (
    graphDraftState.value.chapterGraphs.find(
      (graph) => graph.chapterId === currentChapterId.value,
    ) || null
  )
})
const currentScopeGraph = computed<ChapterGraph | VolumeGraph | null>(() => {
  if (currentScopeType.value === 'volume') return currentVolumeGraph.value
  if (currentScopeType.value === 'chapter') return currentChapterGraph.value
  return null
})
const volumeDraftRelations = computed<VolumeRelation[]>(() => {
  if (currentScopeType.value !== 'volume' || !currentChapterId.value) return []
  return graphDraftState.value.volumeRelations[currentChapterId.value] || []
})
const chapterDraftRelations = computed<ChapterRelation[]>(() => {
  if (currentScopeType.value !== 'chapter' || !currentChapterId.value) return []
  return graphDraftState.value.chapterRelations[currentChapterId.value] || []
})

const chapterBoundAssetRefs = computed<WriterAssetRef[]>(() => {
  if (!currentChapterId.value || currentScopeType.value !== 'chapter') return []
  return assetRefState.value.chapterRefs[currentChapterId.value] || []
})
const volumeBoundAssetRefs = computed<WriterAssetRef[]>(() => {
  const volumeId = currentScopeVolumeId.value
  if (!volumeId) return []
  return assetRefState.value.volumeRefs[volumeId] || []
})
const inheritedVolumeAssetRefs = computed<WriterAssetRef[]>(() => {
  if (currentScopeType.value !== 'chapter') return []
  return volumeBoundAssetRefs.value
})
const localScopeBoundCharacterIds = computed(
  () =>
    new Set(
      (currentScopeType.value === 'volume'
        ? volumeBoundAssetRefs.value
        : chapterBoundAssetRefs.value
      )
        .filter((asset) => asset.assetType === 'character' && asset.assetId)
        .map((asset) => asset.assetId as string),
    ),
)
const boundScopeAssetRefs = computed<WriterAssetRef[]>(() => {
  if (currentScopeType.value === 'volume') {
    return volumeBoundAssetRefs.value
  }

  return mergeWriterAssetRefs({
    chapterRefs: chapterBoundAssetRefs.value,
    volumeRefs: inheritedVolumeAssetRefs.value,
  })
})
const chapterDetectedAssetCandidates = computed<WriterAssetCandidate[]>(() => {
  if (currentScopeType.value !== 'chapter') return []
  if (!currentChapterId.value || editorStore.currentChapterId !== currentChapterId.value) return []
  return extractWriterAssetCandidates({
    text: currentEditorPlainText.value,
    characters: writerStore.characters.list || [],
    locations: writerStore.locations.list || [],
    items: items.value.map((item) => ({
      id: item.id,
      name: item.name,
      alias: item.alias,
    })),
    organizations: organizations.value.map((organization) => ({
      id: organization.id,
      name: organization.name,
      alias: organization.alias,
    })),
    concepts: concepts.value.map((concept) => ({
      id: concept.id,
      name: concept.name,
      alias: concept.alias,
    })),
    entityReferences: editorEntityReferences.value,
  }).filter((candidate) => {
    return !boundScopeAssetRefs.value.some(
      (asset) =>
        asset.assetType === candidate.assetType &&
        (asset.assetId || asset.assetName) === (candidate.assetId || candidate.assetName),
    )
  })
})
const volumeRollupAssetCandidates = computed<WriterAssetCandidate[]>(() => {
  if (currentScopeType.value !== 'volume') return []

  const boundKeys = new Set(
    volumeBoundAssetRefs.value.map((item) =>
      createWriterAssetRefKey(item.assetType, item.assetId, item.assetName),
    ),
  )
  const summary = new Map<string, WriterAssetCandidate>()

  for (const chapterId of currentVolumeChapterIds.value) {
    for (const asset of assetRefState.value.chapterRefs[chapterId] || []) {
      const key = createWriterAssetRefKey(asset.assetType, asset.assetId, asset.assetName)
      if (boundKeys.has(key) || summary.has(key)) continue
      summary.set(key, {
        key,
        assetType: asset.assetType,
        assetId: asset.assetId,
        assetName: asset.assetName,
        source: 'chapter_rollup',
        evidence: asset.evidence,
        unresolved: asset.unresolved,
      })
    }
  }

  return Array.from(summary.values()).sort((a, b) =>
    a.assetName.localeCompare(b.assetName, 'zh-CN'),
  )
})
const scopeAssetCandidates = computed<WriterAssetCandidate[]>(() => {
  return currentScopeType.value === 'volume'
    ? volumeRollupAssetCandidates.value
    : chapterDetectedAssetCandidates.value
})
const bindableScopeAssetCandidates = computed<WriterAssetCandidate[]>(() =>
  scopeAssetCandidates.value.filter((candidate) => !candidate.unresolved),
)
const unresolvedScopeAssetCandidates = computed<WriterAssetCandidate[]>(() =>
  scopeAssetCandidates.value.filter((candidate) => candidate.unresolved),
)
const scopeBindableCharacters = computed(() => {
  if (!currentChapterId.value) return []
  return characters.value.filter(
    (character) => !localScopeBoundCharacterIds.value.has(character.id),
  )
})
const chapterCandidateHint = computed(() => {
  if (!currentChapterId.value) return '当前没有可识别的候选资产。'
  if (editorStore.currentChapterId !== currentChapterId.value) {
    return '切回该章节正文后，会基于当前内容自动识别候选角色、地点、物件与已标记概念。'
  }
  return '当前正文里还没有识别到可绑定资产，可继续输入 @角色 / #地点 / %物品，或插入已标记概念。'
})

const currentChapterGraphTag = computed(() => {
  if (!currentScopeGraph.value && hasCurrentScopeAutoCharacters.value) return '自动检出'
  if (!currentScopeGraph.value) return '自动图谱'
  const draftRelations =
    currentScopeType.value === 'volume' ? volumeDraftRelations.value : chapterDraftRelations.value
  if (draftRelations.length > 0)
    return currentScopeType.value === 'volume' ? '卷已扩展' : '章节已扩展'
  if (currentScopeGraph.value.parentGraphId === 'global') return '全局同步'
  return '自动图谱'
})

const currentChapterGraphTagType = computed<'info' | 'success' | 'warning'>(() => {
  if (!currentScopeGraph.value && hasCurrentScopeAutoCharacters.value) return 'info'
  if (!currentScopeGraph.value) return 'warning'
  const draftRelations =
    currentScopeType.value === 'volume' ? volumeDraftRelations.value : chapterDraftRelations.value
  if (draftRelations.length > 0) return 'success'
  if (currentScopeGraph.value.parentGraphId === 'global') return 'info'
  return 'warning'
})

const globalEmptyStateActions = computed(() => [
  { id: 'import', label: '从角色卡引入', variant: 'primary' as const },
  { id: 'create-character', label: '新建角色', variant: 'secondary' as const },
])

const currentScopeEmptyDescription = computed(() => {
  if (currentScopeGraph.value?.parentGraphId === 'global') {
    return `当前${currentScopeType.value === 'volume' ? '卷' : '章节'}图谱会自动同步全局关系，并叠加本作用域正文检出的角色。`
  }
  return `当前${currentScopeType.value === 'volume' ? '卷' : '章节'}还没有可展示的角色或关系。正文出现 @角色 后会自动进入图谱，也可以先从角色卡引入。`
})

const currentScopeEmptyStateActions = computed(() => {
  const actions: Array<{
    id: string
    label: string
    variant: 'primary' | 'secondary'
    disabled?: boolean
  }> = []

  actions.push({ id: 'import', label: '从角色卡引入', variant: 'primary' })
  actions.push({
    id: 'bind-existing',
    label: '绑定角色卡',
    variant: 'secondary',
    disabled: scopeBindableCharacters.value.length === 0,
  })

  return actions
})

const globalGraphTitleTag = computed(() =>
  isGlobalGraphCreatedEmpty.value ? '空图谱' : `${characters.value.length} 个角色`,
)

const currentScopeGraphTitle = computed(() =>
  currentScopeType.value === 'volume'
    ? `${currentScopeTitle.value} · 卷图谱`
    : currentChapterId.value
      ? getChapterInfo(currentChapterId.value)?.chapter
      : '',
)

const graphFocusBannerText = computed(() => {
  if (!graphFocusFeedback.value) return ''
  const prefix = currentChapterId.value ? '当前图谱' : '当前全局图谱'
  return graphFocusFeedback.value.missing
    ? `${prefix}尚未接入${graphFocusFeedback.value.typeLabel}：${graphFocusFeedback.value.name}`
    : `已定位${graphFocusFeedback.value.typeLabel}：${graphFocusFeedback.value.name}`
})

const getChapterInfo = (chapterId: string) => {
  return {
    volume: '',
    chapter: currentChapterGraph.value?.chapterTitle || chapterId || '未选择章节',
  }
}

function hasChapterGraph(chapterId: string) {
  return graphDraftState.value.chapterGraphs.some((graph) => graph.chapterId === chapterId)
}

function hasVolumeGraph(volumeId: string) {
  return graphDraftState.value.volumeGraphs.some((graph) => graph.volumeId === volumeId)
}

function hasScopeGraph(scopeId: string, scopeType: GraphScopeType) {
  if (scopeType === 'volume') return hasVolumeGraph(scopeId)
  if (scopeType === 'chapter') return hasChapterGraph(scopeId)
  return graphDraftState.value.globalGraphInitialized
}

const handleGlobalEmptyStateAction = (actionId: string) => {
  if (actionId === 'import') {
    void handleImportFromCharacters()
    return
  }
  if (actionId === 'create-character') {
    openCreateCharacterDialog()
  }
}

const handleCurrentScopeEmptyStateAction = (actionId: string) => {
  if (actionId === 'import') {
    void handleImportFromCharacters()
    return
  }
  if (actionId === 'bind-existing') {
    handleBindExistingCharactersToScope()
  }
}

const handleImportFromCharacters = async () => {
  const projectId = activeProjectId.value
  if (!projectId) {
    message.warning('请先选择项目')
    return
  }

  try {
    await writerStore.loadCharacters(projectId)
    await writerStore.loadCharacterRelations(projectId)
    const charList = writerStore.characters.list || []

    if (charList.length === 0) {
      message.warning('当前项目没有角色卡，请先创建角色')
      return
    }

    graphDraftState.value = setGlobalGraphInitialized(projectId, true)

    if (
      currentChapterId.value &&
      currentScopeType.value === 'chapter' &&
      !hasChapterGraph(currentChapterId.value)
    ) {
      graphDraftState.value = createChapterGraphDraft({
        projectId,
        chapterId: currentChapterId.value,
        chapterTitle: getChapterInfo(currentChapterId.value)?.chapter || currentChapterId.value,
        parentGraphId: globalRelations.value.length > 0 ? 'global' : undefined,
        globalRelations: mapToScopedRelations<ChapterRelation>(
          globalRelations.value,
          currentChapterId.value,
        ) as ChapterRelation[] | undefined,
      })
    }

    if (
      currentChapterId.value &&
      currentScopeType.value === 'volume' &&
      !hasVolumeGraph(currentChapterId.value)
    ) {
      graphDraftState.value = createVolumeGraphDraft({
        projectId,
        volumeId: currentChapterId.value,
        volumeTitle: currentScopeTitle.value,
        parentGraphId: globalRelations.value.length > 0 ? 'global' : undefined,
        globalRelations: mapToScopedRelations<VolumeRelation>(
          globalRelations.value,
          currentChapterId.value,
        ) as VolumeRelation[] | undefined,
      })
    }

    const importedCount = globalRelations.value.length
    message.success(
      importedCount > 0
        ? `已载入 ${charList.length} 个角色与 ${importedCount} 条现有关系`
        : `已载入 ${charList.length} 个角色节点，可继续在图谱中创建关系`,
    )
  } catch (error) {
    message.error('引入失败：' + (error as Error).message)
  }
}

const characters = computed(() => {
  return writerStore.characters.list || []
})

const autoCharacterScopeIds = computed(() =>
  buildCharacterGraphAutoScopeIds({
    assetRefState: assetRefState.value,
    chapterId: currentScopeType.value === 'chapter' ? currentChapterId.value || undefined : undefined,
    volumeId: currentScopeVolumeId.value || undefined,
    volumeChapterIds: currentVolumeChapterIds.value,
    globalRelations: globalRelations.value,
  }),
)
const hasCurrentScopeAutoCharacters = computed(() => {
  if (!currentChapterId.value) return false
  return currentScopeType.value === 'volume'
    ? autoCharacterScopeIds.value.volumeIds.size > 0
    : autoCharacterScopeIds.value.chapterIds.size > 0
})
const relations = computed<VisibleRelation[]>(() => {
  if (isGlobalGraph.value) {
    return globalRelations.value
  }

  if (!currentChapterId.value || !currentScopeGraph.value) {
    return []
  }

  const localRelations =
    currentScopeType.value === 'volume' ? volumeDraftRelations.value : chapterDraftRelations.value
  const inherited = currentScopeGraph.value?.parentGraphId
    ? globalRelations.value.map((relation) => ({ ...relation, isInherited: true }))
    : []
  const local = localRelations.map((relation) => ({ ...relation, isInherited: false }))

  return [...inherited, ...local]
})

const isGlobalGraphCreatedEmpty = computed(
  () =>
    !currentChapterId.value &&
    graphDraftState.value.globalGraphInitialized &&
    graphNodes.value.length === 0 &&
    graphLinks.value.length === 0,
)

const isCurrentChapterGraphEmpty = computed(
  () =>
    Boolean(currentChapterId.value) && graphNodes.value.length === 0 && graphLinks.value.length === 0,
)

const strongRelationsCount = computed(
  () => (relations.value || []).filter((relation) => relation.strength >= 70).length,
)
const graphStatusChips = computed(() => {
  const chips = [
    `角色 ${characters.value?.length || 0}`,
    `关系 ${relations.value?.length || 0}`,
    `强关系 ${strongRelationsCount.value}`,
  ]
  if (!isGlobalGraph.value) {
    chips.push(`绑定 ${boundScopeAssetRefs.value.length}`)
    chips.push(`候选 ${scopeAssetCandidates.value.length}`)
  }
  return chips
})

// 当前卷内各章节已@引用（已绑定）的角色 ID 集合
const volumeAppearedCharacterIds = computed<Set<string>>(() => {
  return autoCharacterScopeIds.value.volumeIds
})

// 当前章节已@引用（已绑定）的角色 ID 集合
const chapterAppearedCharacterIds = computed<Set<string>>(() => {
  return autoCharacterScopeIds.value.chapterIds
})

// 当前作用域下已登场的角色 ID 集合（根据 entityScopeTab 切换）
const currentScopeAppearedIds = computed<Set<string>>(() => {
  if (entityScopeTab.value === 'chapter') {
    return chapterAppearedCharacterIds.value
  }
  if (entityScopeTab.value === 'volume') {
    return volumeAppearedCharacterIds.value
  }
  // 'all': 合并卷级和章节级
  return new Set([...volumeAppearedCharacterIds.value, ...chapterAppearedCharacterIds.value])
})

const formatGraphNodeTypeLabel = (type: GraphNode['entityType'] | GraphFocusAssetType) => {
  if (type === 'location') return '地点'
  if (type === 'item') return '物件'
  if (type === 'organization') return '组织'
  if (type === 'concept') return '概念'
  return '角色'
}

const buildGraphAssetNodeId = (
  assetType: 'character' | 'location' | 'item' | 'organization' | 'concept',
  assetId: string | undefined,
  assetName: string,
) => (assetType === 'character' ? assetId || assetName : `${assetType}:${assetId || assetName}`)

const buildGraphAssetNode = (params: {
  assetType: 'character' | 'location' | 'item' | 'organization' | 'concept'
  assetId?: string
  assetName: string
  importance?: number
  isInherited?: boolean
  isAppeared?: boolean
}): GraphNode => ({
  id: buildGraphAssetNodeId(params.assetType, params.assetId, params.assetName),
  name: params.assetName,
  entityType: params.assetType,
  importance: params.importance ?? (params.assetType === 'character' ? 3 : 2),
  isInherited: params.isInherited,
  isAppeared: params.isAppeared,
})

const applyGraphFocusTarget = async (target: GraphFocusTarget) => {
  const projectId = activeProjectId.value
  if (projectId && !graphDraftState.value.globalGraphInitialized) {
    graphDraftState.value = setGlobalGraphInitialized(projectId, true)
  }
  currentChapterId.value = null
  await nextTick()

  const targetNodeId = buildGraphAssetNodeId(target.assetType, target.assetId, target.assetName)
  let matchedNode = graphNodes.value.find((node) => node.id === targetNodeId) || null
  if (!matchedNode && projectId) {
    await handleRefresh()
    await nextTick()
    matchedNode = graphNodes.value.find((node) => node.id === targetNodeId) || null
  }

  focusedGraphNodeId.value = matchedNode ? targetNodeId : null
  selectedGraphNodeId.value = matchedNode ? targetNodeId : null

  if (matchedNode?.entityType === 'character') {
    selectedCharacter.value =
      characters.value.find((character) => character.id === matchedNode.id) || null
    graphFocusFeedback.value = {
      typeLabel: formatGraphNodeTypeLabel(matchedNode.entityType),
      name: matchedNode.name,
      missing: false,
    }
    return
  }

  selectedCharacter.value = null
  graphFocusFeedback.value = {
    typeLabel: formatGraphNodeTypeLabel(target.assetType),
    name: target.assetName,
    missing: !matchedNode,
  }
}

// 转换角色数据为图谱节点
const graphNodes = computed<GraphNode[]>(() => {
  const appearedIds = currentScopeAppearedIds.value

  if (isGlobalGraph.value) {
    const autoGlobalIds = autoCharacterScopeIds.value.globalIds
    return [
      ...characters.value
        .filter(
          (character) =>
            graphDraftState.value.globalGraphInitialized ||
            autoGlobalIds.has(character.id) ||
            globalRelations.value.some(
              (relation) => relation.fromId === character.id || relation.toId === character.id,
            ),
        )
        .map((character) =>
        buildGraphAssetNode({
          assetType: 'character',
          assetId: character.id,
          assetName: character.name,
          importance: character.traits?.length || 0,
          isAppeared: autoGlobalIds.has(character.id),
        }),
      ),
      ...writerStore.locations.list.map((location) =>
        buildGraphAssetNode({
          assetType: 'location',
          assetId: location.id,
          assetName: location.name,
          isAppeared: true,
        }),
      ),
      ...items.value.map((item) =>
        buildGraphAssetNode({
          assetType: 'item',
          assetId: item.id,
          assetName: item.name,
          isAppeared: true,
        }),
      ),
      ...organizations.value.map((organization) =>
        buildGraphAssetNode({
          assetType: 'organization',
          assetId: organization.id,
          assetName: organization.name,
          isAppeared: true,
        }),
      ),
      ...concepts.value.map((concept) =>
        buildGraphAssetNode({
          assetType: 'concept',
          assetId: concept.id,
          assetName: concept.name,
          isAppeared: true,
        }),
      ),
    ]
  }

  const chapterCharIds = new Set([
    ...(currentScopeType.value === 'volume'
      ? volumeDraftRelations.value
      : chapterDraftRelations.value
    ).map((relation) => relation.fromId),
    ...(currentScopeType.value === 'volume'
      ? volumeDraftRelations.value
      : chapterDraftRelations.value
    ).map((relation) => relation.toId),
  ])
  const inheritedCharIds =
    currentScopeGraph.value?.parentGraphId === 'global'
      ? new Set(globalRelations.value.flatMap((relation) => [relation.fromId, relation.toId]))
      : new Set<string>()
  const localBoundCharIds = new Set(
    (currentScopeType.value === 'volume' ? volumeBoundAssetRefs.value : chapterBoundAssetRefs.value)
      .filter((asset) => asset.assetType === 'character' && asset.assetId)
      .map((asset) => asset.assetId as string),
  )
  const inheritedBoundCharIds = new Set(
    inheritedVolumeAssetRefs.value
      .filter((asset) => asset.assetType === 'character' && asset.assetId)
      .map((asset) => asset.assetId as string),
  )
  const visibleCharIds = new Set([
    ...chapterCharIds,
    ...inheritedCharIds,
    ...(currentScopeType.value === 'volume'
      ? autoCharacterScopeIds.value.volumeIds
      : autoCharacterScopeIds.value.chapterIds),
    ...localBoundCharIds,
    ...inheritedBoundCharIds,
  ])

  const characterNodes = characters.value
    .filter((character) => visibleCharIds.has(character.id))
    .map((character) =>
      buildGraphAssetNode({
        assetType: 'character',
        assetId: character.id,
        assetName: character.name,
        importance: character.traits?.length || 0,
        isInherited:
          !chapterCharIds.has(character.id) &&
          !localBoundCharIds.has(character.id) &&
          (inheritedCharIds.has(character.id) || inheritedBoundCharIds.has(character.id)),
        isAppeared: appearedIds.has(character.id),
      }),
    )

  const inheritedAssetKeySet = new Set(
    inheritedVolumeAssetRefs.value.map(
      (asset) => createWriterAssetRefKey(asset.assetType, asset.assetId, asset.assetName),
    ),
  )
  const nonCharacterNodes = boundScopeAssetRefs.value
    .filter((asset) => asset.assetType !== 'character')
    .map((asset) =>
      buildGraphAssetNode({
        assetType: asset.assetType,
        assetId: asset.assetId,
        assetName: asset.assetName,
        isInherited: inheritedAssetKeySet.has(
          createWriterAssetRefKey(asset.assetType, asset.assetId, asset.assetName),
        ),
        isAppeared: asset.source !== 'manual',
      }),
    )

  const seenNodeIds = new Set<string>()
  return [...characterNodes, ...nonCharacterNodes].filter((node) => {
    if (seenNodeIds.has(node.id)) return false
    seenNodeIds.add(node.id)
    return true
  })
})

// 转换关系数据为图谱链接
const graphLinks = computed<GraphLink[]>(() => {
  return relations.value.map((relation: any) => ({
    id: relation.id,
    source: relation.fromId,
    target: relation.toId,
    type: typeof relation.type === 'string' ? relation.type : relation.type,
    strength: relation.strength,
    isInherited: relation.isInherited || false,
  }))
})

/**
 * 自动绑定：当切换到新章节时，静默将正文中已识别的已建档资产绑定到该章节的图谱scope。
 * 仅在章节级模式下生效，且每个章节只自动绑定一次。
 */
function autoBindChapterAssets() {
  const projectId = activeProjectId.value
  const scopeId = currentChapterId.value
  if (!projectId || !scopeId) return
  if (currentScopeType.value !== 'chapter') return
  if (autoBoundChapterIds.value.has(scopeId)) return
  if (editorStore.currentChapterId !== scopeId) return

  // 获取所有可绑定的已建档候选（排除未建档和已绑定的）
  const candidates = bindableScopeAssetCandidates.value
  if (candidates.length === 0) {
    // 即使没有候选也标记为已处理，避免反复检测
    autoBoundChapterIds.value.add(scopeId)
    return
  }

  ensureScopeGraphForBinding()

  let boundCount = 0
  for (const candidate of candidates) {
    assetRefState.value = upsertScopeAssetRef({
      projectId,
      scopeType: 'chapter',
      scopeId,
      assetType: candidate.assetType,
      assetId: candidate.assetId,
      assetName: candidate.assetName,
      source: candidate.source,
      evidence: candidate.evidence,
      unresolved: candidate.unresolved,
    })
    boundCount += 1
  }

  if (boundCount > 0) {
    autoBoundChapterIds.value.add(scopeId)
  }
}

onMounted(async () => {
  await handleRefresh()
  reloadGraphDraftState()
  reloadAssetRefState()
})

async function handleRefresh() {
  const projectId = activeProjectId.value
  if (projectId) {
    const [, , , , conceptData, itemData, organizationData] = await Promise.all([
      writerStore.loadCharacters(projectId),
      writerStore.loadCharacterRelations(projectId),
      writerStore.loadLocations(projectId),
      writerStore.loadOutlineTree(projectId),
      conceptApi.list(projectId),
      listEntities(projectId, 'item'),
      listEntities(projectId, 'organization'),
    ])
    concepts.value = unwrapApiData<Concept[]>(conceptData)
    items.value = itemData
    organizations.value = organizationData
    if (writerStore.characters.relations?.length > 0) {
      graphDraftState.value = setGlobalGraphInitialized(projectId, true)
    } else {
      reloadGraphDraftState()
    }
  }
}

watch(
  () => activeProjectId.value,
  async (projectId, previousProjectId) => {
    if (!projectId || projectId === previousProjectId) return

    reloadGraphDraftState()
    reloadAssetRefState()
    await handleRefresh()
  },
)

watch(
  () => props.focusedAsset,
  (target) => {
    if (!target) return
    void applyGraphFocusTarget(target).finally(() => emit('graph-focus-consumed'))
  },
  { immediate: true },
)

watch(
  graphStatusChips,
  (chips) => {
    emit('status-change', chips)
  },
  { immediate: true },
)

// 监听章节切换，自动绑定已建档资产
watch(currentChapterId, (newChapterId) => {
  if (newChapterId) {
    nextTick(() => autoBindChapterAssets())
  }
})

// 监听编辑器内容加载完成（处理异步加载正文的场景）
watch(currentEditorPlainText, () => {
  if (currentChapterId.value && currentScopeType.value === 'chapter') {
    autoBindChapterAssets()
  }
})

const formatAssetType = (type: WriterAssetCandidate['assetType']) => {
  if (type === 'character') return '角色'
  if (type === 'location') return '地点'
  if (type === 'organization') return '组织'
  if (type === 'concept') return '概念'
  return '物品'
}

const formatAssetSource = (source: WriterAssetCandidate['source']) => {
  if (source === 'mention') return '关键词'
  if (source === 'alias') return '别名命中'
  if (source === 'name') return '正文命中'
  if (source === 'chapter_rollup') return '章节汇总'
  return '手动'
}

const ensureScopeGraphForBinding = () => {
  const projectId = activeProjectId.value
  const scopeId = currentChapterId.value
  if (!projectId || !scopeId || currentScopeGraph.value) return

  if (currentScopeType.value === 'volume') {
    graphDraftState.value = createVolumeGraphDraft({
      projectId,
      volumeId: scopeId,
      volumeTitle: currentScopeTitle.value,
    })
    currentGraphId.value = scopeId
    return
  }

  graphDraftState.value = createChapterGraphDraft({
    projectId,
    chapterId: scopeId,
    chapterTitle: getChapterInfo(scopeId)?.chapter || scopeId,
    parentGraphId: 'global',
    globalRelations: mapToScopedRelations<ChapterRelation>(
      writerStore.characters?.relations || [],
      scopeId,
    ) as ChapterRelation[] | undefined,
  })
  currentGraphId.value = scopeId
}

const bindAssetCandidate = (candidate: WriterAssetCandidate) => {
  const projectId = activeProjectId.value
  const scopeId = currentChapterId.value
  if (!projectId || !scopeId) return false
  if (candidate.unresolved) {
    message.warning('该资产还未建档，暂时无法绑定到图谱')
    return false
  }

  ensureScopeGraphForBinding()

  assetRefState.value = upsertScopeAssetRef({
    projectId,
    scopeType: currentScopeType.value === 'volume' ? 'volume' : 'chapter',
    scopeId,
    assetType: candidate.assetType,
    assetId: candidate.assetId,
    assetName: candidate.assetName,
    source: candidate.source,
    evidence: candidate.evidence,
    unresolved: candidate.unresolved,
  })
  showBoundAssetsPanel.value = true
  return true
}

const handleBindAssetCandidate = (candidate: WriterAssetCandidate) => {
  if (!bindAssetCandidate(candidate)) return
  message.success(`已绑定${formatAssetType(candidate.assetType)}：${candidate.assetName}`)
}

const handleBindExistingCharactersToScope = () => {
  const projectId = activeProjectId.value
  const scopeId = currentChapterId.value
  if (!projectId || !scopeId) return
  const bindableCharacters = [...scopeBindableCharacters.value]
  if (bindableCharacters.length === 0) {
    message.info('当前没有可继续绑定的角色卡')
    return
  }

  ensureScopeGraphForBinding()

  for (const character of bindableCharacters) {
    assetRefState.value = upsertScopeAssetRef({
      projectId,
      scopeType: currentScopeType.value === 'volume' ? 'volume' : 'chapter',
      scopeId,
      assetType: 'character',
      assetId: character.id,
      assetName: character.name,
      source: 'manual',
    })
  }

  showBoundAssetsPanel.value = true
  message.success(`已绑定 ${bindableCharacters.length} 个角色到当前图谱`)
}

const handleBindAllAssetCandidates = async () => {
  if (bindingAllCandidates.value || bindableScopeAssetCandidates.value.length === 0) return

  bindingAllCandidates.value = true
  try {
    let boundCount = 0
    for (const candidate of bindableScopeAssetCandidates.value) {
      if (bindAssetCandidate(candidate)) {
        boundCount += 1
      }
    }

    if (boundCount > 0) {
      message.success(`已批量绑定 ${boundCount} 个候选资产`)
    }
  } finally {
    bindingAllCandidates.value = false
  }
}

const handleCreateAndBindCandidate = async (candidate: WriterAssetCandidate) => {
  const projectId = activeProjectId.value
  const scopeId = currentChapterId.value
  if (!projectId || !scopeId) return

  try {
    let assetType = candidate.assetType
    if (candidate.requiresTypeSelection) {
      const typeResult = await messageBox.prompt(
        '请输入资产类型：角色 / 地点 / 物品 / 组织 / 概念',
        `确认「${candidate.assetName}」的类型`,
      )
      const typeInput = String(typeResult.value || '').trim()
      const typeMap: Record<string, WriterAssetCandidate['assetType']> = {
        角色: 'character',
        character: 'character',
        地点: 'location',
        location: 'location',
        物品: 'item',
        物件: 'item',
        item: 'item',
        组织: 'organization',
        organization: 'organization',
        概念: 'concept',
        concept: 'concept',
      }
      const resolvedType = typeMap[typeInput]
      if (!resolvedType) {
        message.warning('请先选择有效资产类型')
        return
      }
      assetType = resolvedType
    }

    const copyLabel =
      assetType === 'character'
        ? '角色'
        : assetType === 'location'
          ? '地点'
          : assetType === 'concept'
            ? '概念'
            : assetType === 'organization'
              ? '组织'
              : '物品'
    const summaryResult = await messageBox.prompt(
      `为${copyLabel}「${candidate.assetName}」补充一句简介（可选）`,
      `建档并绑定${copyLabel}`,
    )
    const summary = String(summaryResult.value || '').trim()

    let createdAssetId = ''
    let createdAssetName = candidate.assetName

    if (assetType === 'character') {
      const createdCharacter = (await createCharacter(projectId, {
        projectId,
        name: candidate.assetName,
        summary,
      })) as any
      const characterPayload = createdCharacter?.data || createdCharacter
      createdAssetId = characterPayload?.id || ''
      createdAssetName = characterPayload?.name || candidate.assetName
      await writerStore.loadCharacters(projectId)
    } else if (assetType === 'location') {
      const createdLocation = (await locationApi.create(projectId, {
        projectId,
        name: candidate.assetName,
        description: summary,
      })) as any
      const locationPayload = createdLocation?.data || createdLocation
      createdAssetId = locationPayload?.id || ''
      createdAssetName = locationPayload?.name || candidate.assetName
      await writerStore.loadLocations(projectId)
    } else if (assetType === 'concept') {
      const createdConcept = (await conceptApi.create(projectId, {
        projectId,
        name: candidate.assetName,
        summary,
      })) as any
      const conceptPayload = createdConcept?.data || createdConcept
      createdAssetId = conceptPayload?.id || ''
      createdAssetName = conceptPayload?.name || candidate.assetName
      concepts.value = unwrapApiData<Concept[]>(await conceptApi.list(projectId))
    } else if (assetType === 'organization') {
      const createdOrganization = await createLocalEntity({
        projectId,
        type: 'organization',
        name: candidate.assetName,
        summary,
      })
      createdAssetId = createdOrganization.id
      createdAssetName = createdOrganization.name
      organizations.value = await listEntities(projectId, 'organization')
    } else {
      const createdItem = await createLocalEntity({
        projectId,
        type: 'item',
        name: candidate.assetName,
        summary,
      })
      createdAssetId = createdItem.id
      createdAssetName = createdItem.name
      items.value = await listEntities(projectId, 'item')
    }

    if (!createdAssetId) {
      message.error(`${copyLabel}建档失败，请重试`)
      return
    }

    ensureScopeGraphForBinding()

    assetRefState.value = upsertScopeAssetRef({
      projectId,
      scopeType: currentScopeType.value === 'volume' ? 'volume' : 'chapter',
      scopeId,
      assetType,
      assetId: createdAssetId || undefined,
      assetName: createdAssetName,
      source: 'manual',
      evidence: candidate.evidence,
      unresolved: false,
    })
    showBoundAssetsPanel.value = true
    message.success(`已建档并绑定${copyLabel}：${createdAssetName}`)
  } catch {
    return
  }
}

const handleRemoveBoundAsset = (asset: WriterAssetRef) => {
  const projectId = activeProjectId.value
  if (!projectId) return
  assetRefState.value = removeScopeAssetRef(projectId, asset.scopeType, asset.scopeId, asset.id)
  message.success(`已移除${asset.assetName}`)
}

const openCreateCharacterDialog = () => {
  isEdit.value = false
  selectedCharacter.value = null
  dialogVisible.value = true
  resetCharacterFormErrors()
  characterForm.value = {
    name: '',
    alias: [],
    summary: '',
    traits: [],
    background: '',
    personalityPrompt: '',
    speechPattern: '',
    currentState: '',
  }
  showAliasInput.value = false
  showTraitInput.value = false
  newAlias.value = ''
  newTrait.value = ''
}

const handleEditCharacter = (character: Character) => {
  isEdit.value = true
  selectedCharacter.value = character
  dialogVisible.value = true
  resetCharacterFormErrors()
  characterForm.value = {
    name: character.name,
    alias: character.alias || [],
    summary: character.summary || '',
    traits: character.traits || [],
    background: character.background || '',
    personalityPrompt: character.personalityPrompt || '',
    speechPattern: character.speechPattern || '',
    currentState: character.currentState || '',
  }
}

const handleAliasInputConfirm = () => {
  if (newAlias.value && !characterForm.value.alias.includes(newAlias.value)) {
    characterForm.value.alias.push(newAlias.value)
  }
  showAliasInput.value = false
  newAlias.value = ''
}

const handleTraitInputConfirm = () => {
  if (newTrait.value && !characterForm.value.traits.includes(newTrait.value)) {
    characterForm.value.traits.push(newTrait.value)
  }
  showTraitInput.value = false
  newTrait.value = ''
}

const handleSubmit = async () => {
  if (!validateCharacterForm()) return

  // 使用 projectStore.currentProjectId，与 handleRefresh 保持一致
  const projectId = projectStore.currentProjectId
  if (!projectId) {
    message.warning('请先选择项目')
    return
  }

  submitting.value = true
  try {
    if (isEdit.value && selectedCharacter.value) {
      await updateCharacter(selectedCharacter.value.id, projectId, characterForm.value)
    } else {
      const createData: CreateCharacterRequest = {
        projectId,
        name: characterForm.value.name,
        alias: characterForm.value.alias,
        summary: characterForm.value.summary,
        traits: characterForm.value.traits,
        background: characterForm.value.background,
        personalityPrompt: characterForm.value.personalityPrompt,
        speechPattern: characterForm.value.speechPattern,
      }
      const createdResult = await createCharacter(projectId, createData)
      const createdCharacter = ((createdResult as any)?.data || createdResult) as unknown as Character
      if (currentChapterId.value) {
        ensureScopeGraphForBinding()
        assetRefState.value = upsertScopeAssetRef({
          projectId,
          scopeType: currentScopeType.value === 'volume' ? 'volume' : 'chapter',
          scopeId: currentChapterId.value,
          assetType: 'character',
          assetId: createdCharacter.id,
          assetName: createdCharacter.name,
          source: 'manual',
        })
      }
    }

    await handleRefresh()
    message.success(isEdit.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
  } catch (error: any) {
    message.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleManageRelations = (character: Character) => {
  // 设置选中的角色
  selectedCharacter.value = character
  // 打开关系管理对话框
  resetRelationFormErrors()
  relationForm.value = {
    fromId: character.id,
    toId: '',
    type: '' as RelationType,
    strength: 50,
    notes: '',
  }
  relationDialogVisible.value = true
}

// 获取可选的目标角色列表（排除自己和已有关系的角色）
const availableTargetCharacters = computed(() => {
  if (!selectedCharacter.value) return []
  const existingRelationIds = new Set(
    getCharacterRelations(selectedCharacter.value.id).map((r) =>
      r.fromId === selectedCharacter.value!.id ? r.toId : r.fromId,
    ),
  )
  return characters.value.filter(
    (c) => c.id !== selectedCharacter.value!.id && !existingRelationIds.has(c.id),
  )
})
const relationTargetOptions = computed(() =>
  availableTargetCharacters.value.map((character) => ({
    label: character.name,
    value: character.id,
  })),
)
const relationTypeOptions = computed(() =>
  RELATION_TYPE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
)

const selectedCharacterRelationItems = computed(() => {
  const character = selectedCharacter.value
  if (!character) return []
  return getCharacterRelations(character.id).map((relation) => ({
    relation,
    id: relation.id,
    targetName: getCharacterName(relation.fromId === character.id ? relation.toId : relation.fromId),
    type: relation.type,
    strength: relation.strength,
    tagType: getRelationTagType(relation.type),
  }))
})

const handleDeleteRelationFromDialog = (relation: { id: string }) => {
  const targetRelation = selectedCharacterRelationItems.value.find(
    (item) => item.relation.id === relation.id,
  )?.relation
  if (targetRelation) {
    void handleDeleteRelation(targetRelation)
  }
}

const resetCharacterFormErrors = () => {
  characterFormErrors.value = {
    name: '',
  }
}

const validateCharacterForm = () => {
  resetCharacterFormErrors()

  if (!characterForm.value.name.trim()) {
    characterFormErrors.value.name = '请输入角色名称'
    message.warning('请输入角色名称')
    return false
  }

  return true
}

const resetRelationFormErrors = () => {
  relationFormErrors.value = {
    toId: '',
    type: '',
    strength: '',
  }
}

const validateRelationForm = () => {
  resetRelationFormErrors()

  if (!relationForm.value.toId) {
    relationFormErrors.value.toId = '请选择目标角色'
  }

  if (!relationForm.value.type) {
    relationFormErrors.value.type = '请选择关系类型'
  }

  if (relationForm.value.strength < 0 || relationForm.value.strength > 100) {
    relationFormErrors.value.strength = '强度范围为 0-100'
  }

  const firstError = Object.values(relationFormErrors.value).find(Boolean)
  if (firstError) {
    message.warning(firstError)
    return false
  }

  return true
}

// 提交创建关系
const handleCreateRelation = async () => {
  if (!validateRelationForm()) return

  const projectId = activeProjectId.value
  if (!projectId) {
    message.warning('请先选择项目')
    return
  }

  relationSubmitting.value = true
  try {
    if (currentChapterId.value) {
      ensureScopeGraphForBinding()
      if (currentScopeType.value === 'volume' && currentVolumeGraph.value) {
        graphDraftState.value = appendVolumeRelationDraft({
          projectId,
          volumeId: currentChapterId.value,
          graphId: currentVolumeGraph.value.id,
          fromId: relationForm.value.fromId,
          toId: relationForm.value.toId,
          type: relationForm.value.type,
          strength: relationForm.value.strength,
          notes: relationForm.value.notes,
        })
      } else if (currentChapterGraph.value) {
        graphDraftState.value = appendChapterRelationDraft({
          projectId,
          chapterId: currentChapterId.value,
          graphId: currentChapterGraph.value.id,
          fromId: relationForm.value.fromId,
          toId: relationForm.value.toId,
          type: relationForm.value.type,
          strength: relationForm.value.strength,
          notes: relationForm.value.notes,
        })
      }
    } else {
      await writerStore.createCharacterRelation(projectId, {
        fromId: relationForm.value.fromId,
        toId: relationForm.value.toId,
        type: relationForm.value.type,
        strength: relationForm.value.strength,
        notes: relationForm.value.notes,
      })
      graphDraftState.value = setGlobalGraphInitialized(projectId, true)
      await writerStore.loadCharacterRelations(projectId)
    }

    message.success('关系创建成功')
    relationDialogVisible.value = false
  } catch (error: any) {
    message.error(error.message || '创建失败')
  } finally {
    relationSubmitting.value = false
  }
}

// 删除关系
const handleDeleteRelation = async (relation: VisibleRelation) => {
  const projectId = activeProjectId.value
  if (!projectId) return

  try {
    if (
      (relation as CharacterRelation & { isInherited?: boolean }).isInherited &&
      currentChapterId.value
    ) {
      message.warning('继承自全局的关系需要在全局图谱中删除')
      return
    }

    if (currentChapterId.value && currentScopeGraph.value) {
      if (currentScopeType.value === 'volume') {
        graphDraftState.value = deleteVolumeRelationDraft(
          projectId,
          currentChapterId.value,
          relation.id,
        )
      } else {
        graphDraftState.value = deleteChapterRelationDraft(
          projectId,
          currentChapterId.value,
          relation.id,
        )
      }
    } else {
      await writerStore.deleteCharacterRelation(relation.id, projectId)
      await writerStore.loadCharacterRelations(projectId)
    }
    message.success('关系已删除')
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

const getCharacterRelations = (characterId: string): VisibleRelation[] => {
  return (relations.value || []).filter((r) => r.fromId === characterId || r.toId === characterId)
}

const getCharacterName = (characterId: string): string => {
  const character = characters.value.find((c) => c.id === characterId)
  return character?.name || '未知'
}

const getRelationTagType = (
  type: RelationType | string,
): 'success' | 'info' | 'warning' | 'danger' => {
  const typeMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    朋友: 'success',
    家庭: 'info',
    恋人: 'danger',
    盟友: 'success',
    敌人: 'warning',
    其他: 'info',
  }
  return typeMap[type] || 'info'
}

// 处理图谱连线创建事件
const handleGraphCreateLink = (fromId: string, toId: string) => {
  // 检查是否已存在关系
  const existingRelation = relations.value.find(
    (r) => (r.fromId === fromId && r.toId === toId) || (r.fromId === toId && r.toId === fromId),
  )
  if (existingRelation) {
    message.warning('这两个角色之间已存在关系')
    return
  }

  // 打开关系创建对话框
  const fromCharacter = characters.value.find((c) => c.id === fromId)
  const toCharacter = characters.value.find((c) => c.id === toId)

  if (fromCharacter && toCharacter) {
    selectedCharacter.value = fromCharacter
    relationForm.value = {
      fromId: fromId,
      toId: toId,
      type: '' as RelationType,
      strength: 50,
      notes: '',
    }
    relationDialogVisible.value = true
  }
}

// 处理节点点击事件
const handleNodeClick = (nodeId: string) => {
  selectedGraphNodeId.value = nodeId
  focusedGraphNodeId.value = nodeId
  const graphNode = graphNodes.value.find((node) => node.id === nodeId) || null
  const character = characters.value.find((c) => c.id === nodeId)
  if (character) {
    selectedCharacter.value = character
    graphFocusFeedback.value = null
    return
  }
  selectedCharacter.value = null
  graphFocusFeedback.value = graphNode
    ? {
        typeLabel: formatGraphNodeTypeLabel(graphNode.entityType),
        name: graphNode.name,
        missing: false,
      }
    : null
}

const buildCharacterAIContextText = (character: Character): string => {
  const lines = [
    `角色：${character.name}`,
    character.alias?.length ? `别名：${character.alias.join('、')}` : '',
    character.summary ? `简介：${character.summary}` : '',
    character.currentState ? `当前状态：${character.currentState}` : '',
    character.traits?.length ? `性格特征：${character.traits.join('、')}` : '',
    formatActiveEntitiesPrompt(props.activeEntities),
    buildWriterWorkflowContextPrompt(props.workflowContext),
  ].filter(Boolean)

  const relationSummary = getCharacterRelations(character.id)
    .slice(0, 4)
    .map((relation) => {
      const targetId = relation.fromId === character.id ? relation.toId : relation.fromId
      return `${getCharacterName(targetId)}：${relation.type}`
    })

  if (relationSummary.length > 0) {
    lines.push(`当前关系：${relationSummary.join('；')}`)
  }

  return lines.join('\n')
}

const sendSelectedCharacterToAI = () => {
  const character = selectedCharacter.value
  if (!character) {
    return
  }

  emit('trigger-ai-action', {
    source: 'workspace',
    action: 'add_to_chat',
    title: `图谱角色分析：${character.name}`,
    text: buildCharacterAIContextText(character),
    instructions:
      '请结合这位角色在当前图谱中的状态与关系，给出可执行的写作建议，优先关注动机、冲突和后续推进。',
  })
}

// 处理节点删除事件
const handleDeleteNode = (nodeId: string) => {
  if (currentChapterId.value && currentScopeGraph.value && activeProjectId.value) {
    if (currentScopeType.value === 'volume') {
      graphDraftState.value = deleteVolumeRelationsByNode(
        activeProjectId.value,
        currentChapterId.value,
        nodeId,
      )
      message.success('该角色的卷级特有关联已移除')
      return
    }

    graphDraftState.value = deleteChapterRelationsByNode(
      activeProjectId.value,
      currentChapterId.value,
      nodeId,
    )
    message.success('该角色的章节特有关联已移除')
    return
  }

  message.info('全局图谱中的角色节点来自角色卡，请在角色或关系管理中调整')
}

// 在画布指定位置添加节点（右键菜单触发）
const handleAddNodeAt = (x: number, y: number) => {
  void x
  void y
  openCreateCharacterDialog()
}

// 处理故事线章节点击事件
const handleOutlineNodeClick = (node: any) => {
  if (node.id && node.nodeType !== 'directory') {
    currentChapterId.value = node.id
    viewMode.value = 'graph'
  }
}
</script>

<style scoped lang="scss">
.character-graph-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--editor-bg-surface);
}

// 主内容区样式
.graph-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

// 图谱画布
.graph-canvas {
  flex: 1;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.graph-loading-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--editor-text-primary, #0f172a) 82%, transparent);
  color: var(--editor-text-inverse, #ffffff);
  font-size: 12px;
  box-shadow: var(--editor-shadow-lg, 0 10px 30px -18px rgba(15, 23, 42, 0.75));
}

// 图谱统计
.graph-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 10px;
}

// 图谱可视化区域
.graph-visualization {
  flex: 1;
  min-height: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background: var(--editor-bg-base);
  position: relative;
  display: flex;
  flex-direction: column;
}

.graph-view-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

/* 动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .graph-stats {
    grid-template-columns: 1fr;
  }

  .characters-grid {
    grid-template-columns: 1fr;
  }
}

/* 统一主题兼容层 */
[data-editor-theme='graphite'],
[data-editor-theme='amber'],
[data-editor-theme='forest'] {
  .character-graph-view {
    background: var(--editor-bg-surface, #0d0d0d);
  }
}

/* 角色编辑卡片样式 */
.character-edit-card-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--editor-overlay-scrim, rgba(0, 0, 0, 0.5));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

/* 动画效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
