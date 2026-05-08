<template>
  <div class="home-view">
    <!-- 顶部背景装饰 -->
    <div class="hero-background">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="container main-container">
      <!-- 头部 Hero 区域：左侧文案，右侧轮播 -->
      <section class="hero-section">
        <div class="hero-content animate-up">
          <div class="brand-tag"><Icon name="book-open" size="sm" /> 沉浸式阅读体验</div>
          <h1 class="hero-title">青羽书城<span class="highlight">.</span></h1>
          <p class="hero-subtitle">
            探索未知的世界，<br />
            遇见灵魂的共鸣。
          </p>
          <div class="hero-actions">
            <!-- 搜索框嵌入 -->
            <div class="search-wrapper">
              <QyInput placeholder="搜索书名、作者..." class="hero-search" size="lg">
                <template #prefix>
                  <Icon name="magnifying-glass" size="sm" />
                </template>
              </QyInput>
            </div>
          </div>

          <!-- 统计数据胶囊 -->
          <div class="stats-capsule" v-if="stats">
            <div class="stat-mini">
              <strong>{{ formatNumber(stats.totalBooks) }}</strong>
              <span>藏书</span>
            </div>
            <Divider orientation="vertical" />
            <div class="stat-mini">
              <strong>{{ formatNumber(stats.ongoingBooks) }}</strong>
              <span>连载中</span>
            </div>
          </div>
        </div>

        <div class="hero-banner animate-up delay-1">
          <!-- Loading state -->
          <div
            v-if="loading"
            class="banner-skeleton"
            style="
              width: 100%;
              height: 320px;
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
              border-radius: 24px;
            "
          ></div>

          <!-- Content -->
          <div v-else class="banner-wrapper">
            <BannerCarousel
              :banners="banners"
              height="320px"
              indicator-position="none"
              @banner-click="handleBannerClick"
              class="premium-carousel"
            />
            <!-- 装饰性光晕 -->
            <div class="glow-effect"></div>
          </div>
        </div>
      </section>

      <AnnouncementBar
        :items="announcementItems"
        class="animate-up delay-2"
        @select="handleAnnouncementSelect"
      />

      <!-- 主要内容区域 -->
      <div class="content-wrapper">
        <!-- 榜单区域 -->
        <section class="section-block rankings-section animate-on-scroll">
          <!-- 将内容包裹在 card-container 中 -->
          <div class="card-container">
            <div class="section-header">
              <h2 class="section-title">热门榜单</h2>
              <!-- 移动端优化：Tabs 容器 -->
              <div class="section-tabs-wrapper">
                <div class="section-tabs">
                  <span
                    v-for="tab in ['weekly', 'monthly', 'newbie', 'realtime']"
                    :key="tab"
                    :class="{ active: activeRankingTab === tab }"
                    @click="activeRankingTab = tab"
                  >
                    {{ rankingTabName(tab) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="ranking-content">
              <RankingList
                :type="activeRankingTab"
                :items="rankings?.[activeRankingTab] || []"
                :loading="loading"
                :error="rankingsError"
                :max-items="6"
                layout="premium"
                @view-more="handleViewRanking(activeRankingTab)"
                @item-click="handleBookClick"
                @retry="handleRetryRankings"
              />
            </div>
          </div>
        </section>

        <!-- 编辑推荐 -->
        <section class="section-block recommended-section animate-on-scroll">
          <div class="card-container">
            <div class="section-header flex-between">
              <h2 class="section-title">编辑甄选 <span class="title-en">Editors' Choice</span></h2>
              <QyButton variant="outline" size="sm" @click="handleViewBooks('recommended')"
                >全部</QyButton
              >
            </div>
            <!-- 强制 Grid 组件响应式 -->
            <div class="responsive-grid-wrapper">
              <BookGrid
                :books="recommendedBooks"
                :loading="loading"
                :error="recommendedError"
                :max-items="8"
                card-style="premium"
                @book-click="handleBookClick"
                @retry="handleRetryRecommended"
              />
            </div>
          </div>
        </section>

        <!-- 年度精选 -->
        <section class="section-block featured-section animate-on-scroll">
          <div class="section-header">
            <h2 class="section-title">年度精选 <span class="title-en">Featured</span></h2>
          </div>
          <div class="featured-layout" v-if="!loading">
            <!-- 紧凑的网格布局，显示所有精选书籍 -->
            <BookGrid
              :books="featuredBooks"
              :loading="loading"
              :error="featuredError"
              :max-items="6"
              :grid-cols="3"
              card-style="premium"
              @book-click="handleBookClick"
              @retry="handleRetryFeatured"
            />
          </div>
          <!-- 骨架屏 -->
          <div v-else class="featured-skeleton">
            <BookGrid :books="[]" :loading="true" :max-items="6" />
          </div>
        </section>

        <!-- 猜你喜欢 (无限滚动) -->
        <section class="section-block infinite-recommendations animate-on-scroll">
          <div class="card-container recommend-container">
            <div class="section-header center-align">
              <h2 class="section-title"><Icon name="star" solid size="md" /> 猜你喜欢</h2>
              <p class="section-desc">基于你的阅读偏好推荐</p>
            </div>

            <div class="masonry-grid">
              <div
                v-for="book in recommendedItems"
                :key="book.id || book._id"
                class="premium-card"
                @click="handleBookClick(book)"
              >
                <div class="card-image-box">
                  <QyImage
                    :src="getRecommendationCover(book)"
                    fit="cover"
                    @error="handleRecommendationImageError(book)"
                  >
                    <template #error>
                      <div class="image-placeholder">
                        <Icon name="photo" size="md" />
                      </div>
                    </template>
                  </QyImage>
                  <div class="card-overlay">
                    <QyButton variant="primary" size="sm" rounded>立即阅读</QyButton>
                  </div>
                </div>
                <div class="card-info">
                  <h4 class="book-title" :title="book.title">{{ book.title }}</h4>
                  <div class="book-meta-row">
                    <span class="author">{{ book.author }}</span>
                    <span class="rating">
                      <Icon name="star" size="sm" class="text-yellow-400" />
                      {{ formatRating(book.rating) }}
                    </span>
                  </div>
                  <div class="tags-row" v-if="book.categoryName">
                    <span class="tag">{{ book.categoryName }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 加载状态 -->
            <div class="scroll-loader">
              <div v-if="loadingMore" class="loader-animation">
                <span></span><span></span><span></span>
              </div>
              <div
                v-if="!hasMoreRecommendations && recommendedItems.length > 0"
                class="no-more-text"
              >
                - 到底了，去看看别的吧 -
              </div>
              <div ref="loadMoreElRef" class="load-trigger"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookstoreStore } from '../stores/bookstore.store'
import BannerCarousel from '../components/BannerCarousel.vue'
import RankingList from '../components/RankingList.vue'
import BookGrid from '../components/BookGrid.vue'
import AnnouncementBar from '@/modules/announcements/components/AnnouncementBar.vue'
import { useAnnouncements } from '@/modules/announcements/composables/useAnnouncements'
import {
  QyButton,
  QyDivider as Divider,
  Icon,
  Input as QyInput,
  Image as QyImage,
} from '@/design-system/components'
import { usePagination } from '@/composables/usePagination'
import { getFallbackBookCover, resolveBookCover } from '../utils/cover-resolver'

export default {
  name: 'HomeView',
  components: {
    BannerCarousel,
    RankingList,
    BookGrid,
    AnnouncementBar,
    QyButton,
    QyInput,
    Divider,
    QyImage,
    Icon,
  },
  setup() {
    const router = useRouter()
    const bookstoreStore = useBookstoreStore()
    const loading = ref(false)
    const rankingsError = ref(false)
    const recommendedError = ref(false)
    const featuredError = ref(false)
    const loadMoreElRef = ref(null)
    const activeRankingTab = ref('weekly')
    const recommendationCoverOverrides = ref({})
    const { visibleItems: announcementItems, loadAnnouncements } = useAnnouncements()

    // 数据从 store 获取，支持测试模式和真实 API 模式
    // 使用可选链和安全访问，确保即使 store 未初始化也不会报错
    const banners = computed(() => bookstoreStore?.banners || [])
    const recommendedBooks = computed(() => bookstoreStore?.books?.recommended || [])
    const featuredBooks = computed(() => bookstoreStore?.books?.featured || [])
    const rankings = computed(
      () =>
        bookstoreStore?.rankings || {
          realtime: [],
          weekly: [],
          monthly: [],
          newbie: [],
        },
    )
    const stats = computed(() => bookstoreStore?.homepageData?.stats || null)

    // 无限滚动逻辑保持不变
    const {
      items: recommendedItems,
      loading: loadingMore,
      hasMore: hasMoreRecommendations,
      currentPage: recommendationPage,
      total: recommendationTotal,
      setupScrollObserver,
    } = usePagination(
      async (page, pageSize) => {
        try {
          const result = await bookstoreStore.fetchRecommendedBooks(page, pageSize)
          return {
            items: result.items || [],
            total: typeof result.total === 'number' ? result.total : 0,
          }
        } catch {
          return { items: [], total: 0 }
        }
      },
      { pageSize: 12, initialLoad: false, autoLoadOnScroll: true },
    )

    const formatRating = (rating) => {
      if (!rating || typeof rating !== 'number') return '0.0'
      return rating.toFixed(1)
    }

    const formatNumber = (num) => {
      if (!num) return '0'
      return num > 9999 ? (num / 10000).toFixed(1) + 'w' : num
    }

    const getRecommendationBookKey = (book) => String(book?.id || book?._id || book?.title || '')

    const getRecommendationCover = (book) => {
      const key = getRecommendationBookKey(book)
      return recommendationCoverOverrides.value[key] || resolveBookCover(book)
    }

    const handleRecommendationImageError = (book) => {
      const key = getRecommendationBookKey(book)
      if (!key || recommendationCoverOverrides.value[key]) return

      recommendationCoverOverrides.value = {
        ...recommendationCoverOverrides.value,
        [key]: getFallbackBookCover(book),
      }
    }

    const rankingTabName = (type) => {
      const map = { realtime: '实时榜', weekly: '周榜', monthly: '月榜', newbie: '新书榜' }
      return map[type]
    }

    const handleBannerClick = (banner) => {
      if (banner?.bookId) {
        router.push(`/bookstore/books/${banner.bookId}`)
      } else if (banner?.link) {
        router.push(banner.link)
      }
    }

    const handleAnnouncementSelect = (id) => {
      router.push({ name: 'announcement-detail', params: { id } })
    }

    const handleBookClick = (book) => {
      const bookId = book.book?.id || book.bookId || book.id || book._id
      if (bookId) {
        router.push({ name: 'book-detail', params: { id: bookId } })
      }
    }
    const handleViewRanking = (type) => {
      router.push({ path: '/bookstore/rankings', query: type ? { type } : {} })
    }
    const handleViewBooks = (type) => {
      const query = type ? { filter: type } : {}
      router.push({ path: '/bookstore/browse', query })
    }
    const handleRetryRankings = async () => {
      rankingsError.value = false
      loading.value = true
      try {
        if (typeof bookstoreStore.fetchRankings === 'function') {
          await bookstoreStore.fetchRankings()
        }
      } catch (error) {
        rankingsError.value = true
      } finally {
        loading.value = false
      }
    }

    const handleRetryRecommended = async () => {
      recommendedError.value = false
      loading.value = true
      try {
        if (typeof bookstoreStore.fetchRecommendedBooks === 'function') {
          await bookstoreStore.fetchRecommendedBooks(1, 12)
        }
      } catch (error) {
        recommendedError.value = true
      } finally {
        loading.value = false
      }
    }

    const handleRetryFeatured = async () => {
      featuredError.value = false
      loading.value = true
      try {
        if (typeof bookstoreStore.fetchFeaturedBooks === 'function') {
          await bookstoreStore.fetchFeaturedBooks()
        }
      } catch (error) {
        featuredError.value = true
      } finally {
        loading.value = false
      }
    }

    const loadHomepageData = async () => {
      loading.value = true
      try {
        if (typeof bookstoreStore.fetchHomepageData === 'function') {
          await bookstoreStore.fetchHomepageData()
        } else {
          console.warn('[HomeView] fetchHomepageData 方法不存在，尝试单独获取数据')
          if (typeof bookstoreStore.fetchRankings === 'function') {
            await bookstoreStore.fetchRankings()
          }
        }
      } catch (error) {
        console.error('[HomeView] 加载首页数据失败:', error)
        rankingsError.value = true
        recommendedError.value = true
        featuredError.value = true
      } finally {
        loading.value = false
      }
    }

    let scrollObserver = null

    onMounted(async () => {
      await Promise.all([loadHomepageData(), loadAnnouncements()])

      if (Array.isArray(recommendedBooks.value) && recommendedBooks.value.length > 0) {
        recommendedItems.value = [...recommendedBooks.value]
        recommendationPage.value = 2
        recommendationTotal.value = recommendedItems.value.length
      }

      if (loadMoreElRef.value) setupScrollObserver(loadMoreElRef.value)

      scrollObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add('visible')
          })
        },
        { threshold: 0.1 },
      )

      document.querySelectorAll('.animate-on-scroll').forEach((el) => scrollObserver?.observe(el))
    })

    onUnmounted(() => {
      scrollObserver?.disconnect()
    })

    return {
      loading,
      rankingsError,
      recommendedError,
      featuredError,
      loadingMore,
      hasMoreRecommendations,
      announcementItems,
      banners,
      recommendedBooks,
      featuredBooks,
      rankings,
      stats,
      recommendedItems,
      loadMoreElRef,
      activeRankingTab,
      formatNumber,
      formatRating,
      getRecommendationCover,
      handleRecommendationImageError,
      rankingTabName,
      handleAnnouncementSelect,
      handleBookClick,
      handleBannerClick,
      handleViewRanking,
      handleViewBooks,
      handleRetryRankings,
      handleRetryRecommended,
      handleRetryFeatured,
    }
  },
}
</script>

<style scoped lang="scss">
/*
  定义高级感配色与变量
  建议在全局 variables.scss 中定义，这里作为演示局部定义
*/
:root {
  --primary-color: #2c3e50;
  --accent-color: #c0a062;
  /* 金色点缀 */
  --bg-color: #f8f9fb;
  --card-bg: #ffffff;
  --text-main: #2c3e50;
  --text-secondary: #8590a6;
  --shadow-soft: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
  --shadow-hover: 0 20px 60px -12px rgba(0, 0, 0, 0.12);
  --radius-lg: 24px;
  --radius-md: 16px;
}

.home-view {
  min-height: 100vh;
  background-color: #f8f9fb;
  /* 柔和的灰白背景 */
  position: relative;
  overflow-x: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 0 16px;
    /* 减小左右边距 */
  }
}

/* --- 通用卡片容器样式 --- */
.card-container {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-soft);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  /* 移动端调整内边距 */
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 16px;
  }
}

/* 背景装饰 */
.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 600px;
  overflow: hidden;
  z-index: 0;
  background: linear-gradient(180deg, #eef1f5 0%, rgba(255, 255, 255, 0) 100%);

  .shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
  }

  .shape-1 {
    top: -100px;
    right: -50px;
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  }

  .shape-2 {
    top: 100px;
    left: -100px;
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #fccb90 0%, #d57eeb 100%);
  }

  @media (max-width: 768px) {
    height: 400px;

    .shape {
      opacity: 0.4;
    }
  }
}

/* --- 1. Hero 区域移动端适配 --- */
.hero-section {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 40px;
  padding: 36px 0 24px;
  align-items: center;
  min-height: 420px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    /* 平板/手机变为单列 */
    text-align: center;
    gap: 30px;
    padding-top: 20px;

    /* 反转顺序：让轮播图在手机上显示在标题下方，或者保持上方 */
    /* 如果想让图在上面： display: flex; flex-direction: column-reverse; */
  }
}

.hero-content {
  .brand-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 16px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 30px;
    color: #666;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .hero-title {
    font-size: 56px;
    font-weight: 800;
    line-height: 1.1;
    color: #1a1a1a;
    margin-bottom: 20px;
    font-family: 'Playfair Display', serif;
    /* 推荐引入衬线字体 */

    .highlight {
      color: #409eff;
    }

    @media (max-width: 768px) {
      font-size: 32px;
      /* 手机端字体缩小 */
      margin-bottom: 12px;
    }
  }

  .hero-subtitle {
    font-size: 18px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      font-size: 15px;
      margin-bottom: 24px;

      br {
        display: none;
      }
    }
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      flex-direction: column;
      /* 垂直排列按钮 */
      align-items: stretch;
      /* 按钮充满宽度 */
      padding: 0 20px;

      .search-wrapper {
        max-width: 100%;
        width: 100%;
      }

      .demo-btn {
        width: 100%;
        margin-top: 10px;
      }
    }

    .search-wrapper {
      flex: 1;
      max-width: 300px;

      :deep(.input-wrapper) {
        border-radius: 30px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        padding-left: 20px;
        background: rgba(255, 255, 255, 0.9);
      }
    }

    .demo-btn {
      border-radius: 30px;
      padding: 0 24px;
      font-weight: 600;
    }
  }

  .stats-capsule {
    display: inline-flex;
    background: #fff;
    padding: 12px 24px;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

    .stat-mini {
      display: flex;
      flex-direction: column;
      padding: 0 12px;

      strong {
        font-size: 18px;
        color: #333;
      }

      span {
        font-size: 12px;
        color: #999;
        margin-top: 2px;
      }
    }
  }
}

.hero-banner {
  position: relative;

  .banner-wrapper {
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 50px -20px rgba(64, 158, 255, 0.4);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .skeleton,
  :deep(.carousel__container) {
    @media (max-width: 768px) {
      height: 240px !important;
      /* 手机端减小轮播高度 */
    }
  }
}

/* 悬浮公告 */
.floating-notice {
  margin: -20px auto 40px;
  max-width: 600px;
  position: relative;
  z-index: 5;

  .notice-glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 50px;
    padding: 8px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08);

    .notice-icon {
      color: #f56c6c;
      font-size: 18px;
      margin-right: 10px;
    }

    .notice-swiper {
      flex: 1;
      color: #555;
      font-size: 14px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

/* 通用区块样式 */
.section-block {
  margin-bottom: 44px;
}

.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tabs 横向滚动优化 */
.section-tabs-wrapper {
  width: 100%;
  overflow-x: auto;
  /* 允许横向滚动 */
  -webkit-overflow-scrolling: touch;
  /* iOS顺滑滚动 */
  padding-bottom: 4px;
  /* 防止滚动条遮挡 */

  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }
}

.section-header {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 20px;

  &.flex-between {
    justify-content: space-between;
  }

  &.center-align {
    flex-direction: column;
    text-align: center;
  }

  .section-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    position: relative;

    .title-en {
      font-size: 14px;
      font-weight: 400;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-left: 8px;
    }
  }

  .section-desc {
    color: #666;
    margin-top: 8px;
  }

  .section-tabs {
    display: inline-flex;
    white-space: nowrap;
    background: #eef1f6;
    padding: 4px;
    border-radius: 30px;

    span {
      padding: 6px 20px;
      border-radius: 24px;
      font-size: 14px;
      color: #666;
      cursor: pointer;
      transition: all 0.3s;

      &.active {
        background: #fff;
        color: #409eff;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    &.flex-between {
      flex-direction: row;
      /* 标题和按钮保持一行 */
      align-items: center;
    }
  }
}

/* Featured 精选区域 - 简洁布局 */
.featured-layout {
  /* 使用 BookGrid 自身的响应式布局 */
  width: 100%;
  margin-bottom: 0;

  /* 为年度精选添加特殊的网格样式 */
  :deep(.books-layout) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
  }

  /* 增强卡片视觉效果 */
  :deep(.book-card) {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-soft);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
    }
  }
}

/* 年度精选骨架屏 - 简化版 */
.featured-skeleton {
  width: 100%;

  /* 骨架屏使用 BookGrid 自带的骨架屏样式 */
  :deep(.skeleton-layout) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
  }
}

/* 猜你喜欢 (Masonry Grid) 适配 */
.recommend-container {
  padding: 24px;
}

.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.premium-card {
  background: #fafbfd;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #eef2f7;
  transition: all 0.25s ease;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);

    .card-overlay {
      opacity: 1;
    }
  }

  .card-image-box {
    position: relative;
    height: 260px;
    overflow: hidden;

    .image-wrapper {
      width: 100%;
      height: 100%;
    }

    .card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.05));
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      backdrop-filter: blur(2px);
    }
  }

  .card-info {
    padding: 14px;
  }

  .book-title {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 700;
    color: #1f2937;
    line-height: 1.35;
    min-height: 40px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .book-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 8px;

    .author {
      max-width: 60%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .rating {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      color: #f59e0b;
    }
  }

  .tags-row {
    .tag {
      display: inline-block;
      font-size: 11px;
      padding: 3px 10px;
      background: #edf2ff;
      border-radius: 999px;
      color: #4f46e5;
    }
  }

  @media (max-width: 768px) {
    .card-image-box {
      height: 180px;
    }
  }
}

.scroll-loader {
  text-align: center;
  padding: 28px 0 8px;

  .loader-animation {
    display: inline-block;
  }

  .loader-animation span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #409eff;
    border-radius: 50%;
    margin: 0 4px;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .loader-animation span:nth-child(1) {
    animation-delay: -0.32s;
  }

  .loader-animation span:nth-child(2) {
    animation-delay: -0.16s;
  }

  .no-more-text {
    color: #9ca3af;
    font-size: 13px;
    letter-spacing: 1px;
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

.load-trigger {
  height: 1px;
}

.image-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: #eef2f7;
}

.animate-up {
  animation: fadeInUp 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}

.delay-1 {
  animation-delay: 0.1s;
}

.delay-2 {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
