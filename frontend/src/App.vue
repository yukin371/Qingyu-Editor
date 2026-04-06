<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { getPlatform } from './services/platform'

const ready = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const platform = getPlatform()
    if (platform.platform === 'desktop') {
      const { InitDatabase } = await import('../wailsjs/go/main/App')
      await InitDatabase()
    }
    ready.value = true
  } catch (e) {
    error.value = String(e)
  }
})
</script>

<template>
  <div class="app">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else-if="!ready" class="loading">加载中...</div>
    <main v-else class="main">
      <nav class="sidebar">
        <div class="sidebar-header">
          <h2>青羽编辑器</h2>
        </div>
        <!-- TODO: 项目列表 / 大纲树 -->
      </nav>
      <section class="editor-area">
        <!-- TODO: TipTap 编辑器 -->
        <p>编辑器区域（待实现）</p>
      </section>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, .app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.loading, .error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 14px;
}

.error {
  color: #e53e3e;
}

.main {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 240px;
  background: #f7f7f8;
  border-right: 1px solid #e5e5e6;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e5e6;
}

.sidebar-header h2 {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.editor-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
