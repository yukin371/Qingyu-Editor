<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { ThemeSwitcher } from '@/design-system/other'
import ThemePreview from '@/design-system/other/ThemePreview/ThemePreview.vue'

// 显示主题预览对话框
const showThemePreview = ref(false)

// -----------------------------
// 1. 静态常量提升
// -----------------------------
const PASTEL_COLORS = [
  'linear-gradient(135deg, #e0c3fc 0%, #dcc6e0 100%)',
  'linear-gradient(135deg, #8ec5fc 0%, #a8d8fc 100%)',
  'linear-gradient(135deg, #fccb90 0%, #fdd5b5 100%)',
  'linear-gradient(135deg, #d57eeb 0%, #dd92ed 100%)',
  'linear-gradient(135deg, #a8e6cf 0%, #b8ebd9 100%)',
] as const

const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'scifi', name: '科幻' },
  { id: 'literature', name: '文学' },
  { id: 'history', name: '历史' },
] as const

interface DecorativeShape {
  id: number; top: string; left: string; width: string; height: string; background: string; opacity: number
}

// 检测设备性能
const isLowEndDevice = typeof navigator !== 'undefined' && (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4

// 形状生成算法
const generateRandomShapes = (count: number): DecorativeShape[] => {
  const shapes: DecorativeShape[] = []
  const gridSize = 100 / Math.ceil(Math.sqrt(count))

  for (let i = 0; i < count; i++) {
    const size = Math.floor(Math.random() * 60) + 60
    const row = Math.floor(i / Math.ceil(Math.sqrt(count)))
    const col = i % Math.ceil(Math.sqrt(count))
    const top = row * gridSize + Math.random() * (gridSize - 20)
    const left = col * gridSize + Math.random() * (gridSize - 20)

    shapes.push({
      id: i,
      top: `${top}%`,
      left: `${left}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
      opacity: parseFloat((Math.random() * 0.35 + 0.35).toFixed(2)),
    })
  }
  return shapes
}

const card1Shapes = shallowRef(generateRandomShapes(isLowEndDevice ? 1 : 3))

// -----------------------------
// 书籍数据
// -----------------------------
interface Book {
  id: number; title: string; author: string; rating: number; cover: string; category?: string
}

const activeCategory = ref('all')
const loading = ref(false)
const hasMore = ref(true)
const booksBuffer = shallowRef<Book[]>([])

let cursor = 0
const PAGE_SIZE = 12

const selectCategory = async (id: string) => {
  if (activeCategory.value === id) return
  activeCategory.value = id
  await resetAndLoad()
}

// 模拟 API
async function fetchBooksPage(params: { cursor: number; limit: number; category: string }) {
  await new Promise(r => setTimeout(r, 300))
  const base = params.cursor
  const items: Book[] = Array.from({ length: params.limit }).map((_, i) => {
    const id = base + i + 1
    const covers = [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&q=80&fit=crop',
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&q=80&fit=crop',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&q=80&fit=crop',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&q=80&fit=crop',
    ]
    return {
      id: id,
      title: `示例书籍 ${id}`,
      author: ['刘慈欣', '张嘉佳', '马尔克斯', '东野圭吾'][id % 4],
      rating: Number((8.6 + (id % 12) * 0.1).toFixed(1)),
      cover: covers[id % covers.length],
      category: params.category,
    }
  })
  return { items, nextCursor: params.cursor + items.length, hasMore: params.cursor + items.length < 200 }
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await fetchBooksPage({ cursor, limit: PAGE_SIZE, category: activeCategory.value })
    cursor = res.nextCursor
    hasMore.value = res.hasMore
    booksBuffer.value = [...booksBuffer.value, ...res.items]
  } finally {
    loading.value = false
  }
}

const resetAndLoad = async () => {
  cursor = 0
  hasMore.value = true
  booksBuffer.value = []
  await loadMore()
}

// -----------------------------
// 交互优化
// -----------------------------
const handleMouseEnter = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const fromLeft = e.clientX < rect.left + rect.width / 2
  // 左侧进入(看书脊): 旋转正角度; 右侧进入(看书页): 旋转负角度
  target.style.setProperty('--target-rotate', fromLeft ? '30deg' : '-30deg')
}

const handleMouseLeave = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.removeProperty('--target-rotate')
}

// IntersectionObserver
const sentinel = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null

onMounted(async () => {
  await loadMore()
  io = new IntersectionObserver(entries => {
    if (entries[0]?.isIntersecting) loadMore()
  }, { rootMargin: '400px' })
  if (sentinel.value) io.observe(sentinel.value)
})

onBeforeUnmount(() => {
  if (io) io.disconnect()
})
</script>

<template>
  <div class="min-h-screen bg-[#f3f4f6] relative overflow-hidden font-sans selection:bg-[var(--color-primary-200)] selection:text-[var(--color-primary-900)]">

    <!-- 背景动画 - 添加基础背景色防止白色闪烁 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0 backface-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary-200)]/40 rounded-full blur-[100px] mix-blend-multiply animate-float will-change-transform"></div>
      <div class="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-secondary-200)]/40 rounded-full blur-[100px] mix-blend-multiply animate-float animation-delay-2000 will-change-transform"></div>
      <div class="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-sky-200/40 rounded-full blur-[100px] mix-blend-multiply animate-float animation-delay-4000 will-change-transform"></div>
      <div class="absolute inset-0 bg-noise opacity-[0.03]"></div>
    </div>

    <!--
      ========================================
      顶部导航栏 (Header)
      - 手机端: 只显示 Logo 和头像
      - PC端 (md:): 显示 搜索框、按钮组、完整菜单
      ========================================
    -->
    <nav class="fixed top-0 w-full z-50 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center bg-white/60 backdrop-blur-md border-b border-white/30 transition-all duration-300">
      <!-- Logo: 永远显示 -->
      <div class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--gradient-from)] to-[var(--gradient-to)] flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--color-primary-500)]/20">Q</span>
        <div class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">Qingyu</div>
      </div>

      <!-- PC端菜单: 手机端隐藏 (hidden), 平板以上显示 (md:flex) -->
      <div class="hidden md:flex space-x-3">
        <button class="nav-btn group" aria-label="Search">
           <svg class="w-5 h-5 text-slate-600 group-hover:text-[var(--color-primary-600)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
        <button class="nav-btn group" aria-label="Notifications">
           <svg class="w-5 h-5 text-slate-600 group-hover:text-[var(--color-primary-600)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </button>
        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--color-secondary-400)] to-[var(--color-primary-300)] p-[2px] cursor-pointer">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" class="w-full h-full rounded-full bg-white" alt="Avatar" />
        </div>
      </div>

      <!-- 手机端头像: 放在右上角 -->
      <div class="md:hidden">
        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--color-secondary-400)] to-[var(--color-primary-300)] p-[2px] cursor-pointer">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" class="w-full h-full rounded-full bg-white" alt="Avatar" />
        </div>
      </div>
    </nav>

    <!-- 底部导航栏 -->
    <div class="fixed z-50 transition-all duration-300 bottom-0 left-0 w-full md:bottom-8 md:left-1/2 md:w-auto md:-translate-x-1/2">
      <!-- 容器背景 -->
      <div class="flex items-center justify-around md:justify-center md:gap-2 px-3 py-3 md:py-4 bg-white/80 backdrop-blur-2xl border-t md:border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5 md:rounded-full safe-area-bottom">

        <!-- 按钮 1: 首页 (激活状态示例) -->
        <button class="dock-btn active text-[var(--color-primary-600)] bg-[var(--color-primary-100)]">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="text-[10px] md:hidden mt-1 font-medium">首页</span>
        </button>

        <!-- 按钮 2: 书架 -->
        <button class="dock-btn text-slate-500 hover:text-slate-900 hover:bg-slate-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span class="text-[10px] md:hidden mt-1 font-medium">书架</span>
        </button>

        <!-- 按钮 3: 发现 (中间按钮 - 特殊放大样式) -->
        <button class="dock-btn dock-btn-highlight text-[var(--color-primary-600)] bg-[var(--color-primary-100)] relative">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span class="text-[10px] md:hidden mt-1 font-medium">发现</span>
        </button>

        <!-- 按钮 4: 我的 -->
        <button class="dock-btn text-slate-500 hover:text-slate-900 hover:bg-slate-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-[10px] md:hidden mt-1 font-medium">我的</span>
        </button>

        <!-- PC端独有按钮：设置 -->
        <button class="dock-btn hidden md:block text-slate-500 hover:text-slate-900 hover:bg-slate-100" aria-label="Settings">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

      </div>
    </div>

    <!-- 主内容区域 -->
    <main class="relative z-10 pt-24 pb-24 md:pb-10 px-4 max-w-7xl mx-auto space-y-10">
      <!-- Hero (保持原样) -->
      <div class="relative w-full rounded-[2rem] overflow-hidden bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl shadow-[var(--color-primary-500)]/5 group transition-all hover:shadow-2xl hover:shadow-[var(--color-primary-500)]/10 duration-500">
         <div class="absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-br from-[var(--color-primary-200)]/30 to-[var(--color-secondary-200)]/30 blur-3xl rounded-full pointer-events-none"></div>
         <div class="relative z-10 flex flex-col md:flex-row items-center p-8 md:p-12 gap-8 md:gap-16">
            <div class="book-3d-container flex-shrink-0">
               <div class="book-3d w-[160px] h-[240px] md:w-[180px] md:h-[270px]">
                 <div class="relative w-full h-full transform-style-3d">
                   <div class="hero-book-back"></div>
                   <div class="hero-book-spine"></div>
                   <div class="hero-book-pages"></div>
                   <img class="hero-book-cover" src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop" loading="eager" alt="Hero Book" />
                 </div>
               </div>
            </div>
            <div class="flex-1 text-center md:text-left space-y-6">
               <h1 class="text-4xl md:text-5xl font-bold text-slate-800">
                 探索 <span class="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)]">未知世界</span>
               </h1>
               <p class="text-slate-500 text-lg">高性能渲染与丝滑交互体验的完美结合。</p>
            </div>
         </div>
      </div>

      <!-- 主题切换器 -->
      <div class="flex justify-center">
        <div class="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl px-6 py-4 shadow-sm">
          <ThemeSwitcher />
        </div>
      </div>

      <!-- 主题色示例（使用 CSS 变量，展示主题切换效果） -->
      <div class="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-4">主题色示例</h3>
        <div class="flex flex-wrap gap-4">
          <!-- 主色按钮 -->
          <button class="px-4 py-2 rounded-lg text-white font-medium transition-all" :style="{ backgroundColor: 'var(--color-primary-600)' }">
            主按钮
          </button>
          <!-- 辅助色按钮 -->
          <button class="px-4 py-2 rounded-lg text-white font-medium transition-all" :style="{ backgroundColor: 'var(--color-secondary-600)' }">
            辅助按钮
          </button>
          <!-- 渐变背景 -->
          <div class="px-4 py-2 rounded-lg text-white font-medium transition-all" :style="{ backgroundImage: 'linear-gradient(to right, var(--gradient-from), var(--gradient-to))' }">
            渐变按钮
          </div>
          <!-- 渐变边框 -->
          <div class="px-4 py-2 rounded-lg font-medium border-2 transition-all" :style="{ borderColor: 'var(--color-primary-600)', color: 'var(--color-primary-600)' }">
            边框按钮
          </div>
        </div>
      </div>

      <!-- 分类筛选 (保持原样) -->
      <div class="flex justify-center">
        <div class="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl px-6 py-4 shadow-sm">
          <ThemeSwitcher />
        </div>
      </div>

      <!-- 分类筛选 (保持原样) -->
      <div class="flex items-center space-x-2 overflow-x-auto py-2 no-scrollbar touch-pan-x">
        <button v-for="cat in CATEGORIES" :key="cat.id" @click="selectCategory(cat.id)"
          class="flex-shrink-0 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border"
          :class="activeCategory === cat.id ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' : 'bg-white/50 backdrop-blur-sm border-white/60 text-slate-500 hover:bg-white hover:text-slate-800'">
          {{ cat.name }}
        </button>
      </div>

      <!-- 书籍列表 -->
      <div>
        <div class="flex justify-between items-end mb-8 px-2">
          <h2 class="text-2xl font-bold text-slate-800">热门书籍</h2>
          <div class="text-sm text-slate-500 font-medium">已加载 {{ booksBuffer.length }} 本</div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 gap-y-12">
          <!--
             [修复2]：移除了 auto-content-visibility
             auto-content-visibility 会应用 contain: paint，导致 3D 书籍上浮时被裁切。
             添加了 pt-8 (padding-top) 为上浮动画预留空间。
          -->
          <div
            v-for="book in booksBuffer"
            :key="book.id"
            class="flex flex-col group cursor-pointer perspective-container pt-8"
          >
            <!-- 增加 z-index 确保 hover 时遮盖其他内容 -->
            <div class="book-container self-center mb-6 relative" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
              <div class="book-wrapper">
                <div class="book-image-wrapper">
                  <div class="book-back"></div>
                  <!-- [修复1]：书脊样式修正 -->
                  <div class="book-spine"></div>
                  <div class="book-pages"></div>
                  <div class="book-pages-top"></div>
                  <div class="book-pages-bottom"></div>

                  <img
                    :src="book.cover"
                    class="book-cover"
                    loading="lazy"
                    decoding="async"
                    width="140"
                    height="210"
                    alt=""
                  />
                </div>
              </div>
              <div class="shadow-blob absolute -bottom-4 left-1/2 w-[80%] h-4 bg-black/20 rounded-full"></div>
            </div>

            <div class="text-center space-y-1 px-2">
              <h3 class="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-[var(--color-primary-700)] transition-colors">{{ book.title }}</h3>
              <p class="text-sm text-slate-400">{{ book.author }}</p>
              <div class="flex items-center justify-center gap-1 mt-2">
                 <span class="text-yellow-400">★</span>
                 <span class="text-xs font-semibold text-slate-600 pt-0.5">{{ book.rating }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div ref="sentinel" class="h-24 flex items-center justify-center mt-8">
           <div v-if="loading" class="flex gap-2">
             <div class="w-2 h-2 bg-[var(--color-primary-500)] rounded-full animate-bounce"></div>
             <div class="w-2 h-2 bg-[var(--color-primary-500)] rounded-full animate-bounce delay-100"></div>
             <div class="w-2 h-2 bg-[var(--color-primary-500)] rounded-full animate-bounce delay-200"></div>
           </div>
           <div v-else-if="!hasMore" class="text-slate-400 text-sm">—— 到底啦 ——</div>
        </div>
      </div>

      <!-- Feature Cards -->
      <div class="feature-card group">
        <div class="absolute inset-0 overflow-hidden rounded-2xl">
          <div v-for="shape in card1Shapes" :key="shape.id" class="card-shape" :style="{ top: shape.top, left: shape.left, width: shape.width, height: shape.height, background: shape.background, opacity: shape.opacity }"></div>
        </div>
        <div class="feature-card-content">
          <div class="icon-box bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div><h3 class="text-lg font-bold text-slate-800">我的书架</h3><p class="text-sm text-slate-500 mt-1">管理你的藏书</p></div>
        </div>
      </div>
    </main>

    <!-- 主题预览按钮 -->
    <button
      @click="showThemePreview = true"
      class="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--gradient-from)] to-[var(--gradient-to)] shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200"
    >
      <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    </button>

    <!-- 主题预览对话框 -->
    <div
      v-if="showThemePreview"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="showThemePreview = false"
    >
      <div class="max-w-4xl rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-800">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">
            选择主题
          </h2>
          <button
            @click="showThemePreview = false"
            class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <svg class="h-6 w-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ThemePreview :show-apply-button="true" layout="grid" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/style.css";

/* ========================================
  1. 核心工具类
  ======================================== */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* ========================================
  2. iPhone 安全区域适配
  ========================================
  适配 iPhone X+ 底部手势条 (Home Indicator)
  使用 env() 函数读取系统提供的安全区域 insets
  ======================================== */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* ========================================
  3. 底部导航按钮样式 (使用您提供的简洁优雅样式)
  ======================================== */
.dock-btn {
  @apply flex flex-col items-center justify-center;
  @apply p-3 rounded-2xl transition-all duration-300;
  @apply hover:scale-105;
  position: relative;
  transform: translateY(-8px);  /* 让图标略微上浮在胶囊上方 */
}

@media (min-width: 768px) {
  .dock-btn {
    flex-direction: row;
  }
}

/* 普通按钮悬停 - 上浮效果 */
.dock-btn:hover {
  transform: translateY(-16px) scale(1.05);  /* 悬停时上浮到 -16px 并放大 */
}

/* 中间按钮特殊样式 - 放大并突出显示 */
.dock-btn-highlight {
  transform: scale(1.1) translateY(-12px);  /* 放大且上浮更多 */
  box-shadow: 0 4px 20px rgba(var(--color-primary-500-rgb), 0.3);
}

/* 中间按钮悬停时的光晕效果 */
.dock-btn-highlight:hover {
  transform: scale(1.15) translateY(-20px);  /* 悬停时上浮到 -20px */
  box-shadow: 0 6px 30px rgba(var(--color-primary-500-rgb), 0.5);
}

/* 中间按钮点击时的效果 */
.dock-btn-highlight:active {
  transform: scale(1.05) translateY(-12px);  /* 点击时回到默认上浮位置 */
}

/* 激活状态 - 使用语义化颜色变量 */
.dock-btn.active {
  color: rgb(var(--color-primary-600));
  background-color: rgb(var(--color-primary-100));
}

/* 悬停状态 - 使用您提供的样式 */
.dock-btn:not(.active):hover {
  @apply text-slate-900 bg-slate-100;
}

/* ========================================
  4. 背景纹理和动画
  ======================================== */

.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
}

@keyframes float {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

.animate-float { animation: float 7s ease-in-out infinite; will-change: transform; }
.will-change-transform { will-change: transform; }
.backface-hidden { backface-visibility: hidden; }

/* ========================================
  5. 组件样式
  ======================================== */
.nav-btn { @apply p-2.5 rounded-xl bg-white/50 border border-white/50 shadow-sm hover:bg-white transition-all duration-300 active:scale-95; }
.feature-card { @apply relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer; }
.feature-card:hover { transform: translateY(-4px); }
.feature-card-content { @apply relative z-10 flex items-center space-x-4; }
.icon-box { @apply w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm; }

.card-shape {
  position: absolute; border-radius: 50%; filter: blur(46px); pointer-events: none; transition: all 1s ease; mix-blend-mode: multiply;
}

/* ========================================
  6. 3D 书籍 - 关键样式
  ======================================== */
.perspective-container { perspective: 1000px; }

.book-container {
  width: 140px;
  aspect-ratio: 2/3;
  z-index: 1;
  --target-rotate: 0deg;
  /* 优化层级过渡，避免闪烁 */
  transition: z-index 0s linear 0.3s;
}

/* Hover 时提升层级，防止被周围元素（文字等）遮挡，但主要裁切问题由 pt-8 和移除 content-visibility 解决 */
.book-container:hover {
  z-index: 50;
  transition-delay: 0s;
}

.book-wrapper {
  width: 100%; height: 100%; position: relative;
  transform-style: preserve-3d;
  will-change: transform;
  /* 慢速回弹 */
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
  transform: rotateY(0deg);
}

.book-container:hover .book-wrapper {
  /* 快速激活 */
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  /*
     translateZ(30px) 让书浮起来
     translateY(-10px) 向上移动
     rotateY 根据鼠标方向
  */
  transform: rotateY(var(--target-rotate)) rotateX(5deg) translateZ(30px) translateY(-10px);
}

.book-image-wrapper { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; border-radius: 4px; }

/*
  [3D 盒模型参数修正]
  假设书本厚度为 24px。
  封面在 Z=12px，封底在 Z=-12px。
*/
.book-cover {
  width: 100%; height: 100%; object-fit: cover; border-radius: 4px 6px 6px 4px;
  position: absolute;
  transform: translateZ(12px); /* 前移 12px */
  box-shadow: inset 4px 0 10px rgba(0,0,0,0.1);
}

.book-back {
  position: absolute; width: 100%; height: 100%;
  transform: translateZ(-12px); /* 后移 12px */
  background: #334155; border-radius: 4px 6px 6px 4px;
}

/*
  [修复重点] 书脊 (Spine)
  位置：左侧 (left: 0)
  宽度：24px (等于前后 Z 轴距离之和 12+12)
  变换：
    rotateY(-90deg) -> 此时面朝左
    transform-origin: left -> 以左边缘为轴旋转
    或者 transform: rotateY(-90deg) translateX(-12px) 调整中心

  这里使用更直观的方法：
  让书脊依附在封面的左边缘。
  transform-origin: right center (右边缘即连接封面的边缘)
  rotateY(-90deg) (向左折)
  left: -24px (宽度)
  这样书脊的右边贴着封面的左边。
*/
.book-spine {
  position: absolute;
  top: 0;
  left: -24px; /* 移到左侧外部 */
  width: 24px; /* 厚度 24px */
  height: 100%;
  transform-origin: right; /* 以右侧为轴 */
  transform: rotateY(-90deg); /* 向后折90度，形成侧边 */
  background: #cbd5e1;
  /* 简单的光影效果 */
  background: linear-gradient(to right, #94a3b8, #e2e8f0 40%, #cbd5e1);
}

/* 书页 (Pages) - 右侧 */
.book-pages {
  position: absolute;
  right: 2px; /* 稍微内收 */
  top: 2px;
  width: 22px; /* 略小于厚度 */
  height: calc(100% - 4px);
  transform: rotateY(90deg) translateZ(-11px); /* 修正坐标 */
  background: #fff;
}

/* 书页顶部和底部，补齐空洞 */
.book-pages-top {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 22px;
  transform: rotateX(90deg) translateZ(10px) scaleX(0.95);
  background: #f1f5f9;
}
.book-pages-bottom {
  position: absolute; bottom: 0; left: 0;
  width: 100%; height: 22px;
  transform: rotateX(-90deg) translateZ(10px) scaleX(0.95);
  background: #f1f5f9;
}

.shadow-blob {
  transform: translateX(-50%) scale(0.9);
  opacity: .2; filter: blur(12px);
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease;
}

.book-container:hover .shadow-blob {
  transform: translateX(-50%) scale(1.15);
  opacity: .4;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

/* Hero Book 保持原样 (省略详细样式) */
.hero-book-spine { position: absolute; top: 0; left: 0; width: 30px; height: 100%; transform: rotateY(90deg) translateZ(-15px); background: #e2e8f0; }
</style>
