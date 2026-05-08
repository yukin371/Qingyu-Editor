/**
 * 全局类型声明文件
 * 用于声明第三方模块和路径别名
 */

/// <reference types="vite/client" />

// Vue 组件类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 路径别名模块声明 - API
declare module '@/api/*' {
  const content: any
  export default content
}

declare module '@/api/auth' {
  export function login(data: any): Promise<any>
  export function logout(): Promise<any>
  export function register(data: any): Promise<any>
}

declare module '@/api/user' {
  export function getUserProfile(): Promise<any>
  export function updateUserProfile(data: any): Promise<any>
  export function changePassword(oldPassword: string, newPassword: string): Promise<any>
}

declare module '@/api/reader' {
  export function getChapterInfo(chapterId: string): Promise<any>
  export function getChapterContent(chapterId: string): Promise<any>
  export function getChapterList(params: any): Promise<any>
  export function getReaderSettings(): Promise<any>
  export function updateReaderSettings(settings: any): Promise<any>
  export function recordReadingHistory(data: any): Promise<any>
  export function getReadingHistory(params: any): Promise<any>
  export function getReadingStats(): Promise<any>
  export function deleteReadingHistory(id: string): Promise<any>
  export function clearReadingHistory(): Promise<any>
}

declare module '@/api/bookstore' {
  export function getCategoryDetail(id: string): Promise<any>
  export function getBooksByCategory(id: string, params: any): Promise<any>
  export function getCategoryTree(): Promise<any>
  export function searchBooks(params: any): Promise<any>
  export function incrementBookView(bookId: string): Promise<any>
}

declare module '@/api/recommendation' {
  export function getSimilarRecommendations(params: any): Promise<any>
}

declare module '@/api/writing/ai' {
  export function chatWithAI(message: string, context?: any): Promise<any>
  export function continueWriting(text: string, config?: any): Promise<any>
  export function polishText(text: string, config?: any): Promise<any>
  export function expandText(text: string, config?: any): Promise<any>
  export function rewriteText(text: string, config?: any): Promise<any>
}

// 路径别名模块声明 - Stores
declare module '@/stores/user' {
  import type { UserInfo, LoginRequest, RegisterRequest } from '@/types/user'

  export interface UserStore {
    token: import('vue').Ref<string>
    userInfo: import('vue').Ref<UserInfo | null>
    isLoading: import('vue').Ref<boolean>
    isLoggedIn: import('vue').ComputedRef<boolean>
    isWriter: import('vue').ComputedRef<boolean>
    isAdmin: import('vue').ComputedRef<boolean>
    profile: import('vue').ComputedRef<UserInfo | null>
    username: import('vue').ComputedRef<string>
    email: import('vue').ComputedRef<string>
    displayName: import('vue').ComputedRef<string>
    avatar: import('vue').ComputedRef<string>
    handleLogin(data: LoginRequest): Promise<any>
    handleRegister(data: RegisterRequest): Promise<any>
    handleLogout(): Promise<void>
    fetchUserInfo(): Promise<any>
    updateUserInfo(info: Partial<UserInfo>): void
    fetchProfile(): Promise<any>
    updateProfile(data: any): Promise<any>
  }

  export function useUserStore(): UserStore
}

declare module '@/stores/reader' {
  import type { Chapter, ChapterContent, ReaderSettings } from '@/types/reader'

  export interface ReaderStore {
    currentBookId: import('vue').Ref<string | null>
    currentChapter: import('vue').Ref<Chapter | null>
    chapterContent: import('vue').Ref<ChapterContent | null>
    chapterList: import('vue').Ref<Chapter[]>
    settings: import('vue').Ref<ReaderSettings>
    isLoading: import('vue').Ref<boolean>
    readingProgress: import('vue').Ref<number>
    hasNextChapter: import('vue').ComputedRef<boolean>
    hasPrevChapter: import('vue').ComputedRef<boolean>
    loadChapter(chapterId: string): Promise<any>
    nextChapter(): Promise<any>
    prevChapter(): Promise<any>
    loadPreviousChapter(): Promise<any>
    loadNextChapter(): Promise<any>
    loadChapterList(bookId: string): Promise<any>
    loadSettings(): Promise<any>
    updateSettings(settings: Partial<ReaderSettings>): Promise<any>
    resetSettings(): void
    saveReadingProgress(): Promise<void>
    saveProgress(
      bookId: string,
      chapterId: string,
      progress: number,
      scrollPosition: number,
    ): Promise<void>
    updateReadingTime(bookId: string, duration: number): Promise<void>
    updateProgress(progress: number): void
    clearChapter(): void
    clearCurrentChapter(): void
  }

  export function useReaderStore(): ReaderStore
}

declare module '@/stores/bookstore' {
  import type { Book, Category } from '@/types/bookstore'

  export interface BookstoreStore {
    currentBook: import('vue').Ref<Book | null>
    isLoading: import('vue').Ref<boolean>
    categories: import('vue').Ref<Category[]>
    fetchBookDetail(bookId: string): Promise<any>
    fetchCategories(): Promise<any>
  }

  export function useBookstoreStore(): BookstoreStore
}

// 路径别名模块声明 - Types
declare module '@/types/user' {
  export interface UserInfo {
    id: string
    username: string
    email: string
    nickname?: string
    avatar?: string
    role?: string
    bio?: string
    gender?: string
    birthday?: string
    location?: string
    stats?: any
    createdAt?: string
  }

  export interface LoginRequest {
    username: string
    password: string
  }

  export interface RegisterRequest {
    username: string
    password: string
    email: string
  }

  export interface UpdateProfileRequest {
    nickname?: string
    bio?: string
    gender?: string
    birthday?: string
    location?: string
  }
}

declare module '@/types/reader' {
  export interface Chapter {
    id: string
    bookId: string
    title: string
    chapterNum: number
    chapterNumber?: number
    wordCount: number
    isFree: boolean
    price?: number
    publishTime?: string
    publishedAt?: string
    updateTime?: string
    updatedAt?: string
    locked?: boolean
    prevChapterId?: string | null
    nextChapterId?: string | null
  }

  export interface ChapterContent {
    id: string
    chapterId?: string
    bookId?: string
    title?: string
    content: string
    wordCount: number
    chapterNum?: number
    publishTime?: string
    prevChapterId?: string | null
    nextChapterId?: string | null
    chapter?: Chapter
  }

  export interface ReaderSettings {
    userId: string
    fontSize: number
    fontFamily: string
    lineHeight: number
    letterSpacing: number
    theme: string
    backgroundColor?: string
    textColor?: string
    pageMode: string
    pageWidth?: number
    autoSave: boolean
    enableAnimation: boolean
    showProgress: boolean
    updatedAt: string
  }

  export interface ReadingHistory {
    id: string
    userId: string
    bookId: string
    chapterId: string
    progress: number
    readDuration: number
    lastReadAt: string
    createdAt: string
    book?: any
    chapter?: any
  }

  export interface ReadingStats {
    totalBooks: number
    totalChapters: number
    totalDuration: number
    todayDuration: number
    weekDuration?: number
    monthDuration?: number
    averageDailyDuration?: number
  }
}

declare module '@/types/bookstore' {
  export interface Book {
    id: string
    title: string
    author: string
    coverUrl: string
    description?: string
    categoryId?: string
    categoryName?: string
    status?: string
    isPaid?: boolean
    viewCount?: number
    collectCount?: number
    commentCount?: number
    wordCount?: number
    rating?: number
    tags?: string[]
    chapterCount?: number
    chapters?: any[]
  }

  export interface Category {
    id: string
    name: string
    description?: string
    icon?: string
    bookCount: number
    children?: Category[]
  }

  export interface SearchParams {
    keyword?: string
    categoryId?: string
    status?: string
    minWordCount?: number
    maxWordCount?: number
    sortBy?: string
    sortOrder?: string
    page?: number
    pageSize?: number
  }

  export interface RankingItem {
    book: Book
    score: number
    change?: number
  }
}

declare module '@/types/writer' {
  export interface Character {
    id: string
    projectId?: string
    name: string
    alias?: string[]
    summary?: string
    traits?: string[]
    background?: string
    personalityPrompt?: string
    speechPattern?: string
    currentState?: string
    avatarUrl?: string
  }

  export interface CharacterRelation {
    id: string
    fromId: string
    toId: string
    type: RelationType
    strength: number
    description?: string
  }

  export type RelationType = '朋友' | '家庭' | '恋人' | '盟友' | '敌人' | '其他'

  export interface Location {
    id: string
    projectId?: string
    name: string
    description?: string
    imageUrl?: string
    climate?: string
    culture?: string
    geography?: string
    atmosphere?: string
  }

  export interface LocationRelation {
    id: string
    fromId: string
    toId: string
    type: string
    description?: string
  }

  export interface Timeline {
    id: string
    projectId?: string
    name: string
    description?: string
    events?: TimelineEvent[]
  }

  export interface TimelineEvent {
    id: string
    timelineId?: string
    title: string
    description?: string
    eventType: EventType
    importance: number
    storyTime?: any
  }

  export type EventType = 'plot' | 'character' | 'world' | 'background' | 'milestone'

  export interface OutlineNode {
    id: string
    projectId?: string
    title: string
    level: number
    parentId?: string
    status?: string
    description?: string
    order: number
    wordCount?: number
    documentId?: string
    type?: string
    children?: OutlineNode[]
  }
}

declare module '@/types/ai' {
  export interface ChatMessage {
    id?: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: number
  }

  export type AIToolType = 'chat' | 'continue' | 'polish' | 'expand' | 'rewrite' | 'story-generate'

  export interface AIConfig {
    continueLength?: number
    polishStyle?: string
    expandLevel?: string
    rewriteMode?: string
  }

  export interface AIHistory {
    id: string
    tool: AIToolType
    input: string
    output: string
    timestamp: number
    projectId?: string
    usage?: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  }
}

// 路径别名模块声明 - Composables
declare module '@/composables/useTouch' {
  export function useTouch(target: any, options?: any): void
}

declare module '@/composables/useResponsive' {
  export function useResponsive(): {
    isMobile: import('vue').Ref<boolean>
    isTablet: import('vue').Ref<boolean>
    isDesktop: import('vue').Ref<boolean>
  }
}

// 路径别名模块声明 - Components
declare module '@/components/Common/SectionTitle.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/components/Book/BookCard.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 路径别名模块声明 - Utils
declare module '@/utils/format' {
  export function formatDate(date: string | Date, format?: string): string
  export function formatNumber(num: number): string
  export function formatDuration(seconds: number): string
}

declare module '@/utils/request' {
  import type { AxiosInstance } from 'axios'
  const request: AxiosInstance
  export default request
}

// 环境变量类型声明
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_PORT: string
  readonly VITE_OPEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
