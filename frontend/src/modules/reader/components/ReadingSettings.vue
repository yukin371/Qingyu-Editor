<template>
    <div class="reading-settings">
        <el-drawer v-model="visible" title="阅读设置" :size="drawerSize" direction="btt" :close-on-click-modal="true">
            <div class="settings-content">
                <!-- 主题切换 -->
                <div class="setting-section">
                    <div class="section-title">阅读主题</div>
                    <div class="theme-options">
                        <div v-for="theme in themes" :key="theme.value" class="theme-item"
                            :class="{ 'is-active': settings.theme === theme.value }"
                            :style="{ backgroundColor: theme.bgColor, color: theme.textColor }"
                            @click="handleThemeChange(theme.value)">
                            <el-icon v-if="settings.theme === theme.value" class="check-icon">
                                <QyIcon name="CircleCheck"  />
                            </el-icon>
                            <span>{{ theme.label }}</span>
                        </div>
                    </div>
                </div>

                <!-- 字体设置 -->
                <div class="setting-section">
                    <div class="section-title">字体</div>
                    <el-radio-group v-model="settings.fontFamily" class="radio-group">
                        <el-radio label="system">系统默认</el-radio>
                        <el-radio label="serif">宋体</el-radio>
                        <el-radio label="sans-serif">黑体</el-radio>
                        <el-radio label="monospace">等宽字体</el-radio>
                    </el-radio-group>
                </div>

                <!-- 字号设置 -->
                <div class="setting-section">
                    <div class="section-title">
                        字号
                        <span class="section-value">{{ settings.fontSize }}px</span>
                    </div>
                    <div class="slider-container">
                        <el-icon class="slider-icon" @click="decreaseFontSize">
                            <QyIcon name="Minus"  />
                        </el-icon>
                        <el-slider v-model="settings.fontSize" :min="12" :max="32" :step="2" :show-tooltip="false"
                            class="font-slider" />
                        <el-icon class="slider-icon" @click="increaseFontSize">
                            <QyIcon name="Plus"  />
                        </el-icon>
                    </div>
                </div>

                <!-- 行间距 -->
                <div class="setting-section">
                    <div class="section-title">
                        行间距
                        <span class="section-value">{{ settings.lineHeight }}</span>
                    </div>
                    <el-slider v-model="settings.lineHeight" :min="1.2" :max="2.5" :step="0.1"
                        :format-tooltip="(val: number) => val.toFixed(1)" />
                </div>

                <!-- 页面宽度 -->
                <div class="setting-section">
                    <div class="section-title">
                        页面宽度
                        <span class="section-value">{{ settings.pageWidth }}%</span>
                    </div>
                    <el-slider v-model="settings.pageWidth" :min="60" :max="100" :step="5"
                        :format-tooltip="(val: number) => `${val}%`" />
                </div>

                <!-- 翻页模式 -->
                <div class="setting-section">
                    <div class="section-title">翻页模式</div>
                    <el-radio-group v-model="settings.pageMode" class="radio-group">
                        <el-radio label="scroll">上下滚动</el-radio>
                        <el-radio label="click">点击翻页</el-radio>
                        <el-radio label="slide">左右滑动</el-radio>
                    </el-radio-group>
                </div>

                <!-- 自动阅读 -->
                <div class="setting-section">
                    <div class="section-title">自动阅读</div>
                    <div class="setting-row">
                        <span>启用自动阅读</span>
                        <el-switch v-model="settings.autoRead" />
                    </div>
                    <div v-if="settings.autoRead" class="setting-subsection">
                        <div class="subsection-title">
                            滚动速度
                            <span class="section-value">{{ settings.autoReadSpeed }}</span>
                        </div>
                        <el-slider v-model="settings.autoReadSpeed" :min="1" :max="10" :step="1" />
                    </div>
                </div>

                <!-- 阅读偏好 -->
                <div class="setting-section">
                    <div class="section-title">阅读偏好</div>
                    <div class="setting-row">
                        <span>简体/繁体转换</span>
                        <el-switch v-model="settings.enableConvert" />
                    </div>
                    <div class="setting-row">
                        <span>护眼模式</span>
                        <el-switch v-model="settings.eyeCare" />
                    </div>
                    <div class="setting-row">
                        <span>屏幕常亮</span>
                        <el-switch v-model="settings.keepScreenOn" />
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="setting-actions">
                    <el-button @click="handleReset">恢复默认</el-button>
                    <el-button type="primary" @click="handleSave">保存设置</el-button>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import type { ReadingSettings as IReadingSettings } from '@/types/models'

interface Props {
    modelValue: boolean
    initialSettings?: Partial<IReadingSettings>
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'change', settings: IReadingSettings): void
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    initialSettings: () => ({})
})

const emit = defineEmits<Emits>()

// 抽屉大小
const drawerSize = computed(() => {
    if (window.innerWidth < 768) return '90%'
    return '480px'
})

// 显示状态
const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

// 主题选项
const themes = [
    { label: '白天', value: 'light', bgColor: '#ffffff', textColor: '#303133' },
    { label: '夜间', value: 'dark', bgColor: '#1e1e1e', textColor: '#e0e0e0' },
    { label: '护眼', value: 'eye-care', bgColor: '#c7edcc', textColor: '#333333' },
    { label: '羊皮纸', value: 'parchment', bgColor: '#f4ecd8', textColor: '#5c4a2f' }
]

// 默认设置
const defaultSettings: IReadingSettings = {
    theme: 'light',
    fontFamily: 'system',
    fontSize: 18,
    lineHeight: 1.8,
    pageWidth: 80,
    pageMode: 'scroll',
    autoRead: false,
    autoReadSpeed: 3,
    enableConvert: false,
    eyeCare: false,
    keepScreenOn: false
}

// 设置数据
const settings = reactive<IReadingSettings>({
    ...defaultSettings,
    ...props.initialSettings
})

// 主题切换
const handleThemeChange = (theme: string) => {
    settings.theme = theme as any
}

// 字号调整
const decreaseFontSize = () => {
    if (settings.fontSize > 12) {
        settings.fontSize -= 2
    }
}

const increaseFontSize = () => {
    if (settings.fontSize < 32) {
        settings.fontSize += 2
    }
}

// 保存设置
const handleSave = () => {
    // 保存到localStorage
    localStorage.setItem('reading_settings', JSON.stringify(settings))

    emit('change', { ...settings })
    message.success('设置已保存')
    visible.value = false
}

// 恢复默认
const handleReset = () => {
    Object.assign(settings, defaultSettings)
    message.info('已恢复默认设置')
}

// 监听设置变化，实时预览
watch(
    () => ({ ...settings }),
    (_newSettings) => {
        // 可以在这里实时应用设置，不需要点保存
        // emit('change', newSettings)
    },
    { deep: true }
)
</script>

<style scoped lang="scss">
.settings-content {
    padding: 0 8px 20px;
}

.setting-section {
    margin-bottom: 32px;

    .section-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        font-size: 15px;
        font-weight: 600;
        color: #303133;

        .section-value {
            font-size: 14px;
            font-weight: normal;
            color: #909399;
        }
    }

    .subsection-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 12px 0 8px;
        font-size: 14px;
        color: #606266;
    }
}

// 主题选项
.theme-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .theme-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
        border: 2px solid transparent;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &.is-active {
            border-color: #409eff;
        }

        .check-icon {
            position: absolute;
            top: 8px;
            right: 8px;
            font-size: 20px;
            color: #409eff;
        }

        span {
            font-size: 14px;
            font-weight: 500;
        }
    }
}

// 单选组
.radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

// 滑块容器
.slider-container {
    display: flex;
    align-items: center;
    gap: 12px;

    .slider-icon {
        font-size: 20px;
        color: #606266;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
            color: #409eff;
        }
    }

    .font-slider {
        flex: 1;
    }
}

// 设置行
.setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    font-size: 14px;
    color: #606266;

    &+.setting-row {
        border-top: 1px solid #ebeef5;
    }
}

.setting-subsection {
    margin-top: 16px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

// 操作按钮
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

// 响应式
@media (max-width: 768px) {
    .theme-options {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;

        .theme-item {
            height: 70px;
        }
    }

    .radio-group {
        flex-direction: column;
        gap: 8px;
    }
}
</style>
