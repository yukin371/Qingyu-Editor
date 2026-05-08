import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'

import '../../src/__tests__/mocks'

if (typeof window !== 'undefined' && typeof window.scrollTo !== 'function') {
  window.scrollTo = vi.fn()
}

if (typeof window !== 'undefined' && typeof window.open !== 'function') {
  window.open = vi.fn()
}

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  cleanup()
})
