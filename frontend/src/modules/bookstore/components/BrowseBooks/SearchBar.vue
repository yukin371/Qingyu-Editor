<template>
  <div class="search-bar" data-testid="search-bar">
    <div class="input-wrapper">
      <Icon name="magnifying-glass" class="search-icon" />
      <input
        id="browse-search-input"
        name="search"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keyup.enter="handleEnter"
        :placeholder="placeholder"
        class="search-input"
      />
      <button
        v-if="modelValue"
        @click="handleClear"
        class="clear-btn"
        type="button"
      >
        <Icon name="x-mark" size="sm" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/design-system/base/Icon'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索书名、作者、标签...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
  'clear': []
}>()

const handleEnter = () => {
  if (props.modelValue.trim()) {
    emit('search', props.modelValue)
  }
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style scoped lang="scss">
.search-bar {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 12px 16px;
  transition: all 0.3s;

  &:focus-within {
    border-color: #409eff;
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
  }

  .search-icon {
    color: #9ca3af;
    margin-right: 12px;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 15px;
    color: #1f2937;

    &::placeholder {
      color: #9ca3af;
    }
  }

  .clear-btn {
    padding: 4px;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
      background: #f3f4f6;
      color: #4b5563;
    }
  }
}

@media (max-width: 640px) {
  .search-bar {
    max-width: 100%;
  }

  .input-wrapper {
    padding: 10px 14px;
    border-radius: 14px;

    .search-icon {
      margin-right: 10px;
    }

    .search-input {
      font-size: 14px;
    }

    .clear-btn {
      padding: 3px;
    }
  }
}
</style>
