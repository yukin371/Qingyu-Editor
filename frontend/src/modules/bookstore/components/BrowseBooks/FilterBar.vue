<template>
  <div class="filter-bar" data-testid="filter-bar">
    <div class="filter-scroll-wrapper">
      <!-- 分类筛选 -->
      <QySelect
        :model-value="categoryId"
        @update:model-value="(val: string | number) => $emit('update:categoryId', normalizeSelectValue(val))"
        :options="categoryOptions"
        placeholder="分类"
        clearable
        class="filter-select"
      />

      <!-- 年份筛选 -->
      <QySelect
        :model-value="year"
        @update:model-value="(val: string | number) => $emit('update:year', normalizeSelectValue(val))"
        :options="yearOptions"
        placeholder="年份"
        clearable
        class="filter-select"
      />

      <!-- 状态筛选 -->
      <QySelect
        :model-value="status"
        @update:model-value="(val: string | number) => $emit('update:status', normalizeSelectValue(val))"
        :options="statusOptions"
        placeholder="状态"
        clearable
        class="filter-select"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QySelect } from '@/design-system/form/Select'
import type { Category } from '@/types/models'
import type { SelectOption } from '@/design-system/form/Select/types'

interface Props {
  categoryId: string
  year: string
  status: string
  categories: Category[]
  years: string[]
  statuses: Array<{ value: string; label: string }>
}

const props = defineProps<Props>()

defineEmits<{
  'update:categoryId': [value: string]
  'update:year': [value: string]
  'update:status': [value: string]
}>()

const normalizeSelectValue = (
  value: string | number
): string => {
  return String(value)
}

const flattenCategories = (items: any[] = []): any[] => {
  const result: any[] = []
  items.forEach((item) => {
    if (Array.isArray(item?.children) && item.children.length > 0) {
      result.push(...flattenCategories(item.children))
      return
    }
    result.push(item)
  })
  return result
}

// 转换分类数据为 Select options
const categoryOptions = computed<SelectOption[]>(() => [
  { value: '', label: '全部分类' },
  ...flattenCategories(props.categories as any[]).map((cat: any) => ({
    value: cat.id || cat._id,
    label: cat.name
  }))
])

// 转换年份数据为 Select options
const yearOptions = computed<SelectOption[]>(() => [
  { value: '', label: '全部年份' },
  ...props.years.map(yr => ({ value: yr, label: yr }))
])

// 转换状态数据为 Select options
const statusOptions = computed<SelectOption[]>(() => [
  { value: '', label: '全部状态' },
  ...props.statuses.map(st => ({ value: st.value, label: st.label }))
])
</script>

<style scoped lang="scss">
.filter-bar {
  width: 100%;
  margin-bottom: 16px;
}

.filter-scroll-wrapper {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-select {
  flex-shrink: 0;
  min-width: 100px;

  :deep(.select-trigger) {
    height: 40px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #fff;
  }
}

@media (max-width: 640px) {
  .filter-select {
    min-width: 85px;

    :deep(.select-trigger) {
      height: 36px;
      font-size: 13px;
    }
  }
}
</style>
