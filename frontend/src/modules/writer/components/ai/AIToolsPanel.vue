<template>
  <div class="ai-tools-panel">
    <!-- 工具选择 -->
    <el-tabs v-model="activeTool" @tab-click="handleToolChange">
      <!-- 续写 -->
      <el-tab-pane label="续写" name="continue">
        <div class="tool-content">
          <el-form label-position="top">
            <el-form-item label="当前文本">
              <el-input
                v-model="toolConfig.continue.text"
                type="textarea"
                :rows="4"
                placeholder="输入需要续写的文本，或者留空使用编辑器当前内容..."
                maxlength="5000"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="续写长度">
              <el-radio-group v-model="toolConfig.continue.length">
                <el-radio :label="100">100字</el-radio>
                <el-radio :label="200">200字</el-radio>
                <el-radio :label="500">500字</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-button
              type="primary"
              :loading="isProcessing"
              @click="handleGenerate('continue')"
              :disabled="!canGenerate"
              class="generate-button"
            >
              <QyIcon name="Edit"  />
              开始续写
            </el-button>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 润色 -->
      <el-tab-pane label="润色" name="polish">
        <div class="tool-content">
          <el-form label-position="top">
            <el-form-item label="原始文本">
              <el-input
                v-model="toolConfig.polish.text"
                type="textarea"
                :rows="4"
                placeholder="输入需要润色的文本..."
                maxlength="5000"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="润色风格">
              <el-select v-model="toolConfig.polish.style" placeholder="选择风格" popper-class="writer-select-popper">
                <el-option label="提升文学性" value="literary" />
                <el-option label="简洁明了" value="concise" />
                <el-option label="专业正式" value="formal" />
              </el-select>
            </el-form-item>

            <el-form-item label="附加说明（可选）">
              <el-input
                v-model="toolConfig.polish.instructions"
                type="textarea"
                :rows="2"
                placeholder="例如：使用更生动的词汇..."
                maxlength="500"
              />
            </el-form-item>

            <el-button
              type="primary"
              :loading="isProcessing"
              @click="handleGenerate('polish')"
              :disabled="!toolConfig.polish.text"
              class="generate-button"
            >
              <QyIcon name="Brush"  />
              开始润色
            </el-button>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 扩写 -->
      <el-tab-pane label="扩写" name="expand">
        <div class="tool-content">
          <el-form label-position="top">
            <el-form-item label="大纲/简要文本">
              <el-input
                v-model="toolConfig.expand.text"
                type="textarea"
                :rows="4"
                placeholder="输入大纲或简要文本..."
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="详细程度">
              <el-radio-group v-model="toolConfig.expand.detailLevel">
                <el-radio label="brief">简要</el-radio>
                <el-radio label="moderate">适中</el-radio>
                <el-radio label="detailed">详细</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="扩写指示（可选）">
              <el-input
                v-model="toolConfig.expand.instructions"
                type="textarea"
                :rows="2"
                placeholder="例如：增加环境描写和人物心理活动..."
                maxlength="500"
              />
            </el-form-item>

            <el-button
              type="primary"
              :loading="isProcessing"
              @click="handleGenerate('expand')"
              :disabled="!toolConfig.expand.text"
              class="generate-button"
            >
              <QyIcon name="Plus"  />
              开始扩写
            </el-button>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- AI智能续写（上下文感知） -->
      <el-tab-pane label="智能续写" name="suggest">
        <div class="tool-content">
          <el-form label-position="top">
            <el-form-item label="选中文本（可选）">
              <el-input
                v-model="toolConfig.suggest.text"
                type="textarea"
                :rows="4"
                placeholder="选中文本将自动填充，也可手动输入参考文本..."
                maxlength="5000"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="补充说明（可选）">
              <el-input
                v-model="toolConfig.suggest.instruction"
                type="textarea"
                :rows="2"
                placeholder="例如：请给出接下来的情节发展建议..."
                maxlength="500"
              />
            </el-form-item>

            <el-button
              type="primary"
              :loading="isProcessing"
              @click="handleGenerate('suggest')"
              :disabled="!canSuggestGenerate"
              class="generate-button"
            >
              <QyIcon name="MagicStick" />
              AI智能续写
            </el-button>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 改写 -->
      <el-tab-pane label="改写" name="rewrite">
        <div class="tool-content">
          <el-form label-position="top">
            <el-form-item label="原始文本">
              <el-input
                v-model="toolConfig.rewrite.text"
                type="textarea"
                :rows="4"
                placeholder="输入需要改写的文本..."
                maxlength="5000"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="改写模式">
              <el-select v-model="toolConfig.rewrite.mode" placeholder="选择模式" popper-class="writer-select-popper">
                <el-option label="保持意思，换种说法" value="polish" />
                <el-option label="简化表达" value="simplify" />
                <el-option label="正式风格" value="formal" />
                <el-option label="轻松风格" value="casual" />
              </el-select>
            </el-form-item>

            <el-form-item label="附加说明（可选）">
              <el-input
                v-model="toolConfig.rewrite.instructions"
                type="textarea"
                :rows="2"
                placeholder="例如：更适合年轻读者..."
                maxlength="500"
              />
            </el-form-item>

            <el-button
              type="primary"
              :loading="isProcessing"
              @click="handleGenerate('rewrite')"
              :disabled="!toolConfig.rewrite.text"
              class="generate-button"
            >
              <QyIcon name="RefreshRight"  />
              开始改写
            </el-button>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 结果预览 -->
    <div v-if="lastResult" class="result-preview">
      <div class="result-header">
        <span class="result-title">生成结果</span>
        <el-button text :icon="DocumentCopy" @click="handleCopyResult">复制</el-button>
      </div>
      <div class="result-content">
        {{ lastResult }}
      </div>
      <div v-if="usage" class="token-usage">
        <el-tag size="small">
          Token使用: {{ usage.total_tokens }}
          (提示: {{ usage.prompt_tokens }}, 生成: {{ usage.completion_tokens }})
        </el-tag>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <el-alert :title="error" type="error" :closable="false" show-icon />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { message } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
interface Props {
  selectedText?: string
  lastResult: string
  isProcessing: boolean
  error: string | null
}

interface Emits {
  (e: 'generate', params: { tool: string; text: string; options: any }): void
  (e: 'insert', text: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const activeTool = ref('continue')
const usage = ref<any>(null)

const toolConfig: Record<string, { text: string; length?: number; style?: string; instructions?: string; instruction?: string; detailLevel?: string; mode?: string }> = reactive({
  continue: {
    text: '',
    length: 200
  },
  polish: {
    text: '',
    style: 'literary',
    instructions: ''
  },
  expand: {
    text: '',
    detailLevel: 'moderate',
    instructions: ''
  },
  rewrite: {
    text: '',
    mode: 'polish',
    instructions: ''
  },
  suggest: {
    text: '',
    instruction: ''
  }
})

const canGenerate = computed(() => {
  return toolConfig.continue.text.trim().length > 0 || props.selectedText
})

const canSuggestGenerate = computed(() => {
  // 智能续写不需要必填文本，只要能获取到当前文档即可
  return true
})

// 工具切换
const handleToolChange = (tab: { paneName: string }) => {
  // 如果有选中文本，自动填充到当前工具
  if (props.selectedText) {
    const toolName = tab.paneName
    if (toolName in toolConfig) {
      toolConfig[toolName].text = props.selectedText
    }
  }
}

// 生成内容
const handleGenerate = (tool: string) => {
  const config = toolConfig[tool]

  if (!config.text && !props.selectedText) {
    message.warning('请输入文本')
    return
  }

  const text = config.text || props.selectedText || ''

  const options: Record<string, unknown> = {}

  switch (tool) {
    case 'continue':
      options.length = config.length
      break
    case 'polish':
      options.style = config.style
      options.instructions = config.instructions
      break
    case 'expand':
      options.detailLevel = config.detailLevel
      options.instructions = config.instructions
      break
    case 'rewrite':
      options.mode = config.mode
      options.instructions = config.instructions
      break
    case 'suggest':
      options.instruction = config.instruction
      break
  }

  emit('generate', { tool, text, options })
}

// 复制结果
const handleCopyResult = async () => {
  try {
    await navigator.clipboard.writeText(props.lastResult)
    message.success('已复制到剪贴板')
  } catch (error) {
    message.error('复制失败')
  }
}

// 监听选中文本变化
watch(() => props.selectedText, (newText) => {
  if (newText) {
    // 自动填充到当前激活的工具
    const tool = activeTool.value
    if (tool in toolConfig) {
      toolConfig[tool].text = newText
    }
  }
})
</script>

<style scoped lang="scss">
.ai-tools-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
}

.el-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs__header) {
    margin: 0;
    padding: 16px 16px 0;
    background: white;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow-y: auto;
  }
}

.tool-content {
  padding: 16px;
}

.generate-button {
  width: 100%;
  margin-top: 8px;
}

.result-preview {
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  background: #f9fafb;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-title {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.result-content {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  line-height: 1.6;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 2px;
  }
}

.token-usage {
  margin-top: 8px;
  text-align: right;
}

.error-message {
  margin: 16px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .ai-tools-panel {
    background: #0d0d0d;
  }

  .el-tabs :deep(.el-tabs__header) {
    background: #0d0d0d;
  }

  .result-preview {
    background: #1a1a1a;
    border-top-color: #2d2d2d;
  }

  .result-title {
    color: #e5e7eb;
  }

  .result-content {
    background: #0d0d0d;
    border-color: #2d2d2d;
    color: #e5e7eb;
  }
}
</style>


