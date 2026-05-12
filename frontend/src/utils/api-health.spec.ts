import { beforeEach, describe, expect, it, vi } from 'vitest'

const isRemoteWriterModeMock = vi.fn()

vi.mock('@/modules/writer/data-bridge/wails', () => ({
  isRemoteWriterMode: () => isRemoteWriterModeMock(),
}))

import { checkApiHealth } from './api-health'

describe('api-health', () => {
  beforeEach(() => {
    isRemoteWriterModeMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('skips remote health probing when writer is not in remote mode', async () => {
    const fetchMock = vi.fn()
    isRemoteWriterModeMock.mockReturnValue(false)
    vi.stubGlobal('fetch', fetchMock)

    await expect(checkApiHealth()).resolves.toEqual({ healthy: true })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('probes remote health endpoint only in explicit remote mode', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    })
    isRemoteWriterModeMock.mockReturnValue(true)
    vi.stubGlobal('fetch', fetchMock)

    const result = await checkApiHealth()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/v1/system/health')
    expect(result).toEqual(
      expect.objectContaining({
        healthy: true,
      }),
    )
  })
})
