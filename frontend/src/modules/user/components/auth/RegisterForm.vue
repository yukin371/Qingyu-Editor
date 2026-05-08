<template>
  <div class="register-form">
    <qy-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      label-width="0"
      @submit.prevent="handleRegister"
    >
      <div class="form-header">
        <h2 class="form-title">注册青羽书城</h2>
        <p class="form-subtitle">创建账号，开启您的阅读之旅</p>
      </div>

      <qy-form-item prop="username">
        <Input
          v-model="registerForm.username"
          placeholder="请输入用户名"
          clearable
          size="lg"
          @blur="checkUsernameAvailable"
        />
      </qy-form-item>

      <qy-form-item prop="email">
        <Input
          v-model="registerForm.email"
          type="email"
          placeholder="请输入邮箱地址"
          clearable
          size="lg"
          @blur="checkEmailAvailable"
        />
      </qy-form-item>

      <qy-form-item prop="password">
        <Input
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
          clearable
          size="lg"
        />
      </qy-form-item>

      <qy-form-item prop="confirmPassword">
        <Input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="请确认密码"
          show-password
          clearable
          size="lg"
          @keyup.enter="handleRegister"
        />
      </qy-form-item>

      <qy-form-item prop="agreement">
        <Checkbox v-model="registerForm.agreement">
          我已阅读并同意
          <a class="link-primary" @click="showTerms">《用户协议》</a>
          和
          <a class="link-primary" @click="showPrivacy">《隐私政策》</a>
        </Checkbox>
      </qy-form-item>

      <qy-form-item>
        <qy-button
          type="primary"
          size="lg"
          :loading="loading"
          :disabled="!isFormValid"
          class="register-button"
          @click="handleRegister"
        >
          {{ loading ? '注册中...' : '注册' }}
        </qy-button>
      </qy-form-item>

      <div class="form-footer">
        <span class="login-hint">
          已有账号？
          <a class="link-primary" @click="$emit('switch-to-login')">
            立即登录
          </a>
        </span>
      </div>
    </qy-form>

    <!-- 用户协议对话框 -->
    <UserAgreementDialog v-model:visible="showAgreementDialog" />

    <!-- 隐私政策对话框 -->
    <PrivacyPolicyDialog v-model:visible="showPrivacyDialog" />
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import QyForm from '@/design-system/components/advanced/QyForm/QyForm.vue'
import QyFormItem from '@/design-system/components/advanced/QyForm/QyFormItem.vue'
import QyButton from '@/design-system/components/basic/QyButton/QyButton.vue'
import { Checkbox, Input } from '@/design-system/base'
import { message } from '@/design-system/services'
import UserAgreementDialog from '@/shared/components/common/UserAgreementDialog.vue'
import PrivacyPolicyDialog from '@/shared/components/common/PrivacyPolicyDialog.vue'

export default {
  name: 'RegisterForm',
  components: {
    QyForm,
    QyFormItem,
    QyButton,
    Checkbox,
    Input,
    UserAgreementDialog,
    PrivacyPolicyDialog
  },
  emits: ['register-success', 'switch-to-login'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const registerFormRef = ref()

    // 对话框显示状态
    const showAgreementDialog = ref(false)
    const showPrivacyDialog = ref(false)

    // 表单数据
    const registerForm = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreement: false
    })

    // 用户名和邮箱可用性检查
    const usernameChecking = ref(false)
    const emailChecking = ref(false)

    // 自定义验证器
    const validateUsername = async (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入用户名'))
        return
      }
      if (value.length < 3 || value.length > 20) {
        callback(new Error('用户名长度在 3 到 20 个字符'))
        return
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        callback(new Error('用户名只能包含字母、数字和下划线'))
        return
      }
      callback()
    }

    const validateEmail = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入邮箱地址'))
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        callback(new Error('请输入有效的邮箱地址'))
        return
      }
      callback()
    }

    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入密码'))
        return
      }
      if (value.length < 6 || value.length > 20) {
        callback(new Error('密码长度在 6 到 20 个字符'))
        return
      }
      if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
        callback(new Error('密码必须包含字母和数字'))
        return
      }
      callback()
    }

    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请确认密码'))
        return
      }
      if (value !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
        return
      }
      callback()
    }

    const validateAgreement = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请阅读并同意用户协议和隐私政策'))
        return
      }
      callback()
    }

    // 表单验证规则
    const registerRules = {
      username: [{ validator: validateUsername, trigger: 'blur' }],
      email: [{ validator: validateEmail, trigger: 'blur' }],
      password: [{ validator: validatePassword, trigger: 'blur' }],
      confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
      agreement: [{ validator: validateAgreement, trigger: 'change' }]
    }

    // 计算属性
    const loading = computed(() => authStore.loading)
    const isFormValid = computed(() => {
      return (
        registerForm.username.trim() &&
        registerForm.email.trim() &&
        registerForm.password.trim() &&
        registerForm.confirmPassword.trim() &&
        registerForm.agreement
      )
    })

    // 检查用户名是否可用
    const checkUsernameAvailable = async () => {
      if (!registerForm.username.trim()) return

      usernameChecking.value = true
      try {
        const available = await authStore.checkUsername(registerForm.username)
        if (!available) {
          message.warning('用户名已被使用')
        }
      } catch (error) {
        console.error('检查用户名失败:', error)
      } finally {
        usernameChecking.value = false
      }
    }

    // 检查邮箱是否可用
    const checkEmailAvailable = async () => {
      if (!registerForm.email.trim()) return

      emailChecking.value = true
      try {
        const available = await authStore.checkEmail(registerForm.email)
        if (!available) {
          message.warning('邮箱已被注册')
        }
      } catch (error) {
        console.error('检查邮箱失败:', error)
      } finally {
        emailChecking.value = false
      }
    }

    // 处理注册
    const handleRegister = async () => {
      if (!registerFormRef.value) return

      try {
        // 表单验证
        await registerFormRef.value.validate()

        // 调用注册接口
        await authStore.register({
          username: registerForm.username.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password
        })

        message.success('注册成功')
        emit('register-success')
      } catch (error) {
        if (error.message) {
          message.error(error.message)
        }
      }
    }

    // 显示用户协议
    const showTerms = () => {
      showAgreementDialog.value = true
    }

    // 显示隐私政策
    const showPrivacy = () => {
      showPrivacyDialog.value = true
    }

    // 重置表单
    const resetForm = () => {
      if (registerFormRef.value) {
        registerFormRef.value.resetFields()
      }
      Object.assign(registerForm, {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreement: false
      })
    }

    return {
      registerFormRef,
      registerForm,
      registerRules,
      loading,
      isFormValid,
      showAgreementDialog,
      showPrivacyDialog,
      handleRegister,
      checkUsernameAvailable,
      checkEmailAvailable,
      showTerms,
      showPrivacy,
      resetForm
    }
  }
}
</script>

<style scoped>
.register-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.login-hint {
  font-size: 14px;
  color: #606266;
}

.link-primary {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.link-primary:hover {
  color: #66b1ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-form {
    padding: 30px 20px;
    margin: 20px;
    box-shadow: none;
    border: 1px solid #ebeef5;
  }

  .form-title {
    font-size: 20px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .register-form {
    background: #1d1e1f;
    border: 1px solid #414243;
  }

  .form-title {
    color: #e5eaf3;
  }

  .form-subtitle {
    color: #a3a6ad;
  }

  .login-hint {
    color: #a3a6ad;
  }
}
</style>
