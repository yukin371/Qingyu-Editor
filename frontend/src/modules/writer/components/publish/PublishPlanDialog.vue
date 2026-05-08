<script setup lang="ts">
/**
 * 发布计划对话框
 * 使用 QyDialog (Apple 风格) 替代 el-dialog
 */
import { reactive, watch, ref } from 'vue'
import { QyDialog, QyButton, QySelect } from '@/design-system/components'
import { publishTypeOptions, publishPlatformOptions } from '@/modules/writer/api'

export interface PlanForm {
  name: string
  type: 'free' | 'paid' | 'vip' | 'limited'
  platforms: string[]
  scheduleType: 'immediate' | 'scheduled' | 'manual'
  intervalDays: number
  chaptersPerRelease: number
  isFree: boolean
  price: number
  vipDiscount: number
}

const props = defineProps<{
  visible: boolean
  form: PlanForm
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'save'): void
  (e: 'update:form', form: PlanForm): void
}>()

// 本地 visible 状态（QyDialog 需要可写的 v-model）
const localVisible = ref(props.visible)

watch(() => props.visible, (v) => {
  localVisible.value = v
})

watch(localVisible, (v) => {
  emit('update:visible', v)
})

// 本地表单副本
const localForm = reactive<PlanForm>({ ...props.form })

// 同步 props.form 到本地
watch(
  () => props.form,
  (newForm) => {
    Object.assign(localForm, newForm)
  },
  { deep: true }
)

// 保存
const handleSave = () => {
  emit('update:form', { ...localForm })
  emit('save')
}
</script>

<template>
  <QyDialog
    v-model:visible="localVisible"
    title="发布计划"
    size="md"
    :show-close="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
  >
    <div class="space-y-5">
      <!-- 计划名称 -->
      <div class="form-item">
        <label class="form-label">计划名称</label>
        <input
          v-model="localForm.name"
          type="text"
          class="form-input"
          placeholder="请输入计划名称"
        />
      </div>

      <!-- 发布类型 -->
      <div class="form-item">
        <label class="form-label">发布类型</label>
        <QySelect
          v-model="localForm.type"
          :options="publishTypeOptions.map(o => ({ label: o.label, value: o.value }))"
          placeholder="选择发布类型"
        />
      </div>

      <!-- 发布平台 -->
      <div class="form-item">
        <label class="form-label">发布平台</label>
        <div class="flex flex-wrap gap-4">
          <label
            v-for="option in publishPlatformOptions"
            :key="option.value"
            class="inline-flex items-center gap-2 cursor-pointer"
          >
            <input
              v-model="localForm.platforms"
              type="checkbox"
              :value="option.value"
              class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">{{ option.label }}</span>
          </label>
        </div>
      </div>

      <!-- 发布方式 -->
      <div class="form-item">
        <label class="form-label">发布方式</label>
        <div class="flex flex-wrap gap-4">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input v-model="localForm.scheduleType" type="radio" value="immediate" class="w-4 h-4" />
            <span class="text-sm text-gray-700">立即发布</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input v-model="localForm.scheduleType" type="radio" value="scheduled" class="w-4 h-4" />
            <span class="text-sm text-gray-700">定时发布</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input v-model="localForm.scheduleType" type="radio" value="manual" class="w-4 h-4" />
            <span class="text-sm text-gray-700">手动发布</span>
          </label>
        </div>
      </div>

      <!-- 定时发布设置 -->
      <template v-if="localForm.scheduleType === 'scheduled'">
        <div class="form-item flex items-center gap-3">
          <label class="form-label whitespace-nowrap">发布间隔</label>
          <input
            v-model.number="localForm.intervalDays"
            type="number"
            min="1"
            max="30"
            class="form-input w-24"
          />
          <span class="text-sm text-gray-500">天</span>
        </div>
        <div class="form-item flex items-center gap-3">
          <label class="form-label whitespace-nowrap">每次发布</label>
          <input
            v-model.number="localForm.chaptersPerRelease"
            type="number"
            min="1"
            max="10"
            class="form-input w-24"
          />
          <span class="text-sm text-gray-500">章</span>
        </div>
      </template>

      <!-- 定价设置 -->
      <div class="form-item">
        <label class="form-label">定价设置</label>
        <div class="flex items-center gap-4">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input v-model="localForm.isFree" type="radio" :value="true" class="w-4 h-4" />
            <span class="text-sm text-gray-700">免费</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input v-model="localForm.isFree" type="radio" :value="false" class="w-4 h-4" />
            <span class="text-sm text-gray-700">付费</span>
          </label>
        </div>
      </div>

      <!-- 付费设置 -->
      <template v-if="!localForm.isFree">
        <div class="form-item flex items-center gap-3">
          <label class="form-label whitespace-nowrap">章节价格</label>
          <input
            v-model.number="localForm.price"
            type="number"
            min="1"
            max="1000"
            class="form-input w-28"
          />
          <span class="text-sm text-gray-500">书币/章</span>
        </div>
        <div class="form-item flex items-center gap-3">
          <label class="form-label whitespace-nowrap">VIP折扣</label>
          <input
            v-model.number="localForm.vipDiscount"
            type="number"
            min="0"
            max="100"
            class="form-input w-24"
          />
          <span class="text-sm text-gray-500">%</span>
        </div>
      </template>
    </div>

    <template #footer>
      <QyButton variant="secondary" @click="localVisible = false">
        取消
      </QyButton>
      <QyButton variant="primary" @click="handleSave">
        保存
      </QyButton>
    </template>
  </QyDialog>
</template>

<style scoped>
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

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  font-size: 14px;
  color: #0f172a;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-select {
  width: 100%;
  height: 40px;
  padding: 0 36px 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")
    no-repeat right 10px center;
  background-size: 20px;
  appearance: none;
  font-size: 14px;
  color: #0f172a;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}
</style>
