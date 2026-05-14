<template>
  <QyModal
    :visible="visible"
    :title="dialogTitle"
    width="560px"
    @update:visible="handleVisibilityChange"
  >
    <div class="space-y-4">
      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">名称</span>
        <QyInput v-model="form.name" :maxlength="80" placeholder="输入资产名称" />
      </label>

      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">{{ summaryLabel }}</span>
        <QyTextarea
          v-model="form.summary"
          :rows="3"
          :maxlength="400"
          show-count
          :placeholder="summaryPlaceholder"
        />
      </label>

      <label v-if="showAliasField" class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">别名</span>
        <QyInput v-model="form.alias" :maxlength="160" placeholder="多个别名用逗号分隔" />
      </label>

      <template v-if="category === 'characters'">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">性格特征</span>
          <QyInput v-model="form.traits" :maxlength="160" placeholder="多个特征用逗号分隔" />
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">背景</span>
          <QyTextarea
            v-model="form.background"
            :rows="3"
            :maxlength="500"
            show-count
            placeholder="快速记录角色出身、动机或关键经历"
          />
        </label>
      </template>

      <template v-else-if="category === 'locations'">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">气候</span>
            <QyInput v-model="form.climate" :maxlength="60" placeholder="如：温润、寒冷" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">氛围</span>
            <QyInput v-model="form.atmosphere" :maxlength="60" placeholder="如：压抑、繁华" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">文化</span>
            <QyInput v-model="form.culture" :maxlength="80" placeholder="如：海港商贸文化" />
          </label>
          <label class="block space-y-2">
            <span class="text-sm font-medium text-slate-700">地理</span>
            <QyInput v-model="form.geography" :maxlength="80" placeholder="如：山口、海港、峡谷" />
          </label>
        </div>
      </template>

      <label v-else-if="category === 'concepts'" class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">分类</span>
        <QyInput v-model="form.conceptCategory" :maxlength="60" placeholder="如：规则、势力、文化" />
      </label>
    </div>

    <template #footer>
      <QyButton variant="ghost" @click="handleVisibilityChange(false)">取消</QyButton>
      <QyButton :loading="submitting" @click="handleSubmit">{{ submitText }}</QyButton>
    </template>
  </QyModal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { QyButton, QyInput, QyModal, QyTextarea } from '@/design-system/components'
import type { EncyclopediaCategory } from '@/modules/writer/composables/types'
import type {
  WriterAssetListItem,
  WriterAssetMutationInput,
} from '@/modules/writer/composables/useWriterAssetCatalog'

const props = withDefaults(
  defineProps<{
    visible: boolean
    mode: 'create' | 'edit'
    category: EncyclopediaCategory
    asset?: WriterAssetListItem | null
    submitting?: boolean
  }>(),
  {
    asset: null,
    submitting: false,
  },
)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', payload: WriterAssetMutationInput): void
}>()

const form = reactive({
  name: '',
  summary: '',
  alias: '',
  traits: '',
  background: '',
  climate: '',
  culture: '',
  geography: '',
  atmosphere: '',
  conceptCategory: '',
})

const categoryLabel = computed(() => {
  if (props.category === 'characters') return '角色'
  if (props.category === 'locations') return '地点'
  if (props.category === 'items') return '物件'
  if (props.category === 'organizations') return '组织'
  return '概念'
})

const dialogTitle = computed(() =>
  props.mode === 'create' ? `新建${categoryLabel.value}` : `编辑${categoryLabel.value}`,
)

const submitText = computed(() => (props.mode === 'create' ? '创建' : '保存'))

const showAliasField = computed(
  () =>
    props.category === 'characters' ||
    props.category === 'items' ||
    props.category === 'organizations' ||
    props.category === 'concepts',
)

const summaryLabel = computed(() => (props.category === 'locations' ? '描述' : '摘要'))

const summaryPlaceholder = computed(() =>
  props.category === 'locations' ? '快速记录场景用途、视觉印象或功能' : '快速记录这个资产最核心的设定',
)

function normalizeCsv(value: string) {
  return value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function resetForm() {
  if (props.mode === 'create') {
    form.name = ''
    form.summary = ''
    form.alias = ''
    form.traits = ''
    form.background = ''
    form.climate = ''
    form.culture = ''
    form.geography = ''
    form.atmosphere = ''
    form.conceptCategory = ''
    return
  }

  const raw = props.asset?.raw as Record<string, unknown> | undefined
  form.name = props.asset?.name || ''
  form.summary =
    props.asset?.summary ||
    String(
      raw?.description ||
        raw?.summary ||
        '',
    )
  form.alias = Array.isArray(raw?.alias) ? (raw?.alias as string[]).join('，') : ''
  form.traits = Array.isArray(raw?.traits) ? (raw?.traits as string[]).join('，') : ''
  form.background = typeof raw?.background === 'string' ? raw.background : ''
  form.climate = typeof raw?.climate === 'string' ? raw.climate : ''
  form.culture = typeof raw?.culture === 'string' ? raw.culture : ''
  form.geography = typeof raw?.geography === 'string' ? raw.geography : ''
  form.atmosphere = typeof raw?.atmosphere === 'string' ? raw.atmosphere : ''
  form.conceptCategory =
    typeof raw?.category === 'string'
      ? raw.category
      : props.asset?.badge || ''
}

watch(
  () => [props.visible, props.asset?.id, props.category, props.mode] as const,
  ([visible]) => {
    if (!visible) return
    resetForm()
  },
  { immediate: true },
)

function handleVisibilityChange(value: boolean) {
  emit('update:visible', value)
}

function handleSubmit() {
  const name = form.name.trim()
  if (!name) return

  emit('submit', {
    category: props.category,
    name,
    summary: form.summary.trim(),
    alias: showAliasField.value ? normalizeCsv(form.alias) : [],
    traits: props.category === 'characters' ? normalizeCsv(form.traits) : [],
    background: form.background.trim(),
    climate: form.climate.trim(),
    culture: form.culture.trim(),
    geography: form.geography.trim(),
    atmosphere: form.atmosphere.trim(),
    conceptCategory: form.conceptCategory.trim(),
  })
}
</script>
