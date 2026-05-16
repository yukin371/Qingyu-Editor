import { describe, expect, it } from 'vitest'
import {
  formatChineseOrdinal,
  formatDefaultChapterTitle,
  formatDefaultVolumeTitle,
} from '../writerDocumentNaming'

describe('writerDocumentNaming', () => {
  it('格式化默认卷章标题时应统一使用中文序数', () => {
    expect(formatDefaultVolumeTitle(2)).toBe('第二卷')
    expect(formatDefaultChapterTitle(3)).toBe('第三章')
    expect(formatDefaultChapterTitle(10)).toBe('第十章')
    expect(formatDefaultChapterTitle(21)).toBe('第二十一章')
  })

  it('应支持长篇章节序号', () => {
    expect(formatChineseOrdinal(105)).toBe('一百零五')
    expect(formatDefaultChapterTitle(1001)).toBe('第一千零一章')
  })
})
