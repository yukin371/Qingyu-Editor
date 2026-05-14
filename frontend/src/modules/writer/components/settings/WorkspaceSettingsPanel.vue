<template>
  <div class="workspace-settings-panel">
    <header class="workspace-settings-panel__header">
      <h2>外观与写作偏好</h2>
      <button type="button" class="workspace-settings-panel__reset" @click="appearanceStore.resetAppearance()">
        恢复默认
      </button>
    </header>

    <div class="workspace-settings-panel__tabs">
      <button
        type="button"
        class="workspace-settings-panel__tab"
        :class="{ 'is-active': activeTab === 'appearance' }"
        @click="activeTab = 'appearance'"
      >
        外观
      </button>
      <button
        type="button"
        class="workspace-settings-panel__tab"
        :class="{ 'is-active': activeTab === 'shortcuts' }"
        @click="activeTab = 'shortcuts'"
      >
        快捷键
      </button>
    </div>

    <section v-if="activeTab === 'appearance'" class="workspace-settings-panel__body">
      <div class="workspace-settings-panel__section">
        <div class="workspace-settings-panel__section-title">主题</div>
        <div class="workspace-settings-panel__theme-grid">
          <button
            v-for="option in editorThemeStore.themeOptions"
            :key="option.value"
            type="button"
            class="workspace-settings-panel__theme-card"
            :class="{ 'is-active': editorThemeStore.currentTheme === option.value }"
            @click="editorThemeStore.setTheme(option.value as EditorThemeName)"
          >
            <span
              class="workspace-settings-panel__theme-preview"
              :style="{
                background: `linear-gradient(135deg, ${option.preview.base} 0%, ${option.preview.accentSoft} 100%)`,
                '--theme-preview-accent': option.preview.accent,
              }"
            ></span>
            <strong>{{ option.label }}</strong>
          </button>
        </div>
      </div>

      <div class="workspace-settings-panel__section">
        <div class="workspace-settings-panel__section-title">版式</div>
        <label class="workspace-settings-panel__field">
          <span>字体风格</span>
          <select v-model="appearanceStore.fontFamily">
            <option value="serif">小说衬线</option>
            <option value="sans">简洁无衬线</option>
          </select>
        </label>

        <label class="workspace-settings-panel__field">
          <span>字号 {{ appearanceStore.fontSize }}px</span>
          <input v-model.number="appearanceStore.fontSize" type="range" min="16" max="26" step="1" />
        </label>

        <label class="workspace-settings-panel__field">
          <span>行距 {{ appearanceStore.lineHeight.toFixed(2) }}</span>
          <input
            v-model.number="appearanceStore.lineHeight"
            type="range"
            min="1.6"
            max="2.4"
            step="0.05"
          />
        </label>

        <label class="workspace-settings-panel__field">
          <span>版心宽度 {{ appearanceStore.contentWidth }}px</span>
          <input
            v-model.number="appearanceStore.contentWidth"
            type="range"
            min="680"
            max="1080"
            step="10"
          />
        </label>
      </div>

      <div class="workspace-settings-panel__section">
        <div class="workspace-settings-panel__section-title">工具栏</div>
        <label class="workspace-settings-panel__switch">
          <input v-model="appearanceStore.compactToolbar" type="checkbox" />
          <span>紧凑写作工具栏</span>
        </label>
      </div>
    </section>

    <section v-else class="workspace-settings-panel__body workspace-settings-panel__body--shortcuts">
      <ShortcutSettingsPanel />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ShortcutSettingsPanel from './ShortcutSettingsPanel.vue'
import {
  useEditorThemeStore,
  type EditorThemeName,
} from '@/modules/writer/stores/editorThemeStore'
import { useEditorAppearanceStore } from '@/modules/writer/stores/editorAppearanceStore'

const activeTab = ref<'appearance' | 'shortcuts'>('appearance')
const editorThemeStore = useEditorThemeStore()
const appearanceStore = useEditorAppearanceStore()
</script>

<style scoped lang="scss">
.workspace-settings-panel {
  display: flex;
  flex-direction: column;
  min-height: 520px;
  background: var(--editor-bg-surface, #f8fafc);
  color: var(--editor-text-primary, #0f172a);
}

.workspace-settings-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
}

.workspace-settings-panel__header h2 {
  margin: 0;
  font-size: 18px;
}

.workspace-settings-panel__reset {
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--editor-border, #dbe3ee);
  border-radius: 8px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  color: var(--editor-text-secondary, #334155);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.workspace-settings-panel__tabs {
  display: inline-flex;
  gap: 4px;
  padding: 12px 20px 0;
}

.workspace-settings-panel__tab {
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 999px;
  background: var(--editor-bg-elevated, #eef2f7);
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &.is-active {
    background: var(--editor-text-primary, #0f172a);
    color: var(--editor-text-inverse, #ffffff);
  }
}

.workspace-settings-panel__body {
  flex: 1;
  overflow: auto;
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workspace-settings-panel__body--shortcuts {
  padding: 12px 0 0;
}

.workspace-settings-panel__section {
  padding: 16px;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: 14px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
}

.workspace-settings-panel__section-title {
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--editor-text-secondary, #334155);
}

.workspace-settings-panel__theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.workspace-settings-panel__theme-card {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: 12px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #fff));
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--editor-transition-fast, 120ms ease-out),
    background var(--editor-transition-fast, 120ms ease-out),
    box-shadow var(--editor-transition-fast, 120ms ease-out);

  &:hover {
    border-color: var(--editor-accent-soft-border, #a5f3fc);
    background: color-mix(
      in srgb,
      var(--editor-layer-panel, var(--editor-bg-base, #fff)) 92%,
      var(--editor-accent-soft, #ecfeff) 8%
    );
  }

  &.is-active {
    border-color: var(--editor-accent, #2563eb);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--editor-accent, #2563eb) 18%, transparent),
      0 0 0 3px color-mix(in srgb, var(--editor-accent-soft-border, #a5f3fc) 55%, transparent);
  }

  strong {
    font-size: 13px;
    color: var(--editor-text-primary, #0f172a);
  }
}

.workspace-settings-panel__theme-preview {
  display: block;
  width: 100%;
  height: 34px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 18px;
    border-radius: 999px;
    background: var(--theme-preview-accent, var(--editor-accent, #06b6d4));
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.32);
  }
}

.workspace-settings-panel__field {
  display: grid;
  gap: 8px;
  margin-top: 12px;

  &:first-of-type {
    margin-top: 0;
  }

  span {
    font-size: 12px;
    font-weight: 600;
    color: var(--editor-text-secondary, #334155);
  }

  select,
  input[type='range'] {
    width: 100%;
  }

  select {
    height: 36px;
    padding: 0 10px;
    border: 1px solid var(--editor-border, #dbe3ee);
    border-radius: 10px;
    background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
    color: var(--editor-text-primary, #0f172a);
  }
}

.workspace-settings-panel__switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--editor-text-secondary, #334155);
}
</style>
