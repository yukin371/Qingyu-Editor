<template>
  <WriterPageShell>
    <div class="project-list-view">
      <WriterSurfaceCard class="mb-5">
        <div class="page-header" style="margin-bottom: 0">
          <div style="display: flex; align-items: center; gap: 16px">
            <h1>我的项目</h1>
          </div>
          <div style="display: flex; gap: 8px">
            <label
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-green-600 bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700 cursor-pointer"
            >
              <QyIcon name="FileDown" :size="14" />
              导入项目
              <input
                type="file"
                accept=".zip"
                class="hidden"
                @change="handleImportProject"
              />
            </label>
            <button
              v-if="hasLocalData"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-orange-500 bg-orange-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
              @click="showMigrationDialog = true"
            >
              <QyIcon name="Upload" :size="14" />
              迁移本地数据
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              @click="showCreateDialog = true"
            >
              <QyIcon name="Plus" :size="14" />
              新建项目
            </button>
          </div>
        </div>
        <p class="mt-3 text-sm text-slate-500">统一管理作品与章节，支持快速新建、编辑与发布。</p>
      </WriterSurfaceCard>

      <div v-loading="loading" class="projects-container">
        <div v-if="!loading && projectList.length === 0" class="empty-container">
          <Empty description="还没有项目，创建一个开始吧！">
            <template #action>
              <el-button type="primary" @click="showCreateDialog = true">
                <QyIcon name="Plus" :size="14" />
                创建第一个项目
              </el-button>
            </template>
          </Empty>
        </div>

        <div v-else class="project-grid">
          <WriterSurfaceCard
            v-for="project in projectList"
            :key="project.projectId"
            tag="article"
            centered
            interactive
            class="project-card"
            @click="openProject(project.projectId)"
          >
            <div class="card-header">
              <span class="project-name">{{ project.title }}</span>
              <QyDropdown
                class="project-actions"
                :items="getProjectMenuItems(project)"
                trigger="click"
                placement="bottom-end"
                @select="(key: string) => handleCommand(key, project)"
              >
                <button
                  type="button"
                  class="more-btn"
                  aria-label="更多操作"
                >
                  <QyIcon name="MoreFilled" :size="16" />
                </button>
              </QyDropdown>
            </div>

            <div class="project-description">
              {{ project.summary || project.description || '暂无描述' }}
            </div>

            <div class="project-stats">
              <div class="stat-item">
                <span class="stat-label">字数</span>
                <span class="stat-value">{{ project.wordCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">章节</span>
                <span class="stat-value">{{ project.chapterCount || 0 }}</span>
              </div>
            </div>

            <div class="project-meta">
              <span class="status-badge" :class="getStatusClass(project.status)">
                {{ getStatusText(project.status) }}
              </span>
              <span class="meta-date">{{ formatDate(project.updatedAt) }}</span>
            </div>

            <div class="project-entry-hint">
              <span>点击进入项目</span>
              <QyIcon name="ArrowRight" :size="14" />
            </div>
          </WriterSurfaceCard>
        </div>
      </div>

      <CenteredModalCard
        v-model="showCreateDialog"
        title="创建新项目"
        width="min(560px, 92vw)"
        :show-close="true"
        :close-on-click-modal="true"
      >
        <el-form :model="newProject" label-position="top" class="create-form">
          <div class="form-row">
            <el-form-item label="项目名称" required class="flex-1">
              <el-input v-model="newProject.title" placeholder="请输入项目名称" maxlength="50" />
            </el-form-item>

            <el-form-item label="项目类型" class="type-select">
              <div class="native-select-wrap">
                <select v-model="newProject.type" class="native-select" aria-label="项目类型">
                  <option value="novel">小说</option>
                  <option value="essay">散文随笔</option>
                  <option value="script">剧本</option>
                  <option value="notes">笔记</option>
                  <option value="poetry">诗歌</option>
                  <option value="others">其他</option>
                </select>
                <QyIcon name="ArrowDown" :size="14" class="native-select-caret" />
              </div>
            </el-form-item>
          </div>

          <el-form-item label="项目封面">
            <div class="cover-upload-container">
              <!-- 有预览图时显示预览和删除按钮 -->
              <div v-if="coverPreviewUrl" class="cover-preview-wrapper">
                <img :src="coverPreviewUrl" alt="封面预览" class="cover-preview-img" />
                <button type="button" class="cover-remove-btn" @click="removeCover">
                  <QyIcon name="Close" :size="14" />
                </button>
              </div>
              <!-- 无预览图时显示上传按钮 -->
              <button type="button" class="cover-upload-btn" @click="triggerCoverUpload">
                <QyIcon name="Plus" :size="20" />
                <span>上传封面</span>
              </button>
              <input
                ref="coverInputRef"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                style="display: none"
                @change="handleCoverFileSelect"
              />
              <p class="cover-hint">支持 JPG、PNG，不超过 2MB</p>
            </div>
          </el-form-item>

          <el-form-item label="项目描述">
            <el-input
              v-model="newProject.description"
              type="textarea"
              :rows="3"
              placeholder="请输入项目描述（可选）"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">创建</el-button>
        </template>
      </CenteredModalCard>

      <CenteredModalCard v-model="showPublishConfirmDialog" title="发布确认" width="420px">
        <div class="publish-confirm-text">
          确认一键发布项目“{{ pendingPublishProject?.title || '' }}”？
        </div>
        <template #footer>
          <el-button @click="cancelPublish">取消</el-button>
          <el-button type="primary" @click="confirmPublish">确认发布</el-button>
        </template>
      </CenteredModalCard>

      <!-- 数据迁移对话框 -->
      <MigrationDialog
        v-model="showMigrationDialog"
        @migration-complete="handleMigrationComplete"
      />
    </div>
  </WriterPageShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { Empty } from '@/design-system/base'
import { QyDropdown } from '@/design-system/navigation/Dropdown'
// 使用后端 API 的 writerStore，而不是 IndexedDB 的旧 store
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { ElMessage } from 'element-plus'
import WriterPageShell from '@/modules/writer/components/WriterPageShell.vue'
import WriterSurfaceCard from '@/modules/writer/components/WriterSurfaceCard.vue'
import CenteredModalCard from '@/modules/writer/components/CenteredModalCard.vue'
import MigrationDialog from '@/modules/writer/components/MigrationDialog.vue'
import { hasLocalDataToMigrate } from '@/utils/migration'

const router = useRouter()
const writerStore = useWriterStore()

// State
const showCreateDialog = ref(false)
const newProject = ref({
  title: '',
  description: '',
  type: 'novel' as 'novel' | 'essay' | 'script' | 'notes' | 'poetry' | 'others',
  coverUrl: '',
})
const coverPreviewUrl = ref('')
const coverInputRef = ref<HTMLInputElement | null>(null)
const showPublishConfirmDialog = ref(false)
const pendingPublishProject = ref<any | null>(null)

// 迁移相关状态
const showMigrationDialog = ref(false)
const hasLocalData = ref(false)

// Computed
const projectList = computed<any[]>(() => {
  const list = (writerStore as any).projectList
  return Array.isArray(list) ? list : []
})
const loading = computed(() => Boolean((writerStore as any).loading))

// Methods
const formatDate = (dateStr: string) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const openProject = (projectId: string) => {
  if (!projectId) {
    ElMessage.error('项目ID无效')
    return
  }
  router.push({ name: 'writer-project', params: { projectId } })
}

const handleCreate = async () => {
  if (!newProject.value.title.trim()) {
    message.warning('请输入项目名称')
    return
  }

  try {
    const project = await writerStore.createNewProject({
      title: newProject.value.title,
      summary: newProject.value.description, // 映射到后端的 summary 字段
      coverUrl: newProject.value.coverUrl, // 封面图片URL
      // type 字段暂时不使用，后端没有对应字段
      // type: newProject.value.type,
    })

    if (project) {
      // 关闭弹窗
      showCreateDialog.value = false
      // 重置表单
      newProject.value = { title: '', description: '', type: 'novel', coverUrl: '' }
      // 清除封面预览
      coverPreviewUrl.value = ''

      // 打开新创建的项目 - 兼容不同的字段名
      const projectId = project.projectId || project.id
      if (projectId) {
        openProject(projectId)
      } else {
        ElMessage.error('项目创建成功，但缺少项目ID')
      }
    }
  } catch (error: any) {
    // 处理重复项目名称错误（后端返回 40901/HTTP 409）
    const errorCode = error?.response?.data?.code || error?.code
    const errorStatus = error?.response?.status
    if (errorCode === 40901 || errorStatus === 409) {
      ElMessage.error('项目名称已存在，请使用其他名称')
    } else if (error.message) {
      ElMessage.error('创建项目失败：' + error.message)
    } else {
      ElMessage.error('创建项目失败，请稍后重试')
    }
  }
}

// 触发封面文件选择
const triggerCoverUpload = () => {
  coverInputRef.value?.click()
}

// 封面文件选择处理
const handleCoverFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // 校验文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    input.value = ''
    return
  }

  // 校验文件大小 (2MB)
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB')
    input.value = ''
    return
  }

  try {
    // 创建本地预览URL
    const previewUrl = URL.createObjectURL(file)
    coverPreviewUrl.value = previewUrl

    // 将文件转换为 base64 Data URL（临时方案）
    const reader = new FileReader()
    reader.onload = (e) => {
      newProject.value.coverUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)

    ElMessage.success('封面上传成功')
  } catch (error: any) {
    ElMessage.error('封面上传失败：' + (error.message || '未知错误'))
    coverPreviewUrl.value = ''
    newProject.value.coverUrl = ''
  }

  // 清空 input 以允许重复选择同一文件
  input.value = ''
}

// 移除封面
const removeCover = () => {
  // 释放预览URL
  if (coverPreviewUrl.value && coverPreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(coverPreviewUrl.value)
  }
  coverPreviewUrl.value = ''
  newProject.value.coverUrl = ''
}

const getProjectMenuItems = (project: any) => [
  { key: 'export', label: '导出为ZIP' },
  { key: 'publish', label: '一键发布', disabled: project.status === 'published' },
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除', danger: true, divider: true },
]

const handleCommand = async (command: string, project: any) => {
  if (command === 'export') {
    await handleExport(project)
  } else if (command === 'publish') {
    await handlePublish(project)
  } else if (command === 'edit') {
    // TODO: 实现编辑功能
    message.info('编辑功能开发中')
  } else if (command === 'delete') {
    try {
      await messageBox.confirm(`确定要删除项目"${project.title}"吗？此操作不可恢复。`, '确认删除', {
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      })

      await writerStore.deleteProjectById(project.projectId)
    } catch (error: any) {
      if (error !== 'cancel') {
        message.error('删除失败：' + (error.message || '未知错误'))
      }
    }
  }
}

// 导出项目
const handleExport = async (project: any) => {
  const projectId = project.projectId || project.id
  if (!projectId) {
    message.error('项目ID无效，无法导出')
    return
  }

  try {
    message.info('正在导出项目...')
    const { exportProjectToZip } = await import('@/utils/exportImport')
    await exportProjectToZip(projectId)
    message.success('项目导出成功')
  } catch (error: any) {
    message.error('导出失败：' + (error.message || '未知错误'))
  }
}

// 导入项目
const handleImportProject = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // 清空 input 以允许重复选择同一文件
  input.value = ''

  try {
    message.info('正在导入项目...')
    const { importProjectFromZip } = await import('@/utils/exportImport')
    const result = await importProjectFromZip(file)

    if (result.success) {
      message.success(`项目 "${result.title}" 导入成功，共 ${result.documentCount} 个文档`)
      // 刷新项目列表
      await writerStore.fetchProjects()
    } else {
      message.error(result.error || '导入失败')
    }
  } catch (error: any) {
    message.error('导入失败：' + (error.message || '未知错误'))
  }
}

const handlePublish = async (project: any) => {
  const projectId = project.projectId || project.id
  if (!projectId) {
    message.error('项目ID无效，无法发布')
    return
  }
  pendingPublishProject.value = project
  showPublishConfirmDialog.value = true
}

const cancelPublish = () => {
  showPublishConfirmDialog.value = false
  pendingPublishProject.value = null
}

const confirmPublish = async () => {
  const project = pendingPublishProject.value
  const projectId = project?.projectId || project?.id
  if (!projectId) {
    message.error('项目ID无效，无法发布')
    return
  }

  try {
    // 使用类型断言解决 TS2339 错误
    await (writerStore as any).publishProjectById(projectId)
    cancelPublish()
  } catch (error: any) {
    message.error('发布失败：' + (error.message || '未知错误'))
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    writing: '写作中',
    completed: '已完成',
    published: '已发布',
  }
  return textMap[status] || status
}

const getStatusClass = (status: string) => `status-${status || 'draft'}`

// 迁移完成处理
const handleMigrationComplete = async () => {
  hasLocalData.value = false
  await writerStore.fetchProjects()
  message.success('数据迁移完成，项目列表已刷新')
}

// Lifecycle
onMounted(async () => {
  try {
    await writerStore.fetchProjects()

    // 检查是否有本地数据需要迁移
    const localDataStatus = await hasLocalDataToMigrate()
    hasLocalData.value = localDataStatus.hasData
  } catch (error: any) {
    message.error('加载项目列表失败：' + (error.message || '未知错误'))
  }
})
</script>

<style scoped>
.project-list-view {
  padding: 0;
  max-width: none;
  margin: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.loading-container,
.empty-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 28px;
  padding: 10px 4px;
}

.project-card {
  border: 1px solid #dbe6f6 !important;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
}

.project-card:hover {
  transform: translateY(-6px);
  border-color: #93c5fd !important;
  box-shadow: 0 14px 34px rgba(37, 99, 235, 0.18);
}

.card-header {
  position: relative;
  margin-bottom: 10px;
  min-height: 24px;
  text-align: center;
}

.project-actions {
  position: absolute;
  top: 0;
  right: 0;
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  display: inline-block;
  max-width: calc(100% - 28px);
}

.more-btn {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #93c5fd;
  background: #eff6ff;
  border-radius: 10px;
  color: #1d4ed8;
  cursor: pointer;
  padding: 0;
  transition: all 0.16s ease;
}

.more-btn:hover {
  color: #1e40af;
  background: #dbeafe;
  border-color: #60a5fa;
}

.more-btn:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

.project-description {
  color: #606266;
  min-height: 60px;
  margin-bottom: 16px;
  text-align: center;
}

.project-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.status-draft {
  background: #eff6ff;
  color: #2563eb;
}

.status-badge.status-writing {
  background: #fffbeb;
  color: #b45309;
}

.status-badge.status-completed,
.status-badge.status-published {
  background: #ecfdf5;
  color: #047857;
}

.project-entry-hint {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #dbe6f6;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
}

.create-form :deep(.el-form-item__content .el-input),
.create-form :deep(.el-form-item__content .el-textarea) {
  width: 100% !important;
  display: block;
}

.create-form {
  width: 100%;
  max-width: 100%;
  margin: 0;
}

.create-form :deep(.el-form-item) {
  display: block !important;
  margin-bottom: 16px;
  width: 100%;
}

.create-form :deep(.el-form-item__label) {
  padding-bottom: 6px;
  font-weight: 600;
  color: #1e293b;
}

.create-form :deep(.el-form-item__content) {
  display: block !important;
  flex: 0 0 100% !important;
  width: 100% !important;
  margin-left: 0 !important;
}

.create-form :deep(.el-form-item__content .el-input__wrapper) {
  width: 100% !important;
  min-height: 44px !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 10px !important;
  background: #f8fafc !important;
  box-shadow: none !important;
  padding: 0 12px !important;
  display: flex !important;
  align-items: center !important;
  overflow: hidden;
}

.create-form :deep(.el-form-item__content .el-textarea__inner) {
  width: 100% !important;
  min-height: 132px;
  border: 1px solid #cbd5e1 !important;
  border-radius: 10px !important;
  background: #f8fafc !important;
  padding: 10px 12px !important;
}

.create-form :deep(.el-input__inner) {
  width: 100% !important;
  height: 100% !important;
  line-height: 44px !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
}

.create-form :deep(.el-input__wrapper.is-focus),
.create-form :deep(.el-textarea__inner:focus) {
  border-color: #60a5fa !important;
  background: #ffffff !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.14) !important;
}

.native-select-wrap {
  position: relative;
  width: 100%;
}

.native-select {
  width: 100%;
  height: 44px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #1e293b;
  padding: 0 40px 0 12px;
  font-size: 16px;
  line-height: 44px;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
}

.native-select:focus {
  border-color: #60a5fa;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.14);
}

.native-select-caret {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
}

:global(.centered-modal-card .create-form .el-form-item) {
  display: block !important;
  width: 100% !important;
}

:global(.centered-modal-card .create-form .el-form-item__content),
:global(.centered-modal-card .create-form .el-input),
:global(.centered-modal-card .create-form .el-textarea),
:global(.centered-modal-card .create-form .el-input__wrapper),
:global(.centered-modal-card .create-form .el-textarea__inner) {
  width: 100% !important;
}

.publish-confirm-text {
  font-size: 15px;
  color: #334155;
  line-height: 1.7;
  text-align: center;
}

/* 表单行布局 */
.form-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.form-row .flex-1 {
  flex: 1;
}

.form-row .type-select {
  flex: 0 0 140px;
  min-width: 120px;
}

/* 封面上传样式 */
.cover-upload-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.cover-upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 160px;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  cursor: pointer;
  color: #64748b;
  gap: 6px;
  background: #f8fafc;
  transition: all 0.2s ease;
  font-family: inherit;
}

.cover-upload-btn:hover {
  border-color: #60a5fa;
  background: #eff6ff;
  color: #2563eb;
}

.cover-upload-btn span {
  font-size: 13px;
  font-weight: 500;
}

.cover-preview-wrapper {
  position: relative;
  width: 120px;
  height: 160px;
}

.cover-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
}

.cover-remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
}

.cover-preview-wrapper:hover .cover-remove-btn {
  opacity: 1;
}

.cover-remove-btn:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: scale(1.1);
}

.cover-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.4;
}
</style>
