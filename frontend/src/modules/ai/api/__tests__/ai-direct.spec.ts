import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
    })),
  },
}))

vi.mock('../request', () => ({
  AI_REQUEST_TIMEOUT_MS: 65_000,
}))

describe('ai direct runtime routing', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    delete (window as Window & { go?: unknown }).go
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    delete (window as Window & { go?: unknown }).go
    window.history.replaceState({}, '', '/')
  })

  it('keeps explicit direct mode when env url is configured', async () => {
    vi.stubEnv('VITE_AI_DIRECT_MODE', 'true')
    vi.stubEnv('VITE_AI_SERVICE_URL', 'http://127.0.0.1:8000')

    const { isDirectModeEnabled, resolveDirectServiceUrl } = await import('../ai-direct')

    expect(resolveDirectServiceUrl()).toBe('http://127.0.0.1:8000')
    expect(isDirectModeEnabled()).toBe(true)
  })

  it('defaults Wails runtime to the local AI service when env vars are absent', async () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    const { isDirectModeEnabled, resolveDirectServiceUrl } = await import('../ai-direct')

    expect(resolveDirectServiceUrl()).toBe('http://127.0.0.1:8000')
    expect(isDirectModeEnabled()).toBe(true)
  })

  it('keeps explicit remote runtime from auto-enabling local direct mode', async () => {
    window.history.replaceState({}, '', '/?remote=true')

    const { isDirectModeEnabled, resolveDirectServiceUrl } = await import('../ai-direct')

    expect(resolveDirectServiceUrl()).toBe('')
    expect(isDirectModeEnabled()).toBe(false)
  })
})
