import { describe, expect, it } from 'vitest'
import { calculateWritingWordCount, detailedWordCount } from '../wordCount'

describe('writer wordCount', () => {
  it('只统计汉字和连续拉丁词，排除标点、数字和空白', () => {
    expect(calculateWritingWordCount('你好，世界！123 hahaha... boom?')).toBe(6)
  })

  it('连续字母拟声词只算一个字', () => {
    expect(calculateWritingWordCount('他笑了 hahaha 哈哈哈')).toBe(7)
  })

  it('详细统计 total 使用正文统计口径，标点单独计数', () => {
    expect(detailedWordCount('青羽，AI hahaha!!! 2026')).toMatchObject({
      total: 4,
      chinese: 2,
      english: 2,
      numbers: 4,
      punctuation: 4,
    })
  })
})
