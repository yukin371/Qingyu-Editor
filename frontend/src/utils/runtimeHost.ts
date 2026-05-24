type WindowWithWailsBridge = Window & { go?: { main?: { App?: Record<string, unknown> } } }

const STANDALONE_EDITOR_PORTS = new Set(['34115', '43127'])

function getCurrentWindowUrl(): URL | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return new URL(window.location.href)
  } catch {
    return null
  }
}

export function isExplicitRemoteRuntime(): boolean {
  const currentUrl = getCurrentWindowUrl()
  return currentUrl?.searchParams.get('remote') === 'true'
}

export function isWailsRuntimeAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const candidate = window as WindowWithWailsBridge
  return !!candidate.go?.main?.App
}

export function isStandaloneDesktopShellRuntime(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  if (isWailsRuntimeAvailable()) {
    return true
  }

  if (window.location.protocol === 'file:') {
    return true
  }

  return STANDALONE_EDITOR_PORTS.has(window.location.port)
}

export function isStandaloneBrowserRuntime(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  if (isExplicitRemoteRuntime()) {
    return false
  }

  if (isStandaloneDesktopShellRuntime()) {
    return true
  }

  return window.location.protocol === 'http:' || window.location.protocol === 'https:'
}
