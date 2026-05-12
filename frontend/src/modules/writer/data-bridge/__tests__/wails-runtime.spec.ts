import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  isRemoteWriterMode,
  isStandaloneLocalWriterAvailable,
  isStandaloneWriterRuntime,
} from '../wails'

describe('writer runtime detection', () => {
  beforeEach(() => {
    delete (window as Window & { go?: unknown }).go
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    delete (window as Window & { go?: unknown }).go
    window.history.replaceState({}, '', '/')
  })

  it('treats the default browser host as standalone local and not remote', () => {
    expect(isRemoteWriterMode()).toBe(false)
    expect(isStandaloneWriterRuntime()).toBe(true)
    expect(isStandaloneLocalWriterAvailable()).toBe(true)
  })

  it('treats explicit remote mode as remote only', () => {
    window.history.replaceState({}, '', '/?remote=true')

    expect(isRemoteWriterMode()).toBe(true)
    expect(isStandaloneWriterRuntime()).toBe(false)
    expect(isStandaloneLocalWriterAvailable()).toBe(false)
  })

  it('treats the Wails host as standalone even without query params', () => {
    ;(window as Window & { go?: unknown }).go = { main: { App: {} } }

    expect(isRemoteWriterMode()).toBe(false)
    expect(isStandaloneWriterRuntime()).toBe(true)
    expect(isStandaloneLocalWriterAvailable()).toBe(false)
  })
})
