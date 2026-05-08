<template>
  <div class="project-tree">
    <div
      v-for="chapter in chapters"
      :key="chapter.id"
      class="chapter-item"
      :class="{ active: chapter.id === currentChapterId }"
      :data-id="chapter.id"
      @click="handleChapterClick(chapter.id)"
    >
      <div class="chapter-content">
        <span v-if="chapter.children?.length" class="expand-button" @click.stop="toggleExpand(chapter.id)">
          <QyIcon :name="expandedChapters.has(chapter.id) ? 'ArrowDown' : 'ArrowRight'" />
        </span>
        <span class="chapter-title">{{ chapter.title }}</span>
      </div>

      <div v-if="chapter.children?.length && expandedChapters.has(chapter.id)" class="child-chapters">
        <ProjectTree
          :chapters="chapter.children"
          :current-chapter-id="currentChapterId"
          :project-id="projectId"
          @chapter-select="$emit('chapterSelect', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Chapter {
  id: string
  title: string
  children?: Chapter[]
}

defineProps<{
  projectId: string
  chapters: Chapter[]
  currentChapterId: string
}>()

const emit = defineEmits<{
  chapterSelect: [chapterId: string]
}>()

const expandedChapters = ref<Set<string>>(new Set())

const handleChapterClick = (chapterId: string) => {
  emit('chapterSelect', chapterId)
}

const toggleExpand = (chapterId: string) => {
  if (expandedChapters.value.has(chapterId)) {
    expandedChapters.value.delete(chapterId)
  } else {
    expandedChapters.value.add(chapterId)
  }
}
</script>

<style scoped lang="scss">
.project-tree {
  .chapter-item {
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.active {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }

  .chapter-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .expand-button {
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    padding: 2px;
  }

  .chapter-title {
    font-size: 14px;
    flex: 1;
  }

  .child-chapters {
    margin-left: 20px;
  }
}
</style>
