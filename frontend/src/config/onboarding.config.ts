/**
 * 新手引导配置
 * 定义各个功能模块的引导流程
 */

// 本地定义类型以避免模块解析问题
export interface TourStep {
  target: string
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void
  skipable?: boolean
}

export interface TourConfig {
  id: string
  name: string
  description?: string
  steps: TourStep[]
  autoStart?: boolean
  skippable?: boolean
  showProgress?: boolean
  prerequisite?: string
  triggerOn?: string[]
}

// ==================== 欢迎引导 ====================
export const welcomeTourConfig: TourConfig = {
  id: 'welcome-tour',
  name: '欢迎来到青羽',
  description: '了解青羽平台的基本功能',
  skippable: true,
  showProgress: true,
  steps: [
    {
      target: 'body',
      title: '欢迎来到青羽！🎉',
      content: '青羽是一个创作与阅读的平台，让我们快速了解主要功能。',
      placement: 'bottom'
    },
    {
      target: '.bookstore-section',
      title: '书城',
      content: '在这里发现精彩的小说，支持按分类、榜单浏览，也可以搜索你感兴趣的作品。',
      placement: 'bottom'
    },
    {
      target: '.reader-section',
      title: '阅读器',
      content: '舒适的阅读体验，支持自定义字体、背景、亮度，还有书签和笔记功能。',
      placement: 'bottom'
    },
    {
      target: '.writer-section',
      title: '创作工具',
      content: '如果你是作者，可以在这里创作小说，管理章节，查看收益统计。',
      placement: 'bottom'
    },
    {
      target: '.user-section',
      title: '个人中心',
      content: '管理你的个人信息、钱包余额、阅读历史等。',
      placement: 'bottom'
    }
  ]
}

// ==================== 书城引导 ====================
export const bookstoreTourConfig: TourConfig = {
  id: 'bookstore-tour',
  name: '书城导览',
  description: '了解如何浏览和发现小说',
  skippable: true,
  showProgress: true,
  triggerOn: ['/bookstore', '/'],
  steps: [
    {
      target: '.search-bar',
      title: '搜索书籍',
      content: '在这里搜索你感兴趣的书籍，支持按书名、作者搜索。',
      placement: 'bottom'
    },
    {
      target: '.ranking-list',
      title: '热门榜单',
      content: '查看实时榜单，发现最受欢迎的书籍。',
      placement: 'right'
    },
    {
      target: '.category-list',
      title: '分类浏览',
      content: '按分类浏览书籍，玄幻、都市、科幻等各种类型应有尽有。',
      placement: 'right'
    },
    {
      target: '.book-card',
      title: '书籍详情',
      content: '点击书籍卡片查看详情，包括简介、章节列表、读者评价等。',
      placement: 'top'
    }
  ]
}

// ==================== 钱包引导 ====================
export const walletTourConfig: TourConfig = {
  id: 'wallet-tour',
  name: '钱包功能',
  description: '了解如何充值和消费',
  skippable: true,
  showProgress: true,
  triggerOn: ['/account/wallet'],
  prerequisite: 'welcome-tour',
  steps: [
    {
      target: '.wallet-stats',
      title: '钱包余额',
      content: '这里显示你的账户余额、累计收入和消费情况。',
      placement: 'bottom'
    },
    {
      target: '.recharge-btn',
      title: '充值',
      content: '点击充值按钮为账户充值，支持支付宝、微信支付。',
      placement: 'bottom',
      action: () => {
        // 可以自动打开充值对话框
        document.querySelector('.recharge-btn')?.dispatchEvent(new Event('click'))
      }
    },
    {
      target: '.transaction-list',
      title: '交易记录',
      content: '查看所有交易记录，包括充值、消费、转账等。',
      placement: 'top'
    }
  ]
}

// ==================== 阅读器引导 ====================
export const readerTourConfig: TourConfig = {
  id: 'reader-tour',
  name: '阅读器使用',
  description: '了解阅读器的各项功能',
  skippable: true,
  showProgress: true,
  triggerOn: ['/reader'],
  steps: [
    {
      target: '.chapter-list',
      title: '章节目录',
      content: '点击目录按钮查看所有章节，快速跳转到你想看的章节。',
      placement: 'right'
    },
    {
      target: '.reading-settings',
      title: '阅读设置',
      content: '自定义字体大小、背景颜色、亮度等，打造舒适的阅读体验。',
      placement: 'right'
    },
    {
      target: '.bookmark-btn',
      title: '书签功能',
      content: '点击书签按钮，在当前位置添加书签，方便下次继续阅读。',
      placement: 'bottom'
    },
    {
      target: '.note-btn',
      title: '笔记功能',
      content: '记录你的阅读心得和想法，支持富文本格式。',
      placement: 'bottom'
    }
  ]
}

// ==================== 作者创作引导 ====================
export const writerTourConfig: TourConfig = {
  id: 'writer-tour',
  name: '创作工具',
  description: '了解如何创作和发布作品',
  skippable: true,
  showProgress: true,
  triggerOn: ['/writer', '/writer/workspace'],
  steps: [
    {
      target: '.project-list',
      title: '项目管理',
      content: '在这里管理你的小说项目，创建新作品或继续编辑现有作品。',
      placement: 'right'
    },
    {
      target: '.editor',
      title: '编辑器',
      content: '强大的写作编辑器，支持字数统计、自动保存、版本管理等功能。',
      placement: 'top'
    },
    {
      target: '.ai-tools',
      title: 'AI辅助创作',
      content: '使用AI工具帮助你生成灵感、续写内容、润色文字。',
      placement: 'left'
    },
    {
      target: '.publish-btn',
      title: '发布章节',
      content: '写完章节后点击发布，作品将进入审核流程。',
      placement: 'bottom'
    }
  ]
}

// ==================== 所有引导配置 ====================
export const onboardingTours: TourConfig[] = [
  welcomeTourConfig,
  bookstoreTourConfig,
  walletTourConfig,
  readerTourConfig,
  writerTourConfig
]

// ==================== 初始化函数 ====================
export function initializeOnboarding() {
  // 在应用启动时注册所有引导
  // 这个函数在主应用入口调用
  return onboardingTours
}
