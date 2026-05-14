export interface MentionDraft {
  raw: string
  query: string
  from: number
  to: number
}

const MENTION_DRAFT_RE = /@([\u4e00-\u9fa5\w-]{0,30})$/

export function extractMentionDraft(textBefore: string, cursorPos: number): MentionDraft | null {
  const match = textBefore.match(MENTION_DRAFT_RE)
  if (!match) return null

  const raw = match[0] || ''
  const query = match[1] || ''
  const startsWithSpace = raw.startsWith(' ')
  const from = cursorPos - raw.length + (startsWithSpace ? 1 : 0)

  return {
    raw,
    query,
    from: Math.max(0, from),
    to: cursorPos,
  }
}
