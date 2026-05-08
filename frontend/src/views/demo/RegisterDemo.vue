<template>
  <div class="auth-demo-page">
    <div class="auth-panel">
      <header class="auth-header">
        <h1>{{ mode === 'login' ? '登录' : '注册' }}</h1>
      </header>

      <div class="mode-switch">
        <button :class="['mode-btn', { active: mode === 'login' }]" @click="mode = 'login'">登录</button>
        <button :class="['mode-btn', { active: mode === 'register' }]" @click="mode = 'register'">注册</button>
      </div>

      <QyForm
        v-if="mode === 'login'"
        ref="loginFormRef"
        v-model="loginForm"
        :rules="(loginRules as any)"
        class="auth-form"
        @submit.prevent="handleLogin"
      >
        <QyFormItem prop="username">
          <QyInput
            v-model="loginForm.username"
            placeholder="用户名或邮箱"
            size="md"
            :input-attrs="{ autocomplete: 'username' }"
            @keyup.enter="handleLogin"
          />
        </QyFormItem>

        <QyFormItem prop="password">
          <QyInput
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="md"
            :show-password="true"
            :input-attrs="{ autocomplete: 'current-password' }"
            @keyup.enter="handleLogin"
          />
        </QyFormItem>

        <QyButton variant="primary" size="md" class="submit-btn" :loading="submitting" @click="handleLogin">
          立即登录
        </QyButton>
      </QyForm>

      <QyForm
        v-else
        ref="registerFormRef"
        v-model="registerForm"
        :rules="(registerRules as any)"
        class="auth-form"
        @submit.prevent="handleRegister"
      >
        <QyFormItem prop="username">
          <QyInput
            v-model="registerForm.username"
            placeholder="用户名（3-20位）"
            size="md"
            :input-attrs="{ autocomplete: 'username' }"
          />
        </QyFormItem>

        <QyFormItem prop="email">
          <QyInput
            v-model="registerForm.email"
            placeholder="邮箱"
            size="md"
            :input-attrs="{ autocomplete: 'email' }"
          />
        </QyFormItem>

        <QyFormItem prop="password">
          <QyInput
            v-model="registerForm.password"
            type="password"
            placeholder="密码（至少6位）"
            size="md"
            :show-password="true"
            :input-attrs="{ autocomplete: 'new-password' }"
          />
        </QyFormItem>

        <QyFormItem prop="confirmPassword">
          <QyInput
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="md"
            :show-password="true"
            :input-attrs="{ autocomplete: 'new-password' }"
            @keyup.enter="handleRegister"
          />
        </QyFormItem>

        <QyFormItem prop="agreement">
          <label class="agreement-row">
            <input v-model="registerForm.agreement" type="checkbox" />
            <span>同意用户协议与隐私政策</span>
          </label>
        </QyFormItem>

        <QyButton variant="primary" size="md" class="submit-btn" :loading="submitting" @click="handleRegister">
          创建账号
        </QyButton>
      </QyForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from '@/design-system/services'
import { QyForm, QyFormItem, QyInput, QyButton } from '@/design-system/components'
import type { FormInstance, FormRules } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

type AuthMode = 'login' | 'register'
const mode = ref<AuthMode>('register')
const submitting = ref(false)
const isMockMode = computed(() => route.query.test === 'true')

const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度需为3-20位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [{
    validator: (_rule, value, callback) => {
      if (!value) return callback(new Error('请确认密码'))
      if (value !== registerForm.value.password) return callback(new Error('两次密码不一致'))
      callback()
    },
    trigger: 'blur'
  }],
  agreement: [{
    validator: (_rule, value, callback) => {
      if (!value) return callback(new Error('请先同意协议'))
      callback()
    },
    trigger: 'change'
  }]
}

const handleLogin = async () => {
  if (submitting.value || !loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (isMockMode.value) {
        await new Promise(resolve => setTimeout(resolve, 300))
      } else {
        await authStore.login({
          username: loginForm.value.username.trim(),
          password: loginForm.value.password
        })
      }
      message.success('登录成功')
      router.push(isMockMode.value ? '/demo?test=true' : '/bookstore')
    } catch (error: any) {
      message.error(error?.message || '登录失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleRegister = async () => {
  if (submitting.value || !registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (isMockMode.value) {
        await new Promise(resolve => setTimeout(resolve, 300))
      } else {
        await authStore.register({
          username: registerForm.value.username.trim(),
          email: registerForm.value.email.trim(),
          password: registerForm.value.password
        })
      }
      message.success('注册成功')
      mode.value = 'login'
      loginForm.value.username = registerForm.value.username.trim()
    } catch (error: any) {
      message.error(error?.message || '注册失败')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.auth-demo-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #f8fafc;
}

.auth-panel {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 12px;
}

.auth-header {
  margin-bottom: 8px;

  h1 {
    margin: 0;
    font-size: 18px;
    color: #0f172a;
    font-weight: 600;
  }
}

.mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 8px;
}

.mode-btn {
  height: 34px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  cursor: pointer;
}

.mode-btn.active {
  color: #2563eb;
  border-color: #bfdbfe;
  background: #f8fbff;
}

.auth-form :deep(.tw-form-item) {
  margin-bottom: 8px;
}

.auth-form :deep(input) {
  min-height: 34px;
  border-radius: 8px;
}

.agreement-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #334155;
}

.submit-btn {
  width: 100%;
  min-height: 34px;
}
</style>
