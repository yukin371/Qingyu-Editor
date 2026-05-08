import type {
  StoryHarnessCharacterSummary,
  StoryHarnessRelationSummary,
  StoryHarnessChangeRequestPreview,
} from '@/modules/writer/stores/v3/storyHarnessStore'

interface BuildStoryHarnessSuggestionsPayload {
  chapterTitle: string
  content: string
  activeCharacters: StoryHarnessCharacterSummary[]
  activeRelations: StoryHarnessRelationSummary[]
  allCharacters: Array<{
    id: string
    name: string
  }>
}

const INLINE_DIRECTIVE_PATTERN = /^\s*\/\/\s*@(?<name>[^\s]+)\s+(?<instruction>.+)$/gm

const STATE_PATTERNS: Array<{
  keyword: RegExp
  label: string
}> = [
  { keyword: /受伤|负伤|断了手|重伤/, label: '状态可能转为受伤或退出战斗' },
  { keyword: /怀疑|不信任|猜忌/, label: '状态可能转为怀疑或动摇' },
  { keyword: /背叛|反目|决裂/, label: '状态可能转为背叛或决裂' },
]

const takeEvidenceSnippet = (content: string, keyword?: string) => {
  const normalized = content.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''

  if (!keyword) {
    return normalized.slice(0, 48)
  }

  const hitIndex = normalized.indexOf(keyword)
  if (hitIndex < 0) {
    return normalized.slice(0, 48)
  }

  const start = Math.max(0, hitIndex - 10)
  const end = Math.min(normalized.length, hitIndex + keyword.length + 18)
  return normalized.slice(start, end)
}

const findCharacterByName = (
  allCharacters: BuildStoryHarnessSuggestionsPayload['allCharacters'],
  name: string,
) => allCharacters.find((character) => character.name === name)

export function buildStoryHarnessSuggestions(
  payload: BuildStoryHarnessSuggestionsPayload,
): StoryHarnessChangeRequestPreview[] {
  const content = payload.content.trim()
  if (!content) {
    return []
  }

  const suggestions: StoryHarnessChangeRequestPreview[] = []
  const activeCharacterNameSet = new Set(payload.activeCharacters.map((character) => character.name))

  for (const match of content.matchAll(INLINE_DIRECTIVE_PATTERN)) {
    const directiveName = match.groups?.name?.trim()
    const directiveInstruction = match.groups?.instruction?.trim()
    if (!directiveName || !directiveInstruction) {
      continue
    }

    const matchedCharacter = findCharacterByName(payload.allCharacters, directiveName)
    if (!matchedCharacter) {
      continue
    }

    suggestions.push({
      id: `directive-${matchedCharacter.id}`,
      source: 'live',
      type: 'state',
      title: `正文指令建议：更新 ${matchedCharacter.name}`,
      summary: directiveInstruction,
      reason: '这是正文里的显式作者指令，适合作为待确认的 Change Request，而不是强制立即落库。',
      evidence: match[0].trim(),
      severity: 'focus',
    })
  }

  if (content.length >= 120 && payload.activeCharacters.length === 0) {
    suggestions.push({
      id: 'scope-missing-active-characters',
      source: 'live',
      type: 'scene_scope',
      title: '补充当前场景出场名单',
      summary: '正文已经展开，但当前章节还没有声明活跃角色。',
      reason: 'Context Lens 需要最小作用域，下一次进入本章时才能自动对焦。',
      evidence: takeEvidenceSnippet(content),
      severity: 'focus',
    })
  }

  const mentionedOutOfScopeCharacters = payload.allCharacters
    .filter((character) => !activeCharacterNameSet.has(character.name) && content.includes(character.name))
    .slice(0, 2)

  if (mentionedOutOfScopeCharacters.length > 0) {
    suggestions.push({
      id: `scope-out-of-band-${mentionedOutOfScopeCharacters.map((character) => character.id).join('-')}`,
      source: 'live',
      type: 'scene_scope',
      title: '正文出现了未纳入作用域的角色',
      summary: `检测到 ${mentionedOutOfScopeCharacters.map((character) => character.name).join('、')} 已在正文中出现。`,
      reason: '如果这些角色会持续参与本章，建议补进 Scene Scope，避免 Lens 漏掉上下文。',
      evidence: takeEvidenceSnippet(content, mentionedOutOfScopeCharacters[0]?.name),
      severity: 'hint',
    })
  }

  const mentionedActiveCharacters = payload.activeCharacters.filter((character) => content.includes(character.name))

  if (mentionedActiveCharacters.length >= 2 && payload.activeRelations.length === 0) {
    suggestions.push({
      id: `relation-gap-${mentionedActiveCharacters.slice(0, 2).map((character) => character.id).join('-')}`,
      source: 'live',
      type: 'relation',
      title: '当前场景可能需要一条关系摘要',
      summary: `${mentionedActiveCharacters[0]?.name} 与 ${mentionedActiveCharacters[1]?.name} 同时出现在正文，但 Lens 中还没有关系线。`,
      reason: '关系摘要不一定要先填完，但补一条最小关系能让后续章节引用更稳。',
      evidence: takeEvidenceSnippet(content, mentionedActiveCharacters[0]?.name),
      severity: 'hint',
    })
  }

  for (const character of mentionedActiveCharacters) {
    const matchedStatePattern = STATE_PATTERNS.find((pattern) => {
      const relaxedPattern = new RegExp(`${character.name}.{0,12}${pattern.keyword.source}|${pattern.keyword.source}.{0,12}${character.name}`)
      return relaxedPattern.test(content)
    })

    if (!matchedStatePattern) {
      continue
    }

    suggestions.push({
      id: `state-${character.id}-${matchedStatePattern.label}`,
      source: 'live',
      type: 'state',
      title: `角色状态可能需要更新：${character.name}`,
      summary: matchedStatePattern.label,
      reason: '这类变化适合先作为 Change Request 预览，作者确认后再写回正式快照。',
      evidence: takeEvidenceSnippet(content, character.name),
      severity: 'focus',
    })
    break
  }

  return suggestions.slice(0, 3)
}
