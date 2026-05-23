import commonConfusions from '@/modules/writer/data/proofreadLexicons/common-confusions.zh-CN.json'
import cnchar from 'cnchar'
import cncharIdiom from 'cnchar-idiom'
import { pinyin } from 'pinyin-pro'

export type ProofreadLexiconSeverity = 'error' | 'warning' | 'suggestion'

export interface ProofreadLexiconEntry {
  wrong: string
  suggestions: string[]
  category?: string
  severity?: ProofreadLexiconSeverity
  message?: string
}

export interface ProofreadLexicon {
  id: string
  locale: string
  version: string
  description?: string
  entries: ProofreadLexiconEntry[]
}

export interface ProofreadLexiconMatch {
  entry: ProofreadLexiconEntry
  start: number
  end: number
  text: string
  lexiconId: string
}

const builtinLexicons = [commonConfusions as ProofreadLexicon]
const USER_LEXICON_STORAGE_KEY = 'qingyu-editor:writer-proofread-user-lexicon'
const EXTERNAL_IDIOM_LEXICON_ID = 'cnchar-idiom@3.2.6'
const CHINESE_RUN_PATTERN = /[\u4e00-\u9fa5]{4,}/g
let memoryUserState: UserProofreadLexiconState = {
  ignoredTerms: [],
  entries: [],
}
let cncharIdiomReady = false
let idiomIndexCache: IdiomIndex | null = null

export interface UserProofreadLexiconState {
  ignoredTerms: string[]
  entries: ProofreadLexiconEntry[]
}

export interface UserProofreadLexiconImportResult {
  ignoredTerms: string[]
  entries: ProofreadLexiconEntry[]
  ignoredTermCount: number
  entryCount: number
}

interface IdiomIndex {
  idiomSet: Set<string>
  signatureMap: Map<string, string[]>
}

function ensureCncharIdiom() {
  if (!cncharIdiomReady) {
    cnchar.use(cncharIdiom)
    cncharIdiomReady = true
  }
  return cnchar.idiom
}

function canUseLocalStorage() {
  return (
    (typeof window !== 'undefined' && !!window.localStorage) ||
    (typeof globalThis !== 'undefined' && 'localStorage' in globalThis)
  )
}

function getLocalStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  const storage = (globalThis as { localStorage?: Storage }).localStorage
  return storage || null
}

function normalizeEntry(entry: ProofreadLexiconEntry): ProofreadLexiconEntry | null {
  const wrong = entry.wrong?.trim()
  if (!wrong) return null

  return {
    wrong,
    suggestions: Array.isArray(entry.suggestions)
      ? entry.suggestions.map((item) => item.trim()).filter(Boolean)
      : [],
    category: entry.category?.trim() || 'user_typo',
    severity:
      entry.severity === 'error' || entry.severity === 'warning' || entry.severity === 'suggestion'
        ? entry.severity
        : 'warning',
    message: entry.message?.trim() || undefined,
  }
}

function normalizeUserState(input: Partial<UserProofreadLexiconState> | null): UserProofreadLexiconState {
  const ignoredTerms = Array.isArray(input?.ignoredTerms)
    ? Array.from(new Set(input.ignoredTerms.map((item) => item.trim()).filter(Boolean)))
    : []
  const entries = Array.isArray(input?.entries)
    ? input.entries
        .map((entry) => normalizeEntry(entry))
        .filter((entry): entry is ProofreadLexiconEntry => !!entry)
    : []

  return {
    ignoredTerms,
    entries,
  }
}

function readUserState(): UserProofreadLexiconState {
  if (!canUseLocalStorage()) {
    return memoryUserState
  }

  try {
    const raw = getLocalStorage()?.getItem(USER_LEXICON_STORAGE_KEY)
    memoryUserState = normalizeUserState(
      raw ? (JSON.parse(raw) as Partial<UserProofreadLexiconState>) : memoryUserState,
    )
    return memoryUserState
  } catch {
    return memoryUserState
  }
}

function writeUserState(state: UserProofreadLexiconState) {
  memoryUserState = normalizeUserState(state)
  if (!canUseLocalStorage()) return
  try {
    getLocalStorage()?.setItem(USER_LEXICON_STORAGE_KEY, JSON.stringify(memoryUserState))
  } catch {
    // localStorage may be unavailable in restricted WebView contexts; keep memory fallback alive.
  }
}

function getCombinations(length: number, size: number) {
  const results: number[][] = []

  function visit(start: number, current: number[]) {
    if (current.length === size) {
      results.push([...current])
      return
    }

    for (let index = start; index < length; index += 1) {
      current.push(index)
      visit(index + 1, current)
      current.pop()
    }
  }

  visit(0, [])
  return results
}

const IDIOM_WILDCARD_COMBINATIONS = [
  ...getCombinations(4, 1),
  ...getCombinations(4, 2),
]

function createIdiomSignature(text: string, wildcardIndexes: number[]) {
  const wildcardSet = new Set(wildcardIndexes)
  return Array.from(text)
    .map((char, index) => (wildcardSet.has(index) ? '*' : char))
    .join('')
}

function buildIdiomIndex(): IdiomIndex {
  if (idiomIndexCache) return idiomIndexCache

  const idiomApi = ensureCncharIdiom()
  const idioms = idiomApi.dict.idiom.filter((item) => item.length === 4)
  const signatureMap = new Map<string, string[]>()

  for (const idiom of idioms) {
    for (const wildcardIndexes of IDIOM_WILDCARD_COMBINATIONS) {
      const signature = createIdiomSignature(idiom, wildcardIndexes)
      const current = signatureMap.get(signature) || []
      current.push(idiom)
      signatureMap.set(signature, current)
    }
  }

  idiomIndexCache = {
    idiomSet: new Set(idioms),
    signatureMap,
  }
  return idiomIndexCache
}

function getPlainPinyin(text: string): string[] {
  return pinyin(text, { toneType: 'none', type: 'array' }) as string[]
}

function rankIdiomSuggestion(candidate: string, idiom: string) {
  const candidateChars = Array.from(candidate)
  const idiomChars = Array.from(idiom)
  const candidatePinyin = getPlainPinyin(candidate)
  const idiomPinyin = getPlainPinyin(idiom)
  let sameCharCount = 0
  let samePinyinCount = 0

  for (let index = 0; index < idiomChars.length; index += 1) {
    if (candidateChars[index] === idiomChars[index]) sameCharCount += 1
    if (candidatePinyin[index] && candidatePinyin[index] === idiomPinyin[index]) samePinyinCount += 1
  }

  return {
    sameCharCount,
    samePinyinCount,
    score: sameCharCount * 2 + samePinyinCount,
  }
}

function findIdiomSuggestion(candidate: string): ProofreadLexiconEntry | null {
  const idiomIndex = buildIdiomIndex()
  if (idiomIndex.idiomSet.has(candidate)) return null

  const suggestions = new Set<string>()
  for (const wildcardIndexes of IDIOM_WILDCARD_COMBINATIONS) {
    const signature = createIdiomSignature(candidate, wildcardIndexes)
    for (const idiom of idiomIndex.signatureMap.get(signature) || []) {
      suggestions.add(idiom)
    }
  }

  const ranked = Array.from(suggestions)
    .map((idiom) => ({
      idiom,
      ...rankIdiomSuggestion(candidate, idiom),
    }))
    .filter((item) => item.sameCharCount >= 3 || (item.sameCharCount >= 2 && item.samePinyinCount >= 3))
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.sameCharCount - left.sameCharCount ||
        left.idiom.localeCompare(right.idiom, 'zh-CN'),
    )

  const best = ranked[0]
  if (!best) return null

  return {
    wrong: candidate,
    suggestions: [best.idiom],
    category: 'external_idiom',
    severity: best.sameCharCount >= 3 ? 'error' : 'warning',
    message: `检测到疑似成语错写“${candidate}”，可核对是否应为“${best.idiom}”。`,
  }
}

export function getBuiltinProofreadLexicons(): ProofreadLexicon[] {
  return builtinLexicons
}

export function getUserProofreadIgnoredTerms(): string[] {
  return readUserState().ignoredTerms
}

export function addUserProofreadIgnoredTerm(term: string): string[] {
  const normalizedTerm = term.trim()
  const state = readUserState()
  if (!normalizedTerm) return state.ignoredTerms

  const ignoredTerms = Array.from(new Set([...state.ignoredTerms, normalizedTerm]))
  writeUserState({ ...state, ignoredTerms })
  return ignoredTerms
}

export function removeUserProofreadIgnoredTerm(term: string): string[] {
  const normalizedTerm = term.trim()
  const state = readUserState()
  const ignoredTerms = state.ignoredTerms.filter((item) => item !== normalizedTerm)
  writeUserState({ ...state, ignoredTerms })
  return ignoredTerms
}

export function getUserProofreadLexicon(): ProofreadLexicon {
  const state = readUserState()
  return {
    id: 'user-custom.zh-CN',
    locale: 'zh-CN',
    version: 'local',
    description: '用户自定义校对词库',
    entries: state.entries,
  }
}

export function importUserProofreadLexicon(entries: ProofreadLexiconEntry[]) {
  const state = readUserState()
  const nextEntries = [...state.entries]

  for (const entry of entries) {
    const normalized = normalizeEntry(entry)
    if (!normalized) continue
    const existingIndex = nextEntries.findIndex((item) => item.wrong === normalized.wrong)
    if (existingIndex >= 0) {
      nextEntries[existingIndex] = normalized
    } else {
      nextEntries.push(normalized)
    }
  }

  writeUserState({ ...state, entries: nextEntries })
  return getUserProofreadLexicon()
}

export function exportUserProofreadLexiconState(): UserProofreadLexiconState {
  return normalizeUserState(readUserState())
}

export function importUserProofreadLexiconState(
  statePatch: Partial<UserProofreadLexiconState>,
): UserProofreadLexiconImportResult {
  const current = readUserState()
  const incoming = normalizeUserState(statePatch)
  const ignoredTerms = Array.from(new Set([...current.ignoredTerms, ...incoming.ignoredTerms]))
  const entries = [...current.entries]

  for (const entry of incoming.entries) {
    const existingIndex = entries.findIndex((item) => item.wrong === entry.wrong)
    if (existingIndex >= 0) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }
  }

  writeUserState({ ignoredTerms, entries })

  return {
    ignoredTerms,
    entries,
    ignoredTermCount: incoming.ignoredTerms.length,
    entryCount: incoming.entries.length,
  }
}

export function removeUserProofreadLexiconEntry(wrong: string) {
  const normalizedWrong = wrong.trim()
  const state = readUserState()
  const entries = state.entries.filter((entry) => entry.wrong !== normalizedWrong)
  writeUserState({ ...state, entries })
  return getUserProofreadLexicon()
}

export function resetUserProofreadLexiconForTest() {
  memoryUserState = { ignoredTerms: [], entries: [] }
  getLocalStorage()?.removeItem(USER_LEXICON_STORAGE_KEY)
}

export function getActiveProofreadLexicons(): ProofreadLexicon[] {
  const userLexicon = getUserProofreadLexicon()
  return userLexicon.entries.length > 0 ? [...builtinLexicons, userLexicon] : builtinLexicons
}

export function findProofreadLexiconMatches(
  sourceText: string,
  lexicons: ProofreadLexicon[] = getActiveProofreadLexicons(),
  ignoredTerms: string[] = getUserProofreadIgnoredTerms(),
): ProofreadLexiconMatch[] {
  const matchesByRange = new Map<string, ProofreadLexiconMatch>()
  const ignoredSet = new Set(ignoredTerms.map((term) => term.trim()).filter(Boolean))

  for (const lexicon of lexicons) {
    for (const entry of lexicon.entries) {
      if (!entry.wrong) continue
      if (ignoredSet.has(entry.wrong)) continue

      let searchFrom = 0
      while (searchFrom < sourceText.length) {
        const start = sourceText.indexOf(entry.wrong, searchFrom)
        if (start < 0) break

        const end = start + entry.wrong.length
        matchesByRange.set(`${start}:${end}:${entry.wrong}`, {
          entry,
          start,
          end,
          text: entry.wrong,
          lexiconId: lexicon.id,
        })
        searchFrom = start + entry.wrong.length
      }
    }
  }

  return Array.from(matchesByRange.values()).sort(
    (left, right) => left.start - right.start || left.end - right.end,
  )
}

export function findExternalProofreadLexiconMatches(
  sourceText: string,
  ignoredTerms: string[] = getUserProofreadIgnoredTerms(),
): ProofreadLexiconMatch[] {
  const ignoredSet = new Set(ignoredTerms.map((term) => term.trim()).filter(Boolean))
  const matchesByRange = new Map<string, ProofreadLexiconMatch>()
  let runMatch: RegExpExecArray | null

  while ((runMatch = CHINESE_RUN_PATTERN.exec(sourceText)) !== null) {
    const runText = runMatch[0]
    for (let offset = 0; offset <= runText.length - 4; offset += 1) {
      const candidate = runText.slice(offset, offset + 4)
      if (ignoredSet.has(candidate)) continue

      const entry = findIdiomSuggestion(candidate)
      if (!entry) continue

      const start = runMatch.index + offset
      const end = start + candidate.length
      matchesByRange.set(`${start}:${end}:${candidate}`, {
        entry,
        start,
        end,
        text: candidate,
        lexiconId: EXTERNAL_IDIOM_LEXICON_ID,
      })
    }
  }

  return Array.from(matchesByRange.values()).sort(
    (left, right) => left.start - right.start || left.end - right.end,
  )
}

export function findAllProofreadLexiconMatches(
  sourceText: string,
  ignoredTerms: string[] = getUserProofreadIgnoredTerms(),
): ProofreadLexiconMatch[] {
  const matchesByRange = new Map<string, ProofreadLexiconMatch>()
  for (const match of [
    ...findExternalProofreadLexiconMatches(sourceText, ignoredTerms),
    ...findProofreadLexiconMatches(sourceText, getActiveProofreadLexicons(), ignoredTerms),
  ]) {
    matchesByRange.set(`${match.start}:${match.end}:${match.text}`, match)
  }

  return Array.from(matchesByRange.values()).sort(
    (left, right) => left.start - right.start || left.end - right.end,
  )
}
