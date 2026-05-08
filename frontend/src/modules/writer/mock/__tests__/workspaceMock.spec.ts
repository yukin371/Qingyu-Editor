import { describe, expect, it } from 'vitest'
import {
  createMockOutlineTree,
  createMockTimelineEvents,
  createMockTimelines,
  getWorkspaceMockProject,
} from '../workspaceMock'

describe('workspaceMock timeline fixtures', () => {
  it('为 mock 项目提供可用的时间线容器与事件数据', () => {
    const mockProject = getWorkspaceMockProject('project-yljs-1')
    expect(mockProject?.project.id).toBe('project-yljs-1')

    const timelines = createMockTimelines('project-yljs-1')
    const events = createMockTimelineEvents('project-yljs-1')

    expect(timelines).toHaveLength(1)
    expect(timelines[0]?.projectId).toBe('project-yljs-1')
    expect(events.length).toBeGreaterThan(0)
    expect(events[0]?.projectId).toBe('project-yljs-1')
    expect(events.some((event) => event.chapterIds?.includes('ch-2'))).toBe(true)
  })

  it('为 mock 项目提供稳定的大纲树', () => {
    const outlineTree = createMockOutlineTree('project-yljs-1')

    expect(outlineTree).toHaveLength(1)
    expect(outlineTree[0]?.title).toBe('云岚纪事')
    expect(outlineTree[0]?.children?.length).toBeGreaterThan(0)
    expect(
      outlineTree[0]?.children?.[0]?.children?.some((node) => node.documentId === 'ch-2'),
    ).toBe(true)
  })
})
