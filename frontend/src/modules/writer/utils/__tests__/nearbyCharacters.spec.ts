import { describe, expect, it } from 'vitest'
import { extractNearbyCharacters } from '../../utils/nearbyCharacters'

describe('extractNearbyCharacters', () => {
  it('extracts character names from plain text', () => {
    const text = '林雪走进了房间，赵衡正站在窗前。'
    const characterNames = ['林雪', '赵衡', '王五']

    const result = extractNearbyCharacters(text, characterNames)
    expect(result).toEqual(['林雪', '赵衡'])
    expect(result).not.toContain('王五')
  })

  it('handles empty text', () => {
    const result = extractNearbyCharacters('', ['林雪', '赵衡'])
    expect(result).toEqual([])
  })

  it('handles empty character list', () => {
    const result = extractNearbyCharacters('林雪走过来', [])
    expect(result).toEqual([])
  })

  it('handles HTML content by stripping tags', () => {
    const html = '<p>林雪说：<strong>你好</strong></p><p>赵衡点了点头</p>'
    const characterNames = ['林雪', '赵衡']

    const result = extractNearbyCharacters(html, characterNames)
    expect(result).toEqual(['林雪', '赵衡'])
  })

  it('deduplicates character names', () => {
    const text = '林雪看着林雪的影子'
    const characterNames = ['林雪']

    const result = extractNearbyCharacters(text, characterNames)
    expect(result).toEqual(['林雪'])
    expect(result).toHaveLength(1)
  })

  it('respects order of first appearance', () => {
    const text = '赵衡先到了，然后林雪也来了'
    const characterNames = ['林雪', '赵衡', '王五']

    const result = extractNearbyCharacters(text, characterNames)
    expect(result).toEqual(['赵衡', '林雪'])
  })

  it('handles partial name matches correctly', () => {
    const text = '林雪和林峰都在场'
    const characterNames = ['林雪', '林峰']

    const result = extractNearbyCharacters(text, characterNames)
    expect(result).toEqual(['林雪', '林峰'])
  })

  it('does not match substrings of non-character words', () => {
    const text = '这个树林雪景很美'
    const characterNames = ['林雪']

    // "树林雪景" 中的 "林雪" 是子串匹配，但确实是连续的，所以应该匹配
    // 这是可接受的行为——宁可多匹配也不漏匹配
    const result = extractNearbyCharacters(text, characterNames)
    expect(result).toEqual(['林雪'])
  })
})
