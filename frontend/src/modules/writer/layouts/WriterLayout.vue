<template>
  <div class="writer-layout" :class="{ 'writer-layout--project': hideWriterHeader }">
    <header v-if="!hideWriterHeader" class="writer-header">
      <div class="writer-header-inner">
        <router-link to="/writer/dashboard" class="brand">青羽编辑器</router-link>
        <nav class="writer-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            custom
            v-slot="{ navigate, isActive }"
          >
            <QyButton
              size="md"
              :variant="isActive ? 'primary' : 'secondary'"
              class="writer-nav-pill"
              @click="navigate"
            >
              <QyIcon :name="item.icon" :size="16" />
              <span>{{ item.label }}</span>
            </QyButton>
          </router-link>
        </nav>
      </div>
    </header>
    <div class="writer-layout-content" :class="{ 'writer-layout-content--project': hideWriterHeader }">
      <div class="writer-content-backdrop"></div>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { QyButton, QyIcon } from '@/design-system/components'

const route = useRoute()
const navItems = [
  { label: '创作工作台', path: '/writer/dashboard', icon: 'Grid' },
  { label: '我的项目', path: '/writer/projects', icon: 'Files' },
]

const hideWriterHeader = computed(() => route.name === 'writer-project')
</script>

<style scoped>
.writer-layout {
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
}

.writer-layout--project {
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
}

.writer-header {
  background: color-mix(in oklab, var(--el-bg-color) 92%, #ffffff 8%);
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(8px);
}

.writer-header-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.brand {
  font-weight: 700;
  color: var(--el-color-primary);
  text-decoration: none;
  font-size: 20px;
}

.writer-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.writer-nav-pill {
  min-height: 40px;
  font-size: 15px;
  letter-spacing: 0.1px;
}

.writer-nav-pill :deep(.qy-icon) {
  margin-right: 6px;
}

.writer-layout-content {
  flex: 1;
  position: relative;
  isolation: isolate;
  min-height: 0;
  overflow: hidden;
}

.writer-layout-content--project {
  flex: 1;
  min-height: 0;
}

.writer-layout-content--project :deep(.editor-layout) {
  height: 100%;
}

.writer-content-backdrop {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(520px 280px at 92% -8%, rgba(125, 211, 252, 0.2), transparent 70%),
    radial-gradient(420px 220px at 8% 108%, rgba(129, 140, 248, 0.15), transparent 72%),
    linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

@media (max-width: 960px) {
  .writer-header-inner {
    flex-wrap: wrap;
  }

  .writer-nav {
    order: 3;
    width: 100%;
    margin-top: 6px;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 2px;
  }
}
</style>
