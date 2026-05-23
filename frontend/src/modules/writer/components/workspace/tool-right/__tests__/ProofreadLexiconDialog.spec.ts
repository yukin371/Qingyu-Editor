import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProofreadLexiconDialog from '../ProofreadLexiconDialog.vue'
import {
  addUserProofreadIgnoredTerm,
  findProofreadLexiconMatches,
  getUserProofreadIgnoredTerms,
  importUserProofreadLexicon,
  resetUserProofreadLexiconForTest,
} from '@/modules/writer/services/proofreadLexicon.service'

const QyModalStub = {
  props: ['visible', 'title', 'width'],
  emits: ['update:visible'],
  template: '<div v-if="visible" class="qy-modal-stub"><slot /></div>',
}

const QyInputStub = {
  props: ['modelValue', 'placeholder'],
  emits: ['update:modelValue'],
  template:
    '<input :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
}

describe('ProofreadLexiconDialog', () => {
  beforeEach(() => {
    resetUserProofreadLexiconForTest()
  })

  const mountDialog = () =>
    mount(ProofreadLexiconDialog, {
      props: {
        visible: true,
      },
      global: {
        stubs: {
          QyModal: QyModalStub,
          QyInput: QyInputStub,
        },
      },
    })

  it('renders ignored terms and removes them through the dialog', async () => {
    addUserProofreadIgnoredTerm('青羽城')
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('青羽城')

    await wrapper.find('.proofread-lexicon-dialog__chip').trigger('click')

    expect(getUserProofreadIgnoredTerms()).toEqual([])
    expect(wrapper.emitted('changed')).toHaveLength(1)
  })

  it('adds a custom typo entry and refreshes the visible list', async () => {
    const wrapper = mountDialog()
    const inputs = wrapper.findAll('input')

    await inputs[0].setValue('青羽城')
    await inputs[1].setValue('青雨城')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('青羽城')
    expect(wrapper.text()).toContain('青雨城')
    expect(findProofreadLexiconMatches('他回到了青羽城。')).toEqual([
      expect.objectContaining({
        text: '青羽城',
        lexiconId: 'user-custom.zh-CN',
      }),
    ])
    expect(wrapper.emitted('changed')).toHaveLength(1)
  })

  it('removes a custom typo entry', async () => {
    importUserProofreadLexicon([
      {
        wrong: '因该',
        suggestions: ['应该'],
        category: 'user_typo',
      },
    ])
    const wrapper = mountDialog()

    await wrapper.find('.proofread-lexicon-dialog__entry button').trigger('click')

    expect(findProofreadLexiconMatches('他因该知道。').map((match) => match.lexiconId)).not.toContain(
      'user-custom.zh-CN',
    )
    expect(wrapper.emitted('changed')).toHaveLength(1)
  })

  it('exports and imports user lexicon json through the dialog', async () => {
    addUserProofreadIgnoredTerm('青羽城')
    importUserProofreadLexicon([
      {
        wrong: '因该',
        suggestions: ['应该'],
        category: 'user_typo',
      },
    ])
    const wrapper = mountDialog()

    await wrapper.findAll('.proofread-lexicon-dialog__import-actions button')[0].trigger('click')

    expect(wrapper.get('textarea').element.value).toContain('"青羽城"')
    expect(wrapper.get('textarea').element.value).toContain('"因该"')

    resetUserProofreadLexiconForTest()
    await wrapper.get('textarea').setValue(
      JSON.stringify({
        ignoredTerms: ['寒灯司'],
        entries: [{ wrong: '在接在厉', suggestions: ['再接再厉'] }],
      }),
    )
    await wrapper.findAll('.proofread-lexicon-dialog__import-actions button')[1].trigger('click')

    expect(getUserProofreadIgnoredTerms()).toEqual(['寒灯司'])
    expect(findProofreadLexiconMatches('他在接在厉。')).toEqual([
      expect.objectContaining({
        text: '在接在厉',
        lexiconId: 'user-custom.zh-CN',
      }),
    ])
    expect(wrapper.emitted('changed')).toHaveLength(1)
  })
})
