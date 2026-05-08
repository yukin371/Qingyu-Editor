<template>
  <Container maxWidth="xl" padding>
    <Section title="AI提供商管理" spacing="lg">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-filters">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleFilterChange" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="活跃" value="active" />
            <el-option label="未启用" value="inactive" />
            <el-option label="错误" value="error" />
          </el-select>
        </div>
        <div class="toolbar-actions">
          <el-button :icon="Refresh" @click="loadProviders">刷新</el-button>
          <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
            添加提供商
          </el-button>
        </div>
      </div>

      <!-- 提供商列表 -->
      <el-card shadow="hover">
        <el-table
          :data="filteredProviders"
          v-loading="providersLoading"
          stripe
          empty-text="暂无提供商"
        >
          <el-table-column prop="displayName" label="提供商名称" min-width="150">
            <template #default="{ row }">
              <div class="provider-name-cell">
                <div class="provider-name">{{ row.displayName }}</div>
                <div class="provider-id">{{ row.name }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="apiKey" label="API密钥" width="150">
            <template #default="{ row }">
              <span class="apikey-text">{{ formatApiKeyDisplay(row.apiKeyMask || '') }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="modelCount" label="模型数量" width="100" align="center">
            <template #default="{ row }">
              <el-button text type="primary" @click="viewModels(row)">
                {{ row.modelCount }}
              </el-button>
            </template>
          </el-table-column>

          <el-table-column prop="endpoint" label="API端点" min-width="200">
            <template #default="{ row }">
              <span class="endpoint-text">{{ row.endpoint || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="testConnection(row)" :loading="testingProviders[row.id]">
                测试连接
              </el-button>
              <el-button size="small" type="primary" @click="editProvider(row)">
                编辑
              </el-button>
              <el-dropdown @command="(cmd: string) => handleAction(cmd, row)">
                <el-button size="small" text>
                  <QyIcon name="MoreFilled"  />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="toggle">
                      {{ row.status === 'active' ? '禁用' : '启用' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </Section>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingProvider ? '编辑提供商' : '添加提供商'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="providerForm" :rules="providerRules" ref="providerFormRef" label-width="120px">
        <el-form-item label="提供商名称" prop="name">
          <el-input v-model="providerForm.name" placeholder="例如: openai" :disabled="!!editingProvider" />
        </el-form-item>

        <el-form-item label="显示名称" prop="displayName">
          <el-input v-model="providerForm.displayName" placeholder="例如: OpenAI" />
        </el-form-item>

        <el-form-item label="API密钥" prop="apiKey">
          <el-input v-model="providerForm.apiKey" type="password" placeholder="sk-..." show-password />
        </el-form-item>

        <el-form-item label="API端点" prop="endpoint">
          <el-input v-model="providerForm.endpoint" placeholder="https://api.openai.com/v1" />
          <div class="form-hint">留空使用默认端点</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="submitProvider" :loading="submitting">
          {{ editingProvider ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 测试连接结果对话框 -->
    <el-dialog
      v-model="showTestResultDialog"
      title="测试连接结果"
      width="500px"
    >
      <div class="test-result">
        <el-result
          :icon="testResult.success ? 'success' : 'error'"
          :title="testResult.success ? '连接成功' : '连接失败'"
        >
          <template #sub-title>
            <div>{{ testResult.message }}</div>
            <div v-if="testResult.responseTime" class="response-time">
              响应时间: {{ testResult.responseTime }}ms
            </div>
          </template>
        </el-result>
      </div>

      <template #footer>
        <el-button type="primary" @click="showTestResultDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <LoadingOverlay :visible="pageLoading" text="加载中..." />
  </Container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { messageBox } from '@/design-system/services'
import type { FormInstance, FormRules } from '@/design-system/form/Form/types'
import { useAIAdminStore } from '../stores/aiAdmin'
import { Container, Section, LoadingOverlay } from '@/shared/components/design-system'
import { QyIcon } from '@/design-system/components'
import { formatApiKeyDisplay } from '../utils/apikey'
import type { AIProvider } from '../types/ai-admin.types'
import { Refresh as RefreshIcon, Plus as PlusIcon } from '@element-plus/icons-vue'

const router = useRouter()
const aiStore = useAIAdminStore()

// 图标
const Refresh = RefreshIcon as any
const Plus = PlusIcon as any

// 状态
const pageLoading = ref(false)
const providersLoading = computed(() => aiStore.providersLoading)
const statusFilter = ref('')
const showCreateDialog = ref(false)
const showTestResultDialog = ref(false)
const submitting = ref(false)
const editingProvider = ref<AIProvider | null>(null)
const testingProviders = ref<Record<string, boolean>>({})

// 表单
const providerFormRef = ref<FormInstance>()
const providerForm = reactive({
  name: '',
  displayName: '',
  apiKey: '',
  endpoint: ''
})

const providerRules: FormRules = {
  name: [
    { required: true, message: '请输入提供商名称', trigger: 'blur' },
    { pattern: /^[a-z0-9_-]+$/, message: '只能包含小写字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ]
}

// 测试结果
const testResult = ref<{
  success: boolean
  message: string
  responseTime?: number
}>({
  success: false,
  message: ''
})

// 计算属性
const providers = computed(() => aiStore.providers)

const filteredProviders = computed(() => {
  if (!statusFilter.value) return providers.value
  return providers.value.filter(p => p.status === statusFilter.value)
})

// 格式化函数
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

function formatDate(date: string): string {
  return new Date(date).toLocaleString('zh-CN')
}

// 加载提供商
async function loadProviders() {
  await aiStore.loadProviders()
}

// 筛选变化
function handleFilterChange() {
  // 筛选逻辑由computed处理
}

// 查看模型
function viewModels(provider: AIProvider) {
  router.push({
    path: '/admin/ai/models',
    query: { provider: provider.name }
  })
}

// 编辑提供商
function editProvider(provider: AIProvider) {
  editingProvider.value = provider
  providerForm.name = provider.name
  providerForm.displayName = provider.displayName
  providerForm.apiKey = '' // 不回显密钥
  providerForm.endpoint = provider.endpoint || ''
  showCreateDialog.value = true
}

// 提交提供商
async function submitProvider() {
  if (!providerFormRef.value) return

  try {
    await providerFormRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    if (editingProvider.value) {
      await aiStore.updateProvider(editingProvider.value.id, {
        displayName: providerForm.displayName,
        apiKey: providerForm.apiKey || undefined,
        endpoint: providerForm.endpoint || undefined
      })
    } else {
      await aiStore.createProvider({
        name: providerForm.name,
        displayName: providerForm.displayName,
        apiKey: providerForm.apiKey,
        endpoint: providerForm.endpoint || undefined
      })
    }

    showCreateDialog.value = false
    resetForm()
  } finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  editingProvider.value = null
  providerForm.name = ''
  providerForm.displayName = ''
  providerForm.apiKey = ''
  providerForm.endpoint = ''
  providerFormRef.value?.resetFields()
}

// 测试连接
async function testConnection(provider: AIProvider) {
  testingProviders.value[provider.id] = true
  try {
    const result = await aiStore.testProvider(provider.id)
    testResult.value = result
    showTestResultDialog.value = true
  } finally {
    testingProviders.value[provider.id] = false
  }
}

// 处理操作
async function handleAction(command: string, provider: AIProvider) {
  if (command === 'toggle') {
    const newStatus = provider.status === 'active' ? 'inactive' : 'active'
    const actionText = newStatus === 'active' ? '启用' : '禁用'

    try {
      await messageBox.confirm(
        `确定要${actionText}提供商 "${provider.displayName}" 吗？`,
        '确认操作',
        {
          type: 'warning'
        }
      )

      await aiStore.toggleProviderStatus(provider.id, newStatus)
    } catch {
      // 用户取消
    }
  } else if (command === 'delete') {
    try {
      await messageBox.confirm(
        `确定要删除提供商 "${provider.displayName}" 吗？此操作不可恢复。`,
        '确认删除',
        {
          type: 'warning',
          confirmButtonText: '删除'
        }
      )

      await aiStore.deleteProvider(provider.id)
    } catch {
      // 用户取消
    }
  }
}

// 初始化
onMounted(async () => {
  pageLoading.value = true
  try {
    await loadProviders()
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

.provider-name-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.provider-name {
  font-weight: 600;
  color: #212121;
}

.provider-id {
  font-size: 0.75rem;
  color: #9e9e9e;
  font-family: monospace;
}

.endpoint-text {
  font-size: 0.875rem;
  color: #616161;
  font-family: monospace;
}

.apikey-text {
  font-size: 0.875rem;
  color: #616161;
  font-family: monospace;
}

.form-hint {
  font-size: 0.75rem;
  color: #9e9e9e;
  margin-top: 0.25rem;
}

.test-result {
  padding: 1rem 0;
}

.response-time {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #616161;
}
</style>
