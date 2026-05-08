/**
 * HTML清理工具 - 防止XSS攻击
 * 使用DOMPurify清理HTML内容，确保用户输入的内容安全
 */

// @ts-ignore - DOMPurify使用CommonJS导出
import DOMPurify from 'dompurify'

/**
 * DOMPurify配置选项
 */
interface SanitizeConfig {
  /**
   * 允许的HTML标签
   * 默认允许基本的文本格式化标签
   */
  ALLOWED_TAGS?: string[]

  /**
   * 允许的HTML属性
   * 默认只允许安全的属性
   */
  ALLOWED_ATTR?: string[]

  /**
   * 是否允许使用data:协议的URL
   * 默认为false（更安全）
   */
  ALLOW_DATA_ATTR?: boolean

  /**
   * 是否允许使用SVG标签
   * 默认为false（更安全）
   */
  USE_PROFILES?: {
    svg?: boolean
    svgFilters?: boolean
    mathMl?: boolean
    html?: boolean
  }
}

/**
 * 默认配置 - 允许基本的文本格式化
 */
const DEFAULT_CONFIG: SanitizeConfig = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'a',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'code',
    'pre',
    'hr',
    'sub',
    'sup',
    'del',
    'ins',
    'mark',
    'small',
    'span',
    'div',
  ],
  ALLOWED_ATTR: ['href', 'title', 'class', 'target'],
  ALLOW_DATA_ATTR: false,
}

/**
 * Markdown内容配置 - 允许更多标签以支持Markdown渲染
 */
const MARKDOWN_CONFIG: SanitizeConfig = {
  ALLOWED_TAGS: [
    // 基本标签
    'p',
    'br',
    'hr',
    // 标题
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    // 文本格式
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'del',
    'ins',
    'mark',
    'sub',
    'sup',
    'small',
    // 列表
    'ul',
    'ol',
    'li',
    // 引用
    'blockquote',
    // 代码
    'code',
    'pre',
    // 表格
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    // 其他
    'div',
    'span',
    'a',
    'img',
  ],
  ALLOWED_ATTR: [
    'href',
    'title',
    'class',
    'target',
    'src',
    'alt',
    'width',
    'height',
    'align',
  ],
  ALLOW_DATA_ATTR: false,
}

/**
 * 清理HTML内容（使用默认配置）
 * @param dirty 未清理的HTML字符串
 * @param config 自定义配置（可选）
 * @returns 清理后的安全HTML字符串
 *
 * @example
 * ```ts
 * const dirty = '<script>alert("XSS")</script><p>安全内容</p>'
 * const clean = sanitizeHtml(dirty)
 * // 结果: '<p>安全内容</p>'
 * ```
 */
export function sanitizeHtml(dirty: string, config?: SanitizeConfig): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  const sanitizeConfig = config || DEFAULT_CONFIG

  return DOMPurify.sanitize(dirty, sanitizeConfig)
}

/**
 * 清理Markdown渲染后的HTML内容
 * 专门用于清理Markdown转换器（如marked）生成的HTML
 * @param dirty Markdown转换后的HTML字符串
 * @returns 清理后的安全HTML字符串
 *
 * @example
 * ```ts
 * const markdown = '# 标题\n\n<script>alert("XSS")</script>'
 * const html = marked(markdown)
 * const clean = sanitizeMarkdownHtml(html)
 * ```
 */
export function sanitizeMarkdownHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(dirty, MARKDOWN_CONFIG)
}

/**
 * 清理用户输入的纯文本内容
 * 即使内容不包含HTML标签，也应该通过此函数处理
 * @param text 用户输入的文本
 * @returns 转义后的安全文本
 *
 * @example
 * ```ts
 * const userInput = '<script>alert("XSS")</script>普通文本'
 * const safe = sanitizeText(userInput)
 * // 结果: '&lt;script&gt;alert("XSS")&lt;/script&gt;普通文本'
 * ```
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  // 转义HTML特殊字符
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 清理URL参数
 * 防止通过URL注入恶意代码
 * @param url URL字符串
 * @returns 清理后的安全URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  // 只允许http、https、mailto、tel协议
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']

  try {
    const parsedUrl = new URL(url)
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return ''
    }
    return url
  } catch {
    // URL解析失败，可能不是有效的URL
    return ''
  }
}

/**
 * 为DOMPurify添加自定义钩子
 * 可以在清理过程中执行额外的检查或修改
 */
export function setupSanitizeHooks(): void {
  // 添加钩子检查href属性
  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    // 检查所有href属性
    if (data.attrName === 'href') {
      // 确保href不是javascript:协议
      if (data.attrValue.startsWith('javascript:')) {
        data.attrValue = '' // 移除不安全的href
      }
    }

    // 检查src属性
    if (data.attrName === 'src') {
      // 只允许http、https、data:（受限）
      if (!data.attrValue.startsWith('http:') &&
          !data.attrValue.startsWith('https:') &&
          !data.attrValue.startsWith('data:image/png;base64,') &&
          !data.attrValue.startsWith('data:image/jpeg;base64,') &&
          !data.attrValue.startsWith('data:image/gif;base64,')) {
        data.attrValue = '' // 移除不安全的src
      }
    }
  })

  // 添加钩子检查元素
  DOMPurify.addHook('uponSanitizeElement', (_node, data) => {
    // 移除所有style标签
    if (data.tagName === 'style') {
      // DOMPurify会自动移除，这里只是示例
    }
  })
}

/**
 * 初始化清理工具
 * 在应用启动时调用，设置必要的钩子
 */
export function initSanitize(): void {
  setupSanitizeHooks()
}

/**
 * 创建带清理的计算属性辅助函数
 * 用于Vue组件中创建自动清理的computed属性
 * @param getter 原始getter函数
 * @param config 清理配置
 * @returns 新的getter函数
 */
export function createSanitizedComputed<T extends string>(
  getter: () => T,
  config?: SanitizeConfig
): () => string {
  return () => {
    const dirty = getter()
    return sanitizeHtml(dirty, config)
  }
}

/**
 * 批量清理多个HTML内容
 * @param contents HTML内容数组
 * @param config 清理配置
 * @returns 清理后的HTML内容数组
 */
export function sanitizeHtmlArray(
  contents: string[],
  config?: SanitizeConfig
): string[] {
  return contents.map(content => sanitizeHtml(content, config))
}

/**
 * 验证HTML是否安全（不进行清理）
 * @param html HTML字符串
 * @returns 是否安全
 */
export function isHtmlSafe(html: string): boolean {
  const clean = sanitizeHtml(html)
  return clean === html
}
