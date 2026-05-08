<template>
  <div class="emoji-picker" v-if="visible">
    <div class="emoji-grid">
      <div
        v-for="emoji in emojis"
        :key="emoji"
        class="emoji-item"
        @click="$emit('select', emoji)"
      >
        {{ emoji }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(true)

const emojis = [
  '👍', '❤️', '😂', '😮', '😢', '😡',
  '🎉', '🔥', '👏', '👀', '✨', '💯'
]

defineEmits<{
  select: [emoji: string]
  close: []
}>()
</script>

<style scoped lang="scss">
.emoji-picker {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  padding: 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.emoji-item {
  font-size: 24px;
  text-align: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
  }
}
</style>
