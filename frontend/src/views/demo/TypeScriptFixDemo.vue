<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              TypeScript 修复验证 Demo
            </h1>
            <p class="text-slate-500 text-sm mt-1">验证已修复的类型定义和组件功能</p>
          </div>
          <div class="flex items-center gap-2">
            <el-tag type="success" size="small">v1.0</el-tag>
            <el-button size="small" @click="refreshData">刷新数据</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex gap-6">
        <!-- Left Navigation -->
        <div class="w-64 flex-shrink-0">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
            <div class="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 class="font-semibold text-slate-700">验证模块</h3>
            </div>
            <div class="max-h-[calc(100vh-200px)] overflow-y-auto">
              <!-- Reader Module -->
              <div class="border-b border-slate-100">
                <button
                  @click="toggleSection('reader')"
                  class="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span class="text-sm font-medium text-slate-600">Reader 模块</span>
                  <el-icon :class="expandedSections.reader ? 'rotate-90' : ''" class="transition-transform">
                    <ArrowRight />
                  </el-icon>
                </button>
                <div v-show="expandedSections.reader" class="pb-2">
                  <button
                    v-for="item in readerItems"
                    :key="item.key"
                    @click="selectDemo(item.key)"
                    :class="[
                      'w-full px-6 py-2 text-sm text-left hover:bg-slate-50 transition-colors flex items-center gap-2',
                      currentDemo === item.key ? 'bg-cyan-50 text-cyan-700 font-medium' : 'text-slate-500'
                    ]"
                  >
                    <span>{{ item.label }}</span>
                    <el-tag v-if="item.fixed" type="success" size="small" effect="plain">已修复</el-tag>
                  </button>
                </div>
              </div>

              <!-- Admin Module -->
              <div class="border-b border-slate-100">
                <button
                  @click="toggleSection('admin')"
                  class="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span class="text-sm font-medium text-slate-600">Admin 模块</span>
                  <el-icon :class="expandedSections.admin ? 'rotate-90' : ''" class="transition-transform">
                    <ArrowRight />
                  </el-icon>
                </button>
                <div v-show="expandedSections.admin" class="pb-2">
                  <button
                    v-for="item in adminItems"
                    :key="item.key"
                    @click="selectDemo(item.key)"
                    :class="[
                      'w-full px-6 py-2 text-sm text-left hover:bg-slate-50 transition-colors flex items-center gap-2',
                      currentDemo === item.key ? 'bg-cyan-50 text-cyan-700 font-medium' : 'text-slate-500'
                    ]"
                  >
                    <span>{{ item.label }}</span>
                    <el-tag v-if="item.fixed" type="success" size="small" effect="plain">已修复</el-tag>
                  </button>
                </div>
              </div>

              <!-- User Module -->
              <div class="border-b border-slate-100">
                <button
                  @click="toggleSection('user')"
                  class="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span class="text-sm font-medium text-slate-600">User 模块</span>
                  <el-icon :class="expandedSections.user ? 'rotate-90' : ''" class="transition-transform">
                    <ArrowRight />
                  </el-icon>
                </button>
                <div v-show="expandedSections.user" class="pb-2">
                  <button
                    v-for="item in userItems"
                    :key="item.key"
                    @click="selectDemo(item.key)"
                    :class="[
                      'w-full px-6 py-2 text-sm text-left hover:bg-slate-50 transition-colors flex items-center gap-2',
                      currentDemo === item.key ? 'bg-cyan-50 text-cyan-700 font-medium' : 'text-slate-500'
                    ]"
                  >
                    <span>{{ item.label }}</span>
                    <el-tag v-if="item.fixed" type="success" size="small" effect="plain">已修复</el-tag>
                  </button>
                </div>
              </div>

              <!-- Writer Module -->
              <div class="border-b border-slate-100">
                <button
                  @click="toggleSection('writer')"
                  class="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span class="text-sm font-medium text-slate-600">Writer 模块</span>
                  <el-icon :class="expandedSections.writer ? 'rotate-90' : ''" class="transition-transform">
                    <ArrowRight />
                  </el-icon>
                </button>
                <div v-show="expandedSections.writer" class="pb-2">
                  <button
                    v-for="item in writerItems"
                    :key="item.key"
                    @click="selectDemo(item.key)"
                    :class="[
                      'w-full px-6 py-2 text-sm text-left hover:bg-slate-50 transition-colors flex items-center gap-2',
                      currentDemo === item.key ? 'bg-cyan-50 text-cyan-700 font-medium' : 'text-slate-500'
                    ]"
                  >
                    <span>{{ item.label }}</span>
                    <el-tag v-if="item.fixed" type="success" size="small" effect="plain">已修复</el-tag>
                  </button>
                </div>
              </div>

              <!-- Format Utilities -->
              <div>
                <button
                  @click="toggleSection('format')"
                  class="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span class="text-sm font-medium text-slate-600">格式化工具</span>
                  <el-icon :class="expandedSections.format ? 'rotate-90' : ''" class="transition-transform">
                    <ArrowRight />
                  </el-icon>
                </button>
                <div v-show="expandedSections.format" class="pb-2">
                  <button
                    v-for="item in formatItems"
                    :key="item.key"
                    @click="selectDemo(item.key)"
                    :class="[
                      'w-full px-6 py-2 text-sm text-left hover:bg-slate-50 transition-colors flex items-center gap-2',
                      currentDemo === item.key ? 'bg-cyan-50 text-cyan-700 font-medium' : 'text-slate-500'
                    ]"
                  >
                    <span>{{ item.label }}</span>
                    <el-tag v-if="item.fixed" type="success" size="small" effect="plain">已修复</el-tag>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="flex-1 min-w-0">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <!-- Demo Content Header -->
            <div class="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 class="text-lg font-semibold text-slate-800">{{ currentDemoTitle }}</h2>
              <p class="text-sm text-slate-500 mt-1">{{ currentDemoDescription }}</p>
            </div>

            <!-- Demo Content Body -->
            <div class="p-6">
              <!-- Comments Demo -->
              <div v-if="currentDemo === 'comments'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div class="bg-slate-50 rounded-lg p-4">
                    <h4 class="font-medium text-slate-700 mb-2">评论统计</h4>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-500">总评论数:</span>
                        <span class="font-medium">{{ mockData.comments.length }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-500">总点赞数:</span>
                        <span class="font-medium">{{ totalLikes }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="bg-slate-50 rounded-lg p-4">
                    <h4 class="font-medium text-slate-700 mb-2">操作</h4>
                    <div class="flex gap-2">
                      <el-button size="small" @click="testMessage">测试消息提示</el-button>
                      <el-button size="small" type="primary" @click="addComment">模拟添加评论</el-button>
                    </div>
                  </div>
                </div>
                <div class="space-y-3">
                  <div
                    v-for="comment in mockData.comments"
                    :key="comment.id"
                    class="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors"
                  >
                    <div class="flex items-start gap-3">
                      <img :src="comment.user.avatar" :alt="comment.user.nickname" class="w-10 h-10 rounded-full object-cover">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-medium text-slate-800">{{ comment.user.nickname }}</span>
                          <span class="text-xs text-slate-400">{{ comment.user.username }}</span>
                          <Tag v-if="comment.user.level" size="sm" variant="info">Lv{{ comment.user.level }}</Tag>
                        </div>
                        <p class="text-slate-600 text-sm mb-2">{{ comment.content }}</p>
                        <div class="flex items-center gap-4 text-xs text-slate-400">
                          <span>{{ formatRelativeTime(comment.createdAt) }}</span>
                          <span class="flex items-center gap-1">
                            <el-icon><ChatDotRound /></el-icon>
                            {{ comment.replyCount }} 回复
                          </span>
                          <span class="flex items-center gap-1">
                            <el-icon><Star /></el-icon>
                            {{ comment.likeCount }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bookshelf Demo -->
              <div v-if="currentDemo === 'bookshelf'" class="space-y-4">
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div
                    v-for="book in mockData.bookshelf"
                    :key="book.id"
                    class="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div class="aspect-[3/4] bg-gradient-to-br from-cyan-100 to-blue-100 relative">
                      <div class="absolute inset-0 flex items-center justify-center">
                        <el-icon :size="40" class="text-cyan-300"><Reading /></el-icon>
                      </div>
                      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <div class="text-white text-xs">
                          {{ Math.round(book.progress) }}%
                        </div>
                        <div class="w-full bg-white/30 rounded-full h-1 mt-1">
                          <div class="bg-white rounded-full h-1" :style="{ width: `${book.progress}%` }"></div>
                        </div>
                      </div>
                    </div>
                    <div class="p-3">
                      <h4 class="font-medium text-slate-800 text-sm truncate">{{ book.book.title }}</h4>
                      <p class="text-xs text-slate-500 mt-1 truncate">{{ book.book.author }}</p>
                      <div class="flex items-center justify-between mt-2 text-xs text-slate-400">
                        <span>{{ formatReadingTime(book.progress * 0.5) }}</span>
                        <span>{{ formatRelativeTime(book.updateTime || '') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Admin Review Demo -->
              <div v-if="currentDemo === 'review'" class="space-y-4">
                <div class="space-y-3">
                  <div
                    v-for="item in mockData.pendingReviews"
                    :key="item.id"
                    class="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <Tag :variant="item.type === 'book' ? 'primary' : item.type === 'chapter' ? 'success' : 'warning'">
                            {{ item.type === 'book' ? '书籍' : item.type === 'chapter' ? '章节' : '评论' }}
                          </Tag>
                          <h4 class="font-medium text-slate-800">{{ item.title }}</h4>
                        </div>
                        <p class="text-sm text-slate-600 mb-2">{{ item.content || '无内容预览' }}</p>
                        <div class="flex items-center gap-4 text-xs text-slate-400">
                          <span>提交者: {{ item.authorName }}</span>
                          <span>提交时间: {{ formatRelativeTime(String(item.submitTime * 1000)) }}</span>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <el-button size="small" type="success">通过</el-button>
                        <el-button size="small" type="danger">拒绝</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Transaction Demo -->
              <div v-if="currentDemo === 'transactions'" class="space-y-4">
                <div class="bg-slate-50 rounded-lg p-4 mb-4">
                  <h4 class="font-medium text-slate-700 mb-3">余额统计</h4>
                  <div class="grid grid-cols-3 gap-4">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-slate-800">¥{{ (mockData.wallet.balance / 100).toFixed(2) }}</div>
                      <div class="text-xs text-slate-500">可用余额</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-orange-500">¥{{ (mockData.wallet.frozenBalance / 100).toFixed(2) }}</div>
                      <div class="text-xs text-slate-500">冻结金额</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-green-500">¥{{ ((mockData.wallet.totalIncome || 0) / 100).toFixed(2) }}</div>
                      <div class="text-xs text-slate-500">总收入</div>
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="tx in mockData.transactions"
                    :key="tx.id"
                    class="bg-slate-50 rounded-lg p-3 hover:bg-slate-100 transition-colors"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <Tag :variant="getTransactionTypeColor(tx.type)" size="sm">
                            {{ getTransactionTypeName(tx.type) }}
                          </Tag>
                          <span class="font-medium text-slate-800 text-sm">{{ tx.description || getTypeDescription(tx.type) }}</span>
                        </div>
                        <div class="text-xs text-slate-400">{{ formatRelativeTime(String(tx.createTime * 1000)) }}</div>
                      </div>
                      <div class="text-right">
                        <div :class="[
                          'font-bold',
                          tx.type === 'recharge' || tx.type === 'income' ? 'text-green-500' : 'text-slate-800'
                        ]">
                          {{ tx.type === 'recharge' || tx.type === 'income' ? '+' : '-' }}¥{{ (tx.amount / 100).toFixed(2) }}
                        </div>
                        <div class="text-xs text-slate-400">余额: ¥{{ (tx.balance / 100).toFixed(2) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Writer Projects Demo -->
              <div v-if="currentDemo === 'projects'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="project in mockData.projects"
                    :key="project.id"
                    class="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors"
                  >
                    <div class="flex items-start gap-4">
                      <div class="w-20 h-28 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <el-icon :size="30" class="text-cyan-400"><Document /></el-icon>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-slate-800 truncate">{{ project.title }}</h4>
                        <p class="text-sm text-slate-500 mt-1 line-clamp-2">{{ project.summary }}</p>
                        <div class="flex items-center gap-2 mt-2">
                          <Tag :variant="getProjectStatusColor(project.status)">
                            {{ getProjectStatusName(project.status) }}
                          </Tag>
                          <span class="text-xs text-slate-400">{{ project.statistics.totalWords }}字</span>
                          <span class="text-xs text-slate-400">{{ project.statistics.chapterCount }}章</span>
                        </div>
                        <div class="text-xs text-slate-400 mt-2">
                          更新于 {{ formatRelativeTime(project.statistics.lastUpdateAt) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Writer Characters Demo -->
              <div v-if="currentDemo === 'characters'" class="space-y-4">
                <div class="bg-slate-50 rounded-lg p-4">
                  <h4 class="font-medium text-slate-700 mb-3">角色关系图（模拟）</h4>
                  <div class="flex flex-wrap gap-3">
                    <div
                      v-for="char in mockData.characters"
                      :key="char.id"
                      class="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-md transition-shadow"
                    >
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                          <span class="text-cyan-600 font-bold">{{ char.name.charAt(0) }}</span>
                        </div>
                        <div>
                          <h5 class="font-medium text-slate-800">{{ char.name }}</h5>
                          <p class="text-xs text-slate-500">{{ char.role || '主角' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Writer Outline Demo -->
              <div v-if="currentDemo === 'outline'" class="space-y-4">
                <div class="bg-slate-50 rounded-lg p-4">
                  <h4 class="font-medium text-slate-700 mb-3">大纲结构</h4>
                  <div class="space-y-2">
                    <div
                      v-for="node in mockData.outlineNodes"
                      :key="node.id"
                      class="bg-white rounded-lg p-3 border border-slate-200"
                      :style="{ marginLeft: `${(node.level || 1) * 16}px` }"
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="font-medium text-slate-800">{{ node.title }}</span>
                          <span v-if="node.wordCount" class="text-xs text-slate-400 ml-2">({{ node.wordCount }}字)</span>
                        </div>
                        <Tag v-if="node.status" size="sm" :variant="node.status === 'completed' ? 'success' : 'info'">
                          {{ node.status === 'completed' ? '已完成' : '进行中' }}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Format Time Demo -->
              <div v-if="currentDemo === 'formatTime'" class="space-y-4">
                <div class="bg-slate-50 rounded-lg p-4">
                  <h4 class="font-medium text-slate-700 mb-3">时间格式化测试</h4>
                  <div class="space-y-3">
                    <div
                      v-for="(item, index) in timeFormatTests"
                      :key="index"
                      class="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200"
                    >
                      <div>
                        <div class="font-medium text-slate-800">{{ item.label }}</div>
                        <div class="text-xs text-slate-400">{{ item.date }}</div>
                      </div>
                      <div class="text-right">
                        <div class="font-medium text-cyan-600">{{ item.formatted }}</div>
                        <div class="text-xs text-slate-400">{{ formatRelativeTime(item.date) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Format Reading Time Demo -->
              <div v-if="currentDemo === 'formatReadingTime'" class="space-y-4">
                <div class="bg-slate-50 rounded-lg p-4">
                  <h4 class="font-medium text-slate-700 mb-3">阅读时长格式化测试</h4>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div
                      v-for="(item, index) in readingTimeTests"
                      :key="index"
                      class="bg-white rounded-lg p-3 border border-slate-200 text-center"
                    >
                      <div class="text-2xl font-bold text-slate-800">{{ item.minutes }}</div>
                      <div class="text-xs text-slate-400 mb-2">分钟</div>
                      <div class="text-sm font-medium text-cyan-600">{{ item.formatted }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- QyTag Demo -->
              <div v-if="currentDemo === 'qyTag'" class="space-y-4">
                <div class="bg-slate-50 rounded-lg p-4">
                  <h4 class="font-medium text-slate-700 mb-3">QyTag 组件测试</h4>
                  <div class="space-y-4">
                    <div>
                      <h5 class="text-sm font-medium text-slate-600 mb-2">不同类型</h5>
                      <div class="flex flex-wrap gap-2">
                        <Tag variant="primary">主要</Tag>
                        <Tag variant="success">成功</Tag>
                        <Tag variant="warning">警告</Tag>
                        <Tag variant="danger">危险</Tag>
                        <Tag variant="info">信息</Tag>
                      </div>
                    </div>
                    <div>
                      <h5 class="text-sm font-medium text-slate-600 mb-2">不同尺寸</h5>
                      <div class="flex flex-wrap gap-2 items-center">
                        <Tag size="lg">大尺寸</Tag>
                        <Tag>默认尺寸</Tag>
                        <Tag size="sm">小尺寸</Tag>
                      </div>
                    </div>
                    <div>
                      <h5 class="text-sm font-medium text-slate-600 mb-2">可关闭</h5>
                      <div class="flex flex-wrap gap-2">
                        <Tag v-for="tag in closableTags" :key="tag" closable @close="removeTag(tag)">
                          {{ tag }}
                        </Tag>
                        <el-button size="small" @click="addTag">添加标签</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Default Welcome -->
              <div v-if="currentDemo === 'welcome'" class="text-center py-12">
                <el-icon :size="80" class="text-slate-300 mb-4"><Files /></el-icon>
                <h3 class="text-xl font-medium text-slate-700 mb-2">欢迎使用 TypeScript 修复验证 Demo</h3>
                <p class="text-slate-500">请从左侧导航选择要验证的功能模块</p>
                <div class="mt-6 flex justify-center gap-4">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-cyan-600">{{ Object.keys(mockData).length }}</div>
                    <div class="text-xs text-slate-400">Mock 数据类型</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">{{ totalFixedItems }}</div>
                    <div class="text-xs text-slate-400">已修复项目</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowRight, ChatDotRound, Star, Reading, Document, Files } from '@element-plus/icons-vue'
import { Tag } from '@/design-system/base'
import { formatRelativeTime, formatReadingTime } from '../../utils/format'
import type { Comment, ShelfBook } from '../../types/reader'
import type { ReviewItem } from '@/modules/admin/types/admin.types'
import type { Transaction, WalletBalance } from '@/modules/user/types/user.types'
import type { Project } from '@/modules/writer/types/project'
import mockDataJson from './mock-data'

// Types for demo
interface Character {
  id: string
  name: string
  role?: string
}

interface OutlineNode {
  id: string
  title: string
  level?: number
  wordCount?: number
  status?: 'completed' | 'in-progress'
}

// Demo data
const expandedSections = ref<Record<string, boolean>>({
  reader: true,
  admin: false,
  user: false,
  writer: false,
  format: false
})

const currentDemo = ref('welcome')
const closableTags = ref(['标签1', '标签2', '标签3'])

const readerItems = [
  { key: 'comments', label: '评论组件', fixed: true },
  { key: 'bookshelf', label: '书架视图', fixed: true }
]

const adminItems = [
  { key: 'review', label: '审核卡片', fixed: true }
]

const userItems = [
  { key: 'transactions', label: '交易记录', fixed: true }
]

const writerItems = [
  { key: 'projects', label: '项目列表', fixed: true },
  { key: 'characters', label: '角色关系图', fixed: true },
  { key: 'outline', label: '大纲视图', fixed: true }
]

const formatItems = [
  { key: 'formatTime', label: '时间格式化', fixed: true },
  { key: 'formatReadingTime', label: '阅读时长', fixed: true },
  { key: 'qyTag', label: 'QyTag组件', fixed: true }
]

// Mock data
const mockData = ref<{
  comments: Comment[]
  bookshelf: ShelfBook[]
  pendingReviews: ReviewItem[]
  transactions: Transaction[]
  wallet: WalletBalance
  projects: Project[]
  characters: Character[]
  outlineNodes: OutlineNode[]
}>({
  comments: [],
  bookshelf: [],
  pendingReviews: [],
  transactions: [],
  wallet: { userId: '', balance: 0, frozenBalance: 0 },
  projects: [],
  characters: [],
  outlineNodes: []
})

// Time format tests
const timeFormatTests = ref<Array<{ label: string; date: string; formatted: string }>>([])
const readingTimeTests = ref<Array<{ minutes: number; formatted: string }>>([])

// Computed
const currentDemoTitle = computed(() => {
  const allItems = [...readerItems, ...adminItems, ...userItems, ...writerItems, ...formatItems]
  const item = allItems.find(i => i.key === currentDemo.value)
  return item?.label || '欢迎'
})

const currentDemoDescription = computed(() => {
  const descriptions: Record<string, string> = {
    welcome: '选择左侧导航项开始验证',
    comments: '验证 Comment 类型的组件渲染和时间格式化',
    bookshelf: '验证 ShelfBook 类型的书架展示',
    review: '验证 ReviewItem 类型的审核卡片',
    transactions: '验证 Transaction 类型的交易记录显示',
    projects: '验证 Project 类型的项目列表',
    characters: '验证角色关系图组件',
    outline: '验证大纲节点结构展示',
    formatTime: '验证 formatRelativeTime 函数',
    formatReadingTime: '验证 formatReadingTime 函数',
    qyTag: '验证 QyTag 组件的各种状态'
  }
  return descriptions[currentDemo.value] || ''
})

const totalLikes = computed(() => {
  return mockData.value.comments.reduce((sum: number, c) => sum + c.likeCount, 0)
})

const totalFixedItems = computed(() => {
  return [...readerItems, ...adminItems, ...userItems, ...writerItems, ...formatItems]
    .filter(i => i.fixed).length
})

// Methods
const toggleSection = (section: string) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const selectDemo = (key: string) => {
  currentDemo.value = key
}

const testMessage = () => {
  ElMessage.success('ElMessage 功能正常喵~')
}

const addComment = () => {
  ElMessage.info('添加评论功能模拟成功喵~')
}

const getTransactionTypeColor = (type: string) => {
  const colors: Record<string, any> = {
    recharge: 'success',
    purchase: 'danger',
    reward: 'warning',
    withdraw: 'info',
    refund: 'primary',
    income: 'success'
  }
  return colors[type] || 'info'
}

const getTransactionTypeName = (type: string) => {
  const names: Record<string, string> = {
    recharge: '充值',
    purchase: '购买',
    reward: '打赏',
    withdraw: '提现',
    refund: '退款',
    income: '收入'
  }
  return names[type] || type
}

const getTypeDescription = (type: string) => {
  return getTransactionTypeName(type)
}

const getProjectStatusColor = (status: string) => {
  const colors: Record<string, any> = {
    draft: 'info',
    serializing: 'primary',
    completed: 'success',
    suspended: 'warning',
    archived: 'danger'
  }
  return colors[status] || 'info'
}

const getProjectStatusName = (status: string) => {
  const names: Record<string, string> = {
    draft: '草稿',
    serializing: '连载中',
    completed: '已完结',
    suspended: '已暂停',
    archived: '已归档'
  }
  return names[status] || status
}

const removeTag = (tag: string) => {
  const index = closableTags.value.indexOf(tag)
  if (index > -1) {
    closableTags.value.splice(index, 1)
  }
}

const addTag = () => {
  const newTag = `标签${closableTags.value.length + 1}`
  closableTags.value.push(newTag)
}

const refreshData = () => {
  initData()
  ElMessage.success('数据已刷新喵~')
}

const initData = () => {
  mockData.value = mockDataJson

  // Prepare time format tests
  const now = Date.now()
  timeFormatTests.value = [
    { label: '刚刚', date: new Date(now - 30 * 1000).toISOString(), formatted: '刚刚' },
    { label: '5分钟前', date: new Date(now - 5 * 60 * 1000).toISOString(), formatted: '5分钟前' },
    { label: '2小时前', date: new Date(now - 2 * 60 * 60 * 1000).toISOString(), formatted: '2小时前' },
    { label: '3天前', date: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(), formatted: '3天前' },
    { label: '2周前', date: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString(), formatted: '2周前' },
    { label: '1个月前', date: new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString(), formatted: '1个月前' }
  ]

  readingTimeTests.value = [
    { minutes: 0.5, formatted: formatReadingTime(0.5) },
    { minutes: 5, formatted: formatReadingTime(5) },
    { minutes: 30, formatted: formatReadingTime(30) },
    { minutes: 60, formatted: formatReadingTime(60) },
    { minutes: 90, formatted: formatReadingTime(90) },
    { minutes: 150, formatted: formatReadingTime(150) }
  ]
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
