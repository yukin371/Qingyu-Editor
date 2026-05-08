<template>
  <div class="forgot-password-form">
    <qy-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="0"
      @submit.prevent="handleSubmit"
    >
      <div class="form-header">
        <h3 class="form-title">重置密码</h3>
        <p class="form-subtitle">请输入您的邮箱地址，我们将发送重置链接</p>
      </div>

      <qy-form-item prop="email">
        <qy-input
          v-model="form.email"
          type="email"
          placeholder="请输入注册邮箱"
          prefix-icon="Message"
          clearable
          size="large"
        />
      </qy-form-item>

      <qy-form-item prop="verificationCode" v-if="showVerificationCode">
        <div class="verification-input">
          <Input
            v-model="form.verificationCode"
            placeholder="请输入验证码"
            prefix-icon="Key"
            clearable
            size="large"
          />
          <qy-button
            type="primary"
            :disabled="!canSendCode || codeSending"
            :loading="codeSending"
            @click="sendVerificationCode"
          >
            {{ codeButtonText }}
          </qy-button>
        </div>
      </qy-form-item>

      <qy-form-item prop="newPassword" v-if="showPasswordFields">
        <qy-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码"
          prefix-icon="Lock"
          show-password
          clearable
          size="large"
        />
      </qy-form-item>

      <qy-form-item prop="confirmPassword" v-if="showPasswordFields">
        <qy-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请确认新密码"
          prefix-icon="Lock"
          show-password
          clearable
          size="large"
          @keyup.enter="handleSubmit"
        />
      </qy-form-item>

      <div class="form-actions">
        <qy-button
          size="large"
          @click="$emit('cancel')"
        >
          取消
        </qy-button>
        <qy-button
          type="primary"
          size="large"
          :loading="loading"
          :disabled="!isFormValid"
          @click="handleSubmit"
        >
          {{ submitButtonText }}
        </qy-button>
      </div>
    </qy-form>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import QyForm from '@/design-system/components/advanced/QyForm/QyForm.vue'
import QyFormItem from '@/design-system/components/advanced/QyForm/QyFormItem.vue'
import QyButton from '@/design-system/components/basic/QyButton/QyButton.vue'
import { Input } from '@/design-system/base'
import { message } from '@/design-system/services'

export default {
  name: 'ForgotPasswordForm',
  components: {
    QyForm,
    QyFormItem,
    QyButton,
    Input
  },
  emits: ['reset-success', 'cancel'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const formRef = ref()

    // 表单状态
    const currentStep = ref(1) // 1: 输入邮箱, 2: 输入验证码和新密码
    const showVerificationCode = ref(false)
    const showPasswordFields = ref(false)

    // 验证码相关状态
    const codeSending = ref(false)
    const codeCountdown = ref(0)
    const codeTimer = ref(null)

    // 表单数据
    const form = reactive({
      email: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    })

    // 自定义验证器
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
        callback(new Error('请输入新密码'))
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
        callback(new Error('请确认新密码'))
        return
      }
      if (value !== form.newPassword) {
        callback(new Error('两次输入的密码不一致'))
        return
      }
      callback()
    }

    // 表单验证规则
    const rules = {
      email: [{ validator: validateEmail, trigger: 'blur' }],
      verificationCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 6, message: '验证码为6位数字', trigger: 'blur' }
      ],
      newPassword: [{ validator: validatePassword, trigger: 'blur' }],
      confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
    }

    // 计算属性
    const loading = computed(() => authStore.loading)

    const isFormValid = computed(() => {
      if (currentStep.value === 1) {
        return form.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      } else {
        return (
          form.email.trim() &&
          form.verificationCode.trim() &&
          form.newPassword.trim() &&
          form.confirmPassword.trim()
        )
      }
    })

    const canSendCode = computed(() => {
      return (
        form.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
        codeCountdown.value === 0
      )
    })

    const codeButtonText = computed(() => {
      if (codeSending.value) return '发送中...'
      if (codeCountdown.value > 0) return `${codeCountdown.value}s后重发`
      return '发送验证码'
    })

    const submitButtonText = computed(() => {
      if (loading.value) return '处理中...'
      return currentStep.value === 1 ? '发送验证码' : '重置密码'
    })

    // 监听邮箱变化
    watch(
      () => form.email,
      (newEmail) => {
        if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
          if (currentStep.value === 1) {
            showVerificationCode.value = false
            showPasswordFields.value = false
          }
        }
      }
    )

    // 发送验证码
    const sendVerificationCode = async () => {
      if (!canSendCode.value) return

      codeSending.value = true
      try {
        await authStore.sendVerificationCode(form.email)
        message.success('验证码已发送到您的邮箱')
        
        // 切换到第二步
        currentStep.value = 2
        showVerificationCode.value = true
        showPasswordFields.value = true
        
        // 开始倒计时
        codeCountdown.value = 60
        codeTimer.value = setInterval(() => {
          codeCountdown.value--
          if (codeCountdown.value <= 0) {
            clearInterval(codeTimer.value)
            codeTimer.value = null
          }
        }, 1000)
      } catch (error) {
        message.error(error.message || '发送验证码失败')
      } finally {
        codeSending.value = false
      }
    }

    // 处理表单提交
    const handleSubmit = async () => {
      if (!formRef.value) return

      try {
        // 表单验证
        await formRef.value.validate()

        if (currentStep.value === 1) {
          // 第一步：发送验证码
          await sendVerificationCode()
        } else {
          // 第二步：重置密码
          await authStore.resetPassword({
            email: form.email,
            verificationCode: form.verificationCode,
            newPassword: form.newPassword
          })

          message.success('密码重置成功')
          emit('reset-success')
        }
      } catch (error) {
        if (error.message) {
          message.error(error.message)
        }
      }
    }

    // 重置表单
    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields()
      }
      Object.assign(form, {
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      currentStep.value = 1
      showVerificationCode.value = false
      showPasswordFields.value = false
      
      // 清除倒计时
      if (codeTimer.value) {
        clearInterval(codeTimer.value)
        codeTimer.value = null
      }
      codeCountdown.value = 0
    }

    return {
      formRef,
      form,
      rules,
      currentStep,
      showVerificationCode,
      showPasswordFields,
      codeSending,
      canSendCode,
      codeButtonText,
      loading,
      isFormValid,
      submitButtonText,
      handleSubmit,
      sendVerificationCode,
      resetForm
    }
  }
}
</script>

<style scoped>
.forgot-password-form {
  padding: 20px 0;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
  line-height: 1.5;
}

.verification-input {
  display: flex;
  gap: 10px;
}

.verification-input .qy-input {
  flex: 1;
}

.verification-input .qy-button {
  flex-shrink: 0;
  width: 120px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.form-actions .qy-button {
  flex: 1;
  height: 44px;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .verification-input {
    flex-direction: column;
  }

  .verification-input .qy-button {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .form-title {
    color: #e5eaf3;
  }

  .form-subtitle {
    color: #a3a6ad;
  }
}
</style>