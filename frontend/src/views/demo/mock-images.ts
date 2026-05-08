/**
 * Demo 页面图片资源配置
 * 
 * 为 Demo 页面提供统一、高质量的 Mock 图片资源
 * 
 * 图片服务：
 * - picsum.photos: 高质量随机图片
 * - placeholder.com: 自定义占位图
 * - ui-avatars.com: 用户头像生成
 * - api.dicebear.com: 卡通风格头像
 */

// ==================== 图片服务配置 ====================

/**
 * 基础图片配置
 */
export const IMAGE_CONFIG = {
  // 图片 CDN 基础 URL
  picsumBaseUrl: 'https://picsum.photos',
  placeholderBaseUrl: 'https://via.placeholder.com',
  avatarsBaseUrl: 'https://api.dicebear.com/7.x/avataaars/svg',
  
  // 默认图片尺寸
  defaultSize: '300x400',
  coverSize: '300x400',
  bannerSize: '800x400',
  avatarSize: '100x100',
  
  // 图片质量
  quality: 80
}

function parseSize(size: string, fallbackW: number, fallbackH: number): { w: number; h: number } {
  const [wStr, hStr] = size.split('x')
  const w = Number(wStr)
  const h = Number(hStr)
  return {
    w: Number.isFinite(w) && w > 0 ? w : fallbackW,
    h: Number.isFinite(h) && h > 0 ? h : fallbackH
  }
}

function buildPicsumSeedUrl(seed: string, size: string, fallbackW: number, fallbackH: number): string {
  const { w, h } = parseSize(size, fallbackW, fallbackH)
  return `${IMAGE_CONFIG.picsumBaseUrl}/seed/${seed}/${w}/${h}`
}

// 导出图片尺寸配置
export const IMAGE_SIZE = {
  default: IMAGE_CONFIG.defaultSize,
  cover: IMAGE_CONFIG.coverSize,
  banner: IMAGE_CONFIG.bannerSize,
  avatar: IMAGE_CONFIG.avatarSize
}

// ==================== 书籍封面图片 ====================

/**
 * 书籍封面图片生成器
 * @param bookId 书籍 ID
 * @param category 书籍分类
 * @returns 书籍封面图片 URL
 */
export function getBookCoverUrl(bookId: string, category: string = ''): string {
  // 根据分类选择不同的图片风格
  const categoryStyles: Record<string, string> = {
    '科幻': 'scifi',
    '星际科幻': 'scifi',
    '时空穿梭': 'scifi',
    '奇幻': 'fantasy',
    '东方玄幻': 'fantasy',
    '西方奇幻': 'fantasy',
    '仙侠': 'martial',
    '古典仙侠': 'martial',
    '现代修真': 'martial',
    '武侠': 'martial',
    '都市': 'city',
    '都市生活': 'city',
    '都市异能': 'city',
    '游戏': 'adventure',
    '虚拟网游': 'adventure',
    '游戏异界': 'adventure',
    '冒险': 'adventure',
    '爱情': 'romance',
    '历史': 'history',
    '悬疑': 'mystery'
  }
  
  const style = categoryStyles[category] || 'default'
  const safeBookId = encodeURIComponent(String(bookId))
  const seed = `${style}-${safeBookId}`
  
  // 使用 picsum.photos 提供高质量图片
  return buildPicsumSeedUrl(seed, IMAGE_CONFIG.coverSize, 300, 400)
}

/**
 * 预定义的书籍封面
 */
export const BOOK_COVERS = {
  // 科幻类
  scifi: {
    '星河骑士': `${IMAGE_CONFIG.picsumBaseUrl}/seed/scifi-galaxy-knight/300/400.jpg`,
    '时空旅行者': `${IMAGE_CONFIG.picsumBaseUrl}/seed/scifi-time-travel/300/400.jpg`,
    '赛博侦探社': `${IMAGE_CONFIG.picsumBaseUrl}/seed/scifi-cyber/300/400.jpg`,
  },
  
  // 奇幻类
  fantasy: {
    '青羽物语': `${IMAGE_CONFIG.picsumBaseUrl}/seed/fantasy-qingyu/300/400.jpg`,
    '异界猫娘日常': `${IMAGE_CONFIG.picsumBaseUrl}/seed/fantasy-catgirl/300/400.jpg`,
  },
  
  // 武侠类
  martial: {
    '剑道独尊': `${IMAGE_CONFIG.picsumBaseUrl}/seed/martial-sword/300/400.jpg`,
    '古剑传说': `${IMAGE_CONFIG.picsumBaseUrl}/seed/martial-ancient-sword/300/400.jpg`,
    '云岚纪事': `${IMAGE_CONFIG.picsumBaseUrl}/seed/martial-yunlan/300/400.jpg`,
  },
  
  // 都市类
  city: {
    '甜点日记': `${IMAGE_CONFIG.picsumBaseUrl}/seed/city-dessert/300/400.jpg`,
  },
  
  // 冒险类
  adventure: {
    '深海秘境': `${IMAGE_CONFIG.picsumBaseUrl}/seed/adventure-deepsea/300/400.jpg`,
  }
}

// ==================== 用户头像 ====================

/**
 * 用户头像生成器
 * @param username 用户名
 * @param style 头像风格
 * @returns 用户头像 URL
 */
export function getUserAvatarUrl(username: string, style: 'avatars' | 'initials' | 'dicebear' = 'dicebear'): string {
  const seed = encodeURIComponent(username)
  
  switch (style) {
    case 'dicebear':
      return `${IMAGE_CONFIG.avatarsBaseUrl}?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`
    
    case 'initials':
      return `https://ui-avatars.com/api/?name=${seed}&background=random&color=fff`
    
    case 'avatars':
    default:
      return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
  }
}

/**
 * 预定义的用户头像
 */
export const USER_AVATARS = {
  // 主要角色
  'alice_wonder': `${IMAGE_CONFIG.avatarsBaseUrl}?seed=Alice&backgroundColor=ffdfbf`,
  'bob_builder': `${IMAGE_CONFIG.avatarsBaseUrl}?seed=Bob&backgroundColor=c0aede`,
  'charlie_chef': `${IMAGE_CONFIG.avatarsBaseUrl}?seed=Charlie&backgroundColor=b6e3f4`,
  'diana_dancer': `${IMAGE_CONFIG.avatarsBaseUrl}?seed=Diana&backgroundColor=ffd5dc`,
  'evan_engineer': `${IMAGE_CONFIG.avatarsBaseUrl}?seed=Evan&backgroundColor=d1d4f9`,
  'fiona_artist': `${IMAGE_CONFIG.avatarsBaseUrl}?seed=Fiona&backgroundColor=ffdfbf`,
  'george_gamer': `${IMAGE_CONFIG.avatarsBaseUrl}?seed=George&backgroundColor=c0aede`,
  'hanna_hiker': `${IMAGE_CONFIG.avatarsBaseUrl}?seed=Hanna&backgroundColor=b6e3f4`,
  
  // 演示用户
  'demo_user': `${IMAGE_CONFIG.avatarsBaseUrl}?seed=Demo&backgroundColor=ffdfbf`,
  'test_user': `${IMAGE_CONFIG.avatarsBaseUrl}?seed=Test&backgroundColor=c0aede`,
}

// ==================== Banner 图片 ====================

/**
 * Banner 图片生成器
 * @param type Banner 类型
 * @param index Banner 索引
 * @returns Banner 图片 URL
 */
export function getBannerUrl(type: 'home' | 'writer' | 'activity' = 'home', index: number = 0): string {
  const seeds = {
    home: ['banner-feature', 'banner-new', 'banner-event'],
    writer: ['banner-writing', 'banner-contest', 'banner-workshop'],
    activity: ['banner-festival', 'banner-challenge', 'banner-reward']
  }
  
  const seed = seeds[type][index] || 'banner-default'
  return buildPicsumSeedUrl(seed, IMAGE_CONFIG.bannerSize, 800, 400)
}

/**
 * 预定义的 Banner 图片
 */
export const BANNER_IMAGES = {
  // 首页 Banner
  home: {
    main: `${IMAGE_CONFIG.picsumBaseUrl}/seed/banner-main/800/400.jpg`,
    feature: `${IMAGE_CONFIG.picsumBaseUrl}/seed/banner-feature/800/400.jpg`,
    new: `${IMAGE_CONFIG.picsumBaseUrl}/seed/banner-new/800/400.jpg`,
    activity: `${IMAGE_CONFIG.picsumBaseUrl}/seed/banner-activity/800/400.jpg`,
  },
  
  // 创作中心 Banner
  writer: {
    contest: `${IMAGE_CONFIG.picsumBaseUrl}/seed/banner-contest/800/400.jpg`,
    workshop: `${IMAGE_CONFIG.picsumBaseUrl}/seed/banner-workshop/800/400.jpg`,
  }
}

// ==================== 其他图片资源 ====================

/**
 * 背景图片
 */
export const BACKGROUND_IMAGES = {
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  pattern: `${IMAGE_CONFIG.picsumBaseUrl}/seed/pattern-subtle/1920/1080.jpg`,
  hero: `${IMAGE_CONFIG.picsumBaseUrl}/seed/hero-background/1920/600.jpg`,
}

/**
 * Icon 和装饰图片
 */
export const DECORATION_IMAGES = {
  logo: `${IMAGE_CONFIG.placeholderBaseUrl}/100x100/6366f1/ffffff?text=Q`,
  watermark: `${IMAGE_CONFIG.picsumBaseUrl}/seed/watermark/200x200.jpg`,
}

/**
 * 示例内容图片
 */
export const CONTENT_IMAGES = {
  chapter: `${IMAGE_CONFIG.picsumBaseUrl}/seed/chapter-illustration/800/400.jpg`,
  post: `${IMAGE_CONFIG.picsumBaseUrl}/seed/post-image/600/400.jpg`,
  avatar: `${IMAGE_CONFIG.picsumBaseUrl}/seed/default-avatar/100/100.jpg`,
}

// ==================== 工具函数 ====================

/**
 * 获取随机图片
 * @param width 图片宽度
 * @param height 图片高度
 * @param category 图片分类
 * @returns 随机图片 URL
 */
export function getRandomImageUrl(width: number = 300, height: number = 400, category: string = ''): string {
  const seed = category ? `${category}-${Date.now()}` : `random-${Date.now()}`
  return `${IMAGE_CONFIG.picsumBaseUrl}/seed/${seed}/${width}/${height}`
}

/**
 * 获取 Gravatar 头像
 * @param email 邮箱地址
 * @param size 头像大小
 * @returns Gravatar 头像 URL
 */
export function getGravatarUrl(email: string, size: number = 100): string {
  const hash = btoa(email.trim().toLowerCase())
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`
}

/**
 * 获取 UI Avatars 头像（基于用户名首字母）
 * @param username 用户名
 * @param size 头像大小
 * @returns UI Avatars 头像 URL
 */
export function getUiAvatarUrl(username: string, size: number = 100): string {
  const initials = username
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
  
  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=${size}`
}

// ==================== 导出 ====================

export default {
  IMAGE_CONFIG,
  BOOK_COVERS,
  USER_AVATARS,
  BANNER_IMAGES,
  BACKGROUND_IMAGES,
  DECORATION_IMAGES,
  CONTENT_IMAGES,
  
  // 工具函数
  getBookCoverUrl,
  getUserAvatarUrl,
  getBannerUrl,
  getRandomImageUrl,
  getGravatarUrl,
  getUiAvatarUrl
}
