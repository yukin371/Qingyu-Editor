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
    <nav class="workspace-statusbar__stage-dock" aria-label="场景舞台">
      <button
        type="button"
        class="workspace-statusbar__stage-btn"
        :class="{ 'is-active': bottomPanelVisible && activeBottomPanelId === 'scene' }"
        :title="sceneStageSummary || sceneStageTitle || '打开场景舞台'"
        @click="handleStageClick"
      >
        <span class="workspace-statusbar__stage-label">场景舞台</span>
        <span class="workspace-statusbar__stage-title">{{ sceneStageTitle || '未命名场景' }}</span>
      </button>
    </nav>
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
import type { WorkspacePanelId } from '@/modules/writer/types/workspaceLayout'

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
  bottomPanelVisible?: boolean
  activeBottomPanelId?: WorkspacePanelId | null
  sceneStageTitle?: string
  sceneStageSummary?: string
}

const props = withDefaults(defineProps<Props>(), {
  extraStatusChips: () => [],
  isImmersiveMode: false,
  immersiveTimerText: '',
  projectWordCount: 0,
  bottomPanelVisible: false,
  activeBottomPanelId: 'scene',
  sceneStageTitle: '',
  sceneStageSummary: '',
})

const emit = defineEmits<{
  (e: 'toggle-bottom-panel'): void
  (e: 'select-bottom-panel', panelId: WorkspacePanelId): void
}>()

const handleStageClick = () => {
  if (props.bottomPanelVisible && props.activeBottomPanelId === 'scene') {
    emit('toggle-bottom-panel')
    return
  }

  emit('select-bottom-panel', 'scene')
  if (!props.bottomPanelVisible) {
    emit('toggle-bottom-panel')
  }
}

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

.workspace-statusbar__stage-dock {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  flex-shrink: 0;
}

.workspace-statusbar__stage-btn {
  height: 26px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: 999px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
  color: var(--editor-text-muted, #64748b);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;

  &:hover {
    color: var(--editor-text-primary, #0f172a);
    background: var(--editor-bg-elevated, #f1f5f9);
  }

  &.is-active {
    color: var(--editor-accent, #2563eb);
    background: var(--editor-accent-soft, #eff6ff);
  }
}

.workspace-statusbar__stage-label {
  color: inherit;
}

.workspace-statusbar__stage-title {
  max-width: 18vw;
  overflow: hidden;
  text-overflow: ellipsis;
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
  background: color-mix(in srgb, var(--color-warning-100, #fef3c7) 62%, transparent);
  border-color: color-mix(in srgb, var(--color-warning-300, #fcd34d) 40%, transparent);
  color: var(--color-warning-700, #b45309);
}

.workspace-statusbar__state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  color: var(--editor-text-ghost, #94a3b8);
  transition: color 0.3s ease;

  &.status-saved {
    color: var(--color-success-500, #67c23a);
  }

  &.status-saving {
    color: var(--color-info-500, #409eff);
  }

  &.status-unsaved {
    color: var(--color-warning-500, #e6a23c);
  }
}

.workspace-statusbar__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--color-success-400, #48e594);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success-400, #48e594) 22%, transparent);
  flex-shrink: 0;
}

@media (max-width: 1024px) {
  .workspace-statusbar {
    padding: 0 10px;
  }
}
</style>
