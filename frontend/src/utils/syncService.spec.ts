import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const isRemoteWriterModeMock = vi.fn()
const httpGetMock = vi.fn()

vi.mock('@/modules/writer/data-bridge/wails', () => ({
  isRemoteWriterMode: () => isRemoteWriterModeMock(),
}))

vi.mock('@/core/services/http.service', () => ({
  httpService: {
    get: (...args: unknown[]) => httpGetMock(...args),
  },
}))

async function loadSyncService() {
  vi.resetModules()
  const mod = await import('./syncService')
  return mod.syncService
}

describe('syncService remote gating', () => {
  beforeEach(() => {
    isRemoteWriterModeMock.mockReset()
    httpGetMock.mockReset()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('does not probe remote health in standalone local mode', async () => {
    isRemoteWriterModeMock.mockReturnValue(false)

    const syncService = await loadSyncService()

    await expect(syncService.checkBackendHealth()).resolves.toBe(true)
    await syncService.startHealthCheck()

    expect(syncService.getStatus()).toEqual(
      expect.objectContaining({
        isOnline: true,
        error: null,
      }),
    )
    expect(httpGetMock).not.toHaveBeenCalled()
  })

  it('probes the remote health endpoint only when remote mode is explicit', async () => {
    isRemoteWriterModeMock.mockReturnValue(true)
    httpGetMock.mockResolvedValue({ status: 'ok' })

    const syncService = await loadSyncService()

    await expect(syncService.checkBackendHealth()).resolves.toBe(true)
    expect(httpGetMock).toHaveBeenCalledWith('/health', { timeout: 5000 })
  })
})
