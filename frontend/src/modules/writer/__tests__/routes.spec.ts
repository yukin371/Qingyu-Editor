import { describe, expect, it } from 'vitest'
import writerRoutes from '../routes'

type LegacyEditorRedirectInput = {
  params: {
    projectId: string
    chapterId?: string
  }
  query: Record<string, string>
}

type LegacyEditorRedirectResult = {
  name: string
  params: {
    projectId: string
  }
  query: Record<string, string>
}

type LegacyEditorRedirect = (
  input: LegacyEditorRedirectInput,
) => LegacyEditorRedirectResult

describe('writer routes', () => {
  it('legacy editor route 应重定向到 writer-project 并透传 chapterId/query', () => {
    const legacy = writerRoutes.find((route) => route.name === 'writer-editor')
    expect(legacy).toBeTruthy()
    expect(typeof legacy?.redirect).toBe('function')

    const redirect = legacy!.redirect as LegacyEditorRedirect
    const target: LegacyEditorRedirectInput = {
      params: { projectId: 'project-1', chapterId: 'chapter-9' },
      query: { test: 'true', tool: 'writing' },
    }

    const result = redirect(target)
    expect(result).toEqual({
      name: 'writer-project',
      params: { projectId: 'project-1' },
      query: { test: 'true', tool: 'writing', chapterId: 'chapter-9' },
    })
  })

  it('legacy editor route 在无 chapterId 时不应注入 chapterId query', () => {
    const legacy = writerRoutes.find((route) => route.name === 'writer-editor')
    const redirect = legacy!.redirect as LegacyEditorRedirect

    const result = redirect({
      params: { projectId: 'project-2' },
      query: { foo: 'bar' },
    })

    expect(result).toEqual({
      name: 'writer-project',
      params: { projectId: 'project-2' },
      query: { foo: 'bar' },
    })
  })
})
