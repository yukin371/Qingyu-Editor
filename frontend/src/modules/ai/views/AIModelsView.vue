<template>
  <Container maxWidth="xl" padding>
    <Section title="AI模型管理" spacing="lg">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-filters">
          <el-select v-model="providerFilter" placeholder="提供商筛选" clearable @change="handleFilterChange" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="provider in providers" :key="provider.id" :label="provider.displayName" :value="provider.name" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleFilterChange" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="活跃" value="active" />
            <el-option label="未启用" value="inactive" />
          </el-select>
        </div>
        <div class="toolbar-actions">
          <el-button :icon="Refresh" @click="loadModels">刷新</el-button>
        </div>
      </div>

      <!-- 模型列表 -->
      <el-card shadow="hover">
        <el-table
          :data="filteredModels"
          v-loading="modelsLoading"
          stripe
          empty-text="暂无模型"
        >
          <el-table-column prop="displayName" label="模型名称" min-width="200">
            <template #default="{ row }">
              <div class="model-name-cell">
                <div class="model-name">{{ row.displayName }}</div>
                <div class="model-id">{{ row.name }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="provider" label="提供商" width="150">
            <template #default="{ row }">
              <el-tag size="small">{{ getProviderDisplayName(row.provider) }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getModelTypeColor(row.type)" size="small">
                {{ getModelTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="pricing" label="定价" width="150">
            <template #default="{ row }">
              <div v-if="row.pricing" class="pricing-cell">
                <div>输入: ¥{{ row.pricing.input }}/1K</div>
                <div>输出: ¥{{ row.pricing.output }}/1K</div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                :type="row.status === 'active' ? 'warning' : 'success'"
                @click="toggleModelStatus(row)"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="filteredModels.length"
            layout="total, prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </Section>

    <LoadingOverlay :visible="pageLoading" text="加载中..." />
  </Container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from '@/design-system/services'
import { useAIAdminStore } from '../stores/aiAdmin'
import { Container, Section, LoadingOverlay } from '@/shared/components/design-system'
import type { AIModel } from '../types/ai-admin.types'
import { Refresh } from '@element-plus/icons-vue'

const aiStore = useAIAdminStore()

// 状态
const pageLoading = ref(false)
const modelsLoading = computed(() => aiStore.modelsLoading)
const providerFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 计算属性
const models = computed(() => aiStore.models)
const providers = computed(() => aiStore.providers)

const filteredModels = computed(() => {
  let result = models.value

  if (providerFilter.value) {
    result = result.filter(m => m.provider === providerFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(m => m.status === statusFilter.value)
  }

  return result
})

// 格式化函数
function getProviderDisplayName(providerName: string): string {
  const provider = providers.value.find(p => p.name === providerName)
  return provider?.displayName || providerName
}

function getModelTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    chat: 'primary',
    completion: 'success',
    embedding: 'warning',
    image: 'danger'
  }
  return colorMap[type] || 'info'
}

function getModelTypeText(type: string): string {
  const textMap: Record<string, string> = {
    chat: '对话',
    completion: '补全',
    embedding: '嵌入',
    image: '图像'
  }
  return textMap[type] || type
}

function getStatusType(status: string): string {
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    error: 'danger'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status: string): string {
  const textMap: Record<string, string> = {
    active: '活跃',
    inactive: '未启用',
    error: '错误'
  }
  return textMap[status] || status
}

// 加载模型
async function loadModels() {
  await aiStore.loadModels(providerFilter.value || undefined)
}

// 筛选变化
function handleFilterChange() {
  currentPage.value = 1
  loadModels()
}

// 分页变化
function handlePageChange(page: number) {
  currentPage.value = page
}

// 切换模型状态
async function toggleModelStatus(model: AIModel) {
  const newStatus = model.status === 'active' ? 'inactive' : 'active'
  try {
    await aiStore.toggleModelStatus(model.id, newStatus)
  } catch (error: any) {
    message.error(error.message || '更新状态失败')
  }
}

// 初始化
onMounted(async () => {
  pageLoading.value = true
  try {
    await Promise.all([
      aiStore.loadProviders(),
      loadModels()
    ])
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.toolbar-filters {
  display: flex;
  gap: 0.75rem;
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
}

.model-name-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.model-name {
  font-weight: 600;
  color: #212121;
}

.model-id {
  font-size: 0.75rem;
  color: #9e9e9e;
  font-family: monospace;
}

.pricing-cell {
  font-size: 0.75rem;
  color: #616161;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}
</style>
