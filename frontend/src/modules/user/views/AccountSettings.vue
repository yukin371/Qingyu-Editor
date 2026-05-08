<template>
  <div class="account-settings">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="page-title">账户设置</span>
      </template>
    </el-page-header>

    <!-- 角色信息卡片 -->
    <Card class="settings-card role-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">当前角色</span>
        </div>
      </template>
      <div class="role-info">
        <div class="current-roles">
          <Tag
            v-for="role in userRoles"
            :key="role"
            :variant="getRoleTagType(role)"
            class="role-tag"
          >
            {{ getRoleLabel(role) }}
          </Tag>
        </div>
        <!-- 降级按钮 - 仅作者可见 -->
        <QyButton v-if="canDowngrade" variant="danger" @click="showDowngradeDialog">
          降级为读者
        </QyButton>
      </div>
    </Card>

    <Card class="settings-card">
      <QyForm ref="formRef" :model="form" :rules="rules" label-width="120px" class="settings-form">
        <!-- 头像设置 -->
        <QyFormItem label="头像">
          <div class="avatar-upload-container">
            <QyAvatar :size="100" :src="form.avatar || userStore.avatar">
              {{ String(userStore.displayName || '').charAt(0) || 'U' }}
            </QyAvatar>
            <div class="avatar-actions">
              <qy-upload
                :action="uploadUrl"
                :headers="uploadHeaders"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-success="handleAvatarSuccess"
                :on-error="handleUploadError"
              >
                <QyButton type="primary" :loading="uploading"> 上传头像 </QyButton>
              </qy-upload>
              <p class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</p>
            </div>
          </div>
        </QyFormItem>

        <!-- 昵称 -->
        <QyFormItem label="昵称" prop="nickname">
          <Input
            v-model="form.nickname"
            placeholder="请输入昵称"
            :maxlength="50"
            show-count
            clearable
          />
        </QyFormItem>

        <!-- 个人简介 -->
        <QyFormItem label="个人简介" prop="bio">
          <Textarea
            v-model="form.bio"
            placeholder="介绍一下自己吧"
            :rows="4"
            :maxlength="500"
            show-count
          />
        </QyFormItem>

        <!-- 性别 -->
        <QyFormItem label="性别" prop="gender">
          <QyRadioGroup v-model="form.gender">
            <QyRadio value="male">男</QyRadio>
            <QyRadio value="female">女</QyRadio>
            <QyRadio value="other">保密</QyRadio>
          </QyRadioGroup>
        </QyFormItem>

        <!-- 生日 -->
        <QyFormItem label="生日" prop="birthday">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="选择生日"
            :disabled-date="disabledDate"
            value-format="YYYY-MM-DD"
          />
        </QyFormItem>

        <!-- 所在地 -->
        <QyFormItem label="所在地" prop="location">
          <Input
            v-model="form.location"
            placeholder="如：北京市朝阳区"
            :maxlength="100"
            clearable
          />
        </QyFormItem>

        <!-- 个人网站 -->
        <QyFormItem label="个人网站" prop="website">
          <Input
            v-model="form.website"
            placeholder="https://example.com"
            :maxlength="200"
            clearable
          />
        </QyFormItem>

        <!-- 社交账号 -->
        <QyFormItem label="微博">
          <Input v-model="form.social.weibo" placeholder="微博账号" :maxlength="50" clearable />
        </QyFormItem>

        <QyFormItem label="微信">
          <Input v-model="form.social.wechat" placeholder="微信号" :maxlength="50" clearable />
        </QyFormItem>

        <QyFormItem label="QQ">
          <Input v-model="form.social.qq" placeholder="QQ号" :maxlength="20" clearable />
        </QyFormItem>

        <!-- 提交按钮 -->
        <QyFormItem>
          <QyButton type="primary" :loading="saving" @click="handleSave"> 保存设置 </QyButton>
          <QyButton @click="handleReset">重置</QyButton>
        </QyFormItem>
      </QyForm>
    </Card>

    <!-- 降级确认对话框 -->
    <QyModal
      v-model:visible="downgradeDialogVisible"
      title="降级确认"
      width="400px"
      @close="handleDowngradeClose"
    >
      <div class="downgrade-warning">
        <QyIcon name="WarningFilled" class="warning-icon" />
        <p>您确定要降级为读者吗？</p>
        <ul class="downgrade-consequences">
          <li>将无法访问作者工作台</li>
          <li>将无法发布新作品</li>
          <li>已发布的内容将继续保留</li>
          <li>可以随时重新申请成为作者</li>
        </ul>
      </div>
      <template #footer>
        <QyButton @click="handleDowngradeClose">取消</QyButton>
        <QyButton variant="danger" :loading="downgrading" @click="confirmDowngrade">
          确认降级
        </QyButton>
      </template>
    </QyModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import type { FormInstance, UploadProps } from 'element-plus'
import { QyButton, QyRadioGroup, QyRadio, QyModal, QyIcon } from '@/design-system/components'
import { Tag, Textarea, Card, Input } from '@/design-system/base'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import storage from '@/utils/storage'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  ROLES: 'roles',
}

// 上传配置
const uploadUrl = ref('/api/upload/avatar')
const uploadHeaders = {
  Authorization: `Bearer ${authStore.token}`,
}

// 表单引用
const formRef = ref<FormInstance>()

// 状态
const saving = ref(false)
const uploading = ref(false)
const downgradeDialogVisible = ref(false)
const downgrading = ref(false)

// 用户角色 - 优先使用响应式的authStore，localStorage作为后备
const userRoles = computed(() => {
  // 优先：从authStore获取（响应式数据源，确保UI自动更新）
  const storeRoles = authStore.roles || authStore.user?.roles
  if (storeRoles && storeRoles.length > 0) {
    return storeRoles
  }

  // 后备：从localStorage读取（用于初始化和持久化）
  try {
    const stored = localStorage.getItem('qingyu_roles')
    if (stored) {
      const parsed = JSON.parse(stored) as string[]
      if (parsed && parsed.length > 0) {
        // 同步到authStore以保持一致
        ;(authStore as { roles: string[] }).roles = parsed
        return parsed
      }
    }
  } catch (e) {
    console.error('[AccountSettings] Failed to parse localStorage roles:', e)
  }

  return []
})

// 是否可以降级（有author或admin角色）
const canDowngrade = computed(() => {
  return userRoles.value.includes('author') || userRoles.value.includes('admin')
})

// 表单数据
const form = reactive({
  avatar: '',
  nickname: '',
  bio: '',
  gender: 'other',
  birthday: '',
  location: '',
  website: '',
  social: {
    weibo: '',
    wechat: '',
    qq: '',
  },
})

// 验证规则
const rules = {
  nickname: [{ max: 50, message: '昵称长度不能超过50个字符', trigger: 'blur' }],
  bio: [{ max: 500, message: '个人简介长度不能超过500个字符', trigger: 'blur' }],
  website: [
    {
      pattern: /^https?:\/\/.+/,
      message: '请输入有效的网址（以http://或https://开头）',
      trigger: 'blur',
    },
  ],
}

// 获取角色标签颜色
const getRoleTagType = (role: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const roleTypes: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    admin: 'danger',
    author: 'success',
    reader: 'info',
  }
  return roleTypes[role] || 'info'
}

// 获取角色标签文本
const getRoleLabel = (role: string) => {
  const roleLabels: Record<string, string> = {
    admin: '管理员',
    author: '作者',
    reader: '读者',
  }
  return roleLabels[role] || role
}

// 显示降级对话框
const showDowngradeDialog = () => {
  downgradeDialogVisible.value = true
}

// 关闭降级对话框
const handleDowngradeClose = () => {
  downgradeDialogVisible.value = false
}

// 确认降级
const confirmDowngrade = async () => {
  try {
    downgrading.value = true

    const token = localStorage.getItem('qingyu_token')

    const response = await fetch('/api/v1/user/role/downgrade', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_role: 'reader',
        confirm: true,
      }),
    })

    if (response.ok) {
      const result = await response.json()

      message.success('降级成功')
      downgradeDialogVisible.value = false

      // 更新 authStore 中的 roles（响应式，确保UI立即更新）
      const newRoles = result.data?.current_roles || ['reader']

      // 先更新响应式数据，确保UI立即响应
      authStore.roles = newRoles
      if (authStore.user) {
        authStore.user.roles = newRoles
      }

      // 然后持久化到 localStorage
      localStorage.setItem('qingyu_roles', JSON.stringify(newRoles))

      // 跳转到首页
      router.push('/bookstore')
    } else {
      const data = await response.json()
      console.error('[降级] API错误响应:', data)
      message.error(data.message || '降级失败')
    }
  } catch (error) {
    console.error('降级失败:', error)
    message.error('降级失败，请稍后重试')
  } finally {
    downgrading.value = false
  }
}

// 初始化表单
const initForm = () => {
  const profile = userStore.profile as unknown as Record<string, unknown> | undefined
  form.avatar = (profile?.avatar as string) || ''
  form.nickname = (profile?.nickname as string) || ''
  form.bio = (profile?.bio as string) || ''
  form.gender = (profile?.gender as string) || 'other'
  form.birthday = (profile?.birthday as string) || ''
  form.location = (profile?.location as string) || ''
  form.website = (profile?.website as string) || ''
  form.social = (profile?.social as { weibo: string; wechat: string; qq: string }) || {
    weibo: '',
    wechat: '',
    qq: '',
  }
}

// 禁用未来日期
const disabledDate = (date: Date) => {
  return date.getTime() > Date.now()
}

// 头像上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    message.error('只能上传 JPG/PNG 格式的图片')
    return false
  }
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB')
    return false
  }

  uploading.value = true
  return true
}

// 头像上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response: unknown) => {
  uploading.value = false
  const res = response as { code?: number; data?: { url?: string }; message?: string }
  if (res.code === 200 && res.data?.url) {
    form.avatar = res.data.url
    message.success('头像上传成功')
  } else {
    message.error(res.message || '上传失败')
  }
}

// 上传失败
const handleUploadError: UploadProps['onError'] = () => {
  uploading.value = false
  message.error('上传失败,请重试')
}

// 保存设置
const handleSave = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    saving.value = true

    // 准备更新数据
    const updateData: Record<string, unknown> = {}
    if (form.avatar) updateData.avatar = form.avatar
    if (form.nickname) updateData.nickname = form.nickname
    if (form.bio) updateData.bio = form.bio
    if (form.gender) updateData.gender = form.gender
    if (form.birthday) updateData.birthday = form.birthday
    if (form.location) updateData.location = form.location
    if (form.website) updateData.website = form.website
    updateData.social = form.social

    await userStore.updateProfile(updateData)
    message.success('保存成功')
  } catch (error: unknown) {
    message.error((error as Error).message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 重置表单
const handleReset = () => {
  initForm()
  formRef.value?.clearValidate()
  message.info('已重置')
}

// 返回
const goBack = () => {
  router.back()
}

// 初始化
onMounted(async () => {
  await userStore.fetchProfile()
  initForm()

  // 添加：确保roles从localStorage恢复
  if (authStore.token && (!authStore.roles || authStore.roles.length === 0)) {
    const savedRoles = storage.get<string[]>(STORAGE_KEYS.ROLES)
    if (savedRoles && savedRoles.length > 0) {
      authStore.roles = savedRoles
    } else {
      // 如果localStorage也没有，调用initAuth
      await authStore.initAuth()
    }
  }
})
</script>

<style scoped lang="scss">
.account-settings {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
  }
}

.settings-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.role-card {
  .card-header {
    .card-title {
      font-weight: 600;
    }
  }

  .role-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .current-roles {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .role-tag {
    font-size: 14px;
  }
}

.settings-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 0;
}

.avatar-upload-container {
  display: flex;
  align-items: center;
  gap: 24px;

  .avatar-actions {
    .upload-tip {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
    }
  }
}

.downgrade-warning {
  text-align: center;

  .warning-icon {
    font-size: 48px;
    color: #e6a23c;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
  }

  .downgrade-consequences {
    text-align: left;
    padding-left: 20px;
    margin: 0;
    color: #606266;

    li {
      margin: 8px 0;
    }
  }
}

@media (max-width: 768px) {
  .account-settings {
    padding: 10px;
  }

  .settings-form {
    padding: 10px 0;
  }

  .avatar-upload-container {
    flex-direction: column;
    text-align: center;
  }

  .role-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
