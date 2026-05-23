import { beforeEach, describe, expect, it } from 'vitest'
import {
  addUserProofreadIgnoredTerm,
  exportUserProofreadLexiconState,
  findAllProofreadLexiconMatches,
  findExternalProofreadLexiconMatches,
  findProofreadLexiconMatches,
  getUserProofreadIgnoredTerms,
  importUserProofreadLexicon,
  importUserProofreadLexiconState,
  resetUserProofreadLexiconForTest,
} from '../proofreadLexicon.service'

describe('proofreadLexicon.service', () => {
  beforeEach(() => {
    resetUserProofreadLexiconForTest()
  })

  it('matches builtin common typo lexicon entries', () => {
    const matches = findProofreadLexiconMatches('既使如此，他也迫不急待地冲出去。')

    expect(matches.map((match) => match.text)).toEqual(['既使', '迫不急待'])
    expect(matches[0]).toMatchObject({
      start: 0,
      end: 2,
      lexiconId: 'common-confusions.zh-CN',
      entry: {
        suggestions: ['即使'],
      },
    })
  })

  it('accepts external lexicons with the same schema', () => {
    const matches = findProofreadLexiconMatches('他在接在厉地练剑。', [
      {
        id: 'external-demo',
        locale: 'zh-CN',
        version: '1',
        entries: [
          {
            wrong: '在接在厉',
            suggestions: ['再接再厉'],
            category: 'idiom_typo',
          },
        ],
      },
    ])

    expect(matches).toHaveLength(1)
    expect(matches[0]).toMatchObject({
      text: '在接在厉',
      lexiconId: 'external-demo',
      start: 1,
    })
  })

  it('filters matches with user ignored terms', () => {
    addUserProofreadIgnoredTerm('既使')

    expect(getUserProofreadIgnoredTerms()).toContain('既使')
    expect(findProofreadLexiconMatches('既使如此。')).toEqual([])
  })

  it('imports user custom lexicon entries', () => {
    importUserProofreadLexicon([
      {
        wrong: '青羽城',
        suggestions: ['青雨城'],
        category: 'project_term',
        severity: 'warning',
      },
    ])

    expect(findProofreadLexiconMatches('他回到了青羽城。')).toEqual([
      expect.objectContaining({
        text: '青羽城',
        lexiconId: 'user-custom.zh-CN',
      }),
    ])
  })

  it('deduplicates overlapping builtin and user entries by keeping the later lexicon', () => {
    importUserProofreadLexicon([
      {
        wrong: '既使',
        suggestions: ['即使如此'],
        category: 'project_style',
        severity: 'suggestion',
      },
    ])

    expect(findProofreadLexiconMatches('既使如此。')).toEqual([
      expect.objectContaining({
        text: '既使',
        lexiconId: 'user-custom.zh-CN',
        entry: expect.objectContaining({
          suggestions: ['即使如此'],
        }),
      }),
    ])
  })

  it('uses the MIT cnchar idiom lexicon to suggest likely idiom corrections', () => {
    expect(findExternalProofreadLexiconMatches('他已经迫不急待地冲出去。')).toEqual([
      expect.objectContaining({
        text: '迫不急待',
        lexiconId: 'cnchar-idiom@3.2.6',
        entry: expect.objectContaining({
          category: 'external_idiom',
          suggestions: ['迫不及待'],
        }),
      }),
    ])
  })

  it('does not report ordinary four-character prose as idiom typos', () => {
    expect(findExternalProofreadLexiconMatches('他回到了青羽城，城门外灯火通明。')).toEqual([])
  })

  it('keeps curated entries ahead of generated idiom suggestions for the same range', () => {
    expect(findAllProofreadLexiconMatches('他迫不急待地冲出去。')).toEqual([
      expect.objectContaining({
        text: '迫不急待',
        lexiconId: 'common-confusions.zh-CN',
      }),
    ])
  })

  it('exports and imports user lexicon state by merging entries and ignored terms', () => {
    importUserProofreadLexiconState({
      ignoredTerms: ['青羽城'],
      entries: [
        {
          wrong: '因该',
          suggestions: ['应该'],
          category: 'user_typo',
        },
      ],
    })

    expect(exportUserProofreadLexiconState()).toMatchObject({
      ignoredTerms: ['青羽城'],
      entries: [
        expect.objectContaining({
          wrong: '因该',
          suggestions: ['应该'],
        }),
      ],
    })

    importUserProofreadLexiconState({
      ignoredTerms: ['青羽城', '寒灯司'],
      entries: [
        {
          wrong: '因该',
          suggestions: ['应当'],
          severity: 'suggestion',
        },
      ],
    })

    expect(exportUserProofreadLexiconState()).toMatchObject({
      ignoredTerms: ['青羽城', '寒灯司'],
      entries: [
        expect.objectContaining({
          wrong: '因该',
          suggestions: ['应当'],
          severity: 'suggestion',
        }),
      ],
    })
  })
})
