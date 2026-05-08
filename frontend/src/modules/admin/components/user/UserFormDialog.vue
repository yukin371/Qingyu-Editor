<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="600px"
    class="admin-modal-card"
    append-to-body
    align-center
    @update:model-value="emit('update:visible', $event)"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      :disabled="mode === 'view'"
    >
      <div v-if="mode !== 'add'" class="user-avatar-section">
        <Avatar size="xl" :src="formData.avatar" />
      </div>

      <el-form-item label="用户ID" v-if="mode !== 'add'">
        <el-input v-model="formData.userId" disabled />
      </el-form-item>

      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          :disabled="mode !== 'add'"
          placeholder="请输入用户名"
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" :disabled="mode !== 'add'" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input
          v-model="formData.nickname"
          :disabled="mode !== 'add'"
          placeholder="新增时可设置昵称，编辑模式暂不支持修改"
        />
      </el-form-item>

      <el-form-item label="角色" prop="role">
        <el-select
          popper-class="admin-select-popper"
          v-model="formData.role"
          placeholder="请选择角色"
        >
          <el-option label="管理员" value="admin" />
          <el-option label="作者" value="author" />
          <el-option label="读者" value="reader" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select
          popper-class="admin-select-popper"
          v-model="formData.status"
          placeholder="请选择状态"
        >
          <el-option label="正常" value="active" />
          <el-option label="未激活" value="inactive" />
          <el-option label="已封禁" value="banned" />
        </el-select>
      </el-form-item>

      <el-form-item label="邮箱验证">
        <el-switch v-model="formData.emailVerified" disabled />
        <span class="form-hint">当前由注册/验证流程控制，管理端暂不支持修改</span>
      </el-form-item>

      <el-form-item label="个人简介">
        <el-input
          v-model="formData.bio"
          type="textarea"
          :rows="3"
          :disabled="mode !== 'add'"
          placeholder="新增时可设置简介，编辑模式暂不支持修改"
        />
      </el-form-item>

      <el-alert
        v-if="mode === 'edit'"
        type="info"
        :closable="false"
        title="当前后端仅支持修改用户角色和状态"
        description="用户名、邮箱、昵称、邮箱验证和个人简介暂不提供管理员编辑接口。"
        show-icon
      />

      <el-form-item v-if="mode === 'view'" label="注册时间">
        <span>{{ formatDate(formData.createdAt) }}</span>
      </el-form-item>

      <el-form-item v-if="mode === 'view'" label="最后登录">
        <span>{{ formatDate(formData.lastLoginAt) || '-' }}</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:visible', false)">
        {{ mode === 'view' ? '关闭' : '取消' }}
      </el-button>
      <el-button v-if="mode !== 'view'" type="primary" :loading="submitting" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { formatDate } from '@/utils/format'
import { Avatar } from '@/design-system/base'
import type { DialogMode, UserFormData } from './types'

interface Props {
  /** 对话框是否可见 */
  visible: boolean
  /** 对话框模式 */
  mode: DialogMode
  /** 用户数据（编辑/查看时） */
  user?: UserFormData
  /** 提交中状态 */
  submitting?: boolean
}

interface Emits {
  /** 更新可见状态 */
  (e: 'update:visible', value: boolean): void
  /** 提交表单 */
  (e: 'submit', data: UserFormData): void
}

const props = withDefaults(defineProps<Props>(), {
  submitting: false,
  user: undefined,
})

const emit = defineEmits<Emits>()

/** 表单引用 */
const formRef = ref<FormInstance | null>(null)

/** 表单数据 */
const formData = reactive<UserFormData>({
  userId: '',
  username: '',
  email: '',
  nickname: '',
  role: 'reader',
  status: 'active',
  emailVerified: false,
  bio: '',
  avatar: '',
  createdAt: '',
  lastLoginAt: '',
})

/** 表单验证规则 */
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在3-50个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

/** 对话框标题 */
const dialogTitle = computed(() => {
  const titles: Record<DialogMode, string> = {
    view: '查看用户',
    edit: '编辑用户',
    add: '添加用户',
  }
  return titles[props.mode]
})

/** 监听用户数据变化，更新表单 */
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      Object.assign(formData, newUser)
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

/** 重置表单 */
function resetForm() {
  formData.userId = ''
  formData.username = ''
  formData.email = ''
  formData.nickname = ''
  formData.role = 'reader'
  formData.status = 'active'
  formData.emailVerified = false
  formData.bio = ''
  formData.avatar = ''
  formData.createdAt = ''
  formData.lastLoginAt = ''
}

/** 关闭对话框 */
const handleClose = () => {
  resetForm()
  formRef.value?.clearValidate()
}

/** 提交表单 */
const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  emit('submit', { ...formData })
}
</script>

<style scoped lang="scss">
.user-avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.form-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #9ca3af;
}
</style>
