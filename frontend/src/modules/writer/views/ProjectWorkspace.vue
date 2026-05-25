<template>
  <WorkspaceShell
    :is-immersive-mode="isImmersiveMode"
    :editor-theme="editorThemeStore.currentTheme"
  >
    <template #topbar>
      <WorkspaceTopbar
        :project-display-name="projectDisplayName"
        :current-chapter-title="currentChapterTitle"
        :active-tool-label="activeToolLabel"
        :save-status-label="saveStatusLabel"
        :is-immersive-mode="isImmersiveMode"
        :active-right-tool="workspaceLayoutStore.rightToolArea.activeTool"
        :is-right-tool-visible="
          workspaceLayoutStore.rightToolArea.visible && !panelStore.rightCollapsed
        "
        :is-bottom-panel-visible="workspaceLayoutStore.areas.bottom.visible"
        @save="handleTipTapSave"
        @export="handleExportDraft"
        @share="handleShareDraft"
        @back="handleBackToDashboard"
        @toggle-immersive="handleToggleImmersive"
        @open-right-tool="handleOpenRightTool"
        @toggle-bottom-panel="toggleBottomPanel"
        @apply-layout-preset="applyLayoutPreset"
      />
    </template>

    <template #body>
      <EditorLayout ref="editorLayoutRef" class="workspace-editor-layout">
        <!-- 左侧面板插槽 -->
        <template #left-panel>
          <WorkspaceLeftPanel
            v-model:project-id="boundProjectId"
            v-model:chapter-id="displayChapterId"
            :collapsed="panelStore.leftCollapsed"
            :is-immersive-mode="isImmersiveMode"
            :projects="projects"
            :chapters="flatChapters"
            @add-doc="handleAddDoc"
            @add-volume="handleCreateOutlineRoot"
            @open-directory-outline="handleOpenDirectoryOutline"
            @delete-chapter="handleDeleteChapter"
            @create-outline-root="handleCreateOutlineRoot"
            @create-outline-child="handleCreateOutlineChild"
            @edit-selected="handleEditOutlineNode"
            @delete-selected="handleDeleteOutlineNode"
            @move-up="() => handleMoveOutlineNode('up')"
            @move-down="() => handleMoveOutlineNode('down')"
            @toggle="panelStore.toggleLeftCollapsed"
            @open-graph="handleOpenGraph"
            @open-fullscreen-tool="handleOpenFullscreenTool"
            @outline-select="handleOutlineSelect"
            @convert-to-chapter="handleConvertToChapter"
          />
        </template>

        <!-- 主编辑器插槽 -->
        <template #editor>
          <WorkspaceEditorContent
            ref="workspaceEditorContentRef"
            :project-id="safeCurrentProjectId"
            :chapter-id="displayChapterId"
            :chapter-title="displayChapterTitle"
            :tool-overlay-chapter-id="toolOverlayChapterId"
            :tool-overlay-chapter-title="toolOverlayChapterTitle"
            :chapters="flatChapters"
            :scope-label="currentScopeLabel"
            :entity-stats="storyHarnessEntityStats"
            :active-characters="activeScopeCharacters"
            :active-relations="activeScopeRelations"
            :change-requests="storyHarnessChangeRequests"
            :workflow-context="workflowContext"
            :active-entities="activeEntities"
            :scene-stage="sceneStage"
            :proofread-highlights="proofreadHighlights"
            :focused-proofread-issue-id="focusedProofreadIssueId"
            :handle-change-request-decision="handleChangeRequestDecision"
            :handle-trigger-index="handleStoryHarnessTriggerIndex"
            :is-triggering-index="isStoryHarnessTriggering"
            v-model:content="visibleTipTapContent"
            @trigger-ai-action="handleWorkflowAction"
            @entity-scan="handleEditorEntityScan"
            @open-graph="handleOpenGraph"
            @jump-to-chapter="handleChapterIdUpdate"
            @save="handleTipTapSave"
            @add-doc="handleAddDoc"
            @rename-title="handleRenameCurrentDocument"
            @create-structure-plan="handleCreateStructurePlan"
            @status-change="handleWorkspaceStatusChange"
          />
        </template>

        <!-- 右侧AI面板插槽 -->
        <template #right-panel>
          <WorkspaceRightPanel
            :collapsed="panelStore.rightCollapsed"
            :is-immersive-mode="isImmersiveMode"
            :project-id="safeCurrentProjectId"
            :chapter-id="displayChapterId"
            :chapter-title="displayChapterTitle"
            :chapters="flatChapters"
            :source-text="currentChapterPlainText"
            :proofread-ignored-terms="proofreadIgnoredTerms"
            :ai-action-trigger="aiActionTrigger"
            :ai-apply-feedback="aiApplyFeedback"
            :workflow-context="workflowContext"
            :scene-stage="sceneStage"
            :draft-proposals="visibleDraftProposals"
            :harness-data="{
              projectId: safeCurrentProjectId,
              chapterId: displayChapterId,
              chapterTitle: displayChapterTitle,
              content: tipTapContent,
              chapterCount: flatChapters.length,
              scopeLabel: currentScopeLabel,
              entityStats: storyHarnessEntityStats,
              activeCharacters: activeScopeCharacters,
              activeRelations: activeScopeRelations,
              changeRequests: storyHarnessChangeRequests,
              handleChangeRequestDecision,
              handleTriggerIndex: handleStoryHarnessTriggerIndex,
              isTriggeringIndex: isStoryHarnessTriggering,
            }"
            @ai-apply="handleAIApplyGeneratedText"
            @proposal-draft="handleProposalDraft"
            @proposal-status-change="handleProposalStatusChange"
            @create-structure-plan="handleCreateStructurePlan"
            @jump-to-chapter="handleChapterIdUpdate"
            @trigger-ai-action="handleWorkflowAction"
            @proofread-issues-change="handleProofreadIssuesChange"
            @proofread-locate="handleProofreadLocate"
            @proofread-apply="handleProofreadApply"
          />
        </template>
      </EditorLayout>
    </template>

    <template #statusbar>
      <div class="workspace-bottom-stack">
        <WorkspaceBottomPanel
          :visible="workspaceLayoutStore.areas.bottom.visible"
          :is-immersive-mode="isImmersiveMode"
          :height="workspaceLayoutStore.bottomPanel.height"
          :scene-stage="sceneStage"
          @open-assets="handleOpenRightToolExclusive('assets')"
          @send-to-ai="handleSceneStageSendToAI"
          @resize="workspaceLayoutStore.updateBottomPanelHeight"
          @update-draft="updateSceneStageDraft"
          @advance-beat="advanceSceneStageBeat"
          @start-scene="startNewSceneStage"
          @close="toggleBottomPanel"
        />
        <WorkspaceStatusbar
          :chapter-count="chapterCount"
          :directory-count="directoryCount"
          :active-tool-label="activeToolLabel"
          :save-status-label="saveStatusLabel"
          :extra-status-chips="workspaceExtraStatusChips"
          :is-immersive-mode="isImmersiveMode"
          :immersive-timer-text="immersiveTimerText"
          :project-word-count="currentProjectWordCount"
          :bottom-panel-visible="workspaceLayoutStore.areas.bottom.visible"
          :active-bottom-panel-id="workspaceLayoutStore.areas.bottom.activePanelId"
          :scene-stage-title="sceneStage.sceneTitle"
          :scene-stage-summary="sceneStage.summaryLine"
          @toggle-bottom-panel="toggleBottomPanel"
          @select-bottom-panel="handleBottomPanelSelect"
        />
      </div>
    </template>
  </WorkspaceShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import { WRITER_ROUTE_NAMES } from '@/modules/writer/routes'
// 引入 Store 体系
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { useDocumentStore } from '@/modules/writer/stores/documentStore'
import { useEditorStore, type ActiveTool } from '@/modules/writer/stores/editorStore'
import { usePanelStore } from '@/modules/writer/stores/panelStore'
import { useEditorThemeStore } from '@/modules/writer/stores/editorThemeStore'
import { useEditorAppearanceStore } from '@/modules/writer/stores/editorAppearanceStore'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { getWorkspaceMockProject } from '@/modules/writer/mock/workspaceMock'
import { DocumentType } from '@/modules/writer/types/document'
import type { OutlineNode } from '@/types/writer'

// 引入 Composables
import { useWorkspaceState } from '@/modules/writer/composables/useWorkspaceState'
import { useImmersiveTimer } from '@/modules/writer/composables/useImmersiveTimer'
import { useLegacyEncyclopediaView } from '@/modules/writer/composables/useLegacyEncyclopediaView'
import { useDirectoryOutline } from '@/modules/writer/composables/useDirectoryOutline'
import { useStoryHarnessWorkspace } from '@/modules/writer/composables/useStoryHarnessWorkspace'
import { useWorkflowContext } from '@/modules/writer/composables/useWorkflowContext'
import { useWriterSceneStage } from '@/modules/writer/composables/useWriterSceneStage'
import { type ToolType } from '@/modules/writer/composables/useToolOverlay'

// 引入 API
import {
  outlineApi,
  type CreateOutlineRequest,
  type UpdateOutlineRequest,
} from '@/modules/writer/api/outline'
import { createDocument, updateDocument } from '@/modules/writer/api/document'
import { editorApi } from '@/modules/writer/api/editor'
import { conceptApi } from '@/modules/writer/api/concept'
import { listEntities } from '@/modules/writer/api/entities'
import {
  isStandaloneWriterRuntime,
  isWailsWriterAvailable,
} from '@/modules/writer/data-bridge/wails'
import { ensureProjectBaseSkeleton } from '@/modules/writer/services/workbenchProject.service'

// 引入子组件
import WorkspaceTopbar from '@/modules/writer/components/workspace/WorkspaceTopbar.vue'
import WorkspaceLeftPanel from '@/modules/writer/components/workspace/WorkspaceLeftPanel.vue'
import WorkspaceRightPanel from '@/modules/writer/components/workspace/WorkspaceRightPanel.vue'
import WorkspaceBottomPanel from '@/modules/writer/components/workspace/WorkspaceBottomPanel.vue'
import WorkspaceShell from '@/modules/writer/components/workspace/WorkspaceShell.vue'
import WorkspaceStatusbar from '@/modules/writer/components/workspace/WorkspaceStatusbar.vue'
import WorkspaceEditorContent from '@/modules/writer/components/workspace/WorkspaceEditorContent.vue'
import EditorLayout from '@/modules/writer/components/editor/EditorLayout.vue'
import {
  appendPlainTextToEditorContent,
  buildEditorContentFromPlainText,
  extractPlainTextFromEditorContent,
  stripLeadingTitleHeadingFromEditorContent,
} from '@/modules/writer/utils/editorContent'
import {
  formatDefaultChapterTitle,
  formatDefaultVolumeTitle,
} from '@/modules/writer/utils/writerDocumentNaming'
import {
  registerPendingDiff,
  clearPendingDiffs,
  setDiffCallbacks,
  type PendingDiff,
} from '@/design-system/components/editor/QySmartKeyword/extensions/AiDiffExtension'
import { mapPlainTextRangeToDocPosition } from '@/design-system/components/editor/QySmartKeyword/extensions/ProofreadHighlightExtension'
import {
  extractEntitiesFromTipTapContent,
  groupEntitiesByType,
  parseEntityReferences,
} from '@/modules/writer/utils/entityParser'
import {
  extractWriterAssetCandidates,
  replaceProjectChapterAssetRefs,
  replaceScopeAssetRefs,
} from '@/modules/writer/utils/writerAssetRefs'
import type { EntityReference } from '@/modules/writer/types/entity'
import type {
  WriterAIActionTrigger,
  WriterAIApplyFeedback,
  WriterAIApplyPayload,
  WriterDraftProposal,
  WriterDraftProposalKind,
  WriterDraftProposalSource,
  WriterDraftProposalStatus,
  WriterResultCandidate,
  WriterStructurePlanPayload,
  WriterWorkflowActionRequest,
} from '@/modules/writer/types/workflow'
import { buildWriterAIActionTrigger } from '@/modules/writer/types/workflow'
import type {
  RightToolType,
  WorkspaceLayoutPreset,
  WorkspacePanelId,
} from '@/modules/writer/types/workspaceLayout'
import { buildWriterSceneStagePrompt } from '@/modules/writer/types/sceneStage'
import { useWorkspaceLayoutStore } from '@/modules/writer/stores/workspaceLayoutStore'
import type { ProofreadIssue } from '@/modules/writer/composables/useProofreadPanel'
import type { ProofreadHighlightRange } from '@/design-system/components/editor'

// =======================
// Props 定义
// =======================
const props = defineProps<{
  projectId?: string
}>()

// =======================
// Store 初始化
// =======================
const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const documentStore = useDocumentStore()
const editorStore = useEditorStore()
const panelStore = usePanelStore()
const editorThemeStore = useEditorThemeStore()
const editorAppearanceStore = useEditorAppearanceStore()
const writerStore = useWriterStore()
const workspaceLayoutStore = useWorkspaceLayoutStore()

// =======================
// 计算属性
// =======================
const isTestMode = computed(() => route.query.test === 'true')
const mockProject = computed(() =>
  isTestMode.value ? getWorkspaceMockProject(currentProjectId.value) : null,
)
const queryChapterId = computed(() => String(route.query.chapterId || ''))
const queryTool = computed(() => String(route.query.tool || ''))
const queryRightTool = computed(() => String(route.query.rightTool || ''))
const resolvedActiveTool = computed<ActiveTool>(() => editorStore.activeTool ?? 'writing')
const workspaceStatusChips = ref<string[]>([])
const workspaceTransientStatusChip = ref('')
const workspaceExtraStatusChips = computed(() =>
  workspaceTransientStatusChip.value
    ? [...workspaceStatusChips.value, workspaceTransientStatusChip.value]
    : workspaceStatusChips.value,
)
const workspaceEntryFeedback = ref('')
const proofreadIssues = ref<ProofreadIssue[]>([])
const focusedProofreadIssueId = ref('')
const STANDALONE_LAST_PROJECT_KEY = 'qingyu-editor:last-project'
const CREATED_PROJECT_ENTRY_QUERY = 'created_project'
const CONTINUE_PROJECT_ENTRY_QUERY = 'continue_project'
const IMPORTED_PROJECT_ENTRY_QUERY = 'imported_project'
const CHAPTER_SWITCH_FEEDBACK_MS = 2400
let chapterSwitchFeedbackTimer: number | null = null

// =======================
// 使用 Composables
// =======================
const {
  currentProjectId,
  currentChapterId,
  projectDisplayName,
  currentChapterTitle,
  chapterCount,
  directoryCount,
  activeToolLabel,
  saveStatusLabel,
  tipTapContent,
  projects,
  flatChapters,
  availableDocMap,
} = useWorkspaceState({
  projectIdProp: props.projectId,
  isTestMode,
  mockProject,
})

// 当前项目总字数
const currentProjectWordCount = computed(() => {
  const project = projects.value.find((p) => p.id === currentProjectId.value)
  return project?.wordCount || 0
})

const AUTO_SAVE_DELAY_MS = 1200
let autoSaveTimer: number | null = null
const lastSavedContentSignature = ref('')

type SaveOptions = {
  silent?: boolean
  refreshHarness?: boolean
}

const buildCurrentEditorContents = () => [
  {
    paragraphId: 'root',
    order: 0,
    content: tipTapContent.value || '',
    contentType: 'tiptap_json',
    version: Number(editorStore.currentVersion || 0),
  },
]

const getContentSignature = (chapterId = currentChapterId.value, content = tipTapContent.value) =>
  `${chapterId || ''}:${content || ''}`

const clearAutoSaveTimer = () => {
  if (autoSaveTimer) {
    window.clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  }
}

const isImmersiveMode = computed(() => resolvedActiveTool.value === 'immersive')

const { immersiveTimerText, startImmersiveTimer, stopImmersiveTimer } = useImmersiveTimer({
  isImmersiveMode,
})

const { encyclopediaSubView } = useLegacyEncyclopediaView()

const { buildDirectoryOutline } = useDirectoryOutline({ availableDocMap, mockProject })

const handleWorkspaceStatusChange = (chips: string[]) => {
  workspaceStatusChips.value = chips
}

const clearChapterSwitchFeedback = () => {
  if (chapterSwitchFeedbackTimer) {
    window.clearTimeout(chapterSwitchFeedbackTimer)
    chapterSwitchFeedbackTimer = null
  }
}

const showWorkspaceTransientStatusChip = (label: string) => {
  if (!label) {
    return
  }

  clearChapterSwitchFeedback()
  workspaceTransientStatusChip.value = label
  chapterSwitchFeedbackTimer = window.setTimeout(() => {
    workspaceTransientStatusChip.value = ''
    chapterSwitchFeedbackTimer = null
  }, CHAPTER_SWITCH_FEEDBACK_MS)
}

const showChapterSwitchFeedback = (chapterId: string, chapterTitle?: string) => {
  const resolvedTitle = chapterTitle?.trim() || resolveChapterTitle(chapterId) || chapterId
  if (!resolvedTitle) {
    return
  }

  showWorkspaceTransientStatusChip(`已切换：${resolvedTitle}`)
}

const showChapterCreatedFeedback = (chapterTitle?: string) => {
  const resolvedTitle = chapterTitle?.trim()
  if (!resolvedTitle) {
    return
  }

  showWorkspaceTransientStatusChip(`已创建：${resolvedTitle}（可直接改标题）`)
}

const showCreatedProjectEntryFeedback = (chapterTitle?: string) => {
  const resolvedTitle = chapterTitle?.trim()
  if (resolvedTitle) {
    showWorkspaceTransientStatusChip(`已打开：${resolvedTitle}（可直接改标题）`)
    return
  }

  showWorkspaceTransientStatusChip('已创建项目，已打开首章（可直接改标题）')
}

const showContinueProjectEntryFeedback = (chapterTitle?: string) => {
  const resolvedTitle = chapterTitle?.trim()
  if (resolvedTitle) {
    showWorkspaceTransientStatusChip(`继续创作：${resolvedTitle}`)
    return
  }

  showWorkspaceTransientStatusChip('已回到上次创作位置')
}

const showImportedProjectEntryFeedback = (chapterTitle?: string) => {
  const resolvedTitle = chapterTitle?.trim()
  if (resolvedTitle) {
    showWorkspaceTransientStatusChip(`已导入项目：当前章节 ${resolvedTitle}`)
    return
  }

  showWorkspaceTransientStatusChip('已导入项目，已进入工作区')
}

const toggleBottomPanel = () => {
  workspaceLayoutStore.setAreaVisibility('bottom', !workspaceLayoutStore.areas.bottom.visible)
}

const switchEditorLayoutTab = (tab: 'left' | 'editor' | 'right') => {
  const switchTab = editorLayoutRef.value?.switchTab
  if (typeof switchTab === 'function') {
    switchTab(tab)
  }
}

const handleOpenRightTool = (tool: 'ai' | 'assets' | 'harness' | 'proofread' | 'inspiration') => {
  panelStore.setRightCollapsed(false)
  workspaceLayoutStore.setRightToolActive(tool)
  switchEditorLayoutTab('right')
}

const handleOpenRightToolExclusive = (tool: RightToolType) => {
  panelStore.setRightCollapsed(false)
  workspaceLayoutStore.setRightToolActive(tool)
  switchEditorLayoutTab('right')
}

const isRightToolType = (tool: string): tool is RightToolType =>
  tool === 'ai' || tool === 'assets' || tool === 'harness' || tool === 'proofread' || tool === 'inspiration'

const handleToggleImmersive = () => {
  editorStore.setActiveTool(isImmersiveMode.value ? 'writing' : 'immersive')
}

const handleBottomPanelSelect = (panelId: WorkspacePanelId) => {
  workspaceLayoutStore.setAreaActivePanel('bottom', panelId)
}

const handleSceneStageSendToAI = () => {
  if (!sceneStage.value.summaryLine) {
    return
  }

  handleWorkflowAction({
    source: 'workspace',
    action: 'add_to_chat',
    title: sceneStage.value.sceneTitle || '场景舞台',
    text: buildWriterSceneStagePrompt(sceneStage.value),
  })
}

const applyLayoutPreset = (preset: WorkspaceLayoutPreset) => {
  workspaceLayoutStore.applyPreset(preset)

  if (preset === 'focus') {
    panelStore.setLeftCollapsed(true)
    panelStore.setRightCollapsed(true)
    return
  }

  if (preset === 'outline-first') {
    panelStore.setLeftCollapsed(false)
    panelStore.setRightCollapsed(true)
    return
  }

  if (preset === 'ai-first') {
    panelStore.setLeftCollapsed(true)
    panelStore.setRightCollapsed(false)
    return
  }

  panelStore.setLeftCollapsed(false)
  panelStore.setRightCollapsed(false)
}

const displayChapterId = computed({
  get: () => currentChapterId.value,
  set: (value: string) => {
    if (currentChapterId.value !== value) {
      resetWorkflowTransientState()
      writerStore.setSelectedText('')
      void handleChapterIdUpdate(value)
      return
    }

    currentChapterId.value = value
  },
})
const displayChapterTitle = computed(() => currentChapterTitle.value)
const visibleTipTapContent = computed({
  get: () =>
    stripLeadingTitleHeadingFromEditorContent(tipTapContent.value, displayChapterTitle.value),
  set: (value: string) => {
    tipTapContent.value = value
  },
})

const currentChapterPlainText = computed(() =>
  extractPlainTextFromEditorContent(visibleTipTapContent.value),
)

const proofreadHighlights = computed<ProofreadHighlightRange[]>(() =>
  proofreadIssues.value
    .filter((issue) => issue.status === 'open' && issue.position)
    .map((issue) => ({
      id: issue.id,
      start: issue.position?.start ?? 0,
      end: issue.position?.end ?? 0,
      severity: issue.severity,
      originalText: issue.originalText,
    })),
)

const handleProofreadIssuesChange = (issues: ProofreadIssue[]) => {
  proofreadIssues.value = issues
  if (!issues.some((issue) => issue.id === focusedProofreadIssueId.value && issue.status === 'open')) {
    focusedProofreadIssueId.value = ''
  }
}

const handleProofreadLocate = (issue: ProofreadIssue) => {
  if (!issue.position || issue.status !== 'open') return
  focusedProofreadIssueId.value = issue.id
}

const handleProofreadApply = (issue: ProofreadIssue) => {
  const tiptapEditor = editorStore.tipTapEditor
  const replacementText = issue.replacementText?.trim()

  if (!tiptapEditor || !issue.position || issue.status !== 'open' || !replacementText) {
    return
  }

  const mapped = mapPlainTextRangeToDocPosition(tiptapEditor.state.doc, {
    id: issue.id,
    start: issue.position.start,
    end: issue.position.end,
    severity: issue.severity,
    originalText: issue.originalText,
  })

  if (!mapped) {
    focusedProofreadIssueId.value = ''
    message.warning('原文位置已变化，请重新校对后再应用建议')
    return
  }

  focusedProofreadIssueId.value = issue.id
  registerPendingDiff({
    id: `proofread-diff-${issue.id}-${Date.now()}`,
    from: mapped.from,
    to: mapped.to,
    oldText: tiptapEditor.state.doc.textBetween(mapped.from, mapped.to, ''),
    newText: replacementText,
    applyMode: 'replace_selection',
  })
  tiptapEditor.view.dispatch(tiptapEditor.state.tr.setMeta('aiDiff', { updated: true }))
  setAIApplyFeedback(
    'idle',
    '校对建议已就绪',
    '请在正文编辑器内接受或放弃这条校对修改。',
    'replace_selection',
  )
  message.info('校对建议已显示在正文编辑器中，请直接接受或放弃')
}

const {
  currentScopeLabel,
  activeScopeCharacters,
  activeScopeRelations,
  storyHarnessChangeRequests,
  persistCurrentLiveChangeRequests,
  handleChangeRequestDecision,
  triggerIndexAndRefresh,
  refreshAfterSave,
} = useStoryHarnessWorkspace({
  projectId: currentProjectId,
  displayChapterId,
  displayChapterTitle,
  currentChapterPlainText,
  availableDocMap,
})

const storyHarnessEntityReferences = computed(() => {
  const rawContent = tipTapContent.value || editorStore.editorContent || editorStore.content || ''

  let entityReferences: EntityReference[] = []

  try {
    entityReferences = extractEntitiesFromTipTapContent(JSON.parse(rawContent))
  } catch {
    entityReferences = []
  }

  if (entityReferences.length === 0) {
    entityReferences = parseEntityReferences(currentChapterPlainText.value, {
      includePosition: false,
      dedupe: true,
    })
  }

  return entityReferences
})

const storyHarnessEntityStats = computed(() => {
  const grouped = groupEntitiesByType(storyHarnessEntityReferences.value)

  return {
    characters: Math.max(activeScopeCharacters.value.length, grouped.character.length),
    locations: grouped.location.length,
    items: grouped.item.length,
    concepts: grouped.concept.length,
  }
})

const { workflowContext, activeEntities } = useWorkflowContext({
  projectId: currentProjectId,
  chapterId: displayChapterId,
  chapterTitle: displayChapterTitle,
  scopeLabel: currentScopeLabel,
  activeCharacters: activeScopeCharacters,
  activeRelations: activeScopeRelations,
  changeRequests: storyHarnessChangeRequests,
  entityReferences: storyHarnessEntityReferences,
  entityStats: storyHarnessEntityStats,
})

const proofreadIgnoredTerms = computed(() => {
  const terms = new Set<string>()
  const addTerm = (term?: string) => {
    const normalized = term?.trim()
    if (normalized) terms.add(normalized)
  }

  for (const character of writerStore.characters.list || []) {
    addTerm(character.name)
    for (const alias of character.alias || []) addTerm(alias)
  }
  for (const location of writerStore.locations.list || []) {
    addTerm(location.name)
  }
  for (const entity of activeEntities.value) {
    addTerm(entity.name)
  }

  return Array.from(terms)
})

const safeCurrentProjectId = computed(() => currentProjectId.value || '')

const { sceneStage, updateSceneStageDraft, advanceSceneStageBeat, startNewSceneStage } = useWriterSceneStage({
  projectId: safeCurrentProjectId,
  chapterId: displayChapterId,
  chapterTitle: displayChapterTitle,
  scopeLabel: currentScopeLabel,
  workflowContext,
  activeEntities,
  changeRequests: storyHarnessChangeRequests,
  chapters: flatChapters,
})

const unwrapConceptList = <T,>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return ((payload as Record<string, unknown>).data as T) ?? ([] as unknown as T)
  }
  return (payload as T) ?? ([] as unknown as T)
}

const handleEditorEntityScan = async (refs: Array<{ id?: string; name: string; type: string }>) => {
  if (!currentProjectId.value || !displayChapterId.value) {
    return
  }

  try {
    const [items, organizations, conceptPayload] = await Promise.all([
      listEntities(currentProjectId.value, 'item').catch(() => []),
      listEntities(currentProjectId.value, 'organization').catch(() => []),
      conceptApi.list(currentProjectId.value).catch(() => []),
      writerStore.loadCharacters(currentProjectId.value).catch(() => undefined),
      writerStore.loadLocations(currentProjectId.value).catch(() => undefined),
    ])

    const candidates = extractWriterAssetCandidates({
      text: currentChapterPlainText.value,
      characters: writerStore.characters.list || [],
      locations: writerStore.locations.list || [],
      items,
      organizations,
      concepts: unwrapConceptList(conceptPayload),
      entityReferences: refs,
    }).filter((candidate) => !candidate.unresolved)

    replaceScopeAssetRefs({
      projectId: currentProjectId.value,
      scopeType: 'chapter',
      scopeId: displayChapterId.value,
      candidates,
    })
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[ProjectWorkspace] 同步章节资产引用失败:', error)
    }
  }
}

const validationSampleAssetRefSeeded = ref(false)

const unwrapEditorContent = (payload: unknown): string => {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const record = payload as Record<string, unknown>
  const data = record.data && typeof record.data === 'object' ? (record.data as Record<string, unknown>) : record
  return typeof data.content === 'string' ? data.content : ''
}

const ensureValidationSampleAssetRefs = async (projectId: string) => {
  if (validationSampleAssetRefSeeded.value || projectId !== 'local-validation-yunlan') {
    return
  }

  const validationSampleEnabled =
    route.query.validationSample === 'true' || route.query.validationSample === '1'
  if (!validationSampleEnabled) {
    return
  }

  validationSampleAssetRefSeeded.value = true

  try {
    const chapters = flatChapters.value.filter((chapter) => chapter.nodeType !== 'directory')
    if (chapters.length === 0) {
      return
    }

    const [items, organizations, conceptPayload] = await Promise.all([
      listEntities(projectId, 'item').catch(() => []),
      listEntities(projectId, 'organization').catch(() => []),
      conceptApi.list(projectId).catch(() => []),
      writerStore.loadCharacters(projectId).catch(() => undefined),
      writerStore.loadLocations(projectId).catch(() => undefined),
    ])

    const concepts = unwrapConceptList<Array<{ id: string; name: string; alias?: string[] }>>(
      conceptPayload,
    )
    const entries = await Promise.all(
      chapters.map(async (chapter) => {
        const contentPayload = await editorApi.getContent(chapter.id).catch(() => null)
        const rawContent = unwrapEditorContent(contentPayload)
        const text = extractPlainTextFromEditorContent(rawContent)
        let entityReferences: EntityReference[] = []
        try {
          entityReferences = extractEntitiesFromTipTapContent(JSON.parse(rawContent))
        } catch {
          entityReferences = parseEntityReferences(text, { includePosition: false })
        }
        const candidates = extractWriterAssetCandidates({
          text,
          characters: writerStore.characters.list || [],
          locations: writerStore.locations.list || [],
          items,
          organizations,
          concepts,
          entityReferences,
        }).filter((candidate) => !candidate.unresolved)

        return {
          chapterId: chapter.id,
          candidates,
        }
      }),
    )

    replaceProjectChapterAssetRefs({
      projectId,
      entries,
    })
  } catch (error) {
    validationSampleAssetRefSeeded.value = false
    if (import.meta.env.DEV) {
      console.warn('[ProjectWorkspace] 初始化验证样本资产引用失败:', error)
    }
  }
}

// =======================
// UI 状态
// =======================
const isStoryHarnessTriggering = ref(false)
const aiActionTrigger = ref<WriterAIActionTrigger | null>(null)
const aiApplyFeedback = ref<WriterAIApplyFeedback | null>(null)
const latestSelectionContext = ref<{ text: string; from: number; to: number } | null>(null)
const draftProposals = ref<WriterDraftProposal[]>([])
const visibleDraftProposals = computed(() =>
  draftProposals.value.filter(
    (proposal) =>
      proposal.projectId === currentProjectId.value &&
      proposal.chapterId === displayChapterId.value,
  ),
)
const boundProjectId = computed({
  get: () => safeCurrentProjectId.value,
  set: (value: string) => {
    currentProjectId.value = value
  },
})

// =======================
// 事件处理
// =======================
const resetWorkflowTransientState = (options?: { clearActionTrigger?: boolean }) => {
  if (options?.clearActionTrigger ?? true) {
    aiActionTrigger.value = null
  }
  aiApplyFeedback.value = null
  latestSelectionContext.value = null
}

const retireWorkflowActionSession = () => {
  aiActionTrigger.value = null
  latestSelectionContext.value = null
}

const resolveCurrentDocumentParentId = () => {
  const currentDoc = availableDocMap.value.get(currentChapterId.value)
  if (!currentDoc) {
    return undefined
  }

  if (currentDoc.type === DocumentType.VOLUME) {
    return currentDoc.id
  }

  const parentId = currentDoc.parentId
  if (!parentId) {
    return undefined
  }

  const parentDoc = availableDocMap.value.get(parentId)
  return parentDoc?.type === DocumentType.VOLUME ? parentId : undefined
}

const getChapterSiblingsByParent = (parentId?: string) =>
  flatChapters.value.filter(
    (chapter) =>
      chapter.nodeType !== 'directory' &&
      (chapter.parentId || undefined) === (parentId || undefined),
  )

const resolveNextChapterOrder = (parentId?: string) => {
  const siblingOrders = getChapterSiblingsByParent(parentId)
    .map((chapter) => Number(availableDocMap.value.get(chapter.id)?.order ?? chapter.sortOrder ?? 0))
    .filter((order) => Number.isFinite(order))

  if (siblingOrders.length === 0) {
    return 0
  }

  return Math.max(...siblingOrders) + 1
}

const buildDefaultChapterDraft = (parentId?: string) => {
  const siblingCount = getChapterSiblingsByParent(parentId).length

  return {
    title: formatDefaultChapterTitle(siblingCount + 1),
    order: resolveNextChapterOrder(parentId),
  }
}

const focusCurrentTitleInput = async () => {
  switchEditorLayoutTab('editor')
  await nextTick()
  await workspaceEditorContentRef.value?.focusTitleInput?.()
}

const handleAddDoc = async () => {
  if (!currentProjectId.value) {
    message.warning('请先选择项目')
    return
  }

  try {
    const parentId = resolveCurrentDocumentParentId()
    const { title, order } = buildDefaultChapterDraft(parentId)
    const newDoc = await documentStore.create(currentProjectId.value, {
      title,
      type: DocumentType.CHAPTER,
      projectId: currentProjectId.value,
      parentId,
      order,
    })

    if (!newDoc?.id) {
      message.error('创建章节失败')
      return
    }

    currentChapterId.value = newDoc.id
    const nextQuery = { ...route.query } as LocationQueryRaw
    nextQuery.chapterId = newDoc.id
    nextQuery.tool = 'writing'
    delete nextQuery.encyclopediaView
    await router.replace({ query: nextQuery })
    await focusCurrentTitleInput()
    showChapterCreatedFeedback(newDoc.title || title)
  } catch (error) {
    console.error('[ProjectWorkspace] 创建章节失败:', error)
    message.error('创建章节失败，请重试')
  }
}

const handleOpenDirectoryOutline = async (directoryId: string) => {
  if (!directoryId) return

  editorStore.setActiveTool('writing')
  if (currentChapterId.value !== directoryId) {
    currentChapterId.value = directoryId
    return
  }
  const outlineContent = buildDirectoryOutline(directoryId)
  editorStore.setContent(outlineContent, false)
  editorStore.editorContent = outlineContent
  editorStore.markSaved()
  if (route.query.tool !== 'writing') {
    await router.replace({ query: { ...route.query, tool: 'writing' } as LocationQueryRaw })
  }
}

const refreshWorkspaceStatistics = async () => {
  if (!currentProjectId.value) {
    return
  }

  await Promise.allSettled([
    documentStore.loadTree(currentProjectId.value),
    projectStore.loadDetail(currentProjectId.value),
  ])
}

const handleTipTapSave = async (contents?: unknown[], options: SaveOptions = {}) => {
  if (!currentChapterId.value) {
    if (!options.silent) {
      message.warning('请先选择要保存的章节')
    }
    return
  }
  clearAutoSaveTimer()
  try {
    const contentsToSave =
      contents && Array.isArray(contents) && contents.length > 0
        ? contents
        : buildCurrentEditorContents()

    await editorStore.saveParagraphs(
      contentsToSave as Array<{
        paragraphId?: string
        order: number
        content: string
        contentType?: string
      }>,
    )
    lastSavedContentSignature.value = getContentSignature()
    await refreshWorkspaceStatistics()
    if (options.refreshHarness !== false) {
      await persistCurrentLiveChangeRequests()
      await refreshAfterSave()
    }
    // 保存成功静默处理，不显示弹窗，状态栏会显示保存状态
  } catch (error) {
    console.error('[ProjectWorkspace] 保存失败:', error)
    if (!options.silent) {
      message.error('保存失败，请重试')
    }
  }
}

const scheduleAutoSave = () => {
  if (!editorStore.autosaveEnabled || !currentChapterId.value) {
    return
  }
  clearAutoSaveTimer()
  autoSaveTimer = window.setTimeout(() => {
    autoSaveTimer = null
    void handleTipTapSave(undefined, { silent: true, refreshHarness: false })
  }, AUTO_SAVE_DELAY_MS)
}

const handleStoryHarnessTriggerIndex = async () => {
  if (!currentProjectId.value || !displayChapterId.value || isStoryHarnessTriggering.value) {
    return
  }

  isStoryHarnessTriggering.value = true
  try {
    const result = await triggerIndexAndRefresh()
    if (!result) {
      message.info('当前章节暂时无法生成建议，请稍后重试')
      return
    }

    if (result.pending > 0) {
      message.success(`已生成 ${result.pending} 条待处理建议`)
      return
    }

    message.info('已完成索引，本次没有新增建议')
  } catch (error) {
    console.error('[ProjectWorkspace] 手动触发 Story Harness 索引失败:', error)
    message.error('生成建议失败，请重试')
  } finally {
    isStoryHarnessTriggering.value = false
  }
}

const handleExportDraft = () => {
  message.info('导出功能已接入入口，后续可绑定实际导出流程')
}

const handleShareDraft = async () => {
  const shareUrl = window.location.href
  if (!navigator?.clipboard?.writeText) {
    message.info('当前环境不支持自动复制，请手动复制地址栏链接')
    return
  }
  try {
    await navigator.clipboard.writeText(shareUrl)
    message.success('分享链接已复制到剪贴板')
  } catch {
    message.error('复制失败，请手动复制地址栏链接')
  }
}

const handleBackToDashboard = () => {
  router.push('/writer')
}

const handleRenameCurrentDocument = async (title: string) => {
  if (!currentChapterId.value) {
    return
  }

  const nextTitle = title.trim()
  if (!nextTitle) {
    message.warning('标题不能为空')
    return
  }

  try {
    await updateDocument(currentChapterId.value, { title: nextTitle })

    if (currentProjectId.value) {
      await documentStore.loadTree(currentProjectId.value)
    }

    if (writerStore.currentDocument?.id === currentChapterId.value) {
      writerStore.currentDocument = {
        ...writerStore.currentDocument,
        title: nextTitle,
      }
    }
  } catch (error) {
    console.error('[ProjectWorkspace] 重命名文档失败:', error)
    message.error('更新标题失败，请重试')
  }
}

const handleDeleteChapter = async (docId: string) => {
  try {
    await messageBox.confirm('确定删除该章节吗？此操作不可恢复', '警告', { type: 'warning' })
    await documentStore.remove(docId)
    if (docId === currentChapterId.value) {
      editorStore.reset()
    }
  } catch {
    // cancel
  }
}

// 处理章节 ID 更新（从侧边栏选择章节）
const handleChapterIdUpdate = async (chapterId: string) => {
  if (!chapterId) return

  // 其他视图切换到写作模式
  const nextQuery = { ...route.query } as LocationQueryRaw
  nextQuery.chapterId = chapterId
  nextQuery.tool = 'writing'
  delete nextQuery.encyclopediaView
  await router.replace({ query: nextQuery })
  showChapterSwitchFeedback(chapterId)
}

const handleOpenGraph = async (chapterId: string) => {
  if (chapterId) {
    toolOverlayChapterId.value = chapterId
    toolOverlayChapterTitle.value = resolveChapterTitle(chapterId)
  } else {
    toolOverlayChapterId.value = ''
    toolOverlayChapterTitle.value = ''
  }

  workspaceEditorContentRef.value?.openFullscreenTool('relations')
}

// 处理大纲节点选择 - 设置当前节点并加载关联文档内容
const handleOutlineSelect = async (node: OutlineNode) => {
  // 设置当前选中的大纲节点
  writerStore.setCurrentOutlineNode(node)

  // 如果节点关联了文档，切换到该文档
  if (node.documentId) {
    // 切换到写作模式并加载文档
    editorStore.setActiveTool('writing')
    currentChapterId.value = node.documentId
    const nextQuery = { ...route.query } as LocationQueryRaw
    nextQuery.chapterId = node.documentId
    nextQuery.tool = 'writing'
    delete nextQuery.encyclopediaView
    await router.replace({ query: nextQuery })
    showChapterSwitchFeedback(node.documentId, node.title)
  }
}

// 处理创建大纲根节点
const handleCreateOutlineRoot = async () => {
  try {
    // 生成默认标题
    const volumeCount = flatChapters.value.filter((ch) => ch.nodeType === 'directory').length
    const defaultTitle = formatDefaultVolumeTitle(volumeCount + 1)

    // 创建卷（volume），后端会自动同步创建对应的大纲节点
    await createDocument(currentProjectId.value, {
      projectId: currentProjectId.value,
      title: defaultTitle,
      type: DocumentType.VOLUME,
      order: volumeCount,
    })

    // 重新加载数据
    await Promise.all([documentStore.loadTree(currentProjectId.value), loadOutlineTree()])

    message.success(`已创建 ${defaultTitle}`)
  } catch (error) {
    console.error('[ProjectWorkspace] 创建大纲根节点失败:', error)
    message.error('创建失败，请重试')
  }
}

// 处理创建大纲子节点
const handleCreateOutlineChild = async (data?: CreateOutlineRequest) => {
  try {
    const currentNode = writerStore.outline.currentNode
    if (!currentNode) {
      message.warning('请先选择父节点')
      return
    }

    // 如果没有传入数据，使用默认值创建
    const createData: CreateOutlineRequest = data || {
      title: '新节点',
      parentId: currentNode.id,
    }

    // 确保 parentId 设置正确
    if (!createData.parentId) {
      createData.parentId = currentNode.id
    }

    await outlineApi.create(currentProjectId.value, createData)
    message.success('创建成功')

    // 重新加载大纲树
    await loadOutlineTree()
  } catch (error) {
    console.error('[ProjectWorkspace] 创建大纲子节点失败:', error)
    message.error('创建失败')
  }
}

// 处理大纲节点转为章节
const handleConvertToChapter = async (payload: {
  outlineNode: OutlineNode
  volumeNode: OutlineNode
}) => {
  try {
    const { outlineNode, volumeNode } = payload

    // 获取目标卷下已有章节数量，用于生成默认章节标题
    const volumeChildren = flatChapters.value.filter((ch) => ch.parentId === volumeNode.documentId)
    const chapterCount = volumeChildren.length + 1
    const defaultTitle = formatDefaultChapterTitle(chapterCount)

    // 在对应卷下创建新章节
    const newDoc = await createDocument(currentProjectId.value, {
      projectId: currentProjectId.value,
      parentId: volumeNode.documentId,
      title: defaultTitle,
      type: DocumentType.CHAPTER,
      order: chapterCount - 1,
    })

    // 标记原大纲节点为已转换（通过更新 summary 或添加标记）
    // 这里我们添加一个标记表明已转换
    await outlineApi.update(outlineNode.id, currentProjectId.value, {
      summary: `[已转换为章节] ${outlineNode.title}`,
      // 可以考虑添加一个 converted 标记字段
    })

    // 重新加载数据
    await Promise.all([documentStore.loadTree(currentProjectId.value), loadOutlineTree()])

    message.success(`已在"${volumeNode.title}"下生成"${defaultTitle}"`)

    // createDocument 可能返回 AxiosResponse，也可能直接返回文档对象
    const createdDoc = ((newDoc as { data?: { id?: string; documentId?: string } })?.data ||
      newDoc) as {
      id?: string
      documentId?: string
    }

    // 自动选中新创建的章节，进入编辑态
    const newDocId = createdDoc.id ?? createdDoc.documentId ?? ''
    if (newDocId) {
      currentChapterId.value = newDocId
      const nextQuery = { ...route.query } as LocationQueryRaw
      nextQuery.chapterId = newDocId
      nextQuery.tool = 'writing'
      delete nextQuery.encyclopediaView
      await router.replace({ query: nextQuery })
      await focusCurrentTitleInput()
      showChapterCreatedFeedback(defaultTitle)
    }
  } catch (error) {
    console.error('[ProjectWorkspace] 转为章节失败:', error)
    message.error('转为章节失败，请重试')
  }
}

// 处理编辑选中节点
const handleEditOutlineNode = async (data?: UpdateOutlineRequest) => {
  try {
    const currentNode = writerStore.outline.currentNode
    if (!currentNode) {
      message.warning('请先选择要编辑的节点')
      return
    }

    // 如果没有传入数据，不执行更新
    if (!data) {
      message.warning('没有修改数据')
      return
    }

    await outlineApi.update(currentNode.id, currentProjectId.value, data)
    message.success('保存成功')

    // 重新加载大纲树
    await loadOutlineTree()
  } catch (error) {
    console.error('[ProjectWorkspace] 编辑大纲节点失败:', error)
    message.error('编辑失败')
  }
}

// 处理删除选中节点
const handleDeleteOutlineNode = async () => {
  try {
    const currentNodeId = writerStore.outline.currentNode?.id
    if (!currentNodeId) {
      message.warning('请先选择要删除的节点')
      return
    }

    await messageBox.confirm('确定删除该大纲节点吗？此操作不可恢复', '警告', { type: 'warning' })

    await outlineApi.delete(currentNodeId, currentProjectId.value)
    message.success('删除成功')

    // 重新加载大纲树
    await loadOutlineTree()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('[ProjectWorkspace] 删除大纲节点失败:', error)
      message.error('删除失败')
    }
  }
}

// 处理节点移动（上移/下移）
const handleMoveOutlineNode = async (direction: 'up' | 'down') => {
  // 获取选中的大纲节点
  const currentNode = writerStore.outline.currentNode
  if (!currentNode) {
    message.warning('请先选择要移动的节点')
    return
  }

  // 获取同级节点列表
  const siblings = currentNode.parentId
    ? writerStore.outline.tree.find((node) => node.id === currentNode.parentId)?.children || []
    : writerStore.outline.tree

  const orderedSiblings = [...siblings].sort(
    (left, right) => (left.order ?? 0) - (right.order ?? 0),
  )
  const currentIndex = orderedSiblings.findIndex((node) => node.id === currentNode.id)

  if (currentIndex < 0) {
    message.warning('无法找到节点位置')
    return
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  const swapNode = orderedSiblings[targetIndex]

  if (!swapNode) {
    message.warning(direction === 'up' ? '已经是第一个' : '已经是最后一个')
    return
  }

  try {
    // 交换两个节点的 order 值
    const currentOrder = currentNode.order ?? currentIndex
    const swapOrder = swapNode.order ?? targetIndex

    // 并行更新两个节点
    await Promise.all([
      outlineApi.update(currentNode.id, currentProjectId.value, { order: swapOrder }),
      outlineApi.update(swapNode.id, currentProjectId.value, { order: currentOrder }),
    ])

    message.success(`节点已${direction === 'up' ? '上移' : '下移'}`)

    // 重新加载大纲树
    await loadOutlineTree()
  } catch (error) {
    console.error('[ProjectWorkspace] 移动大纲节点失败:', error)
    message.error('移动失败')
  }
}

// 加载大纲树
const loadOutlineTree = async () => {
  try {
    writerStore.outline.loading = true
    writerStore.outline.tree = await outlineApi.getTree(currentProjectId.value)
  } catch (error) {
    console.error('[ProjectWorkspace] 加载大纲树失败:', error)
    message.error('加载大纲树失败')
    writerStore.outline.tree = []
  } finally {
    writerStore.outline.loading = false
  }
}

// 处理打开全屏工具
const workspaceEditorContentRef = ref<InstanceType<typeof WorkspaceEditorContent> | null>(null)
const editorLayoutRef = ref<InstanceType<typeof EditorLayout> | null>(null)
const toolOverlayChapterId = ref<string | undefined>(undefined)
const toolOverlayChapterTitle = ref<string | undefined>(undefined)

const resolveChapterTitle = (chapterId: string) => {
  if (!chapterId) return ''
  return (
    flatChapters.value.find((chapter) => chapter.id === chapterId)?.title ||
    availableDocMap.value.get(chapterId)?.title ||
    ''
  )
}

const normalizeToolOverlayScope = (chapterId?: string) => {
  if (typeof chapterId === 'string') {
    toolOverlayChapterId.value = chapterId
    toolOverlayChapterTitle.value = chapterId ? resolveChapterTitle(chapterId) : ''
    return
  }

  toolOverlayChapterId.value = undefined
  toolOverlayChapterTitle.value = undefined
}

const mapLegacyEncyclopediaViewToTool = (subView: string): ToolType => {
  if (subView === 'timeline') return 'timeline'
  if (subView === 'branches') return 'branches'
  if (subView === 'structure') return 'structure'
  return 'relations'
}

const handleOpenFullscreenTool = (tool: string, chapterId?: string) => {
  normalizeToolOverlayScope(chapterId)
  workspaceEditorContentRef.value?.openFullscreenTool(tool)
}

/** 关闭全屏覆盖层 */
const handleCloseFullscreen = () => {
  workspaceEditorContentRef.value?.closeFullscreen()
  normalizeToolOverlayScope()
  workspaceStatusChips.value = []
}

// 不再需要的 emit 定义，删除
void handleCloseFullscreen

const handleWorkflowAction = (payload: WriterWorkflowActionRequest) => {
  panelStore.setRightCollapsed(false)
  workspaceLayoutStore.setRightToolActive('ai')
  resetWorkflowTransientState({ clearActionTrigger: false })
  const normalizedText = payload.text?.trim() || currentChapterPlainText.value
  latestSelectionContext.value =
    typeof payload.from === 'number' && typeof payload.to === 'number'
      ? {
          text: normalizedText,
          from: payload.from,
          to: payload.to,
        }
      : null
  aiActionTrigger.value = buildWriterAIActionTrigger(
    {
      ...payload,
      text: normalizedText,
    },
    workflowContext.value,
  )
}

const resolveCreatedDocumentId = (created: unknown): string => {
  const record = ((created as { data?: unknown })?.data || created) as {
    id?: string
    documentId?: string
  }
  return record.id ?? record.documentId ?? ''
}

const flattenOutlineNodes = (nodes: OutlineNode[]): OutlineNode[] =>
  nodes.flatMap((node) => [node, ...flattenOutlineNodes(node.children || [])])

const findOutlineNodeByDocumentId = (documentId: string) =>
  flattenOutlineNodes(writerStore.outline.tree).find((node) => node.documentId === documentId) ||
  null

const resolveCurrentVolumeDocument = () => {
  const currentDoc = availableDocMap.value.get(currentChapterId.value)
  if (!currentDoc) {
    return null
  }

  if (currentDoc.type === DocumentType.VOLUME) {
    return currentDoc
  }

  if (currentDoc.parentId) {
    const parentDoc = availableDocMap.value.get(currentDoc.parentId)
    if (parentDoc?.type === DocumentType.VOLUME) {
      return parentDoc
    }
  }

  return null
}

const buildStructureDocumentTitle = (
  mode: WriterStructurePlanPayload['mode'],
  rawTitle: string,
  sequence: number,
) => {
  const cleaned = rawTitle
    .replace(/^第[\d一二三四五六七八九十百千]+[卷章节回]\s*/u, '')
    .replace(/^(卷|章节?)\s*[:：-]?\s*/u, '')
    .trim()

  if (mode === 'volume') {
    const defaultTitle = formatDefaultVolumeTitle(sequence)
    return cleaned ? `${defaultTitle} ${cleaned}` : defaultTitle
  }

  const defaultTitle = formatDefaultChapterTitle(sequence)
  return cleaned ? `${defaultTitle} ${cleaned}` : defaultTitle
}

const normalizeStructureDocumentTitle = (rawTitle: string) =>
  rawTitle
    .replace(/^第[\d一二三四五六七八九十百千]+[卷章节回]\s*/u, '')
    .replace(/^(卷|章节?)\s*[:：-]?\s*/u, '')
    .trim()

const handleCreateStructurePlan = async (payload: WriterStructurePlanPayload) => {
  if (!currentProjectId.value || payload.items.length === 0) {
    return
  }

  const volumeDocs = Array.from(availableDocMap.value.values()).filter(
    (doc) => doc.type === DocumentType.VOLUME,
  )
  const currentVolumeDoc = resolveCurrentVolumeDocument()
  const importTarget = payload.importTarget || 'project-root'
  const duplicateStrategy = payload.duplicateStrategy || 'allow_duplicate'
  const chapterParentId =
    payload.mode === 'chapter' && importTarget === 'current-volume'
      ? currentVolumeDoc?.id
      : undefined
  const chapterSiblingDocs =
    payload.mode === 'chapter'
      ? Array.from(availableDocMap.value.values()).filter(
          (doc) => doc.type === DocumentType.CHAPTER && doc.parentId === chapterParentId,
        )
      : []
  const outlineParentNode =
    payload.mode === 'chapter' && chapterParentId
      ? findOutlineNodeByDocumentId(chapterParentId)
      : null
  const existingChapterTitleSet =
    payload.mode === 'chapter'
      ? new Set(chapterSiblingDocs.map((doc) => normalizeStructureDocumentTitle(doc.title)))
      : new Set<string>()

  try {
    const createdDocumentIds: string[] = []
    let skippedCount = 0

    for (const [index, item] of payload.items.entries()) {
      const normalizedItemTitle = normalizeStructureDocumentTitle(item.title)
      if (
        payload.mode === 'chapter' &&
        duplicateStrategy === 'skip_existing' &&
        existingChapterTitleSet.has(normalizedItemTitle)
      ) {
        skippedCount += 1
        continue
      }

      const sequenceBase = payload.mode === 'volume' ? volumeDocs.length : chapterSiblingDocs.length
      const title = buildStructureDocumentTitle(payload.mode, item.title, sequenceBase + index + 1)
      const created = await createDocument(currentProjectId.value, {
        projectId: currentProjectId.value,
        parentId: payload.mode === 'chapter' ? chapterParentId : undefined,
        title,
        type: payload.mode === 'volume' ? DocumentType.VOLUME : DocumentType.CHAPTER,
        order: sequenceBase + index,
      })
      const createdDocumentId = resolveCreatedDocumentId(created)
      if (createdDocumentId) {
        createdDocumentIds.push(createdDocumentId)
      }

      if (payload.mode === 'chapter' && createdDocumentId) {
        existingChapterTitleSet.add(normalizedItemTitle)
        await outlineApi.create(currentProjectId.value, {
          parentId: outlineParentNode?.id,
          title,
          type: 'chapter',
          summary: item.summary || item.reason || payload.summary,
          documentId: createdDocumentId,
          order: chapterSiblingDocs.length + index,
        })
      }
    }

    await Promise.all([documentStore.loadTree(currentProjectId.value), loadOutlineTree()])

    if (payload.mode === 'chapter' && createdDocumentIds[0]) {
      currentChapterId.value = createdDocumentIds[0]
      const nextQuery = { ...route.query } as LocationQueryRaw
      nextQuery.chapterId = createdDocumentIds[0]
      nextQuery.tool = 'writing'
      delete nextQuery.encyclopediaView
      await router.replace({ query: nextQuery })
      await focusCurrentTitleInput()
      showChapterCreatedFeedback(resolveChapterTitle(createdDocumentIds[0]))
    }

    const createdCount = createdDocumentIds.length
    const skippedText =
      payload.mode === 'chapter' && duplicateStrategy === 'skip_existing' && skippedCount > 0
        ? `，已跳过 ${skippedCount} 个重复章节`
        : ''
    const successText =
      payload.mode === 'volume'
        ? `已创建 ${createdCount} 个 AI 卷草案`
        : createdCount > 0
          ? `已创建 ${createdCount} 个 AI 章节草案${skippedText}`
          : `未新增章节，已跳过 ${skippedCount} 个重复章节`

    if (createdCount > 0) {
      message.success(successText)
    } else {
      message.info(successText)
    }
  } catch (error) {
    console.error('[ProjectWorkspace] 创建 AI 结构草案失败:', error)
    message.error(payload.mode === 'volume' ? 'AI 增卷失败，请重试' : 'AI 增章节失败，请重试')
  }
}

const setAIApplyFeedback = (
  status: WriterAIApplyFeedback['status'],
  title: string,
  detail: string,
  mode?: WriterAIApplyFeedback['mode'],
) => {
  aiApplyFeedback.value = {
    status,
    title,
    detail,
    mode,
    updatedAt: Date.now(),
  }
}

const mapResultCandidateToProposal = (
  candidate: WriterResultCandidate,
): {
  kind: WriterDraftProposalKind
  source: WriterDraftProposalSource
  title: string
  summary: string
} => {
  if (candidate.source === 'summary') {
    return {
      kind: 'chapter-direction',
      source: 'summary-workbench',
      title: candidate.title || '章节方向提案',
      summary: candidate.summary || '已暂存为章节方向提案。',
    }
  }

  if (candidate.source === 'review') {
    return {
      kind: 'text-draft',
      source: 'review-workbench',
      title: candidate.title || '审校建议提案',
      summary: candidate.summary || '已暂存为审校建议提案。',
    }
  }

  return {
    kind: 'text-draft',
    source: candidate.source === 'rewrite' ? 'rewrite-workbench' : 'ai-chat',
    title: candidate.title || '正文候选提案',
    summary: candidate.summary || '已暂存为正文候选提案。',
  }
}

const handleProposalDraft = (candidate: WriterResultCandidate) => {
  const mapped = mapResultCandidateToProposal(candidate)
  const generatedText = candidate.generatedText.trim()

  if (!generatedText) {
    return
  }

  const existingProposal = draftProposals.value.find(
    (proposal) =>
      proposal.projectId === currentProjectId.value &&
      proposal.content.generatedText === generatedText &&
      proposal.chapterId === displayChapterId.value,
  )

  if (existingProposal) {
    existingProposal.source = mapped.source
    existingProposal.kind = mapped.kind
    existingProposal.title = mapped.title
    existingProposal.summary = mapped.summary
    existingProposal.content = {
      action: candidate.action,
      sourceText: candidate.sourceText,
      generatedText,
      workflowContextSignature: workflowContext.value.signature,
    }
    existingProposal.status = 'draft'
    existingProposal.updatedAt = Date.now()
    retireWorkflowActionSession()
    message.success('已更新现有提案草稿')
    return
  }

  const nextProposal: WriterDraftProposal = {
    id: `proposal-${Date.now()}`,
    projectId: currentProjectId.value,
    chapterId: displayChapterId.value || undefined,
    source: mapped.source,
    kind: mapped.kind,
    title: mapped.title,
    summary: mapped.summary,
    content: {
      action: candidate.action,
      sourceText: candidate.sourceText,
      generatedText,
      workflowContextSignature: workflowContext.value.signature,
    },
    status: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  draftProposals.value = [nextProposal, ...draftProposals.value].slice(0, 5)
  retireWorkflowActionSession()

  message.success('已暂存到提案草稿')
}

const handleProposalStatusChange = (payload: {
  proposalId: string
  status: WriterDraftProposalStatus
}) => {
  const now = Date.now()
  const chapterScopedId = displayChapterId.value || undefined
  const targetProposal = draftProposals.value.find(
    (proposal) =>
      proposal.id === payload.proposalId &&
      proposal.projectId === currentProjectId.value &&
      proposal.chapterId === chapterScopedId,
  )

  draftProposals.value = draftProposals.value.map((proposal) =>
    proposal.id === payload.proposalId
      ? {
          ...proposal,
          status: payload.status,
          updatedAt: now,
        }
      : payload.status === 'selected' &&
          proposal.projectId === currentProjectId.value &&
          proposal.chapterId === chapterScopedId &&
          proposal.status === 'selected'
        ? {
            ...proposal,
            status: 'draft',
            updatedAt: now,
          }
        : proposal,
  )

  if (payload.status === 'selected') {
    message.success('已保留当前提案方向')
    return
  }

  if (payload.status === 'discarded') {
    message.info(targetProposal?.status === 'selected' ? '已移出当前提案' : '已丢弃当前提案')
  }
}

// ── AI 内联 Diff 回调 ──────────────────────────
setDiffCallbacks(
  // 接受：将新文本正式写入编辑器
  (diff: PendingDiff) => {
    const tiptapEditor = editorStore.tipTapEditor
    if (!tiptapEditor) return

    const docSize = tiptapEditor.state.doc.content.size
    const from = Math.min(diff.from, diff.to)
    const to = Math.max(diff.from, diff.to)
    if (from < 0 || to > docSize || from > to) return

    if (diff.applyMode === 'replace_selection') {
      if (!diff.oldText.includes('\n') && !diff.newText.includes('\n')) {
        tiptapEditor.chain().focus().insertContentAt({ from, to }, diff.newText).run()
      } else {
        const insertionDoc = JSON.parse(buildEditorContentFromPlainText(diff.newText)) as {
          content?: unknown[]
        }
        const insertionContent =
          insertionDoc.content && insertionDoc.content.length > 0
            ? insertionDoc.content
            : [{ type: 'paragraph' }]
        tiptapEditor.chain().focus().insertContentAt({ from, to }, insertionContent).run()
      }
    } else {
      const insertionDoc = JSON.parse(buildEditorContentFromPlainText(diff.newText)) as {
        content?: unknown[]
      }
      const insertionContent =
        insertionDoc.content && insertionDoc.content.length > 0
          ? insertionDoc.content
          : [{ type: 'paragraph' }]
      tiptapEditor.chain().focus().insertContentAt(to, insertionContent).run()
    }

    const nextJson = JSON.stringify(tiptapEditor.getJSON())
    tipTapContent.value = nextJson
    editorStore.editorContent = nextJson
    clearPendingDiffs()
    writerStore.setSelectedText('')
    latestSelectionContext.value = null
    setAIApplyFeedback(
      'success',
      diff.applyMode === 'insert_after_selection' ? '已接受续写建议' : '已接受正文修改',
      diff.applyMode === 'insert_after_selection'
        ? 'AI 结果已插入到当前片段后方。'
        : 'AI 结果已正式写入正文编辑器。',
      diff.applyMode,
    )
    retireWorkflowActionSession()
    message.success('已接受 AI 建议')
  },
  // 拒绝：清除 diff，保持原文
  (diff: PendingDiff) => {
    clearPendingDiffs()
    writerStore.setSelectedText('')
    latestSelectionContext.value = null
    setAIApplyFeedback(
      'fallback',
      '已放弃本次 AI 修改',
      diff.applyMode === 'insert_after_selection'
        ? '续写建议已撤回，正文保持原样。'
        : '正文修改已撤回，原文保持不变。',
      diff.applyMode,
    )
    retireWorkflowActionSession()
    message.info('已拒绝 AI 建议')
  },
)

const handleAIApplyGeneratedText = (payload: WriterAIApplyPayload) => {
  void applyAIResultToWorkspace(payload)
}

async function ensureAIApplyTargetDocument(payload: WriterAIApplyPayload) {
  const targetDocumentId = payload.targetDocumentId?.trim()
  if (!targetDocumentId || targetDocumentId === displayChapterId.value) {
    return
  }

  const targetDocumentTitle =
    payload.targetDocumentTitle?.trim() || resolveChapterTitle(targetDocumentId) || targetDocumentId

  setAIApplyFeedback(
    'idle',
    '正在切换目标章节',
    `准备切换到《${targetDocumentTitle}》并挂起正文 diff。`,
    payload.applyMode,
  )

  await handleChapterIdUpdate(targetDocumentId)

  const targetDocument = availableDocMap.value.get(targetDocumentId)
  if (targetDocument) {
    await documentStore.selectDocument(targetDocument)
  }
  await editorStore.loadDocument(targetDocumentId)
  latestSelectionContext.value = null
  writerStore.setSelectedText('')
  await nextTick()
}

async function applyAIResultToWorkspace(payload: WriterAIApplyPayload) {
  await ensureAIApplyTargetDocument(payload)

  const generatedText = (payload.generatedText || '').trim()
  if (!generatedText) return

  const tiptapEditor = editorStore.tipTapEditor
  const selectionContext = latestSelectionContext.value
  const requestedApplyMode = payload.applyMode || aiActionTrigger.value?.applyMode
  const currentDocumentText = currentChapterPlainText.value.trim()

  if (tiptapEditor) {
    const docSize = tiptapEditor.state.doc.content.size
    const hasSelectionContext = !!selectionContext
    const shouldDiffWholeDocument =
      !hasSelectionContext &&
      requestedApplyMode === 'replace_document' &&
      !!generatedText &&
      payload.sourceText.trim() === currentDocumentText

    if (hasSelectionContext || shouldDiffWholeDocument) {
      const from = hasSelectionContext ? Math.min(selectionContext.from, selectionContext.to) : 0
      const to = hasSelectionContext
        ? Math.max(selectionContext.from, selectionContext.to)
        : docSize
      const oldText = hasSelectionContext
        ? tiptapEditor.state.doc.textBetween(from, to, '\n')
        : tiptapEditor.state.doc.textBetween(0, docSize, '\n')

      if (from >= 0 && to <= docSize && from <= to) {
        registerPendingDiff({
          id: `diff-${Date.now()}`,
          from,
          to,
          oldText,
          newText: generatedText,
          applyMode:
            requestedApplyMode === 'insert_after_selection'
              ? 'insert_after_selection'
              : 'replace_selection',
        })
        tiptapEditor.view.dispatch(tiptapEditor.state.tr.setMeta('aiDiff', { updated: true }))
        setAIApplyFeedback(
          'idle',
          shouldDiffWholeDocument ? '整章 Diff 已就绪' : '选区 Diff 已就绪',
          shouldDiffWholeDocument
            ? '请在正文编辑器内接受或放弃这次整章修改。'
            : '请在正文编辑器内接受或放弃这次选区修改。',
          requestedApplyMode,
        )
        message.info('AI 建议已显示在正文编辑器中，请直接接受或拒绝')
        return
      }
    }
  }

  // fallback：无选区时，仍直接写入

  if (
    tiptapEditor &&
    selectionContext &&
    (requestedApplyMode === 'replace_selection' || requestedApplyMode === 'insert_after_selection')
  ) {
    try {
      const docSize = tiptapEditor.state.doc.content.size
      const from = Math.min(selectionContext.from, selectionContext.to)
      const to = Math.max(selectionContext.from, selectionContext.to)
      const latestSelectedText = tiptapEditor.state.doc.textBetween(from, to, '\n').trim()
      const selectionStillMatches =
        !selectionContext.text.trim() || latestSelectedText === selectionContext.text.trim()

      if (from >= 0 && to <= docSize && from <= to && selectionStillMatches) {
        const insertionDoc = JSON.parse(buildEditorContentFromPlainText(generatedText)) as {
          content?: unknown[]
        }
        const insertionContent =
          insertionDoc.content && insertionDoc.content.length > 0
            ? insertionDoc.content
            : [{ type: 'paragraph' }]

        if (requestedApplyMode === 'replace_selection') {
          tiptapEditor.chain().focus().insertContentAt({ from, to }, insertionContent).run()
        } else {
          tiptapEditor.chain().focus().insertContentAt(to, insertionContent).run()
        }

        const nextJson = JSON.stringify(tiptapEditor.getJSON())
        tipTapContent.value = nextJson
        editorStore.editorContent = nextJson
        latestSelectionContext.value = null
        writerStore.setSelectedText('')
        setAIApplyFeedback(
          'success',
          '已按选区回填',
          requestedApplyMode === 'insert_after_selection'
            ? 'AI 结果已插入到原选区后方。'
            : 'AI 结果已替换当前选区。',
          requestedApplyMode,
        )
        retireWorkflowActionSession()
        message.success('AI 结果已应用到当前选区')
        return
      }

      if (!selectionStillMatches) {
        setAIApplyFeedback(
          'fallback',
          '选区已失效，改为安全回填',
          '原选区内容已变化，系统改为按段落/全文模式写回，避免覆盖错误位置。',
          requestedApplyMode,
        )
        message.info('原选区内容已发生变化，已改为按整段结果安全回填。')
      }
    } catch (error) {
      if (import.meta.env.DEV)
        console.warn(
          '[ProjectWorkspace] failed to apply AI result to selection, fallback to document mode:',
          error,
        )
      setAIApplyFeedback(
        'fallback',
        '定位选区失败，改为安全回填',
        '系统未能稳定定位原选区，已切换为文档级写回以避免内容损坏。',
        requestedApplyMode,
      )
    }
  }

  const sourceText = payload.sourceText || ''
  const currentEditorContent =
    tipTapContent.value || editorStore.editorContent || editorStore.content || ''
  const shouldReplaceWholeChapter =
    requestedApplyMode === 'replace_document' ||
    (!!sourceText.trim() && sourceText.trim() === currentChapterPlainText.value.trim())

  const nextEditorContent =
    requestedApplyMode === 'append_paragraph' ||
    payload.action === 'continue' ||
    payload.action === 'expand'
      ? appendPlainTextToEditorContent(currentEditorContent, generatedText)
      : shouldReplaceWholeChapter
        ? buildEditorContentFromPlainText(generatedText)
        : appendPlainTextToEditorContent(currentEditorContent, generatedText)

  tipTapContent.value = nextEditorContent
  editorStore.editorContent = nextEditorContent
  latestSelectionContext.value = null
  writerStore.setSelectedText('')
  setAIApplyFeedback(
    requestedApplyMode === 'replace_document' ? 'success' : 'fallback',
    requestedApplyMode === 'replace_document' ? '已整章替换' : '已按安全模式写回',
    requestedApplyMode === 'append_paragraph' ||
      payload.action === 'continue' ||
      payload.action === 'expand'
      ? 'AI 结果已追加为新的正文段落。'
      : requestedApplyMode === 'replace_document'
        ? 'AI 结果已完整替换当前章节正文。'
        : 'AI 结果已写回编辑器，但未直接覆盖原选区。',
    requestedApplyMode,
  )
  aiActionTrigger.value = null
  message.success('AI 结果已应用到编辑器')
}

// =======================
// 生命周期
// =======================
onMounted(async () => {
  if (route.query.redirect) {
    const nextQuery = { ...route.query } as LocationQueryRaw
    delete nextQuery.redirect
    await router.replace({ query: nextQuery })
  }

  // 恢复编辑器主题
  editorThemeStore.initTheme()
  editorAppearanceStore.initAppearance()
  const isStandaloneHost = isStandaloneWriterRuntime()
  let pId = currentProjectId.value
  let bootstrapChapterId = ''

  if (!pId && isStandaloneHost) {
    await projectStore.loadList()

    const lastProjectId = window.localStorage.getItem(STANDALONE_LAST_PROJECT_KEY) || ''
    const preferredProject =
      projectStore.projects.find((project) => project.id === lastProjectId) ||
      projectStore.projects[0]

    if (preferredProject?.id) {
      pId = preferredProject.id
    } else {
      const createdProject = (await projectStore.create({
        title: '未命名项目',
        summary: '',
      })) as { id?: string; projectId?: string } | undefined
      pId = createdProject?.id || createdProject?.projectId || ''
      const { chapterId } = await ensureProjectBaseSkeleton(pId)
      bootstrapChapterId = chapterId || ''
    }

    if (pId) {
      const nextQuery = { ...route.query } as LocationQueryRaw
      if (bootstrapChapterId) {
        nextQuery.chapterId = bootstrapChapterId
        nextQuery.entry = CREATED_PROJECT_ENTRY_QUERY
      }
      await router.replace({
        name: 'writer-project',
        params: { projectId: pId },
        query: nextQuery,
      })
    }
  }

  if (!pId) {
    return
  }

  await projectStore.loadList()

  try {
    await projectStore.loadDetail(pId)
  } catch (error) {
    message.warning('项目不存在或已失效，已返回工作台')
    await router.replace({ name: WRITER_ROUTE_NAMES.home })
    return
  }

  const bootstrapTasks: Array<Promise<unknown>> = [
    documentStore.loadTree(pId),
    loadOutlineTree(),
    writerStore.loadTimelines(pId),
  ]

  if (writerStore.characters.list.length === 0) {
    bootstrapTasks.push(writerStore.loadCharacters(pId))
  }

  if (writerStore.characters.relations.length === 0) {
    bootstrapTasks.push(writerStore.loadCharacterRelations(pId))
  }

  if (!isWailsWriterAvailable() && isStandaloneHost) {
    currentProjectId.value = pId
  }

  await Promise.all(bootstrapTasks)
  await ensureValidationSampleAssetRefs(pId)
  if (writerStore.timeline.currentTimeline) {
    await writerStore.loadTimelineEvents(writerStore.timeline.currentTimeline.id)
  }
  workspaceEntryFeedback.value = typeof route.query.entry === 'string' ? route.query.entry : ''
})

// =======================
// Watchers
// =======================
watch(
  [() => currentProjectId.value, () => currentChapterId.value],
  ([projectId, chapterId], [prevProjectId, prevChapterId]) => {
    if (projectId === prevProjectId && chapterId === prevChapterId) {
      return
    }

    resetWorkflowTransientState()
    writerStore.setSelectedText('')
  },
)

watch(
  [displayChapterId, currentChapterPlainText],
  ([chapterId, text], [prevChapterId, prevText]) => {
    if (chapterId === prevChapterId && text === prevText) {
      return
    }

    focusedProofreadIssueId.value = ''
    proofreadIssues.value = proofreadIssues.value.map((issue) =>
      issue.status === 'open' ? { ...issue, status: 'stale' } : issue,
    )
  },
)

watch(
  [() => currentChapterId.value, () => tipTapContent.value],
  ([chapterId, content], [previousChapterId]) => {
    if (!chapterId) {
      clearAutoSaveTimer()
      lastSavedContentSignature.value = ''
      return
    }

    const nextSignature = getContentSignature(chapterId, content)
    if (chapterId !== previousChapterId) {
      clearAutoSaveTimer()
      lastSavedContentSignature.value = nextSignature
      return
    }

    if (!content || nextSignature === lastSavedContentSignature.value) {
      return
    }

    if (!editorStore.isDirty) {
      lastSavedContentSignature.value = nextSignature
      return
    }

    scheduleAutoSave()
  },
  { flush: 'post' },
)

watch(
  () => currentProjectId.value,
  (projectId) => {
    if (!projectId) {
      return
    }

    window.localStorage.setItem(STANDALONE_LAST_PROJECT_KEY, projectId)
  },
  { immediate: true },
)

watch(
  () => flatChapters.value,
  (chapters) => {
    if (!currentChapterId.value && chapters.length > 0) {
      const firstChapter = chapters.find((chapter) => chapter.nodeType !== 'directory')
      const targetChapter = firstChapter || chapters[0]
      if (targetChapter) {
        currentChapterId.value = targetChapter.id
      }
    }
  },
  { immediate: true },
)

watch(
  [queryChapterId, availableDocMap],
  ([chapterId, docMap]) => {
    if (!chapterId) {
      return
    }
    if (!docMap.has(chapterId)) {
      return
    }
    currentChapterId.value = chapterId
  },
  { immediate: true },
)

watch(
  [
    () => workspaceEntryFeedback.value,
    () => workspaceEditorContentRef.value,
    queryChapterId,
  ],
  async ([entryFeedback, editorContentRef, chapterId]) => {
    if (!entryFeedback || !editorContentRef) {
      return
    }

    workspaceEntryFeedback.value = ''
    const resolvedChapterTitle =
      currentChapterTitle.value || resolveChapterTitle(currentChapterId.value || chapterId)

    if (entryFeedback === CREATED_PROJECT_ENTRY_QUERY) {
      await nextTick()
      await focusCurrentTitleInput()
      showCreatedProjectEntryFeedback(resolvedChapterTitle)
    } else if (entryFeedback === CONTINUE_PROJECT_ENTRY_QUERY) {
      showContinueProjectEntryFeedback(resolvedChapterTitle)
    } else if (entryFeedback === IMPORTED_PROJECT_ENTRY_QUERY) {
      showImportedProjectEntryFeedback(resolvedChapterTitle)
    }

    const nextQuery = { ...route.query } as LocationQueryRaw
    delete nextQuery.entry
    await router.replace({ query: nextQuery })
  },
  { immediate: true, flush: 'post' },
)

watch(
  () => queryTool.value,
  (tool) => {
    const normalizedTool: ActiveTool = tool === 'immersive' ? 'immersive' : 'writing'
    editorStore.setActiveTool(normalizedTool)
  },
  { immediate: true },
)

watch(
  () => queryRightTool.value,
  (tool) => {
    if (!isRightToolType(tool)) {
      return
    }

    panelStore.setRightCollapsed(false)
    workspaceLayoutStore.setRightToolActive(tool)
  },
  { immediate: true },
)

watch(
  [queryTool, encyclopediaSubView, queryChapterId],
  ([tool, subView, chapterId]) => {
    if (tool !== 'encyclopedia') {
      return
    }

    void (async () => {
      await nextTick()
      handleOpenFullscreenTool(mapLegacyEncyclopediaViewToTool(subView), chapterId || '')

      const nextQuery = { ...route.query } as LocationQueryRaw
      nextQuery.tool = 'writing'
      delete nextQuery.encyclopediaView
      await router.replace({ query: nextQuery })
    })()
  },
  { immediate: true, flush: 'post' },
)

watch(
  () => isImmersiveMode.value,
  (immersive) => {
    if (immersive) {
      startImmersiveTimer()
    } else {
      stopImmersiveTimer()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  clearChapterSwitchFeedback()
  clearAutoSaveTimer()
})
</script>

<style scoped lang="scss">
.workspace-studio {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.workspace-editor-layout {
  flex: 1;
  min-height: 0;
}

.workspace-bottom-stack {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
