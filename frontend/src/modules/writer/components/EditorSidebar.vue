<template>
  <div class="editor-sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- 折叠按钮 -->
    <div class="sidebar-toggle" @click="toggleCollapse" role="button" :aria-label="isCollapsed ? '展开侧边栏' : '折叠侧边栏'">
      <QyIcon :name="isCollapsed ? 'ChevronRight' : 'ChevronLeft'" />
    </div>

    <template v-if="!isCollapsed">
      <!-- 项目区域 -->
      <div class="sidebar-section">
        <div class="section-header">
          <h3>项目</h3>
        </div>
        <ProjectTree
          :project-id="currentProjectId"
          :current-chapter-id="currentChapterId"
          :chapters="props.chapters || []"
          @chapter-select="handleChapterSelect"
        />
      </div>

      <!-- 工具区域 -->
      <div class="sidebar-section">
        <div class="section-header">
          <h3>工具</h3>
        </div>
        <nav class="tool-nav">
          <button
            v-for="tool in tools"
            :key="tool.value"
            class="tool-item"
            :class="{ active: activeTool === tool.value }"
            :data-tool="tool.value"
            @click="handleToolChange(tool.value)"
          >
            <QyIcon :name="tool.icon" />
            <span class="tool-label">{{ tool.label }}</span>
          </button>
        </nav>
      </div>
    </template>

    <template v-else>
      <!-- 折叠状态：仅显示工具图标 -->
      <nav class="collapsed-nav">
        <button
          v-for="tool in tools"
          :key="tool.value"
          class="collapsed-tool-item"
          :class="{ active: activeTool === tool.value }"
          :data-tool="tool.value"
          @click="handleToolChange(tool.value)"
          :title="tool.label"
        >
          <QyIcon :name="tool.icon" />
        </button>
      </nav>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ProjectTree from './ProjectTree.vue'

interface Tool {
  value: string
  label: string
  icon: string
}

const tools: Tool[] = [
  { value: 'editor', label: '写作', icon: 'Edit' },
  { value: 'outline', label: '大纲', icon: 'List' },
  { value: 'characters', label: '角色', icon: 'User' },
  { value: 'encyclopedia', label: '设定', icon: 'LocationInformation' }
]

interface Chapter {
  id: string
  title: string
  children?: Chapter[]
}

const props = defineProps<{
  projectId: string
  chapterId: string
  chapters?: Chapter[]
}>()

const emit = defineEmits<{
  toolChange: [tool: string]
  chapterSelect: [chapterId: string]
}>()

const activeTool = ref('editor')
const isCollapsed = ref(false)

const currentProjectId = computed(() => props.projectId)
const currentChapterId = computed(() => props.chapterId)

const handleToolChange = (tool: string) => {
  activeTool.value = tool
  emit('toolChange', tool)
}

const handleChapterSelect = (chapterId: string) => {
  emit('chapterSelect', chapterId)
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped lang="scss">
.editor-sidebar {
  width: 280px;
  height: 100%;
  background: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;

  &.collapsed {
    width: 60px;
  }
}

.sidebar-toggle {
  padding: 12px;
  cursor: pointer;
  display: flex;
  justify-content: flex-end;
  border-bottom: 1px solid var(--el-border-color);

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.sidebar-section {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);

  &:last-child {
    flex: 1;
    overflow-y: auto;
  }
}

.section-header {
  margin-bottom: 12px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
}

.tool-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  transition: all 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.collapsed-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 8px;
}

.collapsed-tool-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  transition: all 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.tool-label {
  font-size: 14px;
}
</style>
