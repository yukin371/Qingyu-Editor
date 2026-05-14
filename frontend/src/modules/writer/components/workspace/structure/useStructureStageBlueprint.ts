import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { message } from '@/design-system/services'
import type { SidebarChapterSummary } from '@/modules/writer/composables/types'
import {
  buildWriterWorkflowContextPrompt,
  type WriterWorkflowActionRequest,
  type WriterWorkflowContext,
  type WriterStructureDuplicateStrategy,
  type WriterStructureImportTarget,
  type WriterStructurePlanPayload,
} from '@/modules/writer/types/workflow'
import {
  type GoldenChapterPlan,
  getCreativeWorkflowTemplate,
  loadCreativeWorkflow,
  type CreativeWorkflowRecord,
} from '@/modules/writer/services/creativeWorkflow.service'

interface UseStructureStageBlueprintOptions {
  chapters: Ref<SidebarChapterSummary[]>
  currentChapterId: Ref<string>
  effectiveProjectId: ComputedRef<string>
  workflowContext: Ref<WriterWorkflowContext | undefined>
}

export function useStructureStageBlueprint(options: UseStructureStageBlueprintOptions) {
  const creativeWorkflow = ref<CreativeWorkflowRecord | null>(null)
  const creativeWorkflowTemplate = computed(() =>
    getCreativeWorkflowTemplate(creativeWorkflow.value?.templateId),
  )
  const hasCreativeWorkflowBlueprint = computed(() =>
    Boolean(
      creativeWorkflow.value?.templateId ||
      creativeWorkflow.value?.pitchLine ||
      creativeWorkflow.value?.corePromises.length,
    ),
  )
  const creativeWorkflowTemplateName = computed(() => creativeWorkflowTemplate.value?.name || '')
  const creativeWorkflowPitch = computed(() => creativeWorkflow.value?.pitchLine || '')
  const creativeWorkflowAudienceLabel = computed(
    () => creativeWorkflow.value?.targetAudience.slice(0, 2).join(' / ') || '',
  )
  const creativeWorkflowPaceContract = computed(() => creativeWorkflow.value?.paceContract || '')
  const creativeWorkflowPromises = computed(() => creativeWorkflow.value?.corePromises || [])
  const creativeWorkflowGoldenChapters = computed<GoldenChapterPlan[]>(
    () => creativeWorkflow.value?.goldenChapters || [],
  )
  const currentVolumeDirectory = computed(() => {
    const currentChapter = options.chapters.value.find(
      (chapter) => chapter.id === options.currentChapterId.value,
    )
    if (!currentChapter?.parentId) {
      return ''
    }

    return (
      options.chapters.value.find(
        (chapter) =>
          chapter.id === currentChapter.parentId && chapter.nodeType === 'directory',
      )?.title || ''
    )
  })
  const creativeWorkflowImportTarget = ref<WriterStructureImportTarget>('project-root')
  const creativeWorkflowImportTargetTouched = ref(false)
  const creativeWorkflowDuplicateStrategy = ref<WriterStructureDuplicateStrategy>('skip_existing')
  const creativeWorkflowImportTargetLabel = computed(() =>
    creativeWorkflowImportTarget.value === 'current-volume' && currentVolumeDirectory.value
      ? `当前卷：${currentVolumeDirectory.value}`
      : '项目根目录',
  )

  watch(
    currentVolumeDirectory,
    (value) => {
      if (creativeWorkflowImportTargetTouched.value) {
        return
      }
      creativeWorkflowImportTarget.value = value ? 'current-volume' : 'project-root'
    },
    { immediate: true },
  )

  async function loadBlueprint() {
    if (!options.effectiveProjectId.value) {
      creativeWorkflow.value = null
      return
    }
    creativeWorkflow.value = await loadCreativeWorkflow(options.effectiveProjectId.value)
  }

  function setCreativeWorkflowImportTarget(value: WriterStructureImportTarget) {
    creativeWorkflowImportTarget.value = value
    creativeWorkflowImportTargetTouched.value = true
  }

  function setCreativeWorkflowDuplicateStrategy(value: WriterStructureDuplicateStrategy) {
    creativeWorkflowDuplicateStrategy.value = value
  }

  function buildCreativeWorkflowToAIRequest(): WriterWorkflowActionRequest | null {
    if (!creativeWorkflow.value) return null

    const workflowPrompt = buildWriterWorkflowContextPrompt(options.workflowContext.value)
    const lines = [
      '阶段 1 创作流输入：',
      creativeWorkflowTemplateName.value ? `题材模板：${creativeWorkflowTemplateName.value}` : '',
      creativeWorkflowPitch.value ? `定位声明：${creativeWorkflowPitch.value}` : '',
      creativeWorkflowAudienceLabel.value ? `目标读者：${creativeWorkflowAudienceLabel.value}` : '',
      creativeWorkflowPromises.value.length
        ? `核心承诺：${creativeWorkflowPromises.value.join('；')}`
        : '',
      creativeWorkflowPaceContract.value ? `节奏合约：${creativeWorkflowPaceContract.value}` : '',
      ...creativeWorkflowGoldenChapters.value.map((chapter) =>
        [
          `第${chapter.chapterNumber}章：${chapter.title}`,
          chapter.summary ? `目标：${chapter.summary}` : '',
          chapter.hook ? `钩子：${chapter.hook}` : '',
          chapter.payoff ? `兑现：${chapter.payoff}` : '',
        ]
          .filter(Boolean)
          .join(' | '),
      ),
      workflowPrompt,
    ].filter(Boolean)

    return {
      source: 'workspace',
      action: 'add_to_chat',
      title: `蓝图接力：${creativeWorkflowTemplateName.value || '黄金三章规划'}`,
      text: lines.join('\n'),
      instructions:
        '请把这些阶段 1 输入转成阶段 3 可执行蓝图建议，优先输出结构节点拆分、前三章 beats、爽点兑现顺序与伏笔预埋建议。',
    }
  }

  function buildCreativeWorkflowStructurePlan(): WriterStructurePlanPayload | null {
    if (!creativeWorkflowGoldenChapters.value.length) {
      message.warning('当前还没有可导入的黄金三章内容')
      return null
    }

    return {
      mode: 'chapter',
      prompt: `基于 ${creativeWorkflowTemplateName.value || '当前模板'} 导入黄金三章`,
      summary:
        creativeWorkflowPitch.value ||
        creativeWorkflowPaceContract.value ||
        '根据阶段 1 的黄金三章规划生成章节草案。',
      importTarget: creativeWorkflowImportTarget.value,
      duplicateStrategy: creativeWorkflowDuplicateStrategy.value,
      items: creativeWorkflowGoldenChapters.value.map((chapter) => ({
        title: chapter.title,
        summary: chapter.summary,
        reason: [
          chapter.hook ? `钩子：${chapter.hook}` : '',
          chapter.payoff ? `兑现：${chapter.payoff}` : '',
        ]
          .filter(Boolean)
          .join('；'),
      })),
    }
  }

  return {
    creativeWorkflow,
    hasCreativeWorkflowBlueprint,
    creativeWorkflowTemplateName,
    creativeWorkflowPitch,
    creativeWorkflowAudienceLabel,
    creativeWorkflowPaceContract,
    creativeWorkflowPromises,
    creativeWorkflowGoldenChapters,
    currentVolumeDirectory,
    creativeWorkflowImportTarget,
    creativeWorkflowDuplicateStrategy,
    creativeWorkflowImportTargetLabel,
    loadBlueprint,
    setCreativeWorkflowImportTarget,
    setCreativeWorkflowDuplicateStrategy,
    buildCreativeWorkflowToAIRequest,
    buildCreativeWorkflowStructurePlan,
  }
}
