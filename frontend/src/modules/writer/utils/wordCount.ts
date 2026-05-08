/**
 * 字数统计工具
 */

/**
 * 字数统计结果
 */
export interface WordCountResult {
  total: number
  chinese: number
  english: number
  numbers: number
  punctuation: number
  whitespace: number
}

/**
 * 详细字数统计
 * @param text 文本内容
 * @param filterMarkdown 是否过滤Markdown语法
 */
export function detailedWordCount(text: string, filterMarkdown: boolean = false): WordCountResult {
  if (!text) {
    return {
      total: 0,
      chinese: 0,
      english: 0,
      numbers: 0,
      punctuation: 0,
      whitespace: 0
    }
  }

  let content = text

  if (filterMarkdown) {
    content = removeMarkdownSyntax(content)
  }

  // 统计各类字符
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g) || []
  const englishWords = content.match(/[a-zA-Z]+/g) || []
  const numbers: string[] = content.match(/\d+/g) || []
  const punctuation = content.match(/[，。！？；：""''（）、《》【】]/g) || []
  const whitespace: string[] = content.match(/\s+/g) || []

  const chinese = chineseChars.length
  const english = englishWords.length
  const numberCount = numbers.reduce((sum: number, num: string) => sum + num.length, 0)
  const punctuationCount = punctuation.length
  const whitespaceCount = whitespace.reduce((sum: number, ws: string) => sum + ws.length, 0)

  return {
    total: chinese + english,
    chinese,
    english,
    numbers: numberCount,
    punctuation: punctuationCount,
    whitespace: whitespaceCount
  }
}

/**
 * 移除Markdown语法
 * @param text Markdown文本
 */
export function removeMarkdownSyntax(text: string): string {
  return text
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码
    .replace(/`([^`]+)`/g, '$1')
    // 移除图片
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 移除链接，保留文本
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    // 移除标题标记
    .replace(/#{1,6}\s/g, '')
    // 移除粗体
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    // 移除斜体
    .replace(/\*([^*]+)\*/g, '$1')
    // 移除删除线
    .replace(/~~([^~]+)~~/g, '$1')
    // 移除引用
    .replace(/>\s/g, '')
    // 移除列表标记
    .replace(/^[-*+]\s/gm, '')
    // 移除有序列表标记
    .replace(/^\d+\.\s/gm, '')
    // 移除水平线
    .replace(/^[-*_]{3,}$/gm, '')
}

/**
 * 按段落统计字数
 * @param text 文本内容
 * @param filterMarkdown 是否过滤Markdown语法
 */
export function countByParagraph(
  text: string,
  filterMarkdown: boolean = false
): Array<{ paragraph: string; wordCount: number }> {
  const paragraphs = text.split(/\n\n+/)

  return paragraphs.map(paragraph => {
    const content = filterMarkdown ? removeMarkdownSyntax(paragraph) : paragraph
    const wordCount = detailedWordCount(content, false).total

    return {
      paragraph: paragraph.trim(),
      wordCount
    }
  })
}

/**
 * 计算写作速度（字/分钟）
 * @param wordCount 字数
 * @param timeInMinutes 时间（分钟）
 */
export function calculateWritingSpeed(wordCount: number, timeInMinutes: number): number {
  if (timeInMinutes === 0) return 0
  return Math.round(wordCount / timeInMinutes)
}

/**
 * 估算完成时间
 * @param currentWordCount 当前字数
 * @param targetWordCount 目标字数
 * @param writingSpeed 写作速度（字/分钟）
 */
export function estimateCompletionTime(
  currentWordCount: number,
  targetWordCount: number,
  writingSpeed: number
): number {
  const remainingWords = targetWordCount - currentWordCount
  if (remainingWords <= 0 || writingSpeed === 0) return 0
  return Math.ceil(remainingWords / writingSpeed)
}

/**
 * 格式化写作速度
 * @param speed 速度（字/分钟）
 */
export function formatWritingSpeed(speed: number): string {
  return `${speed} 字/分钟`
}

/**
 * 格式化完成时间
 * @param minutes 分钟数
 */
export function formatCompletionTime(minutes: number): string {
  if (minutes < 1) {
    return '即将完成'
  }
  if (minutes < 60) {
    return `约 ${minutes} 分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours < 24) {
    return mins > 0 ? `约 ${hours} 小时 ${mins} 分钟` : `约 ${hours} 小时`
  }
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours > 0 ? `约 ${days} 天 ${remainingHours} 小时` : `约 ${days} 天`
}

