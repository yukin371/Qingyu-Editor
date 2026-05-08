<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-description">
        抱歉，您访问的页面不存在或已被移除
      </p>
      <div class="error-actions">
        <QyButton variant="primary" :icon="homeIcon" @click="goHome">
          返回首页
        </QyButton>
        <QyButton :icon="backIcon" @click="goBack">
          返回上一页
        </QyButton>
      </div>
      <div class="error-suggestion">
        <p>您可以：</p>
        <ul>
          <li>检查网址是否正确</li>
          <li>返回首页重新导航</li>
          <li>使用搜索功能查找内容</li>
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

// Back icon
const backIcon = ref('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>')

const goHome = () => {
  router.push('/bookstore')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
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
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
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







