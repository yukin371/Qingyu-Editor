/**
 * 从章节内容中提取已出现的角色名
 */

/**
 * 从文本中提取出现的角色名，按首次出现顺序返回
 * @param content 章节内容（纯文本或HTML）
 * @param characterNames 项目中所有角色名列表
 * @returns 出现的角色名列表（按首次出现顺序，去重）
 */
export function extractNearbyCharacters(
  content: string,
  characterNames: string[],
): string[] {
  if (!content || !characterNames.length) return []

  // 去除 HTML 标签
  const plainText = stripHtml(content)

  const found: string[] = []
  const seen = new Set<string>()

  for (const name of characterNames) {
    if (seen.has(name)) continue
    if (plainText.includes(name)) {
      found.push(name)
      seen.add(name)
    }
  }

  // 按首次出现位置排序
  found.sort((a, b) => plainText.indexOf(a) - plainText.indexOf(b))

  return found
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}
