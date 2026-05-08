<template>
  <div class="tag-filter" data-testid="tag-filter">
    <div class="tag-scroll-wrapper">
      <!-- 已选标签 -->
      <TransitionGroup name="tag-list">
        <div
          v-for="tag in selectedTags"
          :key="tag"
          class="selected-tag"
        >
          <span class="tag-text">{{ tag }}</span>
          <button
            @click="removeTag(tag)"
            class="tag-close"
            type="button"
          >
            ×
          </button>
        </div>
      </TransitionGroup>

      <!-- 添加标签按钮 -->
      <button
        v-if="canAddMore"
        @click="showDropdown = !showDropdown"
        class="add-tag-chip"
        type="button"
      >
        <Icon name="plus" size="sm" />
        <span>添加标签</span>
        <span v-if="maxSelected > 0" class="tag-count">
          {{ selectedTags.length }}/{{ maxSelected }}
        </span>
      </button>

      <!-- 已达上限提示 -->
      <div v-else class="max-tags-hint">
        <Icon name="information-circle" size="sm" />
        <span>最多选择{{ maxSelected }}个标签</span>
      </div>
    </div>

    <!-- 性能提示 -->
    <div v-if="shouldShowPerfWarning" class="perf-warning">
      <Icon name="exclamation-triangle" size="sm" />
      <span>标签过多可能影响搜索性能</span>
    </div>

    <div v-if="showDropdown" class="tag-dropdown">
      <button
        v-for="tag in unselectedTags"
        :key="tag"
        class="tag-option"
        type="button"
        @click="addTag(tag)"
      >
        {{ tag }}
      </button>
      <div v-if="unselectedTags.length === 0" class="tag-option-empty">没有更多标签</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@/design-system/base/Icon'

interface Props {
  selectedTags: string[]
  availableTags: string[]
  maxSelected?: number
  recommendLimit?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxSelected: 8,
  recommendLimit: 3
})

const emit = defineEmits<{
  'update:selectedTags': [tags: string[]]
}>()

const showDropdown = ref(false)

const canAddMore = computed(() => {
  return props.maxSelected === 0 || props.selectedTags.length < props.maxSelected
})

const shouldShowPerfWarning = computed(() => {
  return props.selectedTags.length >= props.recommendLimit
})

const unselectedTags = computed(() => {
  return props.availableTags.filter(tag => !props.selectedTags.includes(tag))
})

const removeTag = (tagName: string) => {
  const newTags = props.selectedTags.filter(t => t !== tagName)
  emit('update:selectedTags', newTags)
}

const addTag = (tagName: string) => {
  if (props.selectedTags.includes(tagName)) return
  if (!canAddMore.value) return
  
  const newTags = [...props.selectedTags, tagName]
  emit('update:selectedTags', newTags)
  showDropdown.value = false
}
</script>

<style scoped lang="scss">
.tag-filter {
  width: 100%;
  margin-bottom: 16px;
}

.tag-scroll-wrapper {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.selected-tag {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;

  .tag-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.add-tag-chip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #ecf5ff;
    border-color: #409eff;
    color: #409eff;
  }

  .tag-count {
    font-size: 11px;
    color: #909399;
  }
}

.max-tags-hint {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #fef0f0;
  border-radius: 16px;
  font-size: 12px;
  color: #f56c6c;
}

.perf-warning {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #e6a23c;
}

.tag-dropdown {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-option {
  border: 1px solid #dbe3ef;
  background: #f8fafc;
  color: #475569;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #409eff;
    color: #409eff;
    background: #ecf5ff;
  }
}

.tag-option-empty {
  color: #9ca3af;
  font-size: 12px;
  padding: 4px 2px;
}

.tag-list-enter-active,
.tag-list-leave-active {
  transition: all 0.3s ease;
}

.tag-list-enter-from,
.tag-list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@media (max-width: 640px) {
  .tag-scroll-wrapper {
    gap: 6px;
  }

  .selected-tag,
  .add-tag-chip {
    padding: 4px 10px;
    font-size: 12px;
  }
}
</style>
