<template>
  <div class="error-page server-error">
    <div class="error-content">
      <div class="error-code">500</div>
      <h1 class="error-title">服务器错误</h1>
      <p class="error-description">
        抱歉，服务器遇到了一些问题，我们正在努力修复
      </p>
      <div class="error-actions">
        <QyButton variant="primary" :icon="homeIcon" @click="goHome">
          返回首页
        </QyButton>
        <QyButton :icon="refreshIcon" @click="reload">
          刷新页面
        </QyButton>
      </div>
      <div class="error-suggestion">
        <p>您可以尝试：</p>
        <ul>
          <li>刷新页面重新加载</li>
          <li>稍后再试</li>
          <li>联系我们的技术支持</li>
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

// Refresh icon
const refreshIcon = ref('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>')

const goHome = () => {
  router.push('/bookstore')
}

const reload = () => {
  window.location.reload()
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

.server-error {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
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







