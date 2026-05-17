<template>
  <header class="workspace-topbar">
    <div class="workspace-topbar__left">
      <div class="topbar-brand">作家2</div>
      <button class="topbar-back-btn" :title="'返回工作台'" @click="$emit('back')">
        <QyIcon name="Files" :size="14" />
        <span>{{ projectDisplayName }}</span>
      </button>
    </div>

    <div class="workspace-topbar__center">
      <span class="chapter-title">{{ currentChapterTitle || '未选择章节' }}</span>
      <span v-if="saveStatusLabel" class="status-text">· {{ saveStatusLabel }}</span>
      <span class="tool-chip">{{ activeToolLabel }}</span>
    </div>

    <div class="workspace-topbar__right">
      <div class="topbar-quick-actions">
        <button
          class="topbar-icon-btn"
          :title="isImmersiveMode ? '退出全屏' : '全屏'"
          @click="$emit('toggle-immersive')"
        >
          <QyIcon :name="isImmersiveMode ? 'Minus' : 'FullScreen'" :size="14" />
        </button>
        <button class="topbar-icon-btn" :title="'设定'" @click="$emit('open-right-tool', 'assets')">
          <QyIcon name="FolderOpened" :size="14" />
        </button>
        <button
          class="topbar-icon-btn"
          :title="'校对'"
          @click="$emit('open-right-tool', 'proofread')"
        >
          <QyIcon name="CircleCheck" :size="14" />
        </button>
        <button
          class="topbar-icon-btn"
          :title="'灵感'"
          @click="$emit('open-right-tool', 'inspiration')"
        >
          <QyIcon name="MagicStick" :size="14" />
        </button>
        <button class="topbar-icon-btn" :title="'AI 助手'" @click="$emit('open-right-tool', 'ai')">
          <QyIcon name="ChatDotRound" :size="14" />
        </button>
      </div>

      <button class="topbar-btn topbar-btn--compact" :title="'保存'" @click="$emit('save')">
        <QyIcon name="DocumentChecked" :size="14" />
      </button>
      <button class="topbar-btn topbar-btn--compact topbar-btn--primary" :title="'导出正文'" @click="$emit('export')">
        <QyIcon name="Download" :size="14" />
      </button>
      <button
        class="topbar-btn topbar-btn--icon"
        :title="'设置'"
        @click="showWorkspaceSettings = true"
      >
        <QyIcon name="SetUp" :size="16" />
      </button>
      <div class="topbar-divider"></div>

      <div class="topbar-overflow" @click.stop>
        <button class="topbar-btn topbar-btn--icon" :title="'更多操作'" @click="overflowOpen = !overflowOpen">
          <QyIcon name="MoreFilled" :size="16" />
        </button>
        <div v-if="overflowOpen" class="topbar-overflow__menu">
          <button class="topbar-overflow__item" @click="$emit('share'); overflowOpen = false">
            <QyIcon name="Share" :size="14" />
            <span>分享</span>
          </button>
          <button
            class="topbar-overflow__item"
            @click="$emit('toggle-bottom-panel'); overflowOpen = false"
          >
            <QyIcon name="Memo" :size="14" />
            <span>场景舞台</span>
          </button>
          <button
            class="topbar-overflow__item"
            @click="showShortcutSettings = true; overflowOpen = false"
          >
            <QyIcon name="SetUp" :size="14" />
            <span>快捷键设置</span>
          </button>
          <div class="topbar-overflow__divider"></div>
          <div class="topbar-overflow__label">布局预设</div>
          <button
            class="topbar-overflow__item"
            @click="$emit('apply-layout-preset', 'default'); overflowOpen = false"
          >
            <QyIcon name="Monitor" :size="14" />
            <span>默认</span>
          </button>
          <button
            class="topbar-overflow__item"
            @click="$emit('apply-layout-preset', 'focus'); overflowOpen = false"
          >
            <QyIcon name="Crop" :size="14" />
            <span>专注</span>
          </button>
          <button
            class="topbar-overflow__item"
            @click="$emit('apply-layout-preset', 'outline-first'); overflowOpen = false"
          >
            <QyIcon name="Memo" :size="14" />
            <span>大纲优先</span>
          </button>
          <button
            class="topbar-overflow__item"
            @click="$emit('apply-layout-preset', 'ai-first'); overflowOpen = false"
          >
            <QyIcon name="MagicStick" :size="14" />
            <span>AI 优先</span>
          </button>
        </div>
      </div>
    </div>

    <QyDialog
      v-model:visible="showShortcutSettings"
      title="快捷键设置"
      size="lg"
      :close-on-click-modal="true"
      class="shortcut-settings-dialog"
    >
      <ShortcutSettingsPanel />
    </QyDialog>

    <QyDialog
      v-model:visible="showWorkspaceSettings"
      title="工作区设置"
      size="full"
      :close-on-click-modal="true"
      class="workspace-settings-dialog"
    >
      <WorkspaceSettingsPanel />
    </QyDialog>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { QyDialog } from '@/design-system/components'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import ShortcutSettingsPanel from '../settings/ShortcutSettingsPanel.vue'
import WorkspaceSettingsPanel from '../settings/WorkspaceSettingsPanel.vue'
import type { WorkspaceLayoutPreset } from '@/modules/writer/types/workspaceLayout'

defineProps<{
  projectDisplayName: string
  currentChapterTitle: string
  activeToolLabel: string
  saveStatusLabel: string
  isImmersiveMode: boolean
}>()

defineEmits<{
  (e: 'back'): void
  (e: 'save'): void
  (e: 'export'): void
  (e: 'share'): void
  (e: 'toggle-bottom-panel'): void
  (e: 'toggle-immersive'): void
  (e: 'open-right-tool', tool: 'ai' | 'assets' | 'proofread' | 'inspiration'): void
  (e: 'apply-layout-preset', preset: WorkspaceLayoutPreset): void
}>()

const overflowOpen = ref(false)
const showShortcutSettings = ref(false)
const showWorkspaceSettings = ref(false)

function closeOverflow() {
  overflowOpen.value = false
}

onMounted(() => document.addEventListener('click', closeOverflow))
onUnmounted(() => document.removeEventListener('click', closeOverflow))
</script>

<style scoped lang="scss">
.workspace-topbar {
  height: 48px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 96%, transparent),
    color-mix(
      in srgb,
      var(--editor-layer-soft, var(--editor-bg-surface, #f5f7fa)) 92%,
      var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 8%
    )
  );
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.workspace-topbar__left {
  min-width: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  background: var(--editor-bg-elevated, #e8edf5);
  color: var(--editor-text-secondary, #334155);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.topbar-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 88%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 88%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
  white-space: nowrap;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: var(--editor-bg-elevated, var(--editor-bg-base, #ffffff));
    border-color: var(--editor-accent-soft-border, #93c5fd);
    color: var(--editor-text-primary, #0f172a);
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.workspace-topbar__center {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
}

.chapter-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--editor-text-primary, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 360px;
}

.status-text {
  font-size: 11px;
  color: var(--editor-text-ghost, #94a3b8);
  white-space: nowrap;
  flex-shrink: 0;
}

.tool-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--editor-bg-elevated, #eef2f7);
  color: var(--editor-text-secondary, #475569);
  font-size: 11px;
  font-weight: 600;
}

.workspace-topbar__right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.topbar-quick-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 88%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--editor-layer-glass, var(--editor-bg-base, #ffffff)) 90%, transparent);
}

.topbar-icon-btn {
  display: inline-flex;
  align-items: center;
  height: 30px;
  width: 30px;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--editor-text-secondary, #475569);
  cursor: pointer;
  transition:
    background 120ms ease,
    color 120ms ease;

  &:hover {
    background: var(--editor-bg-elevated, #eef2f7);
    color: var(--editor-text-primary, #0f172a);
  }
}

.topbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 88%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 94%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  white-space: nowrap;

  &:hover {
    background: var(--editor-bg-elevated, var(--editor-bg-base, #ffffff));
    border-color: var(--editor-accent-soft-border, #93c5fd);
    color: var(--editor-text-primary, #0f172a);
  }

  &--primary {
    background: var(--editor-accent, #2563eb);
    border-color: var(--editor-accent, #2563eb);
    color: var(--editor-text-inverse, #ffffff);

    &:hover {
      background: var(--editor-accent-hover, #1d4ed8);
      border-color: var(--editor-accent-hover, #1d4ed8);
      color: var(--editor-text-inverse, #ffffff);
    }
  }

  &--icon {
    padding: 0 8px;
  }

  &--compact {
    width: 32px;
    justify-content: center;
    padding: 0;
  }
}

.topbar-divider {
  width: 1px;
  height: 20px;
  background: color-mix(in srgb, var(--editor-border, #cbd5e1) 88%, transparent);
  margin: 0 2px;
}

.topbar-overflow {
  position: relative;
}

.topbar-overflow__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 88%, transparent);
  border-radius: 10px;
  box-shadow: var(--editor-shadow-lg, 0 16px 32px rgba(15, 23, 42, 0.1));
  padding: 6px;
  z-index: 100;
  min-width: 160px;
}

.topbar-overflow__item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-primary, #0f172a);
  }
}

.topbar-overflow__divider {
  height: 1px;
  background: var(--editor-border, #e2e8f0);
  margin: 4px 8px;
}

.topbar-overflow__label {
  padding: 4px 10px 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--editor-text-ghost, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

</style>

<style lang="scss">
.workspace-settings-dialog {
  width: min(920px, calc(100vw - 48px));
  height: min(760px, calc(100vh - 72px));
  max-width: min(920px, calc(100vw - 48px)) !important;
  max-height: min(760px, calc(100vh - 72px));
  margin: 0;
  border-radius: 28px;
}

.workspace-settings-dialog > .flex-1 {
  padding: 0;
}
</style>
