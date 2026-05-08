<template>
    <div class="reading-settings">
        <!-- 字体大小 -->
        <div class="setting-item">
            <label>字体大小</label>
            <div class="setting-control">
                <el-button @click="decreaseFontSize" :icon="Minus" circle size="small"
                    :disabled="modelValue.fontSize <= 12" />
                <span class="font-size-value">{{ modelValue.fontSize }}px</span>
                <el-button @click="increaseFontSize" :icon="Plus" circle size="small"
                    :disabled="modelValue.fontSize >= 28" />
            </div>
        </div>

        <!-- 行距 -->
        <div class="setting-item">
            <label>行距</label>
            <el-slider :model-value="modelValue.lineHeight" @update:model-value="updateSetting('lineHeight', $event)"
                :min="1.2" :max="3.0" :step="0.1" :show-tooltip="true" />
        </div>

        <!-- 页面宽度 -->
        <div class="setting-item">
            <label>页面宽度</label>
            <el-slider :model-value="modelValue.pageWidth" @update:model-value="updateSetting('pageWidth', $event)"
                :min="500" :max="1200" :step="50" :show-tooltip="true" />
        </div>

        <!-- 主题选择 -->
        <div class="setting-item">
            <label>阅读主题</label>
            <div class="theme-selector">
                <div v-for="theme in themes" :key="theme.value" class="theme-option"
                    :class="{ 'is-active': modelValue.theme === theme.value }"
                    :style="{ backgroundColor: theme.bg, color: theme.color }"
                    @click="updateSetting('theme', theme.value)">
                    {{ theme.label }}
                </div>
            </div>
        </div>

        <!-- 字体选择 -->
        <div class="setting-item">
            <label>字体</label>
            <el-select :model-value="modelValue.fontFamily" @update:model-value="updateSetting('fontFamily', $event)"
                placeholder="选择字体">
                <el-option label="系统默认" value="system-ui, -apple-system, sans-serif" />
                <el-option label="宋体" value="SimSun, serif" />
                <el-option label="黑体" value="SimHei, sans-serif" />
                <el-option label="楷体" value="KaiTi, serif" />
                <el-option label="微软雅黑" value="Microsoft YaHei, sans-serif" />
            </el-select>
        </div>

        <!-- 翻页模式 -->
        <div v-if="showPageMode" class="setting-item">
            <label>翻页模式</label>
            <el-radio-group :model-value="modelValue.pageMode" @update:model-value="updateSetting('pageMode', $event)">
                <el-radio label="scroll">滚动</el-radio>
                <el-radio label="page">翻页</el-radio>
            </el-radio-group>
        </div>

        <!-- 自动保存 -->
        <div v-if="showAutoSave" class="setting-item">
            <label>自动保存进度</label>
            <el-switch :model-value="modelValue.autoSave" @update:model-value="updateSetting('autoSave', $event)" />
        </div>

        <!-- 操作按钮 -->
        <div v-if="showActions" class="setting-actions">
            <el-button @click="handleReset" style="width: 100%">
                重置设置
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Minus, Plus } from '@element-plus/icons-vue'
import type { ReadingSettings } from '@/types/models'

interface ThemeOption {
    label: string
    value: string
    bg: string
    color: string
}

interface Props {
    modelValue: ReadingSettings
    showPageMode?: boolean
    showAutoSave?: boolean
    showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    showPageMode: true,
    showAutoSave: true,
    showActions: true
})

const emit = defineEmits<{
    'update:modelValue': [value: ReadingSettings]
    reset: []
}>()

const themes: ThemeOption[] = [
    { label: '默认', value: 'light', bg: '#ffffff', color: '#303133' },
    { label: '护眼', value: 'sepia', bg: '#f4ecd8', color: '#5c4a2f' },
    { label: '夜间', value: 'night', bg: '#1e1e1e', color: '#c9c9c9' },
    { label: '暗黑', value: 'dark', bg: '#000000', color: '#888888' }
]

const updateSetting = (key: string, value: any) => {
    emit('update:modelValue', {
        ...props.modelValue,
        [key]: value
    })
}

const increaseFontSize = () => {
    if (props.modelValue.fontSize < 28) {
        updateSetting('fontSize', props.modelValue.fontSize + 1)
    }
}

const decreaseFontSize = () => {
    if (props.modelValue.fontSize > 12) {
        updateSetting('fontSize', props.modelValue.fontSize - 1)
    }
}

const handleReset = () => {
    emit('reset')
}
</script>

<style scoped lang="scss">
.reading-settings {
    padding: 0 20px;

    .setting-item {
        margin-bottom: 28px;

        label {
            display: block;
            margin-bottom: 12px;
            font-size: 14px;
            font-weight: 500;
            color: #303133;
        }

        .setting-control {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;

            .font-size-value {
                min-width: 50px;
                text-align: center;
                font-weight: 600;
                color: #409eff;
            }
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
            font-size: 13px;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }

            &.is-active {
                border-color: #409eff;
                box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
            }
        }
    }

    .setting-actions {
        margin-top: 32px;
        padding-top: 20px;
        border-top: 1px solid #ebeef5;
    }
}

// 响应式
@media (max-width: 768px) {
    .reading-settings {
        padding: 0 16px;

        .theme-selector {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;

            .theme-option {
                padding: 12px 8px;
                font-size: 12px;
            }
        }
    }
}
</style>
