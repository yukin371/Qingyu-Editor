const CHINESE_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const CHINESE_UNITS = ['', '十', '百', '千']
const SECTION_UNITS = ['', '万', '亿']

function formatSection(section: number): string {
  let result = ''
  let pendingZero = false

  for (let unitIndex = CHINESE_UNITS.length - 1; unitIndex >= 0; unitIndex -= 1) {
    const divisor = 10 ** unitIndex
    const digit = Math.floor(section / divisor)
    section %= divisor

    if (digit === 0) {
      pendingZero = result.length > 0 && section > 0
      continue
    }

    if (pendingZero) {
      result += CHINESE_DIGITS[0]
      pendingZero = false
    }

    result += CHINESE_DIGITS[digit] + CHINESE_UNITS[unitIndex]
  }

  return result
}

export function formatChineseOrdinal(value: number): string {
  const normalized = Math.floor(Number(value))
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return CHINESE_DIGITS[0]
  }

  let remaining = normalized
  let sectionIndex = 0
  const parts: string[] = []
  let needsZero = false

  while (remaining > 0) {
    const section = remaining % 10000
    if (section === 0) {
      needsZero = parts.length > 0
    } else {
      let sectionText = formatSection(section)
      if (sectionIndex > 0) {
        sectionText += SECTION_UNITS[sectionIndex]
      }
      if (needsZero && section < 1000) {
        sectionText = `${CHINESE_DIGITS[0]}${sectionText}`
      }
      parts.unshift(sectionText)
      needsZero = false
    }

    remaining = Math.floor(remaining / 10000)
    sectionIndex += 1
  }

  const text = parts.join('')
  return text.startsWith('一十') ? text.slice(1) : text
}

export function formatDefaultChapterTitle(sequence: number): string {
  return `第${formatChineseOrdinal(sequence)}章`
}

export function formatDefaultVolumeTitle(sequence: number): string {
  return `第${formatChineseOrdinal(sequence)}卷`
}
