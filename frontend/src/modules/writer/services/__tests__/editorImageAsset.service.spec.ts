import { describe, expect, it } from 'vitest'
import { createEmbeddedEditorImage } from '../editorImageAsset.service'

describe('editorImageAsset service', () => {
  it('应把允许的图片文件转换为可持久化的 data url', async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], 'sample.png', {
      type: 'image/png',
    })

    const result = await createEmbeddedEditorImage(file)

    expect(result.mode).toBe('embedded-data-url')
    expect(result.alt).toBe('sample.png')
    expect(result.src.startsWith('data:image/png;base64,')).toBe(true)
  })

  it('应拒绝不受支持的图片格式', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'sample.webp', {
      type: 'image/webp',
    })

    await expect(createEmbeddedEditorImage(file)).rejects.toThrow('目前仅支持 PNG、JPG、GIF 图片')
  })
})
