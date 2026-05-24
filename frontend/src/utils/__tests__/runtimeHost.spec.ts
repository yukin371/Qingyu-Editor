import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  isExplicitRemoteRuntime,
  isStandaloneBrowserRuntime,
  isStandaloneDesktopShellRuntime,
  isWailsRuntimeAvailable,
} from '../runtimeHost'

describe('runtime host detection', () => {
  beforeEach(() => {
    delete (window as Window & { go?: unknown }).go
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    delete (window as Window & { go?: unknown }).go
    window.history.replaceState({}, '', '/')
  })

  it('treats the default browser host as local browser runtime only', () => {
    expect(isExplicitRemoteRuntime()).toBe(false)
    expect(isWailsRuntimeAvailable()).toBe(false)
    expect(isStandaloneDesktopShellRuntime()).toBe(false)
    expect(isStandaloneBrowserRuntime()).toBe(true)
  })

  it('lets explicit remote mode disable local runtime defaults', () => {
    window.history.replaceState({}, '', '/?remote=true')

    expect(isExplicitRemoteRuntime()).toBe(true)
    expect(isStandaloneDesktopShellRuntime()).toBe(false)
    expect(isStandaloneBrowserRuntime()).toBe(false)
  })

  it('treats the Wails host as desktop shell runtime', () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    expect(isExplicitRemoteRuntime()).toBe(false)
    expect(isWailsRuntimeAvailable()).toBe(true)
    expect(isStandaloneDesktopShellRuntime()).toBe(true)
    expect(isStandaloneBrowserRuntime()).toBe(true)
  })
})
