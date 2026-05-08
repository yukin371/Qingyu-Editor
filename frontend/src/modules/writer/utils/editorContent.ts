export function extractPlainTextFromEditorContent(content: string | undefined | null): string {
  if (!content) return ''

  try {
    return flattenNodeText(JSON.parse(content)).replace(/\n{3,}/g, '\n\n').trim()
  } catch {
    return String(content).trim()
  }
}

function flattenNodeText(node: unknown): string {
  if (!node) return ''

  if (Array.isArray(node)) {
    return node.map(flattenNodeText).filter(Boolean).join('\n')
  }

  if (typeof node !== 'object') {
    return ''
  }

  const typed = node as { type?: string; text?: string; content?: unknown[] }

  if (typed.type === 'text') {
    return typed.text || ''
  }

  const children = Array.isArray(typed.content)
    ? typed.content.map(flattenNodeText).filter(Boolean)
    : []

  if (typed.type === 'paragraph' || typed.type === 'heading' || typed.type === 'blockquote') {
    return children.join('') + '\n'
  }

  if (typed.type === 'hardBreak') {
    return '\n'
  }

  return children.join('')
}

export function buildEditorContentFromPlainText(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)

  return JSON.stringify({
    type: 'doc',
    content: paragraphs.length
      ? paragraphs.map((paragraph) => ({
          type: 'paragraph',
          content: [{ type: 'text', text: paragraph }],
        }))
      : [{ type: 'paragraph' }],
  })
}

export function appendPlainTextToEditorContent(
  existingContent: string | undefined | null,
  nextText: string,
): string {
  const appendedDoc = buildEditorContentFromPlainText(nextText)

  if (!existingContent) {
    return appendedDoc
  }

  try {
    const currentDoc = JSON.parse(existingContent) as { type?: string; content?: unknown[] }
    const nextDoc = JSON.parse(appendedDoc) as { content?: unknown[] }

    if (currentDoc.type === 'doc' && Array.isArray(currentDoc.content)) {
      return JSON.stringify({
        ...currentDoc,
        content: [...currentDoc.content, ...(nextDoc.content || [])],
      })
    }
  } catch {
    return `${existingContent}\n\n${nextText}`.trim()
  }

  return appendedDoc
}
