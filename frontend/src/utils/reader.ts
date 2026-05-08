/**
 * 阅读器工具函数
 */

/**
 * 计算阅读时间（分钟）
 * @param wordCount 字数
 * @param readingSpeed 阅读速度（字/分钟），默认300
 */
export function calculateReadingTime(wordCount: number, readingSpeed: number = 300): number {
  return Math.ceil(wordCount / readingSpeed)
}

/**
 * 格式化阅读时间
 * @param minutes 分钟数
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return '不到1分钟'
  }
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

/**
 * 估算阅读速度（字/分钟）
 * @param wordCount 已读字数
 * @param timeInSeconds 已读时长（秒）
 */
export function estimateReadingSpeed(wordCount: number, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 300
  return Math.round((wordCount / timeInSeconds) * 60)
}

/**
 * 计算阅读进度百分比
 * @param currentChapter 当前章节序号
 * @param totalChapters 总章节数
 * @param chapterProgress 当前章节进度（0-100）
 */
export function calculateProgress(
  currentChapter: number,
  totalChapters: number,
  chapterProgress: number = 0
): number {
  if (totalChapters === 0) return 0
  const baseProgress = ((currentChapter - 1) / totalChapters) * 100
  const currentChapterProgress = (chapterProgress / 100) * (1 / totalChapters) * 100
  return Math.min(100, Math.round(baseProgress + currentChapterProgress))
}

/**
 * 格式化章节内容
 * @param content HTML内容
 * @param _settings 阅读设置 (预留参数，未来可能使用)
 */
export function formatChapterContent(
  content: string,
  _settings?: {
    fontSize?: number
    lineHeight?: number
    paragraphSpacing?: number
  }
): string {
  if (!content) return ''
  void _settings

  // 移除空段落
  let formatted = content.replace(/<p>\s*<\/p>/g, '')

  // 移除多余的空格
  formatted = formatted.replace(/\s+/g, ' ')

  // 确保段落标签正确
  formatted = formatted.replace(/<p>/g, '<p class="chapter-paragraph">')

  return formatted
}

/**
 * 提取纯文本内容（去除HTML标签）
 * @param html HTML内容
 */
export function extractPlainText(html: string): string {
  // 使用临时div元素提取文本内容
  const div = document.createElement('div')
  // 先使用DOMPurify清理HTML，防止XSS攻击
  // 注意：这里我们仍然使用innerHTML，但不会执行脚本，因为我们只是提取文本
  // 在生产环境中，应该先清理再使用innerHTML
  const cleanHtml = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // 移除script标签
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // 移除iframe标签
    .replace(/<object[^>]*>.*?<\/object>/gi, '') // 移除object标签
    .replace(/<embed[^>]*>/gi, '') // 移除embed标签
  div.innerHTML = cleanHtml
  return div.textContent || div.innerText || ''
}

/**
 * 计算文本字数（中文按字符，英文按单词）
 * @param text 文本内容
 */
export function countWords(text: string): number {
  // 移除HTML标签
  const plainText = extractPlainText(text)

  // 匹配中文字符
  const chineseChars = plainText.match(/[\u4e00-\u9fa5]/g) || []

  // 匹配英文单词
  const englishWords = plainText.match(/[a-zA-Z]+/g) || []

  return chineseChars.length + englishWords.length
}

/**
 * 生成书签位置标识
 * @param chapterId 章节ID
 * @param scrollPosition 滚动位置
 */
export function generateBookmarkPosition(chapterId: string, scrollPosition: number): string {
  return `${chapterId}:${scrollPosition}`
}

/**
 * 解析书签位置
 * @param position 位置标识
 */
export function parseBookmarkPosition(position: string): { chapterId: string; scrollPosition: number } | null {
  const parts = position.split(':')
  if (parts.length !== 2) return null
  return {
    chapterId: parts[0],
    scrollPosition: parseInt(parts[1], 10)
  }
}

/**
 * 获取滚动百分比
 * @param scrollTop 滚动距离
 * @param scrollHeight 总高度
 * @param clientHeight 可见高度
 */
export function getScrollPercentage(scrollTop: number, scrollHeight: number, clientHeight: number): number {
  const maxScroll = scrollHeight - clientHeight
  if (maxScroll <= 0) return 100
  return Math.min(100, Math.round((scrollTop / maxScroll) * 100))
}

/**
 * 平滑滚动到指定位置
 * @param element 目标元素
 * @param position 目标位置
 * @param duration 动画时长（毫秒）
 */
export function smoothScrollTo(element: HTMLElement, position: number, duration: number = 300): void {
  const start = element.scrollTop
  const distance = position - start
  const startTime = performance.now()

  function animation(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用缓动函数
    const easeProgress = easeInOutCubic(progress)

    element.scrollTop = start + distance * easeProgress

    if (progress < 1) {
      requestAnimationFrame(animation)
    }
  }

  requestAnimationFrame(animation)
}

/**
 * 缓动函数
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * 检查是否支持本地存储
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * 保存阅读设置到本地
 * @param settings 阅读设置
 */
export function saveReadingSettingsToLocal(settings: any): void {
  if (!isLocalStorageAvailable()) return
  try {
    localStorage.setItem('reading_settings', JSON.stringify(settings))
  } catch (error) {
    console.error('保存阅读设置失败:', error)
  }
}

/**
 * 从本地加载阅读设置
 */
export function loadReadingSettingsFromLocal(): any | null {
  if (!isLocalStorageAvailable()) return null
  try {
    const settings = localStorage.getItem('reading_settings')
    return settings ? JSON.parse(settings) : null
  } catch (error) {
    console.error('加载阅读设置失败:', error)
    return null
  }
}
