<template>
  <QyDrawer
    v-model="drawerVisible"
    title="Review Packet"
    direction="rtl"
    size="560px"
    :destroy-on-close="false"
    class="story-harness-review-packet-drawer"
  >
    <div class="flex h-full min-h-0 flex-col gap-4">
      <QyCard
        variant="glass"
        padding="sm"
        shadow="never"
        class="rounded-3xl border border-slate-200/70 bg-white/90"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-medium uppercase text-slate-400">当前审查目标</p>
            <h3 class="mt-2 text-base font-semibold text-slate-950">
              {{ chapterTitle || '未命名章节' }}
            </h3>
            <p class="mt-1 text-sm leading-6 text-slate-500">
              {{ scopeLabel || '未声明场景作用域' }}
            </p>
          </div>
          <Tag size="sm" variant="primary" effect="light">只读预览</Tag>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
          <div class="rounded-2xl bg-slate-50 px-3 py-2">
            <p class="text-xs text-slate-400">正文字符</p>
            <p class="mt-1 font-semibold text-slate-900">{{ contentLength }}</p>
          </div>
          <div class="rounded-2xl bg-slate-50 px-3 py-2">
            <p class="text-xs text-slate-400">正文段落</p>
            <p class="mt-1 font-semibold text-slate-900">{{ paragraphCount }}</p>
          </div>
          <div class="rounded-2xl bg-slate-50 px-3 py-2">
            <p class="text-xs text-slate-400">活跃实体</p>
            <p class="mt-1 font-semibold text-slate-900">{{ totalEntityCount }}</p>
          </div>
          <div class="rounded-2xl bg-slate-50 px-3 py-2">
            <p class="text-xs text-slate-400">待处理建议</p>
            <p class="mt-1 font-semibold text-slate-900">{{ pendingChangeRequests.length }}</p>
          </div>
        </div>
      </QyCard>

      <QyCard
        variant="glass"
        padding="sm"
        shadow="never"
        class="rounded-3xl border border-slate-200/70 bg-white/90"
      >
        <div class="flex items-center justify-between gap-3">
          <h4 class="text-sm font-semibold text-slate-950">Workflow Gate 摘要</h4>
          <Tag size="sm" :variant="gateSummary.variant" effect="light">{{ gateSummary.label }}</Tag>
        </div>
        <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          <li v-for="item in gateChecklist" :key="item.key" class="flex items-start gap-2">
            <span
              class="mt-2 h-2 w-2 shrink-0 rounded-full"
              :class="gateStatusClassMap[item.status]"
            />
            <span>{{ item.text }}</span>
          </li>
        </ul>
      </QyCard>

      <QyCard
        variant="glass"
        padding="sm"
        shadow="never"
        class="rounded-3xl border border-slate-200/70 bg-white/90"
      >
        <div class="flex items-center justify-between gap-3">
          <h4 class="text-sm font-semibold text-slate-950">Context Lens</h4>
          <Tag size="sm" variant="info" effect="light">{{ activeCharacters.length }} 角色</Tag>
        </div>

        <div v-if="activeCharacters.length" class="mt-3 space-y-2">
          <div
            v-for="character in visibleCharacters"
            :key="character.id"
            class="rounded-2xl bg-slate-50 px-3 py-2"
          >
            <p class="text-sm font-medium text-slate-900">{{ character.name }}</p>
            <p class="mt-1 text-xs leading-5 text-slate-500">
              {{ character.currentState || character.traits.join(' / ') || '暂无状态摘要' }}
            </p>
          </div>
        </div>
        <p v-else class="mt-3 text-sm leading-6 text-slate-500">
          当前章节还没有可用的活跃角色切片。
        </p>

        <div v-if="activeRelations.length" class="mt-4 border-t border-slate-100 pt-3">
          <p class="text-xs font-medium uppercase text-slate-400">关系切片</p>
          <div class="mt-2 space-y-2">
            <div
              v-for="relation in visibleRelations"
              :key="relation.id"
              class="rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600"
            >
              {{ relation.fromName }} -> {{ relation.toName }}：{{ relation.type }}
            </div>
          </div>
        </div>
      </QyCard>

      <QyCard
        variant="glass"
        padding="sm"
        shadow="never"
        class="min-h-0 rounded-3xl border border-slate-200/70 bg-white/90"
      >
        <div class="flex items-center justify-between gap-3">
          <h4 class="text-sm font-semibold text-slate-950">Change Request 证据</h4>
          <Tag size="sm" variant="warning" effect="light"
            >{{ visibleChangeRequests.length }} 条</Tag
          >
        </div>

        <div v-if="visibleChangeRequests.length" class="mt-3 space-y-3">
          <div
            v-for="changeRequest in visibleChangeRequests"
            :key="changeRequest.id"
            class="rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-3"
          >
            <div class="flex flex-wrap items-center gap-2">
              <Tag
                size="sm"
                :variant="changeRequest.severity === 'focus' ? 'warning' : 'info'"
                effect="light"
              >
                {{ changeRequest.severity === 'focus' ? '优先处理' : '轻提示' }}
              </Tag>
              <Tag size="sm" variant="info" effect="plain">{{
                typeLabelMap[changeRequest.type]
              }}</Tag>
              <Tag size="sm" :variant="decisionVariant(changeRequest.id)" effect="plain">
                {{ decisionLabel(changeRequest.id) }}
              </Tag>
            </div>
            <p class="mt-3 text-sm font-semibold text-slate-950">{{ changeRequest.title }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ changeRequest.summary }}</p>
            <p
              v-if="changeRequest.evidence"
              class="mt-2 rounded-xl bg-slate-950 px-3 py-2 text-xs leading-5 text-slate-100"
            >
              {{ changeRequest.evidence }}
            </p>
          </div>
        </div>
        <p v-else class="mt-3 text-sm leading-6 text-slate-500">当前没有可纳入审查包的变更建议。</p>
      </QyCard>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs leading-5 text-slate-500">该预览只聚合当前前端已知上下文，不写入后端。</p>
        <QyButton variant="secondary" size="sm" @click="drawerVisible = false">关闭</QyButton>
      </div>
    </template>
  </QyDrawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyButton, QyCard, QyDrawer } from '@/design-system/components'
import { Tag } from '@/design-system/base'
import {
  useStoryHarnessStore,
  type StoryHarnessChangeRequestDecision,
  type StoryHarnessCharacterSummary,
  type StoryHarnessChangeRequestPreview,
  type StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'
import {
  buildStoryHarnessWorkflowGateState,
  type StoryHarnessWorkflowGateStatus,
} from './storyHarnessWorkflowGates'

const props = defineProps<{
  modelValue: boolean
  chapterId: string
  chapterTitle: string
  content: string
  scopeLabel?: string
  entityStats?: {
    characters: number
    locations: number
    items: number
    concepts: number
  }
  activeCharacters: StoryHarnessCharacterSummary[]
  activeRelations: StoryHarnessRelationSummary[]
  changeRequests: StoryHarnessChangeRequestPreview[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const harnessStore = useStoryHarnessStore()
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})
const gateState = computed(() =>
  buildStoryHarnessWorkflowGateState({
    chapterId: props.chapterId,
    chapterTitle: props.chapterTitle,
    content: props.content,
    activeCharacterCount: props.activeCharacters.length,
    activeRelationCount: props.activeRelations.length,
    changeRequests: props.changeRequests,
    getChangeRequestDecision: harnessStore.getChangeRequestDecision,
  }),
)
const contentLength = computed(() => gateState.value.contentLength)
const paragraphCount = computed(() => gateState.value.paragraphCount)
const totalEntityCount = computed(
  () =>
    (props.entityStats?.characters ?? props.activeCharacters.length) +
    (props.entityStats?.locations ?? 0) +
    (props.entityStats?.items ?? 0) +
    (props.entityStats?.concepts ?? 0),
)
const pendingChangeRequests = computed(() => gateState.value.pendingChangeRequests)
const visibleCharacters = computed(() => props.activeCharacters.slice(0, 5))
const visibleRelations = computed(() => props.activeRelations.slice(0, 4))
const visibleChangeRequests = computed(() => props.changeRequests.slice(0, 6))
const gateSummary = computed(() => gateState.value.summary)
const gateChecklist = computed(() =>
  gateState.value.gates.map((gate) => ({
    key: gate.key,
    status: gate.status,
    text: `${gate.title}：${gate.text}`,
  })),
)
const gateStatusClassMap: Record<StoryHarnessWorkflowGateStatus, string> = {
  ready: 'bg-emerald-500',
  attention: 'bg-amber-500',
  missing: 'bg-slate-300',
  info: 'bg-sky-500',
}

const typeLabelMap: Record<StoryHarnessChangeRequestPreview['type'], string> = {
  scene_scope: 'Scene Scope',
  relation: '关系',
  state: '状态',
}

const decisionLabelMap: Record<StoryHarnessChangeRequestDecision, string> = {
  pending: '待处理',
  accepted: '已合并',
  ignored: '已忽略',
  deferred: '稍后',
}

const decisionVariantMap: Record<
  StoryHarnessChangeRequestDecision,
  'success' | 'warning' | 'info'
> = {
  pending: 'warning',
  accepted: 'success',
  ignored: 'info',
  deferred: 'info',
}

const decisionLabel = (changeRequestId: string) =>
  decisionLabelMap[harnessStore.getChangeRequestDecision(changeRequestId)]
const decisionVariant = (changeRequestId: string) =>
  decisionVariantMap[harnessStore.getChangeRequestDecision(changeRequestId)]
</script>
