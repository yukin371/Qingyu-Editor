<template>
  <QyModal
    :visible="visible"
    :title="dialogTitle"
    width="560px"
    @update:visible="handleVisibilityChange"
  >
    <div class="space-y-4">
      <div v-if="templateName" class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
        模板来源：{{ templateName }}
      </div>

      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">项目名称</span>
        <QyInput
          v-model="title"
          :maxlength="80"
          placeholder="例如：夜航人手册"
        />
      </label>

      <QyButton
        v-if="summaryCollapsed && !summaryVisible"
        size="sm"
        variant="ghost"
        @click="summaryVisible = true"
      >
        添加一句话摘要
      </QyButton>

      <label v-if="summaryVisible" class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">一句话摘要</span>
        <QyTextarea
          v-model="summary"
          :rows="3"
          :maxlength="300"
          show-count
          placeholder="可选，用一句话记录这本书的开场目标。"
        />
      </label>
    </div>

    <template #footer>
      <QyButton variant="ghost" @click="handleVisibilityChange(false)">取消</QyButton>
      <QyButton :loading="submitting" @click="handleSubmit">{{ effectiveSubmitText }}</QyButton>
    </template>
  </QyModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QyButton, QyInput, QyModal, QyTextarea } from '@/design-system/components'

const props = withDefaults(
  defineProps<{
    visible: boolean
    submitting?: boolean
    templateName?: string
    initialTitle?: string
    summaryCollapsed?: boolean
    submitText?: string
  }>(),
  {
    submitting: false,
    templateName: '',
    initialTitle: '',
    summaryCollapsed: true,
    submitText: '',
  },
)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', payload: { title: string; summary: string }): void
}>()

const title = ref('')
const summary = ref('')
const summaryVisible = ref(false)

const dialogTitle = computed(() => (props.templateName ? '应用模板并创建项目' : '新建空白项目'))
const effectiveSubmitText = computed(
  () => props.submitText || (props.templateName ? '应用并创建' : '开始创建'),
)

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      return
    }

    title.value = props.initialTitle || ''
    summary.value = ''
    summaryVisible.value = !props.summaryCollapsed
  },
  { immediate: true },
)

function handleVisibilityChange(value: boolean) {
  emit('update:visible', value)
}

function handleSubmit() {
  const nextTitle = title.value.trim()
  if (!nextTitle) {
    return
  }

  emit('submit', {
    title: nextTitle,
    summary: summary.value.trim(),
  })
}
</script>
