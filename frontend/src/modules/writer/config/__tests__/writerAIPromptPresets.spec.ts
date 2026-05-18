import { describe, expect, it } from 'vitest'
import {
  buildWriterAIAgentPrompt,
  buildWriterInternalSkillPrompt,
  getWriterAIToolHintText,
  getWriterAIPromptPreset,
  getWriterAIPromptText,
  inferWriterAIWorkflow,
  inferWriterAIWritingSkillId,
  listWriterInternalSkills,
  listWriterAIAgentWorkflows,
  listWriterAIWritingSkills,
  listWriterAIPromptPresets,
} from '../writerAIPromptPresets'

describe('writerAIPromptPresets', () => {
  it('groups writing, review and organize presets for the AI workflow', () => {
    const presets = listWriterAIPromptPresets()

    expect(presets.map((preset) => preset.group)).toEqual(
      expect.arrayContaining(['write', 'review', 'organize']),
    )
    expect(getWriterAIPromptPreset('chapterReview')).toMatchObject({
      group: 'review',
      label: '审本章',
    })
  })

  it('returns a safe fallback for unknown prompt ids', () => {
    expect(getWriterAIPromptText('missing-preset')).toBe('请提供帮助')
  })

  it('exposes a small fixed minimal-agent workflow set', () => {
    const workflows = listWriterAIAgentWorkflows()

    expect(workflows.map((workflow) => workflow.id)).toEqual([
      'chat',
      'write',
      'review',
      'organize',
      'explain_tool',
    ])
    expect(inferWriterAIWorkflow({
      route: 'single_document_edit',
      mutationMode: 'single_document_diff',
    })).toBe('write')
    expect(inferWriterAIWorkflow({
      route: 'analysis',
      mutationMode: 'none',
    })).toBe('review')
  })

  it('keeps default writing skills compact and explicit', () => {
    const recommended = listWriterAIWritingSkills({ recommendedOnly: true })

    expect(recommended.map((skill) => skill.id)).toEqual([
      'commercial_loop',
      'literary_texture',
      'pacing_boost',
      'character_depth',
    ])
    expect(listWriterAIWritingSkills().length).toBeLessThanOrEqual(5)
    expect(inferWriterAIWritingSkillId({
      route: 'single_document_edit',
      mutationMode: 'single_document_diff',
      intent: { action: 'continue' },
    })).toBe('pacing_boost')
  })

  it('builds one compact agent prompt from workflow, skill and tool hints', () => {
    const prompt = buildWriterAIAgentPrompt({
      workflow: 'write',
      skillId: 'commercial_loop',
      toolHintIds: ['scene_stage', 'assets'],
    })

    expect(prompt).toContain('极简 Agent：写作')
    expect(prompt).toContain('写作 Skill：商业爽文')
    expect(prompt).toContain('工具提示：')
    expect(prompt).toContain('当前场景')
    expect(prompt).toContain('设定资产')
    expect(getWriterAIToolHintText('timeline')).toContain('时间线')
  })

  it('keeps internal writing skills stage-based instead of exposing them as UI presets', () => {
    const initializationSkills = listWriterInternalSkills('initialization')
    const prompt = buildWriterInternalSkillPrompt([
      'project_positioning',
      'genre_contract',
      'golden_three_chapters',
    ])

    expect(initializationSkills.map((skill) => skill.id)).toEqual([
      'project_positioning',
      'genre_contract',
      'audience_promise',
    ])
    expect(prompt).toContain('内置写作 Skill：')
    expect(prompt).toContain('作品定位')
    expect(prompt).toContain('不生成正文')
  })
})
