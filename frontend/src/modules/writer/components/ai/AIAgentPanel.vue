<template>
  <div class="ai-agent-panel">
    <!-- 上下文展示区 -->
    <div class="context-section">
      <h3 class="section-title">
        <QyIcon name="InfoFilled"  />
        当前上下文
      </h3>

      <!-- 角色上下文 -->
      <div v-if="agentContext.characters.length > 0" class="context-group">
        <h4>相关角色</h4>
        <div class="context-items">
          <el-tag
            v-for="character in agentContext.characters"
            :key="character.id"
            size="small"
            @click="handleSelectCharacter(character)"
            style="cursor: pointer; margin-right: 8px; margin-bottom: 8px;"
          >
            {{ character.name }}
          </el-tag>
        </div>
      </div>

      <!-- 地点上下文 -->
      <div v-if="agentContext.locations.length > 0" class="context-group">
        <h4>相关地点</h4>
        <div class="context-items">
          <el-tag
            v-for="location in agentContext.locations"
            :key="location.id"
            size="small"
            type="success"
            @click="handleSelectLocation(location)"
            style="cursor: pointer; margin-right: 8px; margin-bottom: 8px;"
          >
            {{ location.name }}
          </el-tag>
        </div>
      </div>

      <!-- 事件上下文 -->
      <div v-if="agentContext.events.length > 0" class="context-group">
        <h4>相关事件</h4>
        <div class="context-items">
          <el-tag
            v-for="event in agentContext.events.slice(0, 5)"
            :key="event.id"
            size="small"
            type="warning"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ event.title }}
          </el-tag>
        </div>
      </div>

      <el-button
        v-if="agentContext.characters.length === 0 && agentContext.locations.length === 0"
        type="primary"
        size="small"
        @click="handleRefreshContext"
        :loading="isRefreshing"
      >
        <QyIcon name="Refresh"  />
        加载上下文
      </el-button>
    </div>

    <!-- AI 生成工具 -->
    <div class="tools-section">
      <h3 class="section-title">
        <QyIcon name="MagicStick"  />
        智能生成
      </h3>

      <div class="tool-groups">
        <!-- 基于角色的生成 -->
        <div class="tool-group">
          <h4>角色对话生成</h4>
          <el-select
            v-model="selectedCharacter"
            placeholder="选择角色"
            size="small"
            style="width: 100%; margin-bottom: 8px;"
          >
            <el-option
              v-for="character in agentContext.characters"
              :key="character.id"
              :label="character.name"
              :value="character.id"
            />
          </el-select>
          <el-input
            v-model="dialoguePrompt"
            type="textarea"
            :rows="2"
            placeholder="输入对话场景描述..."
            size="small"
          />
          <el-button
            type="primary"
            size="small"
            @click="handleGenerateDialogue"
            :loading="isGenerating"
            style="width: 100%; margin-top: 8px;"
          >
            生成对话
          </el-button>
        </div>

        <!-- 基于地点的生成 -->
        <div class="tool-group">
          <h4>场景描写生成</h4>
          <el-select
            v-model="selectedLocation"
            placeholder="选择地点"
            size="small"
            style="width: 100%; margin-bottom: 8px;"
          >
            <el-option
              v-for="location in agentContext.locations"
              :key="location.id"
              :label="location.name"
              :value="location.id"
            />
          </el-select>
          <el-input
            v-model="scenePrompt"
            type="textarea"
            :rows="2"
            placeholder="输入场景要求..."
            size="small"
          />
          <el-button
            type="primary"
            size="small"
            @click="handleGenerateScene"
            :loading="isGenerating"
            style="width: 100%; margin-top: 8px;"
          >
            生成场景
          </el-button>
        </div>

        <!-- 基于时间线的生成 -->
        <div class="tool-group">
          <h4>情节建议</h4>
          <el-select
            v-model="selectedEvent"
            placeholder="选择事件"
            size="small"
            style="width: 100%; margin-bottom: 8px;"
          >
            <el-option
              v-for="event in agentContext.events"
              :key="event.id"
              :label="event.title"
              :value="event.id"
            />
          </el-select>
          <el-button
            type="primary"
            size="small"
            @click="handleGeneratePlot"
            :loading="isGenerating"
            style="width: 100%; margin-top: 8px;"
          >
            生成情节建议
          </el-button>
        </div>
      </div>
    </div>

    <!-- 生成结果展示 -->
    <div v-if="generatedContent" class="result-section">
      <h3 class="section-title">
        <QyIcon name="Document"  />
        生成结果
      </h3>
      <div class="result-content">
        {{ generatedContent }}
      </div>
      <div class="result-actions">
        <el-button size="small" @click="handleInsertResult">
          <QyIcon name="DocumentCopy"  />
          插入到编辑器
        </el-button>
        <el-button size="small" @click="handleCopyResult">
          <QyIcon name="CopyDocument"  />
          复制
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWriterStore } from '../../stores/writerStore'
// @ts-ignore - TypeScript 服务器可能需要重启才能识别新类型
import type { Character, Location } from '@/types/writer'
import { QyIcon } from '@/design-system/components'
import { message } from '@/design-system/services'
const emit = defineEmits<{
  insert: [text: string]
}>()

const writerStore = useWriterStore()
const isRefreshing = ref(false)
const isGenerating = ref(false)
const selectedCharacter = ref('')
const selectedLocation = ref('')
const selectedEvent = ref('')
const dialoguePrompt = ref('')
const scenePrompt = ref('')
const generatedContent = ref('')

const agentContext = computed(() => writerStore.ai.agentContext)

const handleRefreshContext = async () => {
  isRefreshing.value = true
  try {
    await writerStore.updateAgentContext()
    message.success('上下文已更新')
  } catch (error: any) {
    message.error(error.message || '加载上下文失败')
  } finally {
    isRefreshing.value = false
  }
}

const handleSelectCharacter = (character: Character) => {
  selectedCharacter.value = character.id
  message.info(`已选择角色: ${character.name}`)
}

const handleSelectLocation = (location: Location) => {
  selectedLocation.value = location.id
  message.info(`已选择地点: ${location.name}`)
}

const handleGenerateDialogue = async () => {
  if (!selectedCharacter.value) {
    message.warning('请先选择角色')
    return
  }

  const character = agentContext.value.characters.find(c => c.id === selectedCharacter.value)
  if (!character) return

  isGenerating.value = true
  try {
    // 构建包含角色信息的提示
    const prompt = `基于以下角色信息生成对话：
角色名称：${character.name}
性格特征：${character.traits?.join('、') || '未知'}
性格提示：${character.personalityPrompt || '无'}
语言模式：${character.speechPattern || '普通'}

场景描述：${dialoguePrompt.value}

请生成符合角色性格的对话内容。`

    // 调用 AI 生成
    const result = await writerStore.aiContinueWriting(prompt, 200)
    generatedContent.value = result
    message.success('对话生成成功')
  } catch (error: any) {
    message.error(error.message || '生成失败')
  } finally {
    isGenerating.value = false
  }
}

const handleGenerateScene = async () => {
  if (!selectedLocation.value) {
    message.warning('请先选择地点')
    return
  }

  const location = agentContext.value.locations.find(l => l.id === selectedLocation.value)
  if (!location) return

  isGenerating.value = true
  try {
    const prompt = `基于以下地点信息生成场景描写：
地点名称：${location.name}
描述：${location.description || ''}
气候：${location.climate || '未知'}
文化：${location.culture || '未知'}
地理：${location.geography || '未知'}
氛围：${location.atmosphere || '未知'}

场景要求：${scenePrompt.value}

请生成细致的场景描写。`

    const result = await writerStore.aiContinueWriting(prompt, 300)
    generatedContent.value = result
    message.success('场景生成成功')
  } catch (error: any) {
    message.error(error.message || '生成失败')
  } finally {
    isGenerating.value = false
  }
}

const handleGeneratePlot = async () => {
  if (!selectedEvent.value) {
    message.warning('请先选择事件')
    return
  }

  const event = agentContext.value.events.find(e => e.id === selectedEvent.value)
  if (!event) return

  isGenerating.value = true
  try {
    const prompt = `基于以下时间线事件提供情节建议：
事件标题：${event.title}
事件描述：${event.description || ''}
事件类型：${event.eventType}
重要性：${event.importance}/10

请提供情节发展建议和可能的转折点。`

    const result = await writerStore.aiContinueWriting(prompt, 300)
    generatedContent.value = result
    message.success('情节建议生成成功')
  } catch (error: any) {
    message.error(error.message || '生成失败')
  } finally {
    isGenerating.value = false
  }
}

const handleInsertResult = () => {
  if (generatedContent.value) {
    emit('insert', generatedContent.value)
    message.success('已插入到编辑器')
  }
}

const handleCopyResult = async () => {
  if (generatedContent.value) {
    try {
      await navigator.clipboard.writeText(generatedContent.value)
      message.success('已复制到剪贴板')
    } catch {
      message.error('复制失败')
    }
  }
}
</script>

<style scoped lang="scss">
.ai-agent-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 16px;
  gap: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.context-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e5e7eb;
}

.context-group {
  margin-bottom: 12px;

  h4 {
    font-size: 13px;
    font-weight: 600;
    color: #606266;
    margin: 0 0 8px 0;
  }
}

.context-items {
  display: flex;
  flex-wrap: wrap;
}

.tools-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tool-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-group {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;

  h4 {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
  }
}

.result-section {
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  padding: 12px;
}

.result-content {
  background: #ffffff;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
}

.result-actions {
  display: flex;
  gap: 8px;
}

/* 深色/暖纸/专注模式 — 统一使用 CSS 变量 */
[data-editor-theme="dark"],
[data-editor-theme="sepia"],
[data-editor-theme="focus"] {
  .context-section,
  .tool-group {
    background: var(--editor-bg-base, #1a1a1a);
    border-color: var(--editor-border, #2d2d2d);
  }

  .section-title,
  .tool-group h4 {
    color: var(--editor-text-primary, #e5e5e5);
  }

  .context-group h4 {
    color: var(--editor-text-secondary, #c0c4cc);
  }

  .result-section {
    background: var(--editor-accent-soft, #1a3a52);
    border-color: var(--editor-border-focus, #2d5a7a);
  }

  .result-content {
    background: var(--editor-bg-surface, #0d0d0d);
    color: var(--editor-text-primary, #e5e5e5);
  }
}
</style>

