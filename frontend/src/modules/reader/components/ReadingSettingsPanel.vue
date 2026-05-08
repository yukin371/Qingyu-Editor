<template>
  <div class="reading-settings-panel">
    <el-drawer
      :model-value="modelValue"
      :direction="drawerDirection"
      :size="drawerSize"
      :modal-class="drawerModalClass"
      @update:model-value="handleClose"
    >
      <template #header>
        <div class="panel-header">
          <h2 class="panel-title">阅读设置</h2>
        </div>
      </template>

      <div class="settings-content">
        <!-- T3.2: 主题选择 -->
        <div class="setting-section">
          <div class="section-title">阅读主题</div>
          <div class="theme-grid" role="radiogroup" aria-label="选择阅读主题">
            <button
              v-for="theme in themes"
              :key="theme.value"
              class="theme-card"
              :class="{ active: settings.theme === theme.value }"
              :data-theme="theme.value"
              :aria-label="theme.label"
              :aria-checked="settings.theme === theme.value"
              @click="handleThemeChange(theme.value)"
            >
              <div
                class="theme-preview"
                :style="{ backgroundColor: theme.bg, color: theme.textColor }"
              >
                <span class="theme-sample">Aa</span>
              </div>
              <span class="theme-name">{{ theme.label }}</span>
            </button>
          </div>
        </div>

        <!-- T3.3: 字体设置 -->
        <div class="setting-section">
          <div class="section-title">
            字体大小
            <span class="section-value">{{ settings.fontSize }}px</span>
          </div>
          <div class="font-size-controls">
            <button
              class="font-size-btn font-size-decrease"
              :disabled="settings.fontSize <= fontSizeMin"
              :aria-label="`减小字号，当前${settings.fontSize}像素`"
              @click="decreaseFontSize"
            >
              <QyIcon name="Minus" />
            </button>
            <el-slider
              :model-value="settings.fontSize"
              :min="fontSizeMin"
              :max="fontSizeMax"
              :step="fontSizeStep"
              :show-tooltip="false"
              class="font-size-slider"
              @update:model-value="updateFontSize"
            />
            <button
              class="font-size-btn font-size-increase"
              :disabled="settings.fontSize >= fontSizeMax"
              :aria-label="`增大字号，当前${settings.fontSize}像素`"
              @click="increaseFontSize"
            >
              <QyIcon name="Plus" />
            </button>
          </div>
        </div>

        <!-- T3.3: 行距设置 -->
        <div class="setting-section">
          <div class="section-title">
            行间距
            <span class="section-value">{{ settings.lineHeight }}</span>
          </div>
          <el-slider
            :model-value="settings.lineHeight"
            :min="lineHeightMin"
            :max="lineHeightMax"
            :step="lineHeightStep"
            :format-tooltip="(val: number) => val.toFixed(1)"
            class="line-height-slider"
            @update:model-value="updateLineHeight"
          />
        </div>

        <!-- 页面宽度 -->
        <div class="setting-section">
          <div class="section-title">
            页面宽度
            <span class="section-value">{{ settings.pageWidth }}%</span>
          </div>
          <el-slider
            :model-value="settings.pageWidth"
            :min="pageWidthMin"
            :max="pageWidthMax"
            :step="pageWidthStep"
            :format-tooltip="(val: number) => `${val}%`"
            class="page-width-slider"
            @update:model-value="updatePageWidth"
          />
        </div>

        <!-- 翻页模式 -->
        <div class="setting-section">
          <div class="section-title">翻页模式</div>
          <el-radio-group
            :model-value="settings.pageMode"
            class="radio-group"
            @update:model-value="updatePageMode"
          >
            <el-radio label="scroll">上下滚动</el-radio>
            <el-radio label="click">点击翻页</el-radio>
            <el-radio label="slide">左右滑动</el-radio>
          </el-radio-group>
        </div>

        <!-- 操作按钮 -->
        <div class="setting-actions">
          <el-button class="reset-btn" @click="handleReset">
            恢复默认
          </el-button>
          <el-button type="primary" class="save-btn" @click="handleSave">
            保存设置
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { QyIcon } from '@/design-system/components'
import { useStorage } from '@/composables/useStorage'

/**
 * 阅读设置类型定义
 */
interface ReadingSettings {
  theme: 'light' | 'sepia' | 'night' | 'dark' | 'eyecare'
  fontFamily: string
  fontSize: number
  lineHeight: number
  pageWidth: number
  pageMode: 'scroll' | 'click' | 'slide'
}

interface Theme {
  value: ReadingSettings['theme']
  label: string
  bg: string
  textColor: string
}

/**
 * Props定义
 */
interface Props {
  modelValue: boolean
  initialSettings?: Partial<ReadingSettings>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  initialSettings: () => ({})
})

/**
 * Emits定义
 */
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', settings: ReadingSettings): void
}

const emit = defineEmits<Emits>()

/**
 * T3.1: 响应式抽屉方向和大小
 * 移动端（<768px）：从底部弹出（btt），85%高度
 * 桌面端（≥768px）：从右侧滑出（rtl），400px宽度
 */
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
})

const drawerDirection = computed(() => isMobile.value ? 'btt' : 'rtl')
const drawerSize = computed(() => isMobile.value ? '85%' : '400px')
const drawerModalClass = computed(() => isMobile.value ? 'mobile-drawer' : 'desktop-drawer')

/**
 * T3.2: 主题配置
 * 与reader-variables.scss中的CSS变量保持一致
 */
const themes: Theme[] = [
  {
    value: 'light',
    label: '日间',
    bg: '#ffffff',
    textColor: '#2c3e50'
  },
  {
    value: 'sepia',
    label: '护眼',
    bg: '#f4ecd8',
    textColor: '#5c4a2f'
  },
  {
    value: 'night',
    label: '夜间',
    bg: '#1a1a1a',
    textColor: '#c9c9c9'
  },
  {
    value: 'dark',
    label: '深色',
    bg: '#121212',
    textColor: '#e0e0e0'
  },
  {
    value: 'eyecare',
    label: '绿色',
    bg: '#c7edcc',
    textColor: '#333333'
  }
]

/**
 * 默认设置
 */
const defaultSettings: ReadingSettings = {
  theme: 'light',
  fontFamily: 'system',
  fontSize: 18,
  lineHeight: 1.8,
  pageWidth: 80,
  pageMode: 'scroll'
}

/**
 * T3.3: 字体设置范围
 */
const fontSizeMin = 12
const fontSizeMax = 32
const fontSizeStep = 2

const lineHeightMin = 1.2
const lineHeightMax = 2.5
const lineHeightStep = 0.1

const pageWidthMin = 60
const pageWidthMax = 100
const pageWidthStep = 5

/**
 * 设置状态管理
 * 使用useStorage进行持久化
 */
const settingsStorage = useStorage<ReadingSettings>('reading_settings', defaultSettings)
// 优先使用initialSettings（如果提供），其次使用storage中的值，最后使用默认值
const settings = reactive<ReadingSettings>({
  ...defaultSettings,
  ...settingsStorage.data.value,
  ...props.initialSettings
})

/**
 * 监听设置变化，保存到storage
 */
watch(
  () => ({ ...settings }),
  (newSettings) => {
    settingsStorage.data.value = { ...newSettings }
    settingsStorage.save()
    // 触发change事件，让父组件知道设置变化
    emit('change', { ...newSettings })
  },
  { deep: true }
)

/**
 * T3.2: 主题切换
 */
const handleThemeChange = (theme: ReadingSettings['theme']) => {
  settings.theme = theme
}

/**
 * T3.3: 字号调节
 */
const updateFontSize = (value: number) => {
  settings.fontSize = Math.max(fontSizeMin, Math.min(fontSizeMax, value))
}

const increaseFontSize = () => {
  if (settings.fontSize < fontSizeMax) {
    settings.fontSize = Math.min(fontSizeMax, settings.fontSize + fontSizeStep)
  }
}

const decreaseFontSize = () => {
  if (settings.fontSize > fontSizeMin) {
    settings.fontSize = Math.max(fontSizeMin, settings.fontSize - fontSizeStep)
  }
}

/**
 * T3.3: 行高调节
 */
const updateLineHeight = (value: number) => {
  settings.lineHeight = Math.max(lineHeightMin, Math.min(lineHeightMax, value))
}

/**
 * 页面宽度调节
 */
const updatePageWidth = (value: number) => {
  settings.pageWidth = Math.max(pageWidthMin, Math.min(pageWidthMax, value))
}

/**
 * 翻页模式切换
 */
const updatePageMode = (value: 'scroll' | 'click' | 'slide') => {
  settings.pageMode = value
}

/**
 * 保存设置
 */
const handleSave = () => {
  settingsStorage.data.value = { ...settings }
  settingsStorage.save()
  emit('change', { ...settings })
  emit('update:modelValue', false)
}

/**
 * 恢复默认设置
 */
const handleReset = () => {
  // 逐个重置每个属性，确保响应式更新
  settings.theme = defaultSettings.theme
  settings.fontFamily = defaultSettings.fontFamily
  settings.fontSize = defaultSettings.fontSize
  settings.lineHeight = defaultSettings.lineHeight
  settings.pageWidth = defaultSettings.pageWidth
  settings.pageMode = defaultSettings.pageMode
}

/**
 * 关闭面板
 */
const handleClose = (value: boolean) => {
  emit('update:modelValue', value)
}

// 暴露给测试使用
defineExpose({
  settings,
  themes
})
</script>

<style scoped lang="scss">
.reading-settings-panel {
  :deep(.el-drawer) {
    &.mobile-drawer {
      .el-drawer__body {
        padding-bottom: env(safe-area-inset-bottom);
      }
    }
  }
}

.panel-header {
  padding: 0;

  .panel-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.settings-content {
  padding: 0 16px 24px;
}

.setting-section {
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;

    .section-value {
      font-size: 14px;
      font-weight: normal;
      color: #909399;
    }
  }
}

/**
 * T3.2: 主题选择网格
 */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.theme-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &.active {
    border-color: #409eff;
    background: #ecf5ff;
  }

  &:focus-visible {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }

  .theme-preview {
    width: 100%;
    height: 48px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;

    .theme-sample {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .theme-name {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
  }
}

/**
 * T3.3: 字号控制
 */
.font-size-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.font-size-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #ffffff;
  color: #606266;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    color: #409eff;
    border-color: #409eff;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  &:focus-visible {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

.font-size-slider {
  flex: 1;
}

.line-height-slider,
.page-width-slider {
  width: 100%;
}

/**
 * 单选组
 */
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/**
 * 操作按钮
 */
.setting-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;

  .el-button {
    flex: 1;
  }
}

/**
 * 响应式调整
 */
@media (max-width: 768px) {
  .settings-content {
    padding: 0 12px 20px;
  }

  .theme-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .theme-card {
    padding: 10px;

    .theme-preview {
      height: 40px;

      .theme-sample {
        font-size: 16px;
      }
    }

    .theme-name {
      font-size: 13px;
    }
  }

  .radio-group {
    flex-direction: column;
    gap: 8px;

    :deep(.el-radio) {
      margin-right: 0;
    }
  }

  .setting-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
