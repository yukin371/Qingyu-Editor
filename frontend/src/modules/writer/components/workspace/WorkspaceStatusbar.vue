<template>
  <footer class="workspace-statusbar" :class="{ 'workspace-statusbar--immersive': isImmersiveMode }">
    <div class="workspace-statusbar__stats">
      <!-- 写作统计 -->
      <WritingStatsChip v-if="displayTotalWords > 0" label="总字数" :value="displayTotalWords" />
      <WritingStatsChip v-if="displayTodayWords > 0" label="今日" :value="displayTodayWords" class="today-chip" />

      <span class="status-chip">{{ chapterCount }} 章节</span>
      <span class="status-chip">{{ directoryCount }} 目录</span>
      <span v-if="activeToolLabel" class="status-chip">{{ activeToolLabel }}</span>
      <span
        v-for="chip in extraStatusChips"
        :key="chip"
        class="status-chip status-chip--accent"
      >
        {{ chip }}
      </span>
      <span v-if="isImmersiveMode" class="status-chip status-chip--warm">沉浸 {{ immersiveTimerText }}</span>
    </div>
    <div class="workspace-statusbar__state" :class="saveStatusClass">
      <span class="workspace-statusbar__dot" />
      <span>{{ isImmersiveMode ? '沉浸写作进行中' : (saveStatusLabel || '等待同步') }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import WritingStatsChip from '@/modules/writer/components/WritingStatsChip.vue'
import { useWritingStats, getGlobalTodayWords } from '@/modules/writer/composables/useWritingStats'

export interface Props {
  chapterCount: number
  directoryCount: number
  activeToolLabel: string
  saveStatusLabel: string
  extraStatusChips?: string[]
  isImmersiveMode: boolean
  immersiveTimerText: string
  /** 项目总字数（可选） */
  projectWordCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  extraStatusChips: () => [],
  isImmersiveMode: false,
  immersiveTimerText: '',
  projectWordCount: 0,
})

// 写作统计 Composable
const { todayStats, initTodayStats } = useWritingStats()

// 今日码字（优先使用本地计算的值）
const displayTodayWords = computed(() => {
  const localToday = getGlobalTodayWords()
  const statsToday = todayStats.value.todayWords || 0
  return localToday > 0 ? localToday : statsToday
})

// 总字数（优先使用传入的项目字数，否则使用今日统计）
const displayTotalWords = computed(() => {
  return props.projectWordCount || todayStats.value.todayWords || 0
})

// 根据保存状态计算样式类
const saveStatusClass = computed(() => {
  const label = props.saveStatusLabel
  if (label === '已保存') return 'status-saved'
  if (label === '保存中...') return 'status-saving'
  if (label === '未保存') return 'status-unsaved'
  return ''
})

// 初始化统计
onMounted(() => {
  initTodayStats()
})
</script>

<style scoped lang="scss">
.workspace-statusbar {
  height: 32px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--editor-bg-surface, #f8fafc);
  border-top: 1px solid var(--editor-border, #e2e8f0);
  color: var(--editor-text-ghost, #94a3b8);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.workspace-statusbar--immersive {
  opacity: 0.6;
}

.workspace-statusbar__stats {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  white-space: nowrap;
  flex: 1;
  min-width: 0;

  &::-webkit-scrollbar {
    display: none;
  }
}

.status-chip {
  padding: 1px 6px;
  border-radius: var(--editor-radius-sm, 4px);
  background: var(--editor-bg-elevated, #f1f5f9);
  color: var(--editor-text-ghost, #94a3b8);
  border: 1px solid var(--editor-border, #e2e8f0);
  font-size: 10px;
  white-space: nowrap;
}

.status-chip--accent {
  background: var(--editor-accent-soft, #ecfeff);
  border-color: rgba(6, 182, 212, 0.2);
  color: var(--editor-accent, #06b6d4);
}

.status-chip--warm {
  background: rgba(143, 63, 47, 0.06);
  border-color: rgba(143, 63, 47, 0.1);
  color: #7b3123;
}

.workspace-statusbar__state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  color: var(--editor-text-ghost, #94a3b8);
  transition: color 0.3s ease;

  &.status-saved {
    color: #67c23a;
  }

  &.status-saving {
    color: #409eff;
  }

  &.status-unsaved {
    color: #e6a23c;
  }
}

.workspace-statusbar__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #48e594;
  box-shadow: 0 0 0 3px rgba(72, 229, 148, 0.2);
  flex-shrink: 0;
}

@media (max-width: 1024px) {
  .workspace-statusbar {
    padding: 0 10px;
  }
}
</style>
