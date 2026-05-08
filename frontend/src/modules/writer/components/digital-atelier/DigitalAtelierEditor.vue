<template>
  <div class="digital-atelier-editor" :class="{ 'da-editor--immersive': isImmersive }">
    <!-- 背景装饰层 -->
    <div class="da-bg-decoration" aria-hidden="true">
      <div class="da-bg-gradient da-bg-gradient--cyan"></div>
      <div class="da-bg-gradient da-bg-gradient--violet"></div>
      <svg class="da-bg-particles" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <circle v-for="n in 12" :key="n" :cx="particlePositions[n-1]?.cx" :cy="particlePositions[n-1]?.cy" :r="particlePositions[n-1]?.r" :fill="particlePositions[n-1]?.fill" />
      </svg>
    </div>

    <!-- 顶部导航栏 -->
    <header class="da-navbar" v-if="!isImmersive">
      <div class="da-navbar__brand">
        <span class="da-navbar__logo">Digital Atelier</span>
      </div>
      <nav class="da-navbar__nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="da-navbar__nav-item"
          :class="{ 'is-active': activeMode === item.id }"
          @click="setMode(item.id)"
        >
          {{ item.label }}
        </button>
      </nav>
      <div class="da-navbar__actions">
        <button class="da-button da-button--icon" title="AI 助手" @click="toggleAIPanel">
          <QyIcon name="MagicStick" />
        </button>
        <button class="da-button da-button--icon" title="设置" @click="openSettings">
          <QyIcon name="Setting" />
        </button>
        <div class="da-navbar__avatar">
          <img :src="userAvatar" alt="用户头像" />
        </div>
      </div>
    </header>

    <!-- 侧边栏导航 -->
    <aside class="da-sidebar" v-if="!isImmersive">
      <div class="da-sidebar__nav">
        <button
          v-for="tool in sidebarTools"
          :key="tool.id"
          class="da-sidebar__tool"
          :class="{ 'is-active': activeTool === tool.id }"
          :title="tool.label"
          @click="setTool(tool.id)"
        >
          <QyIcon :name="tool.icon" />
          <span class="da-sidebar__tool-label">{{ tool.label }}</span>
        </button>
      </div>
      <div class="da-sidebar__footer">
        <button class="da-sidebar__tool" title="资源库" @click="openLibrary">
          <QyIcon name="Folder" />
        </button>
        <div class="da-sidebar__avatar">
          <img :src="userAvatar" alt="用户头像" />
        </div>
      </div>
    </aside>

    <!-- 左侧洞察面板：灵感脉冲 -->
    <Transition name="da-panel-slide-left">
      <aside class="da-insight-panel da-insight-panel--left" v-if="showLeftPanel && !isImmersive">
        <div class="da-insight-panel__header">
          <span class="da-insight-panel__label">灵感脉冲</span>
          <span class="da-insight-panel__title">Chapter Pulse</span>
        </div>
        <div class="da-insight-panel__content">
          <div class="da-pulse-chart">
            <div
              v-for="(bar, index) in pulseData"
              :key="index"
              class="da-pulse-bar"
              :style="{
                height: bar.height + '%',
                opacity: bar.opacity,
                boxShadow: bar.highlight ? '0 0 10px rgba(125, 233, 255, 0.4)' : 'none'
              }"
            ></div>
          </div>
          <div class="da-pulse-label">
            情绪张力: {{ emotionalTension }}%
          </div>
        </div>
      </aside>
    </Transition>

    <!-- 主内容区 -->
    <main class="da-main" :class="{ 'da-main--expanded': !showLeftPanel && !showRightPanel }">
      <!-- 手稿写作区 -->
      <article class="da-manuscript">
        <!-- 章节头部 -->
        <header class="da-manuscript__header">
          <span class="da-manuscript__chapter-label">Manuscript · {{ chapterLabel }}</span>
          <h1 class="da-manuscript__title">{{ chapterTitle }}</h1>
        </header>

        <!-- 编辑器区域 -->
        <div class="da-manuscript__body">
          <slot name="editor">
            <!-- 默认编辑器插槽 -->
            <div
              class="da-manuscript__editor"
              ref="editorRef"
              :contenteditable="!readonly"
              @input="handleInput"
              @keydown="handleKeyDown"
            >
              {{ content }}
            </div>
          </slot>

          <!-- 光标指示器 -->
          <span class="da-manuscript__cursor" v-if="showCursor"></span>

          <!-- AI 构思按钮 -->
          <div class="da-manuscript__ai-hint" v-if="showAIHint">
            <button class="da-ai-orb" @click="triggerAIAssist" title="构思后续情节">
              <QyIcon name="MagicStick" />
              <span class="da-ai-orb__tooltip">构思后续情节</span>
            </button>
          </div>
        </div>
      </article>
    </main>

    <!-- 右侧洞察面板：角色映现 -->
    <Transition name="da-panel-slide-right">
      <aside class="da-insight-panel da-insight-panel--right" v-if="showRightPanel && !isImmersive">
        <div class="da-insight-panel__header">
          <span class="da-insight-panel__label">角色映现</span>
          <span class="da-insight-panel__title">Character Presence</span>
        </div>
        <div class="da-insight-panel__content">
          <div class="da-character-list">
            <div
              v-for="character in characters"
              :key="character.id"
              class="da-character-item"
              :class="{ 'is-active': character.isPresent }"
              @click="selectCharacter(character)"
            >
              <div class="da-character-item__avatar">
                <img :src="character.avatar" :alt="character.name" />
                <span class="da-character-item__status" v-if="character.isPresent"></span>
              </div>
              <div class="da-character-item__info">
                <span class="da-character-item__name">{{ character.name }}</span>
                <span class="da-character-item__role">{{ character.role }} · {{ character.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </Transition>

    <!-- 底部状态栏 -->
    <footer class="da-statusbar" v-if="!isImmersive">
      <div class="da-statusbar__line"></div>
      <div class="da-statusbar__content">
        <div class="da-statusbar__item">
          <QyIcon name="Edit" size="14" />
          <span>{{ formattedWordCount }} 字</span>
        </div>
        <div class="da-statusbar__divider"></div>
        <div class="da-statusbar__item">
          <QyIcon name="Clock" size="14" />
          <span>{{ readTime }} 分钟</span>
        </div>
        <div class="da-statusbar__divider"></div>
        <div class="da-statusbar__item">
          <QyIcon name="Refresh" size="14" />
          <span>{{ saveStatus }}</span>
        </div>
      </div>
    </footer>

    <!-- 浮动操作按钮 -->
    <Transition name="da-fab">
      <button class="da-fab" v-if="!isImmersive" @click="handleFABAction" title="快速操作">
        <QyIcon name="EditPen" size="24" />
      </button>
    </Transition>

    <!-- 沉浸模式切换按钮 -->
    <button
      class="da-immersive-toggle"
      v-if="isImmersive"
      @click="toggleImmersive"
      title="退出沉浸模式"
    >
      <QyIcon name="Close" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'

// ==================== Props ====================
interface Props {
  content?: string
  chapterTitle?: string
  chapterLabel?: string
  readonly?: boolean
  showLeftPanel?: boolean
  showRightPanel?: boolean
  wordCount?: number
  userAvatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  chapterTitle: '星尘的余温',
  chapterLabel: '第二章',
  readonly: false,
  showLeftPanel: true,
  showRightPanel: true,
  wordCount: 0,
  userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=writer'
})

// ==================== Emits ====================
interface Emits {
  (e: 'update:content', value: string): void
  (e: 'save'): void
  (e: 'aiAssist'): void
  (e: 'modeChange', mode: string): void
  (e: 'toolChange', tool: string): void
}

const emit = defineEmits<Emits>()

// ==================== Slots ====================
defineSlots<{
  editor?: () => unknown
}>()

// ==================== State ====================
const isImmersive = ref(false)
const activeMode = ref('zen')
const activeTool = ref('orbs')
const showCursor = ref(true)
const showAIHint = ref(true)

// ==================== Navigation ====================
const navItems = [
  { id: 'galaxy', label: 'Galaxy View' },
  { id: 'zen', label: 'Zen Mode' }
]

const sidebarTools = [
  { id: 'orbs', label: 'Orbs', icon: 'Grid' },
  { id: 'world', label: 'World', icon: 'Location' },
  { id: 'cast', label: 'Cast', icon: 'User' },
  { id: 'graph', label: 'Graph', icon: 'Share' }
]

// ==================== Insight Panel Data ====================
const pulseData = [
  { height: 25, opacity: 0.2, highlight: false },
  { height: 50, opacity: 0.3, highlight: false },
  { height: 75, opacity: 0.6, highlight: true },
  { height: 83, opacity: 0.4, highlight: false },
  { height: 75, opacity: 0.2, highlight: false },
  { height: 50, opacity: 0.1, highlight: false }
]

const emotionalTension = ref(64)

const characters = ref([
  {
    id: '1',
    name: '艾琳 (Aeryn)',
    role: '主角',
    status: '在场',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aeryn',
    isPresent: true
  },
  {
    id: '2',
    name: '索伦 (Solon)',
    role: '导师',
    status: '提及',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=solon',
    isPresent: false
  }
])

// ==================== Background Particles ====================
const particlePositions = [
  { cx: 200, cy: 300, r: 1, fill: '#7de9ff' },
  { cx: 800, cy: 150, r: 0.5, fill: '#ffffff' },
  { cx: 450, cy: 800, r: 1.5, fill: '#cebdff' },
  { cx: 120, cy: 650, r: 0.5, fill: '#ffffff' },
  { cx: 950, cy: 400, r: 1, fill: '#7de9ff' },
  { cx: 600, cy: 20, r: 0.8, fill: '#ffffff' },
  { cx: 300, cy: 500, r: 0.6, fill: '#cebdff' },
  { cx: 700, cy: 700, r: 1.2, fill: '#7de9ff' },
  { cx: 150, cy: 200, r: 0.7, fill: '#ffffff' },
  { cx: 850, cy: 600, r: 0.9, fill: '#cebdff' },
  { cx: 400, cy: 100, r: 0.5, fill: '#ffffff' },
  { cx: 550, cy: 450, r: 1.1, fill: '#7de9ff' }
]

// ==================== Computed ====================
const formattedWordCount = computed(() => {
  return props.wordCount.toLocaleString()
})

const readTime = computed(() => {
  const minutes = Math.ceil(props.wordCount / 500)
  return minutes
})

const saveStatus = computed(() => '自动保存')

// ==================== Methods ====================
function setMode(mode: string) {
  activeMode.value = mode
  emit('modeChange', mode)
}

function setTool(tool: string) {
  activeTool.value = tool
  emit('toolChange', tool)
}

function toggleImmersive() {
  isImmersive.value = !isImmersive.value
}

function toggleAIPanel() {
  emit('aiAssist')
}

function openSettings() {
  console.log('Open settings')
}

function openLibrary() {
  console.log('Open library')
}

function selectCharacter(character: typeof characters.value[0]) {
  console.log('Selected character:', character.name)
}

function triggerAIAssist() {
  emit('aiAssist')
}

function handleFABAction() {
  console.log('FAB action')
}

function handleInput(event: Event) {
  const target = event.target as HTMLDivElement
  emit('update:content', target.textContent || '')
}

function handleKeyDown(event: KeyboardEvent) {
  // Ctrl/Cmd + S to save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    emit('save')
  }

  // F11 to toggle immersive mode
  if (event.key === 'F11') {
    event.preventDefault()
    toggleImmersive()
  }

  // Escape to exit immersive mode
  if (event.key === 'Escape' && isImmersive.value) {
    toggleImmersive()
  }
}

// ==================== Keyboard Shortcuts ====================
function handleGlobalKeyDown(event: KeyboardEvent) {
  if (event.key === 'F11') {
    event.preventDefault()
    toggleImmersive()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>

<style scoped lang="scss">
@import '../../styles/digital-atelier-theme.scss';

.digital-atelier-editor {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--da-background);
  color: var(--da-on-surface);
  font-family: var(--da-font-body);

  // ==================== Background Decoration ====================
  .da-bg-decoration {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .da-bg-gradient {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    mix-blend-mode: screen;

    &--cyan {
      top: 25%;
      left: 25%;
      width: 600px;
      height: 600px;
      background: rgba(125, 233, 255, 0.05);
    }

    &--violet {
      bottom: 25%;
      right: 25%;
      width: 500px;
      height: 500px;
      background: rgba(206, 189, 255, 0.05);
    }
  }

  .da-bg-particles {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.2;
  }

  // ==================== Navbar ====================
  .da-navbar {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    height: 56px;
    width: calc(100% - 64px);
    max-width: 1200px;
    @include glass-panel;
    border-radius: var(--da-radius-full);
    box-shadow: 0 0 40px -15px rgba(125, 233, 255, 0.15);

    &__brand {
      display: flex;
      align-items: center;
    }

    &__logo {
      font-size: 20px;
      font-family: var(--da-font-headline);
      font-style: italic;
      color: var(--da-primary);
      letter-spacing: -0.02em;
    }

    &__nav {
      display: flex;
      gap: 32px;
    }

    &__nav-item {
      background: transparent;
      border: none;
      color: var(--da-on-surface-variant);
      font-family: var(--da-font-label);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      cursor: pointer;
      padding: 8px 0;
      border-bottom: 2px solid transparent;
      transition: all var(--da-transition-fast);

      &:hover {
        color: var(--da-primary);
      }

      &.is-active {
        color: var(--da-primary);
        border-bottom-color: var(--da-primary);
      }
    }

    &__actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    &__avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--da-radius-full);
      overflow: hidden;
      border: 1px solid var(--da-outline-variant);
      background: var(--da-surface-container-high);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  // ==================== Sidebar ====================
  .da-sidebar {
    position: fixed;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 0;
    width: 80px;
    height: calc(100vh - 128px);
    @include glass-panel;
    border-radius: var(--da-radius-xl);
    box-shadow: var(--da-shadow-lg);
    box-shadow: 0 0 40px rgba(125, 233, 255, 0.1);

    &__nav {
      display: flex;
      flex-direction: column;
      gap: 32px;
      flex: 1;
    }

    &__tool {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: none;
      color: var(--da-on-surface-variant);
      padding: 12px;
      border-radius: var(--da-radius-full);
      cursor: pointer;
      transition: all var(--da-transition-slow);

      &:hover {
        color: var(--da-on-surface);
        transform: translateX(4px);
      }

      &.is-active {
        background: var(--da-primary-container);
        color: var(--da-primary);
      }
    }

    &__tool-label {
      font-family: var(--da-font-label);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--da-tertiary);
    }

    &__footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      margin-top: auto;
    }

    &__avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--da-radius-full);
      overflow: hidden;
      border: 1px solid var(--da-outline-variant);
      background: var(--da-surface-container-high);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  // ==================== Insight Panels ====================
  .da-insight-panel {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 30;
    width: 192px;
    @include glass-panel;
    border-radius: var(--da-radius-xl);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;

    &--left {
      left: 128px;
    }

    &--right {
      right: 48px;
    }

    &__header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &__label {
      font-family: var(--da-font-label);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--da-on-surface-variant);
    }

    &__title {
      font-family: var(--da-font-headline);
      font-size: 16px;
      font-style: italic;
      color: var(--da-primary);
    }

    &__content {
      flex: 1;
    }
  }

  // ==================== Pulse Chart ====================
  .da-pulse-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 192px;
    padding: 0 8px;
    gap: 4px;
  }

  .da-pulse-bar {
    width: 8px;
    background: var(--da-primary);
    border-radius: var(--da-radius-full) var(--da-radius-full) 0 0;
    transition: all var(--da-transition-normal);
  }

  .da-pulse-label {
    margin-top: 16px;
    text-align: center;
    font-family: var(--da-font-label);
    font-size: 10px;
    color: var(--da-on-surface-variant);
  }

  // ==================== Character List ====================
  .da-character-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .da-character-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: var(--da-radius-md);
    cursor: pointer;
    transition: all var(--da-transition-fast);
    opacity: 0.6;

    &:hover,
    &.is-active {
      opacity: 1;
      background: rgba(125, 233, 255, 0.05);
    }

    &__avatar {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: var(--da-radius-full);
      overflow: hidden;
      border: 1px solid var(--da-tertiary);
      transition: border-color var(--da-transition-fast);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .is-active & {
        border-color: var(--da-primary);
      }
    }

    &__status {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      background: var(--da-primary);
      border-radius: var(--da-radius-full);
      border: 2px solid var(--da-surface);
    }

    &__info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    &__name {
      font-size: 12px;
      font-weight: 600;
      color: var(--da-on-surface);
    }

    &__role {
      font-size: 10px;
      color: var(--da-on-surface-variant);
    }
  }

  // ==================== Main Content ====================
  .da-main {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 128px 256px 96px;
    transition: padding var(--da-transition-slow);

    &--expanded {
      padding-left: 64px;
      padding-right: 64px;
    }
  }

  // ==================== Manuscript ====================
  .da-manuscript {
    @include manuscript-paper;
    width: 100%;
    max-width: 768px;
    min-height: 600px;
    border-radius: var(--da-radius-lg);
    padding: 64px 96px;
    position: relative;

    &__header {
      text-align: center;
      margin-bottom: 64px;
    }

    &__chapter-label {
      display: block;
      font-family: var(--da-font-label);
      font-size: 14px;
      color: var(--da-primary);
      opacity: 0.4;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    &__title {
      font-family: var(--da-font-headline);
      font-size: 40px;
      font-weight: 300;
      font-style: italic;
      color: var(--da-on-surface);
      opacity: 0.9;
      letter-spacing: -0.02em;
      margin: 0;
    }

    &__body {
      position: relative;
    }

    &__editor {
      font-family: var(--da-font-body);
      font-size: 18px;
      line-height: 1.9;
      color: var(--da-on-surface);
      opacity: 0.8;
      outline: none;
      white-space: pre-wrap;
      word-break: break-word;
      min-height: 400px;
      caret-color: var(--da-primary);

      &:empty::before {
        content: '开始创作...';
        color: var(--da-on-surface-variant);
        opacity: 0.5;
        pointer-events: none;
      }
    }

    &__cursor {
      display: inline-block;
      width: 2px;
      height: 24px;
      background: var(--da-primary);
      margin-left: 4px;
      vertical-align: middle;
      animation: da-cursor-blink 1s infinite;
    }

    &__ai-hint {
      position: absolute;
      right: -48px;
      margin-top: 8px;
    }
  }

  // ==================== AI Orb ====================
  .da-ai-orb {
    width: 40px;
    height: 40px;
    border-radius: var(--da-radius-full);
    background: linear-gradient(135deg, var(--da-primary) 0%, var(--da-primary-dim) 100%);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--da-on-primary);
    cursor: pointer;
    box-shadow: var(--da-glow-cyan);
    transition: all var(--da-transition-fast);
    position: relative;

    &:hover {
      transform: scale(1.1);
      box-shadow: var(--da-glow-cyan-strong);
    }

    &:active {
      transform: scale(0.95);
    }

    &__tooltip {
      position: absolute;
      left: 48px;
      white-space: nowrap;
      background: var(--da-surface-container-high);
      padding: 8px 16px;
      border-radius: var(--da-radius-full);
      border: 1px solid var(--da-primary);
      font-size: 12px;
      color: var(--da-primary);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--da-transition-fast);
    }

    &:hover &__tooltip {
      opacity: 1;
    }
  }

  // ==================== Statusbar ====================
  .da-statusbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    height: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;

    &__line {
      width: 100%;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--da-primary) 50%,
        transparent 100%
      );
      animation: da-pulse 2s infinite;
    }

    &__content {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 8px 24px;
      margin-bottom: 16px;
      @include glass-panel;
      border-radius: var(--da-radius-full);
    }

    &__item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--da-font-label);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--da-on-surface-variant);
    }

    &__divider {
      width: 1px;
      height: 12px;
      background: var(--da-outline-variant);
      opacity: 0.3;
    }
  }

  // ==================== FAB ====================
  .da-fab {
    position: fixed;
    bottom: 32px;
    right: 32px;
    z-index: 50;
    width: 56px;
    height: 56px;
    border-radius: var(--da-radius-full);
    background: linear-gradient(135deg, var(--da-primary) 0%, var(--da-primary-dim) 100%);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--da-on-primary);
    cursor: pointer;
    box-shadow: var(--da-shadow-md), var(--da-glow-cyan);
    transition: all var(--da-transition-normal);

    &:hover {
      transform: scale(1.05);
      box-shadow: var(--da-shadow-lg), var(--da-glow-cyan-strong);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  // ==================== Immersive Toggle ====================
  .da-immersive-toggle {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 100;
    width: 48px;
    height: 48px;
    border-radius: var(--da-radius-full);
    background: var(--da-glass-bg);
    backdrop-filter: blur(var(--da-glass-blur));
    border: 1px solid var(--da-glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--da-on-surface);
    cursor: pointer;
    transition: all var(--da-transition-fast);

    &:hover {
      background: var(--da-primary-container);
      color: var(--da-primary);
    }
  }

  // ==================== Immersive Mode ====================
  &.da-editor--immersive {
    .da-main {
      padding: 64px;
    }

    .da-manuscript {
      max-width: 900px;
      min-height: 80vh;
    }
  }
}

// ==================== Transitions ====================
.da-panel-slide-left-enter-active,
.da-panel-slide-left-leave-active {
  transition: all var(--da-transition-slow);
}

.da-panel-slide-left-enter-from,
.da-panel-slide-left-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-100%);
}

.da-panel-slide-right-enter-active,
.da-panel-slide-right-leave-active {
  transition: all var(--da-transition-slow);
}

.da-panel-slide-right-enter-from,
.da-panel-slide-right-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(100%);
}

.da-fab-enter-active,
.da-fab-leave-active {
  transition: all var(--da-transition-normal);
}

.da-fab-enter-from,
.da-fab-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

// ==================== Responsive ====================
@media (max-width: 1536px) {
  .da-insight-panel {
    display: none;
  }

  .da-main {
    padding-left: 128px;
    padding-right: 64px;
  }
}

@media (max-width: 1024px) {
  .da-sidebar {
    display: none;
  }

  .da-main {
    padding-left: 32px;
    padding-right: 32px;
  }

  .da-manuscript {
    padding: 48px;
  }
}

@media (max-width: 768px) {
  .da-navbar {
    width: calc(100% - 32px);
    padding: 0 16px;

    &__nav {
      display: none;
    }
  }

  .da-main {
    padding: 80px 16px 64px;
  }

  .da-manuscript {
    padding: 32px 24px;

    &__title {
      font-size: 28px;
    }

    &__ai-hint {
      display: none;
    }
  }

  .da-fab {
    bottom: 80px;
    right: 16px;
  }
}
</style>
