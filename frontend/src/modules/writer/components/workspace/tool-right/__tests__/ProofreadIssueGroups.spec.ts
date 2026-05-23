import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProofreadIssueGroups from '../ProofreadIssueGroups.vue'
import type { ProofreadIssue } from '@/modules/writer/composables/useProofreadPanel'

const baseIssue: ProofreadIssue = {
  id: 'issue-1',
  type: 'typo',
  severity: 'error',
  status: 'open',
  title: '错别字 / 标点',
  description: '发现疑似错别字。',
  suggestion: '建议改为“风声”。',
  replacementText: '风声',
  originalText: '凤声',
  position: { start: 3, end: 5 },
  source: 'ai',
}

describe('ProofreadIssueGroups', () => {
  const mountGroups = (issue: ProofreadIssue = baseIssue) =>
    mount(ProofreadIssueGroups, {
      props: {
        groupedIssues: [
          {
            type: 'typo',
            label: '错别字 / 标点',
            items: [issue],
          },
        ],
      },
    })

  it('emits apply when an ai issue has a replacement suggestion', async () => {
    const wrapper = mountGroups()
    const buttons = wrapper.findAll('button')

    await buttons[0].trigger('click')

    expect(wrapper.emitted('apply')).toEqual([['issue-1']])
  })

  it('emits locate when the issue has an open text position', async () => {
    const wrapper = mountGroups()
    const buttons = wrapper.findAll('button')

    await buttons[1].trigger('click')

    expect(wrapper.emitted('locate')).toEqual([['issue-1']])
  })

  it('disables locate for stale issues', () => {
    const wrapper = mountGroups({ ...baseIssue, status: 'stale' })
    const buttons = wrapper.findAll('button')

    expect(buttons[0].attributes('disabled')).toBeDefined()
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('does not show apply for local rule prose suggestions', () => {
    const wrapper = mountGroups({ ...baseIssue, source: 'local', replacementText: undefined })
    const buttons = wrapper.findAll('button')

    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toBe('定位')
    expect(buttons[1].text()).toBe('加白')
  })

  it('shows apply for local lexicon issues with explicit replacement text', async () => {
    const wrapper = mountGroups({ ...baseIssue, source: 'local' })
    const buttons = wrapper.findAll('button')

    expect(buttons[0].text()).toBe('应用')

    await buttons[0].trigger('click')

    expect(wrapper.emitted('apply')).toEqual([['issue-1']])
  })
})
