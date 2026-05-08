<template>
  <div class="theme-settings-view">
    <el-card shadow="never" class="settings-card">
      <template #header>
        <div class="card-header">
          <h3>阅读器主题设置</h3>
          <el-button type="primary" @click="saveAllSettings" :loading="saving">
            <QyIcon name="Check" />
            保存设置
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 主题选择 -->
        <el-tab-pane label="主题" name="theme">
          <div class="theme-section">
            <h4>预设主题</h4>
            <div class="theme-grid">
              <div
                v-for="theme in builtinThemes"
                :key="theme.id"
                :class="['theme-card', { active: currentTheme.id === theme.id }]"
                @click="selectTheme(theme)"
              >
                <div class="theme-preview" :style="getPreviewStyle(theme)">
                  <span class="preview-text">预览文本</span>
                </div>
                <div class="theme-name">{{ theme.name }}</div>
                <el-icon v-if="currentTheme.id === theme.id" class="check-icon">
                  <QyIcon name="Check" />
                </el-icon>
              </div>
            </div>

            <el-divider />

            <h4>自定义主题</h4>
            <div class="custom-themes">
              <div
                v-for="theme in customThemes"
                :key="theme.id"
                :class="['theme-card', { active: currentTheme.id === theme.id }]"
              >
                <div class="theme-preview" :style="getPreviewStyle(theme)">
                  <span class="preview-text">{{ theme.name }}</span>
                </div>
                <div class="theme-name">{{ theme.name }}</div>
                <div class="theme-actions">
                  <el-button size="small" text @click="editCustomTheme(theme)">编辑</el-button>
                  <el-button size="small" text type="danger" @click="deleteCustomTheme(theme.id)"
                    >删除</el-button
                  >
                </div>
              </div>
              <div class="theme-card add-theme" @click="showCreateThemeDialog = true">
                <div class="add-icon">
                  <QyIcon name="Plus" />
                </div>
                <div class="theme-name">新建主题</div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 字体设置 -->
        <el-tab-pane label="字体" name="font">
          <div class="font-section">
            <h4>选择字体</h4>
            <div class="font-grid">
              <div
                v-for="font in builtinFonts"
                :key="font.id"
                :class="['font-card', { active: currentFont.id === font.id }]"
                @click="selectFont(font)"
              >
                <div class="font-preview" :style="{ fontFamily: font.family }">
                  <span class="preview-text">字体预览 Font Preview</span>
                  <span class="preview-sample">天地玄黄，宇宙洪荒</span>
                </div>
                <div class="font-name">{{ font.name }}</div>
                <el-icon v-if="currentFont.id === font.id" class="check-icon">
                  <QyIcon name="Check" />
                </el-icon>
              </div>
            </div>

            <el-divider />

            <h4>字体设置</h4>
            <div class="font-settings">
              <div class="setting-item">
                <label>字体大小</label>
                <div class="size-selector">
                  <el-button
                    v-for="size in fontSizeOptions"
                    :key="size.value"
                    :type="fontSettings.size === size.value ? 'primary' : ''"
                    size="small"
                    @click="updateFontSize(size.value)"
                  >
                    {{ size.label }}
                  </el-button>
                </div>
                <el-slider
                  v-model="fontSettings.size"
                  :min="12"
                  :max="32"
                  :step="1"
                  show-input
                  @change="updateFontSize"
                />
              </div>

              <div class="setting-item">
                <label>行间距</label>
                <div class="line-height-selector">
                  <el-button
                    v-for="height in lineHeightOptions"
                    :key="height.value"
                    :type="fontSettings.line_height === height.value ? 'primary' : ''"
                    size="small"
                    @click="fontSettings.line_height = height.value"
                  >
                    {{ height.label }}
                  </el-button>
                </div>
                <el-slider
                  v-model="fontSettings.line_height"
                  :min="1.0"
                  :max="2.5"
                  :step="0.1"
                  show-input
                />
              </div>

              <div class="setting-item">
                <label>字间距</label>
                <el-slider
                  v-model="fontSettings.letter_spacing"
                  :min="-2"
                  :max="10"
                  :step="0.5"
                  show-input
                />
              </div>

              <div class="setting-item">
                <label>字体粗细</label>
                <el-select v-model="fontSettings.weight" style="width: 200px">
                  <el-option label="正常" value="normal" />
                  <el-option label="粗体" value="bold" />
                  <el-option label="100" value="100" />
                  <el-option label="200" value="200" />
                  <el-option label="300" value="300" />
                  <el-option label="400" value="400" />
                  <el-option label="500" value="500" />
                  <el-option label="600" value="600" />
                  <el-option label="700" value="700" />
                  <el-option label="800" value="800" />
                  <el-option label="900" value="900" />
                </el-select>
              </div>
            </div>

            <el-divider />

            <div class="reading-preview">
              <h4>阅读预览</h4>
              <div class="preview-content" :style="getPreviewContentStyle()">
                <p>这是一段预览文本，用于展示当前的阅读器主题和字体设置效果。</p>
                <p>你可以通过上方的选项卡切换不同的主题和字体，实时预览效果。</p>
                <p>阅读体验对于读者来说非常重要，合适的主题和字体可以让阅读更加舒适。</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 创建主题对话框 -->
    <el-dialog v-model="showCreateThemeDialog" title="创建自定义主题" width="600px">
      <el-form :model="customThemeForm" label-width="100px">
        <el-form-item label="主题名称">
          <el-input v-model="customThemeForm.name" placeholder="请输入主题名称" />
        </el-form-item>
        <el-form-item label="背景颜色">
          <el-color-picker v-model="customThemeForm.colors.background" />
        </el-form-item>
        <el-form-item label="前景颜色">
          <el-color-picker v-model="customThemeForm.colors.foreground" />
        </el-form-item>
        <el-form-item label="强调颜色">
          <el-color-picker v-model="customThemeForm.colors.accent" />
        </el-form-item>
        <el-form-item label="次要颜色">
          <el-color-picker v-model="customThemeForm.colors.secondary" />
        </el-form-item>
        <el-form-item label="边框颜色">
          <el-color-picker v-model="customThemeForm.colors.border" />
        </el-form-item>
        <el-form-item label="阴影颜色">
          <el-input
            v-model="customThemeForm.colors.shadow"
            placeholder="例如: rgba(0, 0, 0, 0.1)"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateThemeDialog = false">取消</el-button>
        <el-button type="primary" @click="createCustomTheme">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import {
  builtinThemes,
  getThemes,
  setActiveTheme,
  createCustomTheme as apiCreateTheme,
  deleteCustomTheme as apiDeleteTheme,
  type Theme,
} from '@/modules/reader/api'
import {
  builtinFonts,
  fontSizeOptions,
  lineHeightOptions,
  setFont,
  getFontSettings,
  updateFontSettings,
  type Font,
  type FontSettings,
} from '@/modules/reader/api'

const activeTab = ref('theme')
const saving = ref(false)

// 主题相关
const currentTheme = ref<Theme>(builtinThemes[0])
const customThemes = ref<Theme[]>([])
const showCreateThemeDialog = ref(false)

const customThemeForm = reactive({
  name: '',
  type: 'custom' as const,
  colors: {
    background: '#ffffff',
    foreground: '#333333',
    accent: '#409EFF',
    secondary: '#909399',
    border: '#DCDFE6',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
})

// 字体相关
const currentFont = ref<Font>(builtinFonts[0])
const fontSettings = reactive<FontSettings>({
  family: builtinFonts[0].family,
  size: 18,
  line_height: 1.5,
  letter_spacing: 0,
  weight: 'normal',
})

// 选择主题
const selectTheme = (theme: Theme) => {
  currentTheme.value = theme
}

// 选择字体
const selectFont = (font: Font) => {
  currentFont.value = font
  fontSettings.family = font.family
}

// 更新字体大小
const updateFontSize = (size: number) => {
  fontSettings.size = size
}

// 获取预览样式
const getPreviewStyle = (theme: Theme) => ({
  backgroundColor: theme.colors.background,
  color: theme.colors.foreground,
  border: `1px solid ${theme.colors.border}`,
})

// 获取预览内容样式
const getPreviewContentStyle = () => ({
  fontFamily: fontSettings.family,
  fontSize: `${fontSettings.size}px`,
  lineHeight: fontSettings.line_height,
  letterSpacing: `${fontSettings.letter_spacing}px`,
  fontWeight: fontSettings.weight,
  backgroundColor: currentTheme.value.colors.background,
  color: currentTheme.value.colors.foreground,
  padding: '20px',
  borderRadius: '8px',
  minHeight: '150px',
})

// 创建自定义主题
const createCustomTheme = async () => {
  if (!customThemeForm.name) {
    message.warning('请输入主题名称')
    return
  }

  try {
    const res = await apiCreateTheme(customThemeForm)
    customThemes.value.push(res)
    message.success('主题创建成功')
    showCreateThemeDialog.value = false
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '创建失败'
    message.error(errorMessage)
  }
}

// 编辑自定义主题
const editCustomTheme = (theme: Theme) => {
  Object.assign(customThemeForm, {
    name: theme.name,
    colors: theme.colors,
  })
  showCreateThemeDialog.value = true
}

// 删除自定义主题
const deleteCustomTheme = async (themeId: string) => {
  try {
    await apiDeleteTheme(themeId)
    customThemes.value = customThemes.value.filter((t) => t.id !== themeId)
    message.success('删除成功')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '删除失败'
    message.error(errorMessage)
  }
}

// 保存所有设置
const saveAllSettings = async () => {
  saving.value = true
  try {
    // 保存主题设置
    await setActiveTheme(currentTheme.value.id)

    // 保存字体设置
    await setFont(currentFont.value.id)
    await updateFontSettings(fontSettings)

    message.success('设置保存成功')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '保存失败'
    message.error(errorMessage)
  } finally {
    saving.value = false
  }
}

// 加载用户设置
const loadUserSettings = async () => {
  try {
    // 加载自定义主题
    const themesRes = await getThemes()
    customThemes.value = themesRes.filter((t) => !t.is_builtin)

    // 加载字体设置
    const fontRes = await getFontSettings()
    Object.assign(fontSettings, fontRes)
  } catch (error) {
    console.error('加载用户设置失败', error)
  }
}

onMounted(() => {
  loadUserSettings()
})
</script>

<style scoped lang="scss">
.theme-settings-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
    }
  }
}

.theme-section,
.font-section {
  h4 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
  }
}

.theme-grid,
.font-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.theme-card,
.font-card {
  position: relative;
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
    transform: translateY(-2px);
  }

  &.active {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
  }
}

.theme-preview,
.font-preview {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;

  .preview-text {
    font-size: 14px;
    white-space: nowrap;
  }
}

.font-preview {
  flex-direction: column;
  gap: 8px;

  .preview-sample {
    font-size: 18px;
    font-weight: 500;
  }
}

.theme-name,
.font-name {
  padding: 8px 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  background: var(--el-fill-color-light);
}

.check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--el-color-primary);
  font-size: 20px;
}

.custom-themes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.theme-actions {
  padding: 8px;
  display: flex;
  justify-content: center;
  gap: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.add-theme {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  background: var(--el-fill-color-lighter);
  border-style: dashed;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.add-icon {
  font-size: 32px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.font-settings {
  .setting-item {
    margin-bottom: 24px;

    label {
      display: block;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.size-selector,
.line-height-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.reading-preview {
  margin-top: 24px;

  .preview-content {
    p {
      margin: 0 0 12px;
      text-indent: 2em;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
