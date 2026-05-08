/**
 * Vditor 类型声明
 * 当 vditor 未安装时，提供基本的类型支持
 */

declare module 'vditor' {
  export interface VditorOptions {
    height?: string | number
    width?: string | number
    placeholder?: string
    value?: string
    mode?: 'wysiwyg' | 'sv' | 'ir'
    theme?: 'classic' | 'dark'
    icon?: 'material' | 'ant'
    readonly?: boolean
    toolbar?: Array<string | object>
    counter?: {
      enable?: boolean
      type?: 'markdown' | 'text'
    }
    cache?: {
      enable?: boolean
      id?: string
    }
    input?: (value: string) => void
    focus?: () => void
    blur?: () => void
  }

  export default class Vditor {
    constructor(element: HTMLElement, options?: VditorOptions)
    getValue(): string
    setValue(value: string): void
    focus(): void
    blur(): void
    disabled(): void
    enable(): void
    destroy(): void
  }
}

declare module 'vditor/dist/index.css' {
  const content: string
  export default content
}
