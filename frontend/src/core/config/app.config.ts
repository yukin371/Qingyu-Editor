/**
 * Application Configuration
 * Central configuration for the Qingyu application
 */

export interface AppConfig {
  name: string
  version: string
  env: 'development' | 'staging' | 'production'
  debug: boolean
}

export const appConfig: AppConfig = {
  name: '青羽',
  version: '1.3.0',
  env: (import.meta.env.MODE as AppConfig['env']) || 'development',
  debug: import.meta.env.DEV || false
}

// Feature flags
export const features = {
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  enableAnalytics: false,
  enableDevTools: import.meta.env.DEV
}

// UI Configuration
export const uiConfig = {
  defaultPageSize: 20,
  maxSearchHistory: 10,
  toastDuration: 3000,
  requestTimeout: 10000
}

export default appConfig

