// 平台抽象层入口 — 自动检测并导出对应实现

import type { PlatformService } from './types'
import { DesktopPlatform } from './desktop'
import { MobilePlatform } from './mobile'

let _instance: PlatformService | null = null

export function getPlatform(): PlatformService {
  if (_instance) return _instance

  // 检测运行环境
  const isDesktop = typeof window !== 'undefined' && '__WAILS__' in window
  const isMobile = typeof window !== 'undefined' && 'Capacitor' in window

  if (isDesktop) {
    _instance = new DesktopPlatform()
  } else if (isMobile) {
    _instance = new MobilePlatform()
  } else {
    // 开发模式默认用桌面实现
    _instance = new DesktopPlatform()
  }

  return _instance
}

export type { PlatformService, Project, Chapter, Snapshot, AIProviderConfig, Volume } from './types'
