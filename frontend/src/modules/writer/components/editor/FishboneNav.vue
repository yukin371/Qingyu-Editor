<template>
  <nav class="fishbone-nav" aria-label="大纲导航">
    <div class="fishbone-container">
      <div class="fishbone-trunk">
        <!-- 卷节点 -->
        <div
          v-for="volume in volumes"
          :key="volume.id"
          class="fishbone-volume"
          :class="{ active: currentVolumeId === volume.id }"
          @click="handleVolumeClick(volume)"
        >
          <!-- 上方章节分支 -->
          <div v-if="getTopChapters(volume).length" class="fishbone-chapters-top">
            <span
              v-for="chapter in getTopChapters(volume)"
              :key="chapter.id"
              class="fishbone-chapter-node"
              :class="{ active: currentChapterId === chapter.id }"
              @click.stop="handleChapterClick(chapter)"
            >
              {{ chapter.title }}
            </span>
          </div>

          <!-- 卷节点 -->
          <div class="fishbone-volume-node">
            <span class="volume-icon">📁</span>
            <span class="volume-name">{{ volume.title }}</span>
          </div>
          <div class="fishbone-volume-status">
            <span class="status-dot" :class="volume.status"></span>
            {{ volume.wordCount }}字
          </div>

          <!-- 下方章节分支 -->
          <div v-if="getBottomChapters(volume).length" class="fishbone-chapters-bottom">
            <span
              v-for="chapter in getBottomChapters(volume)"
              :key="chapter.id"
              class="fishbone-chapter-node"
              :class="{ active: currentChapterId === chapter.id }"
              @click.stop="handleChapterClick(chapter)"
            >
              {{ chapter.title }}
            </span>
          </div>
        </div>

        <!-- 连接线 -->
        <template v-for="_i in volumes.length - 1" :key="'connector-' + _i">
          <div class="fishbone-connector top"></div>
          <div class="fishbone-connector bottom"></div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">


interface Chapter {
  id: string
  title: string
  wordCount: number
  status: 'done' | 'active' | 'pending'
}

interface Volume {
  id: string
  title: string
  wordCount: number
  status: 'done' | 'active' | 'pending'
  chapters: Chapter[]
}

interface Props {
  volumes: Volume[]
  currentVolumeId?: string
  currentChapterId?: string
}

interface Emits {
  (e: 'volumeClick', volume: Volume): void
  (e: 'chapterClick', chapter: Chapter): void
}

const props = withDefaults(defineProps<Props>(), {
  volumes: () => [],
  currentVolumeId: '',
  currentChapterId: '',
})

const emit = defineEmits<Emits>()

// 获取上方章节（用于鱼骨图上方显示）
function getTopChapters(volume: Volume): Chapter[] {
  const chapters = volume.chapters || []
  // 奇数章节放上方
  return chapters.filter((_, index) => index % 2 === 0)
}

// 获取下方章节（用于鱼骨图下方显示）
function getBottomChapters(volume: Volume): Chapter[] {
  const chapters = volume.chapters || []
  // 偶数章节放下方
  return chapters.filter((_, index) => index % 2 === 1)
}

function handleVolumeClick(volume: Volume) {
  emit('volumeClick', volume)
}

function handleChapterClick(chapter: Chapter) {
  emit('chapterClick', chapter)
}
</script>

<style scoped lang="scss">
.fishbone-nav {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 20px;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
}

.fishbone-container {
  display: flex;
  align-items: center;
  min-width: max-content;
  padding: 8px 0;
}

.fishbone-trunk {
  display: flex;
  align-items: center;
  gap: 0;
}

// 主干线
.fishbone-trunk::before,
.fishbone-trunk::after {
  content: '';
  flex: 1;
  height: 3px;
  border-radius: 2px;
  min-width: 30px;
}

.fishbone-trunk::before {
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
}

.fishbone-trunk::after {
  background: linear-gradient(90deg, #a78bfa, #8b5cf6);
}

// 卷节点
.fishbone-volume {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 12px;
  padding: 8px 0;

  &:hover {
    transform: translateY(-2px);

    .fishbone-volume-node {
      border-color: #8b5cf6;
      box-shadow: 0 4px 16px rgba(139, 92, 246, 0.2);
    }
  }

  &.active {
    .fishbone-volume-node {
      background: #8b5cf6;
      border-color: #8b5cf6;
      color: #ffffff;
      box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
    }
  }
}

.fishbone-volume-node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #ffffff;
  border: 2px solid #a78bfa;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #8b5cf6;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);

  .volume-icon {
    font-size: 14px;
  }
}

.fishbone-volume-status {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 10px;
  color: #94a3b8;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    &.done { background: #4ade80; }
    &.active { background: #f59e0b; }
    &.pending { background: #cbd5e1; }
  }
}

// 上方章节分支
.fishbone-chapters-top {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column-reverse;
  gap: 4px;
  padding-bottom: 8px;
}

// 下方章节分支
.fishbone-chapters-bottom {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
}

.fishbone-chapter-node {
  padding: 4px 10px;
  background: #ffffff;
  border: 1px solid #60a5fa;
  border-radius: 10px;
  font-size: 11px;
  color: #3b82f6;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;

  // 连接线
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 6px;
    background: #60a5fa;
  }

  // 上方节点：线在上方
  .fishbone-chapters-top & {
    &::after {
      top: -6px;
    }

    &:hover {
      background: #3b82f6;
      color: #ffffff;
      border-color: #3b82f6;
    }
  }

  // 下方节点：线在下方
  .fishbone-chapters-bottom & {
    &::after {
      bottom: -6px;
      top: auto;
    }

    &:hover {
      background: #3b82f6;
      color: #ffffff;
      border-color: #3b82f6;
    }
  }

  &.active {
    background: #3b82f6;
    color: #ffffff;
    border-color: #3b82f6;
    font-weight: 600;
  }
}

// 连接线
.fishbone-connector {
  width: 24px;
  height: 2px;
  background: #e2e8f0;
  position: relative;
  flex-shrink: 0;

  &.top {
    background: linear-gradient(180deg, transparent 50%, #e2e8f0 50%);
  }

  &.bottom {
    background: linear-gradient(0deg, transparent 50%, #e2e8f0 50%);
  }
}
</style>
