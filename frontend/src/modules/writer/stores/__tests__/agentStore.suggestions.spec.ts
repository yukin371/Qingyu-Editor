import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { AIAgentConfig } from '../../types/agent'

const mockSendIntent = vi.fn()
vi.mock('../../api/agent', () => ({
  sendIntent: (...args: any[]) => mockSendIntent(...args),
}))

import { useAgentStore } from '../agentStore'

const testConfig: AIAgentConfig = {
  provider: 'openai',
  apiKey: 'test-key',
  baseUrl: 'https://api.example.com/v1',
  model: 'gpt-4',
}

describe('agentStore suggestion management', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('suggestion routing', () => {
    it('text_diff suggestions route to textDiffSuggestions', async () => {
      mockSendIntent.mockResolvedValue({
        content: '已续写',
        suggestions: [
          { id: 's1', type: 'text_diff', action: 'append', targetEntity: 'chapter', targetId: 'ch1', content: '新内容', summary: '续写' },
        ],
      })

      const store = useAgentStore()
      await store.sendMessage('p1', '续写', testConfig)

      expect(store.textDiffSuggestions).toHaveLength(1)
      expect(store.textDiffSuggestions[0].type).toBe('text_diff')
      expect(store.entityPreviewSuggestions).toHaveLength(0)
    })

    it('entity_preview suggestions route to entityPreviewSuggestions', async () => {
      mockSendIntent.mockResolvedValue({
        content: '建议创建角色',
        suggestions: [
          { id: 's2', type: 'entity_preview', action: 'create', targetEntity: 'character', targetId: '', content: '{}', summary: '新角色' },
        ],
      })

      const store = useAgentStore()
      await store.sendMessage('p1', '创建角色', testConfig)

      expect(store.entityPreviewSuggestions).toHaveLength(1)
      expect(store.textDiffSuggestions).toHaveLength(0)
    })

    it('mixed suggestions route correctly', async () => {
      mockSendIntent.mockResolvedValue({
        content: 'ok',
        suggestions: [
          { id: 's1', type: 'text_diff', action: 'append', targetEntity: 'chapter', targetId: 'ch1', content: '文字', summary: 't1' },
          { id: 's2', type: 'entity_preview', action: 'create', targetEntity: 'character', targetId: '', content: '{}', summary: 't2' },
        ],
      })

      const store = useAgentStore()
      await store.sendMessage('p1', 'test', testConfig)

      expect(store.textDiffSuggestions).toHaveLength(1)
      expect(store.entityPreviewSuggestions).toHaveLength(1)
    })
  })

  describe('suggestion state machine', () => {
    it('transitions: pending → editing → previewing', async () => {
      mockSendIntent.mockResolvedValue({
        content: 'ok',
        suggestions: [
          { id: 's1', type: 'entity_preview', action: 'create', targetEntity: 'character', targetId: '', content: '{}', summary: 'test' },
        ],
      })

      const store = useAgentStore()
      await store.sendMessage('p1', 'test', testConfig)

      // pending
      expect(store.entityPreviewSuggestions[0].status).toBe('pending')

      // → editing
      store.editSuggestion('s1')
      expect(store.entityPreviewSuggestions[0].status).toBe('editing')

      // → previewing (after edit done)
      store.finishEditing('s1')
      expect(store.entityPreviewSuggestions[0].status).toBe('previewing')
    })

    it('marks suggestion as expired when content changes', async () => {
      mockSendIntent.mockResolvedValue({
        content: 'ok',
        suggestions: [
          { id: 's1', type: 'text_diff', action: 'update', targetEntity: 'chapter', targetId: 'ch1', content: 'new', originalContent: 'old', summary: 'test' },
        ],
      })

      const store = useAgentStore()
      await store.sendMessage('p1', 'test', testConfig)

      // 模拟内容被外部修改
      store.markExpiredIfContentChanged('ch1', 'something completely different')
      expect(store.textDiffSuggestions[0].status).toBe('expired')
    })

    it('does not expire if content unchanged', async () => {
      mockSendIntent.mockResolvedValue({
        content: 'ok',
        suggestions: [
          { id: 's1', type: 'text_diff', action: 'update', targetEntity: 'chapter', targetId: 'ch1', content: 'new', originalContent: 'old', summary: 'test' },
        ],
      })

      const store = useAgentStore()
      await store.sendMessage('p1', 'test', testConfig)

      store.markExpiredIfContentChanged('ch1', 'old')
      expect(store.textDiffSuggestions[0].status).toBe('pending')
    })
  })

  describe('getSuggestionById', () => {
    it('finds suggestion across both lists', async () => {
      mockSendIntent.mockResolvedValue({
        content: 'ok',
        suggestions: [
          { id: 's1', type: 'text_diff', action: 'append', targetEntity: 'chapter', targetId: 'ch1', content: 'a', summary: 't' },
          { id: 's2', type: 'entity_preview', action: 'create', targetEntity: 'character', targetId: '', content: '{}', summary: 't' },
        ],
      })

      const store = useAgentStore()
      await store.sendMessage('p1', 'test', testConfig)

      const s1 = store.getSuggestionById('s1')
      expect(s1).toBeDefined()
      expect(s1!.type).toBe('text_diff')

      const s2 = store.getSuggestionById('s2')
      expect(s2).toBeDefined()
      expect(s2!.type).toBe('entity_preview')

      const s3 = store.getSuggestionById('nonexistent')
      expect(s3).toBeUndefined()
    })
  })
})
