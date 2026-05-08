<script setup lang="ts">
/**
 * 导出作品对话框
 * 使用 QyDialog (Apple 风格) 替代 el-dialog
 */
import { reactive, watch, ref } from 'vue'
import { QyDialog, QyButton, QySelect } from '@/design-system/components'
import { exportFormatOptions, exportScopeOptions } from '@/modules/writer/api'

export interface ExportForm {
  format: 'txt' | 'md' | 'docx'
  scope: 'all'
  options: string[]
}

const props = defineProps<{
  visible: boolean
  form: ExportForm
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'export'): void
  (e: 'update:form', form: ExportForm): void
}>()

// 本地 visible 状态
const localVisible = ref(props.visible)

watch(
  () => props.visible,
  (v) => {
    localVisible.value = v
  },
)

watch(localVisible, (v) => {
  emit('update:visible', v)
})

// 创建本地表单副本
const localForm = reactive<ExportForm>({ ...props.form })

// 监听 props.form 变化，同步到本地
watch(
  () => props.form,
  (newForm) => {
    Object.assign(localForm, newForm)
  },
  { deep: true },
)

// 选项配置
const includeOptions = [
  { label: '包含元数据', value: 'include_metadata' },
  { label: '包含评论', value: 'include_comments' },
  { label: '包含目录', value: 'include_toc' },
  { label: '分页符', value: 'page_breaks' },
]

const toggleOption = (value: string) => {
  const idx = localForm.options.indexOf(value)
  if (idx === -1) {
    localForm.options.push(value)
  } else {
    localForm.options.splice(idx, 1)
  }
}

const isOptionChecked = (value: string) => localForm.options.includes(value)

// 导出时同步本地表单到父组件
const handleExport = () => {
  emit('update:form', { ...localForm })
  emit('export')
}
</script>

<template>
  <QyDialog
    v-model:visible="localVisible"
    title="导出作品"
    size="md"
    :show-close="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
  >
    <div class="space-y-5">
      <!-- 导出格式 -->
      <div class="form-item">
        <label class="form-label">导出格式</label>
        <QySelect
          v-model="localForm.format"
          :options="exportFormatOptions.map((o) => ({ label: o.label, value: o.value }))"
          placeholder="选择导出格式"
        />
      </div>

      <!-- 导出范围 -->
      <div class="form-item">
        <label class="form-label">导出范围</label>
        <QySelect
          v-model="localForm.scope"
          :options="exportScopeOptions.map((o) => ({ label: o.label, value: o.value }))"
          placeholder="选择导出范围"
        />
      </div>

      <!-- 包含选项 -->
      <div class="form-item">
        <label class="form-label">包含选项</label>
        <div class="checkbox-group">
          <label v-for="option in includeOptions" :key="option.value" class="checkbox-item">
            <input
              type="checkbox"
              :checked="isOptionChecked(option.value)"
              class="checkbox-input"
              @change="toggleOption(option.value)"
            />
            <span class="checkbox-label">{{ option.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <QyButton variant="secondary" @click="localVisible = false"> 取消 </QyButton>
      <QyButton variant="primary" @click="handleExport"> 开始导出 </QyButton>
    </template>
  </QyDialog>
</template>

<style scoped>
.space-y-5 > * + * {
  margin-top: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

.checkbox-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid #cbd5e1;
  cursor: pointer;
  accent-color: #3b82f6;
}

.checkbox-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.checkbox-label {
  font-size: 14px;
  color: #334155;
}
</style>
