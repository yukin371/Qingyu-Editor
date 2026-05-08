<template>
  <div class="publish-management">
    <div class="page-header">
      <h1>发布管理</h1>
      <p class="sub-title">管理您的作品章节发布状态</p>
    </div>

    <!-- 筛选和操作栏 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="16" align="middle">
        <el-col :xs="24" :sm="12" :md="8">
          <el-select v-model="selectedBook" placeholder="选择作品" clearable @change="loadChapters">
            <el-option
              v-for="book in bookList"
              :key="(book as any)?.projectId || (book as any)?.id || `book-${Math.random()}`"
              :label="(book as any)?.title || (book as any)?.name || '未命名作品'"
              :value="(book as any)?.projectId || (book as any)?.id"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索章节标题"
            clearable
            @change="loadChapters"
          >
            <template #prefix>
              <QyIcon name="Search" />
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="24" :md="8" class="action-col">
          <el-button type="primary" :disabled="selectedChapters.length === 0" @click="batchPublish">
            批量发布
          </el-button>
          <el-button :disabled="selectedChapters.length === 0" @click="batchUnpublish">
            批量下架
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 状态标签页 -->
    <el-card class="content-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all">
          <template #label>
            <span class="tab-label">
              全部
              <el-badge :value="statusCount.all" :hidden="statusCount.all === 0" />
            </span>
          </template>
        </el-tab-pane>

        <el-tab-pane label="草稿" name="draft">
          <template #label>
            <span class="tab-label">
              草稿
              <el-badge :value="statusCount.draft" :hidden="statusCount.draft === 0" type="info" />
            </span>
          </template>
        </el-tab-pane>

        <el-tab-pane label="待审核" name="pending">
          <template #label>
            <span class="tab-label">
              待审核
              <el-badge
                :value="statusCount.pending"
                :hidden="statusCount.pending === 0"
                type="warning"
              />
            </span>
          </template>
        </el-tab-pane>

        <el-tab-pane label="已发布" name="published">
          <template #label>
            <span class="tab-label">
              已发布
              <el-badge
                :value="statusCount.published"
                :hidden="statusCount.published === 0"
                type="success"
              />
            </span>
          </template>
        </el-tab-pane>

        <el-tab-pane label="已下架" name="unpublished">
          <template #label>
            <span class="tab-label">
              已下架
              <el-badge
                :value="statusCount.unpublished"
                :hidden="statusCount.unpublished === 0"
                type="danger"
              />
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 章节列表 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="filteredChapters.length === 0" class="empty-container">
        <Empty description="暂无章节数据" />
      </div>

      <el-table v-else :data="filteredChapters" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />

        <el-table-column prop="chapterNumber" label="章节号" width="80" />

        <el-table-column prop="title" label="章节标题" min-width="200">
          <template #default="{ row }">
            <div class="chapter-title">
              {{ row.title }}
              <el-tag v-if="row.isFree" size="small" type="success">免费</el-tag>
              <el-tag v-else size="small" type="warning">付费</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="wordCount" label="字数" width="100">
          <template #default="{ row }">
            {{ formatNumber(row.wordCount || 0) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="publishTime" label="发布时间" width="160">
          <template #default="{ row }">
            {{ row.publishTime ? formatDateTime(row.publishTime) : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="readCount" label="阅读量" width="100">
          <template #default="{ row }">
            {{ formatNumber(row.readCount || 0) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'draft'"
              type="primary"
              size="small"
              @click="publishChapter(row)"
            >
              发布
            </el-button>
            <el-button
              v-if="row.status === 'published'"
              type="warning"
              size="small"
              @click="unpublishChapter(row)"
            >
              下架
            </el-button>
            <el-button size="small" @click="editChapter(row)"> 编辑 </el-button>
            <el-button type="danger" size="small" @click="deleteChapter(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="filteredChapters.length > 0" class="pagination-container">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 发布设置对话框 -->
    <el-dialog v-model="publishDialogVisible" title="发布设置" width="500px">
      <el-form :model="publishForm" label-width="100px">
        <el-form-item label="发布时间">
          <el-radio-group v-model="publishForm.timeType">
            <el-radio label="now">立即发布</el-radio>
            <el-radio label="scheduled">定时发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="publishForm.timeType === 'scheduled'" label="发布日期">
          <el-date-picker
            v-model="publishForm.scheduledTime"
            type="datetime"
            placeholder="选择发布时间"
            :disabled-date="disabledDate"
          />
        </el-form-item>

        <el-form-item label="章节类型">
          <el-radio-group v-model="publishForm.isFree">
            <el-radio :label="true">免费章节</el-radio>
            <el-radio :label="false">付费章节</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="!publishForm.isFree" label="章节价格">
          <el-input-number v-model="publishForm.price" :min="0" :max="100" :step="1" />
          <span style="margin-left: 8px">书币</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPublish">确认发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { Empty } from '@/design-system/base'
import { getProjects, type Project } from '@/modules/writer/api'

const router = useRouter()

// 书籍列表
const bookList = ref<Project[]>([])
const selectedBook = ref('')

// 搜索关键词
const searchKeyword = ref('')

// 当前标签页
const activeTab = ref('all')

// 章节数据
const chapters = ref<any[]>([])
const loading = ref(false)

// 选中的章节
const selectedChapters = ref<any[]>([])

// 分页
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 发布对话框
const publishDialogVisible = ref(false)
const publishForm = ref({
  timeType: 'now',
  scheduledTime: null,
  isFree: true,
  price: 10,
})
const currentChapter = ref<any>(null)

// 状态统计
const statusCount = computed(() => {
  return {
    all: chapters.value.length,
    draft: chapters.value.filter((c) => c.status === 'draft').length,
    pending: chapters.value.filter((c) => c.status === 'pending').length,
    published: chapters.value.filter((c) => c.status === 'published').length,
    unpublished: chapters.value.filter((c) => c.status === 'unpublished').length,
  }
})

// 过滤后的章节
const filteredChapters = computed(() => {
  let result = chapters.value

  // 按状态过滤
  if (activeTab.value !== 'all') {
    result = result.filter((c) => c.status === activeTab.value)
  }

  // 按关键词过滤
  if (searchKeyword.value) {
    result = result.filter((c) => c.title.toLowerCase().includes(searchKeyword.value.toLowerCase()))
  }

  return result
})

// 使用 watch 更新 pagination.total，避免在 computed 中产生副作用
watch(
  filteredChapters,
  (newValue) => {
    pagination.value.total = newValue.length
  },
  { immediate: true },
)

// 加载书籍列表
const loadBooks = async () => {
  try {
    const response = await getProjects({ page: 1, pageSize: 100 })
    // 过滤掉 null 或 undefined 的项目
    const responseAny = response as any
    const projects = responseAny?.data || responseAny?.projects || []
    bookList.value = (Array.isArray(projects) ? projects : []).filter(
      (item: any) => item && (item.projectId || item.id),
    )

    if (bookList.value.length > 0) {
      const firstBook = bookList.value[0] as any
      if (firstBook && (firstBook.projectId || firstBook.id)) {
        selectedBook.value = firstBook.projectId || firstBook.id
        loadChapters()
      }
    }
  } catch (error) {
    console.error('加载书籍列表失败:', error)
    message.error('加载书籍列表失败')
  }
}

// 加载章节列表
const loadChapters = async () => {
  if (!selectedBook.value) {
    chapters.value = []
    return
  }

  loading.value = true
  try {
    // 模拟数据（实际应该从API获取）
    await new Promise((resolve) => setTimeout(resolve, 500))
    chapters.value = generateMockChapters()
  } catch (error) {
    console.error('加载章节列表失败:', error)
    message.error('加载章节列表失败')
  } finally {
    loading.value = false
  }
}

// 处理分页大小改变
const handleSizeChange = (val: number) => {
  pagination.value.pageSize = val
  loadChapters()
}

// 处理当前页改变
const handleCurrentChange = (val: number) => {
  pagination.value.page = val
  loadChapters()
}

// 生成模拟章节数据
const generateMockChapters = () => {
  const statuses = ['draft', 'pending', 'published', 'unpublished']
  return Array.from({ length: 50 }, (_, i) => ({
    id: `chapter-${i + 1}`,
    chapterNumber: i + 1,
    title: `第${i + 1}章 章节标题示例`,
    wordCount: Math.floor(Math.random() * 3000) + 1000,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    isFree: i < 5 || Math.random() > 0.5,
    publishTime:
      Math.random() > 0.3
        ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    readCount: Math.floor(Math.random() * 10000),
  }))
}

// 标签页切换
const handleTabChange = () => {
  pagination.value.page = 1
}

// 选择变化
const handleSelectionChange = (val: any[]) => {
  selectedChapters.value = val
}

// 发布章节
const publishChapter = (chapter: any) => {
  currentChapter.value = chapter
  publishDialogVisible.value = true
}

// 确认发布
const confirmPublish = async () => {
  try {
    // 实际应该调用API发布
    message.success('发布成功')
    publishDialogVisible.value = false
    loadChapters()
  } catch (error) {
    console.error('发布失败:', error)
    message.error('发布失败')
  }
}

// 下架章节
const unpublishChapter = async (_chapter: any) => {
  try {
    await messageBox.confirm('确定要下架该章节吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 实际应该调用API下架
    message.success('下架成功')
    loadChapters()
  } catch (error) {
    // 用户取消
  }
}

// 批量发布
const batchPublish = async () => {
  try {
    await messageBox.confirm(
      `确定要发布选中的 ${selectedChapters.value.length} 个章节吗？`,
      '批量发布',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    // 实际应该调用API批量发布
    message.success('批量发布成功')
    loadChapters()
  } catch (error) {
    // 用户取消
  }
}

// 批量下架
const batchUnpublish = async () => {
  try {
    await messageBox.confirm(
      `确定要下架选中的 ${selectedChapters.value.length} 个章节吗？`,
      '批量下架',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    // 实际应该调用API批量下架
    message.success('批量下架成功')
    loadChapters()
  } catch (error) {
    // 用户取消
  }
}

// 编辑章节
const editChapter = (chapter: any) => {
  if (!selectedBook.value) {
    message.warning('请先选择书籍')
    return
  }
  router.push({
    name: 'writer-project',
    params: { projectId: selectedBook.value },
    query: { chapterId: chapter.id },
  })
}

// 删除章节
const deleteChapter = async (_chapter: any) => {
  try {
    await messageBox.confirm('确定要删除该章节吗？删除后无法恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error',
    })

    // 实际应该调用API删除
    message.success('删除成功')
    loadChapters()
  } catch (error) {
    // 用户取消
  }
}

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now()
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}

// 格式化日期时间
const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    draft: 'info',
    pending: 'warning',
    published: 'success',
    unpublished: 'danger',
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    pending: '待审核',
    published: '已发布',
    unpublished: '已下架',
  }
  return textMap[status] || status
}

// 初始化
onMounted(() => {
  loadBooks()
})
</script>

<style scoped lang="scss">
.publish-management {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #303133;
  }

  .sub-title {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.filter-card,
.content-card {
  border-radius: 8px;
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.filter-card {
  .el-select,
  .el-input {
    width: 100%;
  }

  .action-col {
    display: flex;
    gap: 12px;

    .el-button {
      flex: 1;
    }
  }
}

.content-card {
  .tab-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

.chapter-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .publish-management {
    padding: 16px;
  }

  .filter-card {
    .el-col {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .action-col {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }

  .el-table {
    :deep(.el-table__body-wrapper) {
      overflow-x: auto;
    }
  }
}
</style>
