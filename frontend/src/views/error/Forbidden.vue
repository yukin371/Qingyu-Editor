<template>
  <div class="error-page forbidden">
    <div class="error-content">
      <div class="error-code">403</div>
      <h1 class="error-title">访问被拒绝</h1>
      <p class="error-description">
        抱歉，您没有权限访问此页面
      </p>
      <div class="error-actions">
        <QyButton variant="primary" :icon="homeIcon" @click="goHome">
          返回首页
        </QyButton>
        <QyButton :icon="userIcon" @click="goToAuth">
          登录账号
        </QyButton>
      </div>
      <div class="error-suggestion">
        <p>可能的原因：</p>
        <ul>
          <li>您还未登录账号</li>
          <li>您的账号权限不足</li>
          <li>此内容仅限特定用户访问</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { QyButton } from '@/design-system/components'

const router = useRouter()

// Home icon
const homeIcon = ref('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>')

// User icon
const userIcon = ref('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>')

const goHome = () => {
  router.push('/bookstore')
}

const goToAuth = () => {
  router.push('/auth')
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.forbidden {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.error-content {
  text-align: center;
  color: white;
  max-width: 600px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: shake 3s infinite;
}

@keyframes shake {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 16px;
  margin: 0 0 32px 0;
  opacity: 0.9;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}

.error-suggestion {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 24px;
  text-align: left;
}

.error-suggestion p {
  margin: 0 0 12px 0;
  font-weight: 500;
}

.error-suggestion ul {
  margin: 0;
  padding-left: 24px;
  list-style: none;
}

.error-suggestion li {
  margin: 8px 0;
  position: relative;
  padding-left: 0;
}

.error-suggestion li::before {
  content: '→';
  position: absolute;
  left: -20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .error-actions :deep(.qy-button) {
    width: 200px;
  }
}
</style>







