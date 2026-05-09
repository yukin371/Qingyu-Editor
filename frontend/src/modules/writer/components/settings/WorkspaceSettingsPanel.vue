<template>
  <div class="workspace-settings-panel">
    <header class="workspace-settings-panel__header">
      <div>
        <p class="workspace-settings-panel__eyebrow">Workspace Settings</p>
        <h2>外观与写作偏好</h2>
      </div>
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
            v-for="(meta, key) in EDITOR_THEMES"
            :key="key"
            type="button"
            class="workspace-settings-panel__theme-card"
            :class="{ 'is-active': editorThemeStore.currentTheme === key }"
            @click="editorThemeStore.setTheme(key as EditorThemeName)"
          >
            <span
              class="workspace-settings-panel__theme-preview"
              :style="{ background: meta.previewColor }"
            ></span>
            <strong>{{ meta.label }}</strong>
            <span>{{ meta.description }}</span>
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
        <p class="workspace-settings-panel__hint">默认收口到小说写作高频格式，减少无关样式操作。</p>
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
  EDITOR_THEMES,
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
  background: #f8fafc;
  color: #0f172a;
}

.workspace-settings-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #e2e8f0;
}

.workspace-settings-panel__eyebrow {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace-settings-panel__header h2 {
  margin: 0;
  font-size: 18px;
}

.workspace-settings-panel__reset {
  height: 32px;
  padding: 0 12px;
  border: 1px solid #dbe3ee;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
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
  background: #eef2f7;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &.is-active {
    background: #0f172a;
    color: #ffffff;
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
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
}

.workspace-settings-panel__section-title {
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.workspace-settings-panel__theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.workspace-settings-panel__theme-card {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  text-align: left;
  cursor: pointer;

  &.is-active {
    border-color: #2563eb;
    box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.12);
  }

  strong {
    font-size: 13px;
  }

  span:last-child {
    color: #64748b;
    font-size: 12px;
  }
}

.workspace-settings-panel__theme-preview {
  display: block;
  width: 100%;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.08);
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
    color: #334155;
  }

  select,
  input[type='range'] {
    width: 100%;
  }

  select {
    height: 36px;
    padding: 0 10px;
    border: 1px solid #dbe3ee;
    border-radius: 10px;
    background: #ffffff;
    color: #0f172a;
  }
}

.workspace-settings-panel__switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.workspace-settings-panel__hint {
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}
</style>
