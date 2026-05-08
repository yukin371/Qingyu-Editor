<script setup lang="ts">
/**
 * 苹果风格组件演示页面
 * 展示 Table、Skeleton、Tabs、Pagination、Timeline 组件的苹果风格设计
 */
import { ref } from 'vue'
import {
  QyAvatar,
  QyBadge,
  QyBookCard,
  QyBookCover,
  QyEmpty,
  Table,
  Tabs,
  TabPane,
  Skeleton,
  Timeline,
  TimelineItem,
} from '@/design-system/components'
import { Tag } from '@/design-system/base'
import QyPagination from '@/design-system/components/data/QyPagination/QyPagination.vue'
import type { Column } from '@/design-system/data/Table/types'

// -----------------------------
// 1. Table 数据和配置
// -----------------------------
interface Book {
  id: number
  title: string
  author: string
  status: 'published' | 'draft' | 'serializing'
  words: number
  revenue: number
  updateTime: string
}

const books = ref<Book[]>([
  {
    id: 1,
    title: '三体',
    author: '刘慈欣',
    status: 'published',
    words: 350000,
    revenue: 128000,
    updateTime: '2024-03-15',
  },
  {
    id: 2,
    title: '活着',
    author: '余华',
    status: 'published',
    words: 85000,
    revenue: 89000,
    updateTime: '2024-03-14',
  },
  {
    id: 3,
    title: '解忧杂货店',
    author: '东野圭吾',
    status: 'serializing',
    words: 156000,
    revenue: 65000,
    updateTime: '2024-03-16',
  },
  {
    id: 4,
    title: '百年孤独',
    author: '马尔克斯',
    status: 'published',
    words: 268000,
    revenue: 52000,
    updateTime: '2024-03-12',
  },
  {
    id: 5,
    title: '恶意',
    author: '东野圭吾',
    status: 'draft',
    words: 98000,
    revenue: 0,
    updateTime: '2024-03-10',
  },
  {
    id: 6,
    title: '白夜行',
    author: '东野圭吾',
    status: 'published',
    words: 285000,
    revenue: 156000,
    updateTime: '2024-03-15',
  },
  {
    id: 7,
    title: '嫌疑人X的献身',
    author: '东野圭吾',
    status: 'published',
    words: 168000,
    revenue: 78000,
    updateTime: '2024-03-14',
  },
])

const tableColumns: Column[] = [
  { prop: 'id', label: 'ID', width: 60, align: 'center' },
  { prop: 'title', label: '书名', minWidth: 150, sortable: true },
  { prop: 'author', label: '作者', width: 100 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    align: 'center',
    render: (row: Record<string, any>) => {
      const book = row as Book
      const statusMap = {
        published: { text: '已发布', class: 'bg-green-100 text-green-700' },
        serializing: { text: '连载中', class: 'bg-blue-100 text-blue-700' },
        draft: { text: '草稿', class: 'bg-gray-100 text-gray-600' },
      }
      const status = statusMap[book.status]
      return `<span class="px-2 py-0.5 rounded-full text-xs font-medium ${status.class}">${status.text}</span>`
    },
  },
  { prop: 'words', label: '字数', width: 100, align: 'right', sortable: true },
  { prop: 'revenue', label: '收益', width: 100, align: 'right', sortable: true },
  { prop: 'updateTime', label: '更新时间', width: 120 },
]

// Table 分页
const tableCurrentPage = ref(1)
const tablePageSize = ref(5)
const paginatedBooks = ref<Book[]>([])

const updateTableData = () => {
  const start = (tableCurrentPage.value - 1) * tablePageSize.value
  const end = start + tablePageSize.value
  paginatedBooks.value = books.value.slice(start, end)
}

updateTableData()

const handleTablePageChange = (page: number, size: number) => {
  tableCurrentPage.value = page
  tablePageSize.value = size
  updateTableData()
}

// Table 排序回调
const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  if (!order) {
    updateTableData()
    return
  }
  const sorted = [...books.value].sort((a, b) => {
    const aVal = a[prop as keyof Book]
    const bVal = b[prop as keyof Book]
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'ascending' ? aVal - bVal : bVal - aVal
    }
    return order === 'ascending'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })
  books.value = sorted
  updateTableData()
}

// -----------------------------
// 2. Tabs 数据（每个 Tabs 类型独立状态）
// -----------------------------
const lineTab = ref('home')
const cardTab = ref('info')
const borderCardTab = ref('notifications')

// -----------------------------
// 3. Skeleton 数据
// -----------------------------
const skeletonLoading = ref(true)
const skeletonItems = ref([1, 2, 3, 4, 5])

const toggleSkeleton = () => {
  skeletonLoading.value = !skeletonLoading.value
}

// -----------------------------
// 4. Pagination 数据
// -----------------------------
const paginationCurrentPage = ref(1)
const paginationTotal = ref(100)
const paginationPageSize = ref(10)

const handlePageChange = (page: number, size: number) => {
  paginationCurrentPage.value = page
  paginationPageSize.value = size
}

const handleEmptyAction = () => {
  alert('引导用户执行操作')
}

// -----------------------------
// 5. 卡片阴影样式
// -----------------------------
const cardBase = 'bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm'

const highlightTags = ['Signals', 'Material calm', 'Apple sheen']

const showcaseBook = {
  title: 'Platform Visual Guide',
  author: 'Qingyu Visuals',
  cover:
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80',
  description: 'A handbook that proves the new components feel alive.',
  rating: 4.7,
  tags: ['Surface', 'Focus', 'Space'],
  readProgress: 58,
  status: 'planned',
}

const showcaseCover = {
  src: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  title: 'Composed Stack',
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 py-10 px-4">
    <div class="max-w-6xl mx-auto space-y-10">
      <!-- 页面标题 -->
      <div class="text-center space-y-3">
        <h1 class="text-3xl font-bold text-slate-800">苹果风格组件演示</h1>
        <p class="text-slate-500">
          Qy Design System - Table · Skeleton · Tabs · Pagination · Timeline
        </p>
      </div>

      <!-- ================================
           1. Table 演示
           ================================ -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <h2 class="text-xl font-bold text-slate-800">Table 表格</h2>
          <span class="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full"
            >数据展示</span
          >
        </div>

        <div :class="cardBase + ' p-6'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-slate-700">作品列表</h3>
            <span class="text-sm text-slate-400">共 {{ books.length }} 部作品</span>
          </div>

          <!-- Table 组件 -->
          <Table
            :data="paginatedBooks"
            :columns="tableColumns"
            :border="true"
            :stripe="true"
            size="md"
            @sort-change="handleSortChange"
          />

          <!-- Table Pagination -->
          <div class="mt-4 flex justify-end">
            <QyPagination
              v-model="tableCurrentPage"
              :total="books.length"
              :page-size="tablePageSize"
              :page-sizes="[5, 10, 20]"
              :layout="['prev', 'pager', 'next']"
              :show-total="true"
              @change="handleTablePageChange as any"
            />
          </div>
        </div>
      </section>

      <!-- ================================
           2. Skeleton 演示
           ================================ -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
          <h2 class="text-xl font-bold text-slate-800">Skeleton 骨架屏</h2>
          <span class="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-medium rounded-full"
            >加载占位</span
          >
        </div>

        <div :class="cardBase + ' p-6'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-slate-700">文章列表</h3>
            <button
              @click="toggleSkeleton"
              class="px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              {{ skeletonLoading ? '显示内容' : '显示骨架' }}
            </button>
          </div>

          <!-- 骨架屏 / 内容切换 -->
          <div class="space-y-4">
            <template v-if="skeletonLoading">
              <div v-for="item in skeletonItems" :key="item" class="flex gap-4">
                <Skeleton type="rect" class="w-16 h-16 rounded-xl" />
                <div class="flex-1 space-y-2">
                  <Skeleton type="text" class="h-4 w-3/4" />
                  <Skeleton type="text" class="h-3 w-1/2" />
                </div>
              </div>
            </template>
            <template v-else>
              <div
                v-for="item in skeletonItems"
                :key="item"
                class="flex gap-4 items-center p-3 bg-slate-50 rounded-xl"
              >
                <div
                  class="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold"
                >
                  {{ item }}
                </div>
                <div>
                  <p class="font-medium text-slate-800">文章标题 {{ item }}</p>
                  <p class="text-sm text-slate-500">这是一篇示例文章的描述内容</p>
                </div>
              </div>
            </template>
          </div>

          <!-- 更多 Skeleton 类型展示 -->
          <div class="mt-8">
            <h4 class="font-medium text-slate-700 mb-4">骨架屏类型</h4>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div class="flex flex-col items-center gap-2">
                <Skeleton type="text" class="w-20 h-4" />
                <Skeleton type="circle" class="w-12 h-12" />
                <span class="text-xs text-slate-500">circle</span>
              </div>
              <div class="flex flex-col items-center gap-2">
                <Skeleton type="text" class="w-20 h-4" />
                <Skeleton type="rect" class="w-12 h-12 rounded-xl" />
                <span class="text-xs text-slate-500">rect</span>
              </div>
              <div class="flex flex-col items-center gap-2">
                <Skeleton type="text" class="w-20 h-4" />
                <Skeleton type="avatar" class="w-12 h-12" />
                <span class="text-xs text-slate-500">avatar</span>
              </div>
              <div class="flex flex-col items-center gap-2">
                <Skeleton type="text" class="w-20 h-4" />
                <Skeleton type="image" class="w-12 h-12" />
                <span class="text-xs text-slate-500">image</span>
              </div>
              <div class="flex flex-col items-center gap-2">
                <Skeleton type="text" class="w-20 h-4" />
                <Skeleton type="text" class="w-full h-4" />
                <Skeleton type="text" class="w-3/4 h-4" />
                <span class="text-xs text-slate-500">text</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================
           3. Tabs 演示
           ================================ -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
          <h2 class="text-xl font-bold text-slate-800">Tabs 标签页</h2>
          <span class="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full"
            >内容切换</span
          >
        </div>

        <div :class="cardBase + ' p-6'">
          <h3 class="font-semibold text-slate-700 mb-4">标签页样式</h3>

          <!-- 演示区域 -->
          <div class="space-y-10">
            <!-- Line Tabs -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">line 类型</span> —
                底部线条指示器，最简洁的风格
              </p>
              <Tabs v-model="lineTab" type="line">
                <TabPane name="home" title="首页">
                  <div class="py-6 text-center">
                    <svg
                      class="w-12 h-12 mx-auto mb-3 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <p class="text-slate-600">这是首页内容区域</p>
                  </div>
                </TabPane>
                <TabPane name="profile" title="个人中心">
                  <div class="py-6 text-center">
                    <svg
                      class="w-12 h-12 mx-auto mb-3 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <p class="text-slate-600">这是个人中心内容区域</p>
                  </div>
                </TabPane>
                <TabPane name="settings" title="设置">
                  <div class="py-6 text-center">
                    <svg
                      class="w-12 h-12 mx-auto mb-3 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p class="text-slate-600">这是设置内容区域</p>
                  </div>
                </TabPane>
              </Tabs>
            </div>

            <!-- Card Tabs -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">card 类型</span> — 卡片式标签，圆角背景容器
              </p>
              <Tabs v-model="cardTab" type="card">
                <TabPane name="info" title="基本信息">
                  <div class="py-4 space-y-3">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold"
                      >
                        U
                      </div>
                      <div>
                        <p class="font-medium text-slate-800">用户名</p>
                        <p class="text-sm text-slate-500">reader_2024</p>
                      </div>
                    </div>
                    <div class="pt-2 border-t border-slate-100">
                      <p class="text-sm text-slate-600">注册时间：2024-01-15</p>
                      <p class="text-sm text-slate-600">会员状态：VIP会员</p>
                    </div>
                  </div>
                </TabPane>
                <TabPane name="stats" title="数据统计">
                  <div class="py-4 space-y-2">
                    <div class="flex justify-between items-center py-2 border-b border-slate-50">
                      <span class="text-slate-600">阅读时长</span>
                      <span class="font-medium text-slate-800">128 小时</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-slate-50">
                      <span class="text-slate-600">阅读书籍</span>
                      <span class="font-medium text-slate-800">24 本</span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                      <span class="text-slate-600">发表评论</span>
                      <span class="font-medium text-slate-800">16 条</span>
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </div>

            <!-- Border Card Tabs -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">border-card 类型</span> —
                边框卡片，带阴影的整块面板
              </p>
              <Tabs v-model="borderCardTab" type="border-card">
                <TabPane name="notifications" title="通知">
                  <div class="py-4 space-y-3">
                    <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <svg
                        class="w-5 h-5 text-blue-500 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p class="font-medium text-slate-800 text-sm">作品更新提醒</p>
                        <p class="text-xs text-slate-500 mt-1">《三体》已更新新章节</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <svg
                        class="w-5 h-5 text-green-500 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <div>
                        <p class="font-medium text-slate-800 text-sm">收到新评论</p>
                        <p class="text-xs text-slate-500 mt-1">读者A 评论了你的作品</p>
                      </div>
                    </div>
                  </div>
                </TabPane>
                <TabPane name="security" title="安全">
                  <div class="py-4 space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-slate-800">登录密码</p>
                        <p class="text-sm text-slate-500">上次修改：30 天前</p>
                      </div>
                      <button
                        class="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        修改
                      </button>
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-medium text-slate-800">两步验证</p>
                        <p class="text-sm text-slate-500">未开启</p>
                      </div>
                      <button
                        class="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        开启
                      </button>
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================
           4. Pagination 演示
           ================================ -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
          <h2 class="text-xl font-bold text-slate-800">Pagination 分页</h2>
          <span class="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full"
            >数据导航</span
          >
        </div>

        <div :class="cardBase + ' p-6'">
          <h3 class="font-semibold text-slate-700 mb-4">分页样式</h3>

          <div class="space-y-8">
            <!-- 基础分页 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">基础分页</p>
              <div class="flex justify-center">
                <QyPagination
                  v-model="paginationCurrentPage"
                  :total="paginationTotal"
                  :page-size="paginationPageSize"
                />
              </div>
            </div>

            <!-- 带背景色的分页 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">带背景色</p>
              <div class="flex justify-center">
                <QyPagination
                  v-model="paginationCurrentPage"
                  :total="paginationTotal"
                  :page-size="paginationPageSize"
                  :background="true"
                />
              </div>
            </div>

            <!-- 带总数和快速跳转 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">带总数和快速跳转</p>
              <div class="flex justify-center">
                <QyPagination
                  v-model="paginationCurrentPage"
                  :total="paginationTotal"
                  :page-size="paginationPageSize"
                  :show-total="true"
                  :show-quick-jumper="true"
                />
              </div>
            </div>

            <!-- 小尺寸分页 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">小尺寸</p>
              <div class="flex justify-center">
                <QyPagination
                  v-model="paginationCurrentPage"
                  :total="paginationTotal"
                  :page-size="paginationPageSize"
                  :small="true"
                />
              </div>
            </div>

            <!-- 自定义每页条数 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">自定义每页条数</p>
              <div class="flex justify-center">
                <QyPagination
                  v-model="paginationCurrentPage"
                  :total="paginationTotal"
                  :page-size="paginationPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :show-total="true"
                  @change="handlePageChange as any"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================
           5. Empty 空状态演示
           ================================ -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
          <h2 class="text-xl font-bold text-slate-800">Empty 空状态</h2>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
            >占位提示</span
          >
        </div>

        <div :class="cardBase + ' p-6'">
          <h3 class="font-semibold text-slate-700 mb-6">空状态样式</h3>

          <div class="space-y-8">
            <!-- 空状态尺寸 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">空状态尺寸</span> — 适应不同容器大小
              </p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- 小尺寸 -->
                <div class="border border-slate-200 rounded-xl p-4">
                  <p class="text-xs text-slate-400 mb-3 text-center">small</p>
                  <QyEmpty title="暂无数据" description="列表为空" icon-size="small" />
                </div>
                <!-- 中尺寸 -->
                <div class="border border-slate-200 rounded-xl p-4">
                  <p class="text-xs text-slate-400 mb-3 text-center">medium (默认)</p>
                  <QyEmpty title="暂无章节" description="请先创建章节" icon-size="medium" />
                </div>
                <!-- 大尺寸 -->
                <div class="border border-slate-200 rounded-xl p-4">
                  <p class="text-xs text-slate-400 mb-3 text-center">large</p>
                  <QyEmpty title="暂无内容" description="当前没有可展示的内容" icon-size="large" />
                </div>
              </div>
            </div>

            <!-- 带操作按钮 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">带操作按钮</span> — 提供引导操作
              </p>
              <div class="flex justify-center">
                <QyEmpty
                  title="暂无收藏"
                  description="去发现感兴趣的内容吧"
                  action-text="探索内容"
                  icon-size="medium"
                  @action="handleEmptyAction"
                />
              </div>
            </div>

            <!-- 自定义图标 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">自定义图标</span> — 通过 slot 传入
              </p>
              <div class="flex justify-center">
                <QyEmpty icon-size="medium">
                  <template #icon>
                    <svg
                      class="w-16 h-16 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </template>
                  <template #title>暂无任务</template>
                  <template #description>创建一个新任务开始吧</template>
                </QyEmpty>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================
           7. Identity showcase
           ================================ -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
          <h2 class="text-xl font-bold text-slate-800">Identity Showcase</h2>
          <span class="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-full"
            >Badge · Tag · Avatar · Book · Empty</span
          >
        </div>

        <div :class="cardBase + ' p-6 showcase-card'">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <QyBadge type="text" text="Live tokens" color="success" />
            <Tag variant="info">Momentum</Tag>
            <Tag variant="primary" effect="plain">Calm</Tag>
            <div class="flex items-center gap-3 ml-auto">
              <QyAvatar type="text" text="DS" size="sm" />
              <QyAvatar type="text" text="UI" size="sm" />
              <QyAvatar type="text" text="+4" size="sm" color="purple" />
            </div>
          </div>

          <div class="showcase-grid">
            <QyBookCard
              :title="showcaseBook.title"
              :author="showcaseBook.author"
              :cover="showcaseBook.cover"
              :description="showcaseBook.description"
              :rating="showcaseBook.rating"
              :tags="showcaseBook.tags"
              :read-progress="showcaseBook.readProgress"
              status="planned"
            />

            <div class="showcase-sidebar">
              <QyBookCover :src="showcaseCover.src" :title="showcaseCover.title" size="md" />
              <div class="showcase-tags">
                <Tag v-for="tag in highlightTags" :key="tag" size="sm" variant="info">
                  {{ tag }}
                </Tag>
              </div>
              <QyEmpty
                title="Calm Surface"
                description="No urgent tasks clutter the layout."
                icon-size="medium"
                action-text="Update status"
                @action="handleEmptyAction"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- ================================
           6. Timeline 时间线演示
           ================================ -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-gradient-to-b from-violet-500 to-violet-600 rounded-full"></div>
          <h2 class="text-xl font-bold text-slate-800">Timeline 时间线</h2>
          <span class="px-2 py-0.5 bg-violet-100 text-violet-600 text-xs font-medium rounded-full"
            >流程展示</span
          >
        </div>

        <div :class="cardBase + ' p-6'">
          <div class="space-y-10">
            <!-- 基础时间线 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">基础时间线</span> — 左侧排列
              </p>
              <Timeline class="max-w-lg">
                <TimelineItem
                  type="success"
                  timestamp="2026-04-06 10:00"
                  title="Phase 1 启动"
                  description="编辑器 V3 Phase 1 核心闭环开发"
                >
                </TimelineItem>
                <TimelineItem
                  type="primary"
                  timestamp="2026-04-06 14:00"
                  title="完成骨架"
                  description="后端 Indexer + Projection 骨架完成"
                >
                </TimelineItem>
                <TimelineItem
                  type="warning"
                  timestamp="2026-04-06 18:00"
                  title="前端接线"
                  description="API URL 修正与 composable 接管"
                >
                </TimelineItem>
              </Timeline>
            </div>

            <!-- 不同颜色节点 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">节点颜色</span> — primary / success /
                warning / danger / info
              </p>
              <Timeline class="max-w-lg">
                <TimelineItem
                  type="primary"
                  title="主要事件"
                  description="蓝色节点，重要里程碑"
                ></TimelineItem>
                <TimelineItem
                  type="success"
                  title="成功完成"
                  description="绿色节点，正面状态"
                ></TimelineItem>
                <TimelineItem
                  type="warning"
                  title="注意提醒"
                  description="黄色节点，需要关注"
                ></TimelineItem>
                <TimelineItem
                  type="danger"
                  title="错误或失败"
                  description="红色节点，危险状态"
                ></TimelineItem>
                <TimelineItem
                  type="info"
                  title="普通信息"
                  description="灰色节点，一般信息"
                ></TimelineItem>
              </Timeline>
            </div>

            <!-- 空心节点 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">空心节点</span> — hollow 属性
              </p>
              <Timeline class="max-w-lg">
                <TimelineItem
                  type="success"
                  hollow
                  title="已完成"
                  description="第一个里程碑已完成"
                ></TimelineItem>
                <TimelineItem
                  type="primary"
                  hollow
                  title="进行中"
                  description="第二个里程碑进行中"
                ></TimelineItem>
                <TimelineItem
                  type="warning"
                  hollow
                  title="待开始"
                  description="第三个里程碑尚未开始"
                ></TimelineItem>
              </Timeline>
            </div>

            <!-- Pending 状态 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">进行中状态</span> — pending 属性闪烁
              </p>
              <Timeline class="max-w-lg">
                <TimelineItem
                  type="success"
                  title="已完成"
                  description="第一步已经完成"
                ></TimelineItem>
                <TimelineItem
                  type="success"
                  title="已完成"
                  description="第二步也已经完成"
                ></TimelineItem>
                <TimelineItem
                  type="primary"
                  pending
                  title="进行中"
                  description="当前正在进行的步骤"
                ></TimelineItem>
                <TimelineItem
                  type="info"
                  hollow
                  title="待开始"
                  description="尚未开始的步骤"
                ></TimelineItem>
              </Timeline>
            </div>

            <!-- 横向时间线 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">横向时间线</span> —
                横向节点轨道，适合阶段与版本演进
              </p>
              <Timeline orientation="horizontal" class="w-full max-w-full">
                <TimelineItem
                  type="primary"
                  timestamp="Q1 2026"
                  title="Token 基建"
                  description="定义基础色阶、线条、圆角与浮层关系，稳定组件视觉底盘。"
                ></TimelineItem>
                <TimelineItem
                  type="success"
                  timestamp="Q2 2026"
                  title="表单组件"
                  description="按钮、输入框、选择器完成苹果感与 Material 秩序感的平衡。"
                ></TimelineItem>
                <TimelineItem
                  type="warning"
                  timestamp="Q3 2026"
                  title="DemoHub 接入"
                  description="基础组件接入 DemoHub，对外形成可比对、可测试的演示入口。"
                ></TimelineItem>
                <TimelineItem
                  type="danger"
                  timestamp="Q4 2026"
                  title="替代准备"
                  description="为平台逐步替换 Element 组件提供稳定的视觉和交互样板。"
                ></TimelineItem>
              </Timeline>
            </div>

            <!-- 交替排列 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">交替排列</span> — 左右交替，节点居中
              </p>
              <Timeline placement="alternate" class="max-w-2xl">
                <TimelineItem
                  type="primary"
                  timestamp="2026-04-06"
                  title="LOREM IPSUM DOLOR"
                  description="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque, facilis quo maiores magnam modi ab libero praesentium blanditiis."
                >
                  <template #icon>
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M10.828 3.842a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm-2.005.448a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"
                      />
                    </svg>
                  </template>
                </TimelineItem>
                <TimelineItem
                  type="success"
                  timestamp="2026-04-05"
                  title="LOREM IPSUM DOLOR"
                  description="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque, facilis quo. Maiores magnam modi ab libero praesentium blanditiis consequatur aspernatur accusantium maxime molestiae sunt ipsa."
                >
                  <template #icon>
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </template>
                </TimelineItem>
                <TimelineItem
                  type="warning"
                  timestamp="2026-04-04"
                  title="LOREM IPSUM DOLOR"
                  description="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque, facilis quo. Maiores magnam modi ab libero praesentium blanditiis."
                >
                  <template #icon>
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </template>
                </TimelineItem>
                <TimelineItem
                  type="danger"
                  timestamp="2026-04-03"
                  title="LOREM IPSUM DOLOR"
                  description="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque, facilis quo. Maiores magnam modi ab libero praesentium blanditiis consequatur aspernatur accusantium maxime molestiae sunt ipsa."
                >
                  <template #icon>
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </template>
                </TimelineItem>
              </Timeline>
            </div>

            <!-- 大节点 -->
            <div>
              <p class="text-sm text-slate-500 mb-3">
                <span class="font-medium text-slate-700">大节点</span> — size="big" 属性
              </p>
              <Timeline class="max-w-lg">
                <TimelineItem
                  size="big"
                  type="primary"
                  title="重要里程碑"
                  description="这是一个大节点，用于强调重要事件"
                ></TimelineItem>
                <TimelineItem
                  size="big"
                  type="success"
                  title="重大成就"
                  description="大节点配合成功色，表示重大成就"
                ></TimelineItem>
                <TimelineItem
                  size="big"
                  type="warning"
                  hollow
                  title="关键决策点"
                  description="空心大节点，既重要又不喧宾夺主"
                ></TimelineItem>
              </Timeline>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部信息 -->
      <div class="text-center text-sm text-slate-400 py-6">
        <p>Qy Design System · 苹果风格组件演示</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 渐变装饰条 */
.bg-gradient-to-b {
  background-size: 100% 100%;
}

/* 确保内容加载后骨架屏隐藏 */
:deep(.skeleton-enter-active),
:deep(.skeleton-leave-active) {
  transition: opacity 0.3s ease;
}
:deep(.skeleton-enter-from),
:deep(.skeleton-leave-to) {
  opacity: 0;
}

.showcase-card {
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(241, 245, 249, 0.9));
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.18);
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  align-items: start;
}

.showcase-sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.showcase-tags {
  display: flex;
  gap: 6px;
}
</style>
