<template>
  <QyDrawer v-model="drawerVisible" title="目录" direction="rtl" size="400px">
    <QyScrollbar>
      <div
        v-for="chapter in chapters"
        :key="chapter.id"
        class="catalog-item"
        :class="{
          'is-active': chapter.id === currentChapterId,
          'is-read': chapter.isRead,
          'is-locked': isChapterLocked(chapter),
        }"
        :data-testid="`catalog-chapter-${chapter.id}`"
        @click="$emit('jump', chapter.id)"
      >
        <span class="chapter-num">{{ chapter.chapterNum ?? '' }}</span>
        <span class="chapter-name">{{ chapter.title }}</span>
        <el-icon v-if="isChapterLocked(chapter)" class="lock-icon">
          <QyIcon name="Lock" />
        </el-icon>
      </div>
    </QyScrollbar>
  </QyDrawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyDrawer, QyScrollbar, QyIcon } from '@/design-system/components'

export interface ChapterItem {
  id: string
  chapterNum?: number
  title: string
  isRead?: boolean
  isFree?: boolean
  canAccess?: boolean
  accessReason?: string
}

const props = defineProps<{
  visible: boolean
  chapters: ChapterItem[]
  currentChapterId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'jump', chapterId: string): void
}>()

const drawerVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})

const isChapterLocked = (chapter: ChapterItem) => !chapter.isFree && chapter.canAccess === false
</script>

<style scoped lang="scss">
.catalog-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }

  &.is-active {
    background-color: #ecf5ff;
    color: #409eff;
  }

  &.is-read {
    color: #909399;
  }

  &.is-locked {
    .chapter-name {
      color: #c05621;
    }
  }

  .chapter-num {
    width: 60px;
    flex-shrink: 0;
    font-size: 14px;
    color: #909399;
  }

  .chapter-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lock-icon {
    margin-left: 8px;
    color: #f56c6c;
  }
}
</style>
