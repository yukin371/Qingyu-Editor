<template>
  <div class="mx-auto max-w-[1440px] space-y-6">
    <section
      class="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Policy Center
          </p>
          <h2 class="mt-3 text-3xl font-black text-slate-900">配额策略配置</h2>
          <p class="mt-2 text-sm text-slate-500">
            按角色和会员等级维护默认配额策略，变更影响后续周期。
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <el-button @click="initializeDefaults">初始化默认策略</el-button>
          <el-button type="primary" @click="openEditor()">新增策略</el-button>
        </div>
      </div>

      <div class="mt-6 grid gap-3 md:grid-cols-[180px_180px_120px]">
        <el-select v-model="filters.role" clearable placeholder="全部角色">
          <el-option label="读者" value="reader" />
          <el-option label="写手" value="writer" />
          <el-option label="管理员" value="admin" />
        </el-select>
        <el-select v-model="filters.status" clearable placeholder="全部状态">
          <el-option label="启用" value="active" />
          <el-option label="停用" value="disabled" />
        </el-select>
        <el-button type="primary" :loading="loading" @click="loadPolicies">查询</el-button>
      </div>
    </section>

    <section
      class="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
    >
      <el-table :data="policies" v-loading="loading">
        <el-table-column label="名称" min-width="180">
          <template #default="{ row }">
            <div class="font-semibold text-slate-900">{{ row.name }}</div>
            <div class="mt-1 text-xs text-slate-500">{{ row.description || '无描述' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="userRole" label="角色" width="120" />
        <el-table-column prop="membershipLevel" label="等级" width="140" />
        <el-table-column prop="dailyQuota" label="日配额" width="120" />
        <el-table-column prop="monthlyQuota" label="月配额" width="120" />
        <el-table-column prop="totalQuota" label="总配额" width="120" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <div class="flex flex-col gap-2">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'" effect="plain">{{
                row.status
              }}</el-tag>
              <el-tag v-if="row.isDefault" type="warning" effect="plain">default</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditor(row)">编辑</el-button>
            <el-button link type="danger" :disabled="row.isDefault" @click="removePolicy(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog
      v-model="editorVisible"
      :title="editorMode === 'create' ? '新增策略' : '编辑策略'"
      width="560px"
    >
      <el-form label-width="100px">
        <el-form-item label="策略名称">
          <el-input v-model="form.name" maxlength="60" />
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select v-model="form.userRole" class="w-full">
            <el-option label="reader" value="reader" />
            <el-option label="writer" value="writer" />
            <el-option label="admin" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="form.membershipLevel" class="w-full">
            <el-option label="normal" value="normal" />
            <el-option label="vip_monthly" value="vip_monthly" />
            <el-option label="vip_yearly" value="vip_yearly" />
            <el-option label="super_vip" value="super_vip" />
          </el-select>
        </el-form-item>
        <el-form-item label="日配额">
          <el-input-number v-model="form.dailyQuota" :min="-1" :step="100" class="w-full" />
        </el-form-item>
        <el-form-item label="月配额">
          <el-input-number v-model="form.monthlyQuota" :min="-1" :step="1000" class="w-full" />
        </el-form-item>
        <el-form-item label="总配额">
          <el-input-number v-model="form.totalQuota" :min="-1" :step="1000" class="w-full" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="140"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitPolicy">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message, messageBox } from '@/design-system/services'
import {
  createQuotaPolicy,
  deleteQuotaPolicy,
  initializeQuotaPolicies,
  listQuotaPolicies,
  updateQuotaPolicy,
  type QuotaPolicy,
} from '@/api/admin/quota'

const loading = ref(false)
const submitting = ref(false)
const editorVisible = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editingId = ref('')
const policies = ref<QuotaPolicy[]>([])

const filters = reactive({
  role: '',
  status: '',
})

const form = reactive({
  name: '',
  userRole: 'reader',
  membershipLevel: 'normal',
  dailyQuota: 1000,
  monthlyQuota: 30000,
  totalQuota: -1,
  description: '',
})

const resetForm = () => {
  form.name = ''
  form.userRole = 'reader'
  form.membershipLevel = 'normal'
  form.dailyQuota = 1000
  form.monthlyQuota = 30000
  form.totalQuota = -1
  form.description = ''
}

const loadPolicies = async () => {
  loading.value = true
  try {
    const result = await listQuotaPolicies({
      role: filters.role || undefined,
      status: filters.status || undefined,
      page: 1,
      limit: 100,
    })
    policies.value = result.items
  } catch (error) {
    console.error('加载 quota policies 失败:', error)
    policies.value = []
    message.error('加载策略列表失败')
  } finally {
    loading.value = false
  }
}

const openEditor = (policy?: QuotaPolicy) => {
  if (policy) {
    editorMode.value = 'edit'
    editingId.value = policy.id
    form.name = policy.name
    form.userRole = policy.userRole
    form.membershipLevel = policy.membershipLevel
    form.dailyQuota = policy.dailyQuota
    form.monthlyQuota = policy.monthlyQuota
    form.totalQuota = policy.totalQuota
    form.description = policy.description || ''
  } else {
    editorMode.value = 'create'
    editingId.value = ''
    resetForm()
  }
  editorVisible.value = true
}

const submitPolicy = async () => {
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      userRole: form.userRole,
      membershipLevel: form.membershipLevel,
      dailyQuota: form.dailyQuota,
      monthlyQuota: form.monthlyQuota,
      totalQuota: form.totalQuota,
      description: form.description,
    }
    if (editorMode.value === 'create') {
      await createQuotaPolicy(payload)
    } else {
      await updateQuotaPolicy(editingId.value, payload)
    }
    editorVisible.value = false
    message.success('策略已保存')
    await loadPolicies()
  } catch (error) {
    console.error('保存策略失败:', error)
    message.error('保存策略失败')
  } finally {
    submitting.value = false
  }
}

const removePolicy = async (id: string) => {
  try {
    await messageBox.confirm('确认停用该策略？默认策略不可删除。', '删除策略', { type: 'warning' })
    await deleteQuotaPolicy(id)
    message.success('策略已删除')
    await loadPolicies()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除策略失败:', error)
      message.error('删除策略失败')
    }
  }
}

const initializeDefaults = async () => {
  try {
    await initializeQuotaPolicies()
    message.success('默认策略初始化完成')
    await loadPolicies()
  } catch (error) {
    console.error('初始化默认策略失败:', error)
    message.error('初始化默认策略失败')
  }
}

onMounted(() => {
  void loadPolicies()
})
</script>
