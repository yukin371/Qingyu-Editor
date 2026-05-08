<template>
  <div
    v-if="visible"
    class="settings-overlay"
    data-testid="settings-overlay"
    @click.self="$emit('close')"
  >
    <section class="settings-modal" data-testid="settings-modal">
      <div class="settings-modal-header">
        <h3>阅读设置</h3>
        <QyButton variant="secondary" size="sm" @click="$emit('close')">关闭</QyButton>
      </div>

      <div class="settings-panel">
        <!-- 字体大小 -->
        <div class="setting-item" data-testid="font-size-setting">
          <label>字体大小</label>
          <div class="setting-control">
            <QyButton @click="$emit('decrease-font')" circle data-testid="decrease-font-btn"
              >-</QyButton
            >
            <span class="font-size-value">{{ settings.fontSize }}px</span>
            <QyButton @click="$emit('increase-font')" circle data-testid="increase-font-btn"
              >+</QyButton
            >
          </div>
        </div>

        <!-- 行距 -->
        <div class="setting-item" data-testid="line-height-setting">
          <div class="setting-title-row">
            <label>行距</label>
            <span class="setting-value">{{ settings.lineHeight.toFixed(1) }}</span>
          </div>
          <div class="setting-slider-wrap">
            <el-slider
              :model-value="settings.lineHeight"
              :min="lineHeightMin"
              :max="lineHeightMax"
              :step="lineHeightStep"
              :show-tooltip="false"
              :marks="lineHeightMarks"
              @update:model-value="(v: number) => $emit('update:line-height', v)"
            />
          </div>
        </div>

        <!-- 页面宽度 -->
        <div class="setting-item" data-testid="page-width-setting">
          <div class="setting-title-row">
            <label>页面宽度</label>
            <span class="setting-value">{{ settings.pageWidth }}px</span>
          </div>
          <div class="setting-slider-wrap">
            <el-slider
              :model-value="settings.pageWidth"
              :min="pageWidthMin"
              :max="pageWidthMax"
              :step="pageWidthStep"
              :show-tooltip="false"
              :marks="pageWidthMarks"
              @update:model-value="(v: number) => $emit('update:page-width', v)"
            />
          </div>
        </div>

        <!-- 主题选择 -->
        <div class="setting-item" data-testid="theme-setting">
          <label>阅读主题</label>
          <div class="theme-selector">
            <div
              v-for="theme in themes"
              :key="theme.value"
              class="theme-option"
              :class="{ 'is-active': settings.theme === theme.value }"
              :style="{ backgroundColor: theme.bg, color: theme.color }"
              :data-testid="`theme-${theme.value}`"
              @click="$emit('update:theme', theme.value)"
            >
              {{ theme.label }}
            </div>
          </div>
        </div>

        <!-- 字体选择 -->
        <div class="setting-item" data-testid="font-family-setting">
          <label>字体</label>
          <QySelect
            v-model="localFontFamily"
            :options="fontFamilyOptions"
            placeholder="选择字体"
            data-testid="font-family-select"
          />
        </div>

        <!-- 翻页模式 -->
        <div class="setting-item" data-testid="page-mode-setting">
          <label>翻页模式</label>
          <QyRadio v-model="localPageMode" value="scroll" data-testid="page-mode-scroll"
            >滚动</QyRadio
          >
          <QyRadio v-model="localPageMode" value="page" data-testid="page-mode-page">翻页</QyRadio>
        </div>

        <!-- 重置按钮 -->
        <div class="setting-item">
          <QyButton @click="$emit('reset')" style="width: 100%" data-testid="reset-settings-btn">
            重置设置
          </QyButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyButton, QySelect, QyRadio } from '@/design-system/components'
import type { ReaderSettings } from '../../composables/useReaderSettings'

const props = defineProps<{
  visible: boolean
  settings: ReaderSettings
  themes: Array<{ label: string; value: string; bg: string; color: string }>
  lineHeightMin: number
  lineHeightMax: number
  lineHeightStep: number
  lineHeightMarks: Record<number, string>
  pageWidthMin: number
  pageWidthMax: number
  pageWidthStep: number
  pageWidthMarks: Record<number, string>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'decrease-font'): void
  (e: 'increase-font'): void
  (e: 'update:line-height', value: number): void
  (e: 'update:page-width', value: number): void
  (e: 'update:theme', theme: string): void
  (e: 'update:font-family', fontFamily: string): void
  (e: 'update:page-mode', pageMode: string): void
  (e: 'reset'): void
}>()

const localFontFamily = computed({
  get: () => props.settings.fontFamily,
  set: (value: string) => emit('update:font-family', value),
})

const fontFamilyOptions = [
  { label: '系统默认', value: 'system-ui, -apple-system, sans-serif' },
  { label: '宋体', value: 'SimSun, serif' },
  { label: '黑体', value: 'SimHei, sans-serif' },
  { label: '楷体', value: 'KaiTi, serif' },
]

const localPageMode = computed({
  get: () => props.settings.pageMode,
  set: (value: string) => emit('update:page-mode', value),
})
</script>

<style scoped lang="scss">
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgb(15 23 42 / 30%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1600;
}

.settings-modal {
  width: min(560px, calc(100vw - 32px));
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgb(15 23 42 / 18%);
}

.settings-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 20px 10px;
  border-bottom: 1px solid #eef2f7;
  margin-bottom: 12px;
}

.settings-modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.settings-panel {
  padding: 0 20px 18px;
  max-height: min(70vh, 640px);
  overflow: auto;

  .setting-item {
    margin-bottom: 32px;

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
    }

    .setting-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      gap: 10px;
    }

    .setting-value {
      font-size: 13px;
      font-weight: 700;
      color: #2563eb;
    }

    .setting-control {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;

      .font-size-value {
        min-width: 50px;
        text-align: center;
        font-weight: bold;
      }
    }

    .setting-slider-wrap {
      padding: 0 4px;
    }
  }

  .theme-selector {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .theme-option {
      padding: 16px;
      text-align: center;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &.is-active {
        border-color: #409eff;
      }
    }
  }
}
</style>
