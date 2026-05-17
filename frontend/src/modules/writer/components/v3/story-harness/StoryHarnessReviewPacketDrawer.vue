<template>
  <section v-if="drawerVisible" class="story-harness-review-packet">
    <div class="flex h-full min-h-0 flex-col gap-4">
      <QyCard
        variant="glass"
        padding="sm"
        shadow="never"
        class="story-harness-review-packet__card rounded-3xl"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="story-harness-review-packet__eyebrow text-xs font-medium uppercase">当前审查目标</p>
            <h3 class="story-harness-review-packet__heading mt-2 text-base font-semibold">
              {{ chapterTitle || '未命名章节' }}
            </h3>
            <p class="story-harness-review-packet__muted mt-1 text-sm leading-6">
              {{ scopeLabel || '未声明场景作用域' }}
            </p>
          </div>
          <Tag size="sm" variant="primary" effect="light">只读预览</Tag>
        </div>

        <div class="story-harness-review-packet__muted mt-4 grid grid-cols-2 gap-2 text-sm">
          <div class="story-harness-review-packet__metric rounded-2xl px-3 py-2">
            <p class="story-harness-review-packet__eyebrow text-xs">正文字符</p>
            <p class="story-harness-review-packet__heading mt-1 font-semibold">{{ contentLength }}</p>
          </div>
          <div class="story-harness-review-packet__metric rounded-2xl px-3 py-2">
            <p class="story-harness-review-packet__eyebrow text-xs">正文段落</p>
            <p class="story-harness-review-packet__heading mt-1 font-semibold">{{ paragraphCount }}</p>
          </div>
          <div class="story-harness-review-packet__metric rounded-2xl px-3 py-2">
            <p class="story-harness-review-packet__eyebrow text-xs">活跃实体</p>
            <p class="story-harness-review-packet__heading mt-1 font-semibold">{{ totalEntityCount }}</p>
          </div>
          <div class="story-harness-review-packet__metric rounded-2xl px-3 py-2">
            <p class="story-harness-review-packet__eyebrow text-xs">待处理建议</p>
            <p class="story-harness-review-packet__heading mt-1 font-semibold">{{ pendingChangeRequests.length }}</p>
          </div>
        </div>
      </QyCard>

      <QyCard
        variant="glass"
        padding="sm"
        shadow="never"
        class="story-harness-review-packet__card rounded-3xl"
      >
        <div class="flex items-center justify-between gap-3">
          <h4 class="story-harness-review-packet__heading text-sm font-semibold">审查摘要</h4>
          <Tag size="sm" :variant="gateSummary.variant" effect="light">{{ gateSummary.label }}</Tag>
        </div>
        <ul class="story-harness-review-packet__secondary mt-3 space-y-2 text-sm leading-6">
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
        class="story-harness-review-packet__card rounded-3xl"
      >
        <div class="flex items-center justify-between gap-3">
          <h4 class="story-harness-review-packet__heading text-sm font-semibold">Context Lens</h4>
          <Tag size="sm" variant="info" effect="light">{{ activeCharacters.length }} 角色</Tag>
        </div>

        <div v-if="activeCharacters.length" class="mt-3 space-y-2">
          <div
            v-for="character in visibleCharacters"
            :key="character.id"
            class="story-harness-review-packet__metric rounded-2xl px-3 py-2"
          >
            <p class="story-harness-review-packet__heading text-sm font-medium">{{ character.name }}</p>
            <p class="story-harness-review-packet__muted mt-1 text-xs leading-5">
              {{ character.currentState || character.traits.join(' / ') || '暂无状态摘要' }}
            </p>
          </div>
        </div>
        <p v-else class="story-harness-review-packet__muted mt-3 text-sm leading-6">
          当前章节还没有可用的活跃角色切片。
        </p>

        <div v-if="activeRelations.length" class="story-harness-review-packet__split mt-4 pt-3">
          <p class="story-harness-review-packet__eyebrow text-xs font-medium uppercase">关系切片</p>
          <div class="mt-2 space-y-2">
            <div
              v-for="relation in visibleRelations"
              :key="relation.id"
              class="story-harness-review-packet__metric story-harness-review-packet__secondary rounded-2xl px-3 py-2 text-sm leading-6"
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
        class="story-harness-review-packet__card min-h-0 rounded-3xl"
      >
        <div class="flex items-center justify-between gap-3">
          <h4 class="story-harness-review-packet__heading text-sm font-semibold">建议证据</h4>
          <Tag size="sm" variant="warning" effect="light"
            >{{ visibleChangeRequests.length }} 条</Tag
          >
        </div>

        <div v-if="visibleChangeRequests.length" class="mt-3 space-y-3">
          <div
            v-for="changeRequest in visibleChangeRequests"
            :key="changeRequest.id"
            class="story-harness-review-packet__evidence rounded-2xl px-3 py-3"
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
            <p class="story-harness-review-packet__heading mt-3 text-sm font-semibold">{{ changeRequest.title }}</p>
            <p class="story-harness-review-packet__secondary mt-2 text-sm leading-6">{{ changeRequest.summary }}</p>
            <p
              v-if="changeRequest.evidence"
              class="story-harness-review-packet__code mt-2 rounded-xl px-3 py-2 text-xs leading-5"
            >
              {{ changeRequest.evidence }}
            </p>
          </div>
        </div>
        <p v-else class="story-harness-review-packet__muted mt-3 text-sm leading-6">当前没有可纳入审查包的变更建议。</p>
      </QyCard>
    </div>

    <div class="story-harness-review-packet__footer mt-4 flex items-center justify-between gap-3">
      <p class="story-harness-review-packet__muted text-xs leading-5">
        该预览只聚合当前前端已知上下文，不写入后端。
      </p>
      <QyButton variant="secondary" size="sm" @click="drawerVisible = false">关闭</QyButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyButton, QyCard } from '@/design-system/components'
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

<style scoped>
.story-harness-review-packet {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.story-harness-review-packet__card {
  border: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  background: color-mix(in srgb, var(--editor-layer-panel, #ffffff) 92%, transparent);
}

.story-harness-review-packet__metric {
  background: var(--editor-layer-strong, #f1f5f9);
}

.story-harness-review-packet__evidence {
  border: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  background: color-mix(in srgb, var(--editor-bg-surface, #f8fafc) 88%, transparent);
}

.story-harness-review-packet__split {
  border-top: 1px solid color-mix(in srgb, var(--editor-border-light, #f1f5f9) 82%, transparent);
}

.story-harness-review-packet__eyebrow {
  color: var(--editor-text-ghost, #94a3b8);
}

.story-harness-review-packet__heading {
  color: var(--editor-text-primary, #0f172a);
}

.story-harness-review-packet__secondary {
  color: var(--editor-text-secondary, #334155);
}

.story-harness-review-packet__muted {
  color: var(--editor-text-muted, #64748b);
}

.story-harness-review-packet__code {
  background: color-mix(in srgb, var(--editor-text-primary, #0f172a) 92%, transparent);
  color: color-mix(in srgb, var(--editor-text-inverse, #ffffff) 92%, var(--editor-text-secondary, #334155) 8%);
}

.story-harness-review-packet__footer {
  flex-shrink: 0;
}
</style>
