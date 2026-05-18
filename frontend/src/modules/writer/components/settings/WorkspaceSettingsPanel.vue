<template>
  <div class="workspace-settings-panel">
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
      <button
        type="button"
        class="workspace-settings-panel__tab"
        :class="{ 'is-active': activeTab === 'ai' }"
        @click="activeTab = 'ai'"
      >
        AI Provider
      </button>
      <button
        v-if="activeTab === 'appearance'"
        type="button"
        class="workspace-settings-panel__reset"
        @click="appearanceStore.resetAppearance()"
      >
        恢复默认
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
          <input
            v-model.number="appearanceStore.fontSize"
            type="range"
            min="16"
            max="26"
            step="1"
          />
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

    <section
      v-else-if="activeTab === 'shortcuts'"
      class="workspace-settings-panel__body workspace-settings-panel__body--shortcuts"
    >
      <ShortcutSettingsPanel />
    </section>

    <section v-else class="workspace-settings-panel__body workspace-settings-panel__body--ai">
      <aside class="workspace-settings-panel__provider-rail">
        <div class="workspace-settings-panel__section-title">接入模式</div>
        <button
          type="button"
          class="workspace-settings-panel__mode-card"
          :class="{ 'is-active': aiProviderStore.mode === 'system_remote' }"
          @click="aiProviderStore.mode = 'system_remote'"
        >
          <strong>系统服务</strong>
          <span>使用系统配置的远程 AI 服务</span>
        </button>
        <button
          type="button"
          class="workspace-settings-panel__mode-card"
          :class="{ 'is-active': aiProviderStore.mode === 'user_api' }"
          @click="aiProviderStore.mode = 'user_api'"
        >
          <strong>用户 API</strong>
          <span>接入本地或自有 OpenAI 兼容 provider</span>
        </button>

        <div class="workspace-settings-panel__provider-summary">
          <span>当前模式</span>
          <strong>{{ providerModeLabel }}</strong>
        </div>
        <div class="workspace-settings-panel__provider-summary">
          <span>配置状态</span>
          <strong>{{ providerConfiguredLabel }}</strong>
        </div>
        <div class="workspace-settings-panel__provider-summary">
          <span>密钥状态</span>
          <strong>{{ providerSecretLabel }}</strong>
        </div>
      </aside>

      <div class="workspace-settings-panel__provider-main">
        <div class="workspace-settings-panel__section workspace-settings-panel__provider-card">
          <div
            class="workspace-settings-panel__section-title workspace-settings-panel__section-title--split"
          >
            <span>{{ aiProviderStore.mode === 'user_api' ? '用户 API Provider' : '系统远程服务' }}</span>
            <button
              type="button"
              class="workspace-settings-panel__health-button"
              :disabled="aiProviderStore.healthChecking"
              @click="aiProviderStore.checkHealth()"
            >
              {{ aiProviderStore.healthChecking ? '检测中…' : '检测连接' }}
            </button>
          </div>

          <div class="workspace-settings-panel__health-card" :class="healthCardClass">
            <span>{{ aiProviderStore.health ? '最近检测' : '连接状态' }}</span>
            <strong>{{ aiProviderStore.health?.message || '尚未检测' }}</strong>
          </div>

          <template v-if="aiProviderStore.mode === 'user_api'">
            <div class="workspace-settings-panel__provider-presets">
              <button
                v-for="preset in aiProviderStore.providerPresets"
                :key="preset.id"
                type="button"
                :class="{
                  'is-active':
                    activeProviderPresetId === preset.id ||
                    (!activeProviderPresetId && preset.id === 'custom'),
                }"
                @click="applyProviderPreset(preset.id)"
              >
                <strong>{{ preset.label }}</strong>
                <span>{{ preset.description }}</span>
              </button>
            </div>

            <div class="workspace-settings-panel__provider-form-grid">
              <label class="workspace-settings-panel__field">
                <span>Provider 地址</span>
                <input
                  v-model="aiProviderStore.baseURL"
                  type="text"
                  placeholder="https://api.openai.com 或 http://localhost:11434"
                />
              </label>

              <label class="workspace-settings-panel__field">
                <span>接口路径</span>
                <input
                  v-model="aiProviderStore.endpointPath"
                  type="text"
                  placeholder="/v1/chat/completions"
                />
              </label>

              <label class="workspace-settings-panel__field">
                <span>模型</span>
                <input
                  v-model="aiProviderStore.model"
                  list="workspace-ai-provider-models"
                  type="text"
                  placeholder="选择或输入模型名"
                />
                <datalist id="workspace-ai-provider-models">
                  <option v-for="model in modelOptions" :key="model" :value="model" />
                </datalist>
              </label>

              <label class="workspace-settings-panel__field">
                <span>API Key（可空）</span>
                <input
                  v-model="apiKeyDraft"
                  type="password"
                  placeholder="sk-..."
                  @blur="commitApiKeyDraft"
                  @change="commitApiKeyDraft"
                />
              </label>
            </div>

            <label class="workspace-settings-panel__field workspace-settings-panel__field--range">
              <span>温度 {{ aiProviderStore.temperature.toFixed(2) }}</span>
              <input
                v-model.number="aiProviderStore.temperature"
                type="range"
                min="0"
                max="2"
                step="0.05"
              />
            </label>

            <div class="workspace-settings-panel__role-models">
              <div class="workspace-settings-panel__section-title">用途模型（可选）</div>
              <div class="workspace-settings-panel__role-grid">
                <label class="workspace-settings-panel__field">
                  <span>写作模型</span>
                  <input
                    v-model="aiProviderStore.writingModel"
                    list="workspace-ai-provider-models"
                    type="text"
                    placeholder="留空则使用默认模型"
                  />
                </label>
                <label class="workspace-settings-panel__field">
                  <span>审查模型</span>
                  <input
                    v-model="aiProviderStore.reviewModel"
                    list="workspace-ai-provider-models"
                    type="text"
                    placeholder="留空则使用默认模型"
                  />
                </label>
                <label class="workspace-settings-panel__field">
                  <span>整理模型</span>
                  <input
                    v-model="aiProviderStore.organizeModel"
                    list="workspace-ai-provider-models"
                    type="text"
                    placeholder="留空则使用默认模型"
                  />
                </label>
              </div>
            </div>

            <div class="workspace-settings-panel__status-row">
              <span
                class="workspace-settings-panel__status-pill"
                :class="{ 'is-ready': aiProviderStore.providerReady }"
              >
                {{ aiProviderStore.providerReady ? '配置就绪' : '待补全' }}
              </span>
              <span class="workspace-settings-panel__status-meta">{{ apiKeyStatusLabel }}</span>
              <button
                type="button"
                class="workspace-settings-panel__link"
                @click="aiProviderStore.resetUserProvider()"
              >
                清空配置
              </button>
            </div>

            <div class="workspace-settings-panel__config-file">
              <div class="workspace-settings-panel__config-file-header">
                <span>配置文件</span>
                <div class="workspace-settings-panel__config-file-actions">
                  <button type="button" @click="loadConfigTemplate">模板</button>
                  <button type="button" @click="exportCurrentConfig">导出</button>
                  <button type="button" @click="applyConfigText">应用</button>
                </div>
              </div>
              <textarea
                v-model="configTextDraft"
                spellcheck="false"
                placeholder='{"mode":"user_api","userProvider":{"baseURL":"...","endpointPath":"/v1/chat/completions","model":"...","apiKey":"..."}}'
              ></textarea>
              <p class="workspace-settings-panel__config-file-note" :class="configMessageClass">
                {{ configImportMessage || '导出配置不会包含明文 API Key；粘贴含 key 的 JSON 后会写入安全存储或本次会话。' }}
              </p>
            </div>
          </template>

          <template v-else>
            <div class="workspace-settings-panel__system-grid">
              <div>
                <span>远程服务</span>
                <strong>系统配置</strong>
              </div>
              <div>
                <span>用户密钥</span>
                <strong>不需要</strong>
              </div>
              <div>
                <span>可用性</span>
                <strong>{{ aiProviderStore.health?.ok ? '可用' : '等待检测' }}</strong>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ShortcutSettingsPanel from './ShortcutSettingsPanel.vue'
import { useEditorThemeStore, type EditorThemeName } from '@/modules/writer/stores/editorThemeStore'
import { useEditorAppearanceStore } from '@/modules/writer/stores/editorAppearanceStore'
import { useAIProviderStore } from '@/modules/ai/stores/aiProviderStore'

const activeTab = ref<'appearance' | 'shortcuts' | 'ai'>('appearance')
const editorThemeStore = useEditorThemeStore()
const appearanceStore = useEditorAppearanceStore()
const aiProviderStore = useAIProviderStore()
const apiKeyDraft = ref(aiProviderStore.apiKey)
const configTextDraft = ref('')
const configImportMessage = ref('')

const providerModeLabel = computed(() =>
  aiProviderStore.mode === 'user_api' ? '用户 API' : '系统服务',
)
const providerConfiguredLabel = computed(() =>
  aiProviderStore.mode === 'system_remote'
    ? '系统托管'
    : aiProviderStore.providerReady
      ? '已补全'
      : '待补全',
)
const apiKeyStatusLabel = computed(() => {
  if (aiProviderStore.hasRuntimeApiKey) {
    return 'API Key 已载入本次会话'
  }
  if (aiProviderStore.apiKeyNeedsRefresh) {
    return '仅保留掩码，若需鉴权请重新输入'
  }
  if (aiProviderStore.hasApiKey) {
    return '已记录 API Key 标记'
  }
  return '未填写 API Key'
})
const providerSecretLabel = computed(() =>
  aiProviderStore.mode === 'system_remote' ? '无需用户密钥' : apiKeyStatusLabel.value,
)
const healthCardClass = computed(() => ({
  'is-ok': aiProviderStore.health?.ok,
  'is-error': aiProviderStore.health && !aiProviderStore.health.ok,
}))
const activeProviderPresetId = computed(
  () =>
    aiProviderStore.providerPresets.find(
      (preset) =>
        preset.baseURL === aiProviderStore.baseURL &&
        preset.endpointPath === aiProviderStore.endpointPath,
    )?.id || '',
)
const modelOptions = computed(() => {
  const activePreset = aiProviderStore.providerPresets.find(
    (preset) => preset.id === activeProviderPresetId.value,
  )
  const models = [
    ...(activePreset?.models || []),
    ...aiProviderStore.providerPresets.flatMap((preset) => preset.models),
    aiProviderStore.model,
    aiProviderStore.writingModel,
    aiProviderStore.reviewModel,
    aiProviderStore.organizeModel,
  ]
  return Array.from(new Set(models.map((model) => model.trim()).filter(Boolean)))
})
const configMessageClass = computed(() => ({
  'is-error': configImportMessage.value.startsWith('导入失败'),
  'is-ok': configImportMessage.value.startsWith('已应用'),
}))

onMounted(() => {
  void aiProviderStore.hydrate()
})

watch(
  () => aiProviderStore.apiKey,
  (value) => {
    apiKeyDraft.value = value
  },
  { immediate: true },
)

function commitApiKeyDraft() {
  aiProviderStore.apiKey = apiKeyDraft.value
  apiKeyDraft.value = aiProviderStore.apiKey
}

function applyProviderPreset(presetId: string) {
  aiProviderStore.applyPreset(presetId)
  configImportMessage.value = ''
}

function loadConfigTemplate() {
  configTextDraft.value = aiProviderStore.createConfigTemplate()
  configImportMessage.value = '已生成模板，可按需填写后应用。'
}

function exportCurrentConfig() {
  configTextDraft.value = aiProviderStore.exportConfigText()
  configImportMessage.value = '已导出当前非敏感配置。'
}

function applyConfigText() {
  try {
    const imported = aiProviderStore.importConfigText(configTextDraft.value)
    apiKeyDraft.value = imported.userProvider.apiKey
    configImportMessage.value = '已应用配置文件。'
  } catch (error) {
    configImportMessage.value = `导入失败：${error instanceof Error ? error.message : '配置文件无法解析。'}`
  }
}
</script>

<style scoped lang="scss">
.workspace-settings-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  background: var(--editor-bg-surface, #f8fafc);
  color: var(--editor-text-primary, #0f172a);
}

.workspace-settings-panel__tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
  background:
    radial-gradient(
      circle at 12% 0%,
      color-mix(in srgb, var(--editor-accent-soft, #dbeafe) 48%, transparent),
      transparent 34%
    ),
    var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
}

.workspace-settings-panel__tab {
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 999px;
  background: var(--editor-bg-elevated, #eef2f7);
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &.is-active {
    background: var(--editor-text-primary, #0f172a);
    color: var(--editor-text-inverse, #ffffff);
  }
}

.workspace-settings-panel__reset {
  margin-left: auto;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--editor-border, #dbe3ee);
  border-radius: 999px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  color: var(--editor-text-secondary, #334155);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.workspace-settings-panel__body {
  flex: 1;
  overflow: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workspace-settings-panel__body--shortcuts {
  padding: 12px 0 0;
}

.workspace-settings-panel__body--ai {
  display: grid;
  grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1.55fr);
  gap: 18px;
  overflow: hidden;
}

.workspace-settings-panel__section {
  padding: 16px;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: 16px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
}

.workspace-settings-panel__section-title {
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 800;
  color: var(--editor-text-secondary, #334155);
}

.workspace-settings-panel__section-title--split {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.workspace-settings-panel__theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.workspace-settings-panel__provider-rail {
  min-width: 0;
  overflow: auto;
  padding: 16px;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: 18px;
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 92%, transparent),
      color-mix(in srgb, var(--editor-layer-soft, var(--editor-bg-surface, #f8fafc)) 86%, transparent)
    );
}

.workspace-settings-panel__provider-main {
  min-width: 0;
  overflow: auto;
}

.workspace-settings-panel__provider-card {
  min-height: 100%;
}

.workspace-settings-panel__provider-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  padding: 10px 0;
  border-top: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);

  span {
    color: var(--editor-text-muted, #64748b);
    font-size: 12px;
  }

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 12px;
    text-align: right;
  }
}

.workspace-settings-panel__mode-card {
  display: grid;
  gap: 6px;
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: 13px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--editor-transition-fast, 120ms ease-out),
    background var(--editor-transition-fast, 120ms ease-out),
    box-shadow var(--editor-transition-fast, 120ms ease-out);

  strong {
    font-size: 13px;
    color: var(--editor-text-primary, #0f172a);
  }

  span {
    font-size: 12px;
    color: var(--editor-text-muted, #64748b);
  }

  &.is-active {
    border-color: var(--editor-accent, #2563eb);
    background: color-mix(
      in srgb,
      var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 86%,
      var(--editor-accent-soft, #eff6ff) 14%
    );
    box-shadow: 0 12px 30px -24px color-mix(in srgb, var(--editor-accent, #2563eb) 58%, transparent);
  }
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
    font-weight: 700;
    color: var(--editor-text-secondary, #334155);
  }

  select,
  input[type='range'],
  input[type='text'],
  input[type='password'],
  textarea {
    width: 100%;
  }

  select,
  input[type='text'],
  input[type='password'],
  textarea {
    height: 38px;
    padding: 0 12px;
    border: 1px solid var(--editor-border, #dbe3ee);
    border-radius: 11px;
    background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
    color: var(--editor-text-primary, #0f172a);
  }

  textarea {
    min-height: 132px;
    padding: 10px 12px;
    resize: vertical;
    font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
    font-size: 12px;
    line-height: 1.55;
  }
}

.workspace-settings-panel__provider-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px 14px;
  margin-top: 16px;
}

.workspace-settings-panel__provider-presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-top: 16px;

  button {
    min-height: 72px;
    padding: 10px 11px;
    border: 1px solid var(--editor-border, #dbe3ee);
    border-radius: 12px;
    background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
    color: var(--editor-text-secondary, #334155);
    display: grid;
    gap: 5px;
    text-align: left;
    font-size: 12px;
    cursor: pointer;

    strong {
      color: var(--editor-text-primary, #0f172a);
      font-size: 13px;
    }

    span {
      color: var(--editor-text-muted, #64748b);
      line-height: 1.45;
    }

    &.is-active {
      border-color: color-mix(in srgb, var(--editor-accent, #2563eb) 58%, var(--editor-border, #dbe3ee));
      background: color-mix(in srgb, var(--editor-accent-soft, #dbeafe) 52%, var(--editor-layer-panel, #ffffff));

      strong {
        color: var(--editor-accent-strong, #1d4ed8);
      }
    }
  }
}

.workspace-settings-panel__field--range {
  margin-top: 16px;
}

.workspace-settings-panel__role-models {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
}

.workspace-settings-panel__role-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.workspace-settings-panel__switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--editor-text-secondary, #334155);
}

.workspace-settings-panel__status-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
}

.workspace-settings-panel__status-pill {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--editor-bg-elevated, #eef2f7);
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 800;

  &.is-ready {
    background: color-mix(in srgb, var(--editor-accent-soft, #dcfce7) 68%, transparent);
    color: var(--editor-accent-strong, #166534);
  }
}

.workspace-settings-panel__status-meta {
  flex: 1;
  min-width: 180px;
  font-size: 12px;
  color: var(--editor-text-muted, #64748b);
}

.workspace-settings-panel__config-file {
  display: grid;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);

  textarea {
    width: 100%;
    min-height: 136px;
    padding: 10px 12px;
    border: 1px solid var(--editor-border, #dbe3ee);
    border-radius: 12px;
    background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
    color: var(--editor-text-primary, #0f172a);
    resize: vertical;
    font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
    font-size: 12px;
    line-height: 1.55;
  }
}

.workspace-settings-panel__config-file-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  > span {
    font-size: 12px;
    font-weight: 800;
    color: var(--editor-text-secondary, #334155);
  }
}

.workspace-settings-panel__config-file-actions {
  display: inline-flex;
  gap: 8px;

  button {
    min-height: 28px;
    padding: 0 10px;
    border: 1px solid var(--editor-border, #dbe3ee);
    border-radius: 999px;
    background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
    color: var(--editor-text-secondary, #334155);
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }
}

.workspace-settings-panel__config-file-note {
  margin: 0;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  line-height: 1.5;

  &.is-ok {
    color: var(--editor-accent-strong, #1d4ed8);
  }

  &.is-error {
    color: color-mix(in srgb, #ef4444 78%, var(--editor-text-primary, #0f172a));
  }
}

.workspace-settings-panel__health-button {
  min-height: 30px;
  padding: 0 12px;
  border: 1px solid var(--editor-border, #dbe3ee);
  border-radius: 999px;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  color: var(--editor-text-secondary, #334155);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
}

.workspace-settings-panel__health-card {
  display: grid;
  gap: 6px;
  margin-top: 8px;
  padding: 14px;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: 14px;
  background: color-mix(
    in srgb,
    var(--editor-layer-soft, var(--editor-bg-surface, #f8fafc)) 82%,
    var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 18%
  );

  span {
    color: var(--editor-text-muted, #64748b);
    font-size: 12px;
    font-weight: 700;
  }

  strong {
    color: var(--editor-text-secondary, #334155);
    font-size: 13px;
    line-height: 1.45;
  }

  &.is-ok {
    border-color: color-mix(in srgb, var(--editor-accent, #2563eb) 42%, var(--editor-border, #e2e8f0));
    background: color-mix(in srgb, var(--editor-accent-soft, #dbeafe) 24%, var(--editor-layer-panel, #ffffff));

    strong {
      color: var(--editor-accent-strong, #1d4ed8);
    }
  }

  &.is-error {
    border-color: color-mix(in srgb, #ef4444 44%, var(--editor-border, #e2e8f0));
    background: color-mix(in srgb, #ef4444 9%, var(--editor-layer-panel, #ffffff));

    strong {
      color: color-mix(in srgb, #ef4444 78%, var(--editor-text-primary, #0f172a));
    }
  }
}

.workspace-settings-panel__system-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;

  div {
    display: grid;
    gap: 6px;
    padding: 14px;
    border: 1px solid var(--editor-border, #e2e8f0);
    border-radius: 14px;
    background: var(--editor-layer-soft, var(--editor-bg-surface, #f8fafc));
  }

  span {
    color: var(--editor-text-muted, #64748b);
    font-size: 12px;
  }

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 13px;
  }
}

.workspace-settings-panel__link {
  border: none;
  background: transparent;
  color: var(--editor-accent, #2563eb);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 760px) {
  .workspace-settings-panel__body--ai,
  .workspace-settings-panel__provider-form-grid,
  .workspace-settings-panel__role-grid,
  .workspace-settings-panel__system-grid {
    grid-template-columns: 1fr;
  }

  .workspace-settings-panel__body--ai {
    overflow: auto;
  }
}
</style>
