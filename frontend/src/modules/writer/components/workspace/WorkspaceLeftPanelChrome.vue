<template>
  <aside v-if="collapsed" class="workspace-left-dock" aria-label="左侧工具栏">
    <button
      type="button"
      class="dock-item"
      :class="{ active: activeTab === 'chapters' }"
      title="章节"
      @click="$emit('select-tab', 'chapters')"
    >
      <QyIcon name="Document" :size="18" />
    </button>
    <button
      type="button"
      class="dock-item"
      :class="{ active: activeTab === 'outline' }"
      title="大纲"
      @click="$emit('select-tab', 'outline')"
    >
      <QyIcon name="Memo" :size="18" />
    </button>
    <button
      type="button"
      class="dock-item dock-item--primary"
      title="结构舞台"
      @click="$emit('open-tool', 'structure')"
    >
      <QyIcon name="Grid" :size="18" />
    </button>

    <div class="dock-divider"></div>

    <button type="button" class="dock-item" title="资产总览" @click="$emit('open-tool', 'assets')">
      <QyIcon name="Collection" :size="18" />
    </button>
    <button type="button" class="dock-item" title="展开更多工具" @click="$emit('toggle')">
      <QyIcon name="ArrowRight" :size="18" />
    </button>
  </aside>

  <header v-else class="workspace-left-tabs">
    <div class="tab-group">
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === 'chapters' }"
        @click="$emit('set-tab', 'chapters')"
      >
        章节
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === 'outline' }"
        @click="$emit('set-tab', 'outline')"
      >
        大纲
      </button>
    </div>

    <button
      type="button"
      class="primary-tool-btn"
      title="打开结构舞台"
      @click="$emit('open-tool', 'structure')"
    >
      <QyIcon name="Grid" :size="14" />
      <span>结构舞台</span>
    </button>

    <div class="more-tools-dropdown" v-click-outside="handleCloseMoreMenu">
      <button
        type="button"
        class="more-btn"
        :class="{ active: moreMenuOpen }"
        @click="$emit('toggle-more-menu')"
      >
        工具
      </button>
      <div v-if="moreMenuOpen" class="dropdown-menu">
        <button
          type="button"
          class="dropdown-item dropdown-item--featured"
          @click="$emit('open-tool', 'assets')"
        >
          <QyIcon name="Collection" :size="14" />
          <span>资产总览</span>
        </button>
        <div class="dropdown-section-label">专业工具</div>
        <button type="button" class="dropdown-item" @click="$emit('open-tool', 'relations')">
          <QyIcon name="Share" :size="14" />
          <span>关系图谱</span>
        </button>
        <button type="button" class="dropdown-item" @click="$emit('open-tool', 'timeline')">
          <QyIcon name="Clock" :size="14" />
          <span>时间线</span>
        </button>
        <button type="button" class="dropdown-item" @click="$emit('open-tool', 'branches')">
          <QyIcon name="Connection" :size="14" />
          <span>故事分支</span>
        </button>
      </div>
    </div>

    <button type="button" class="collapse-btn" title="折叠面板" @click="$emit('toggle')">
      <QyIcon name="ArrowLeft" :size="14" />
    </button>
  </header>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'

defineProps<{
  collapsed: boolean
  activeTab: 'chapters' | 'outline'
  moreMenuOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'set-tab', tab: 'chapters' | 'outline'): void
  (e: 'select-tab', tab: 'chapters' | 'outline'): void
  (e: 'open-tool', tool: string): void
  (e: 'toggle-more-menu'): void
  (e: 'close-more-menu'): void
}>()

function handleCloseMoreMenu() {
  emit('close-more-menu')
}

const vClickOutside = {
  mounted(el: HTMLElement & { clickOutsideEvent?: (event: MouseEvent) => void }, binding: any) {
    el.clickOutsideEvent = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: HTMLElement & { clickOutsideEvent?: (event: MouseEvent) => void }) {
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent)
    }
  },
}
</script>

<style scoped lang="scss">
.workspace-left-tabs {
  height: 44px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-bg-surface, #f8fafc);
  flex-shrink: 0;
}

.tab-group {
  display: flex;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.primary-tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(50, 83, 106, 0.16);
  border-radius: var(--editor-radius-md, 6px);
  background: rgba(236, 254, 255, 0.72);
  color: var(--editor-accent, #06b6d4);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease-out;
  flex-shrink: 0;
  white-space: nowrap;

  &:hover {
    background: rgba(236, 254, 255, 0.96);
    color: var(--editor-text-primary, #0f172a);
    border-color: rgba(50, 83, 106, 0.24);
  }
}

.tab-btn {
  flex: 1;
  padding: 6px 10px;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 120ms ease-out;
  white-space: nowrap;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-secondary, #334155);
  }

  &.active {
    background: var(--editor-accent-soft, #ecfeff);
    color: var(--editor-accent, #06b6d4);
    font-weight: 600;
  }
}

.more-tools-dropdown {
  position: relative;
  flex-shrink: 0;
}

.more-btn {
  min-width: 40px;
  height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease-out;
  line-height: 1;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-secondary, #334155);
  }

  &.active {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-accent, #06b6d4);
  }
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 156px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: var(--editor-radius-lg, 8px);
  box-shadow: var(--editor-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08));
  padding: 4px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 120ms ease-out;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-primary, #0f172a);
  }

  span {
    flex: 1;
  }
}

.dropdown-item--featured {
  background: color-mix(in srgb, var(--editor-layer-accent, rgba(236, 254, 255, 0.56)) 72%, transparent);
  color: var(--editor-accent, #06b6d4);
}

.dropdown-section-label {
  padding: 6px 10px 4px;
  color: var(--editor-text-muted, #64748b);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.collapse-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  cursor: pointer;
  transition: all 120ms ease-out;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-secondary, #334155);
  }
}

.workspace-left-dock {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  gap: 4px;
  height: 100%;
  background: var(--editor-bg-actbar, #f1f5f9);
  border-right: 1px solid var(--editor-border, #e2e8f0);
}

.dock-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-actbar-icon, #64748b);
  cursor: pointer;
  transition:
    background 120ms ease-out,
    color 120ms ease-out;

  &:hover {
    background: var(--editor-bg-elevated, #e8edf2);
    color: var(--editor-text-primary, #0f172a);
  }

  &.active {
    background: var(--editor-accent-soft, #ecfeff);
    color: var(--editor-accent, #06b6d4);
  }

  &--primary {
    color: var(--editor-accent, #06b6d4);

    &:not(.active) {
      background: rgba(6, 182, 212, 0.08);
    }

    &:hover {
      background: rgba(6, 182, 212, 0.14);
      color: var(--editor-accent, #06b6d4);
    }
  }
}

.dock-divider {
  width: 24px;
  height: 1px;
  background: var(--editor-border, #e2e8f0);
  margin: 4px 0;
}

@media (max-width: 1024px) {
  .workspace-left-tabs {
    padding: 0 8px;
  }

  .tab-btn {
    font-size: 12px;
    padding: 6px 8px;
  }

  .primary-tool-btn {
    padding: 0 8px;

    span {
      display: none;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .tab-btn,
  .primary-tool-btn,
  .more-btn,
  .collapse-btn,
  .dropdown-item {
    transition: none;
  }
}
</style>
