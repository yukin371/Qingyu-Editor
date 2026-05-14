type TipTapNode = {
  type?: string
  text?: string
  content?: TipTapNode[]
  [key: string]: unknown
}

function cleanNode(node: unknown, trimLeadingText: boolean): unknown {
  if (!node || typeof node !== 'object') return node

  const current = node as TipTapNode

  if (current.type === 'text' && typeof current.text === 'string') {
    return {
      ...current,
      text: trimLeadingText ? current.text.replace(/^ +/, '') : current.text,
    }
  }

  if (current.type === 'paragraph' && Array.isArray(current.content)) {
    return {
      ...current,
      content: current.content.map((child, index) => cleanNode(child, index === 0)),
    }
  }

  if (Array.isArray(current.content)) {
    return {
      ...current,
      content: current.content.map((child) => cleanNode(child, false)),
    }
  }

  return node
}

export function cleanParagraphLeadingSpaces(doc: unknown): unknown {
  return cleanNode(doc, false)
}
