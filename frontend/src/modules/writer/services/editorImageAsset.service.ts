const MAX_EMBEDDED_IMAGE_BYTES = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif'])

export type EmbeddedEditorImage = {
  src: string
  alt: string
  mimeType: string
  size: number
  mode: 'embedded-data-url'
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  if (typeof btoa === 'function') {
    return btoa(binary)
  }

  const fallback = globalThis as typeof globalThis & {
    Buffer?: { from(input: string, encoding: string): { toString(outputEncoding: string): string } }
  }
  if (fallback.Buffer) {
    return fallback.Buffer.from(binary, 'binary').toString('base64')
  }

  throw new Error('当前环境不支持图片编码')
}

function validateImage(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件')
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('目前仅支持 PNG、JPG、GIF 图片')
  }

  if (file.size > MAX_EMBEDDED_IMAGE_BYTES) {
    throw new Error('图片大小不能超过10MB')
  }
}

export async function createEmbeddedEditorImage(file: File): Promise<EmbeddedEditorImage> {
  validateImage(file)

  const bytes = new Uint8Array(await file.arrayBuffer())
  const base64 = toBase64(bytes)

  return {
    src: `data:${file.type};base64,${base64}`,
    alt: file.name,
    mimeType: file.type,
    size: file.size,
    mode: 'embedded-data-url',
  }
}
