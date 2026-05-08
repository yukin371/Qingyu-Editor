/**
 * Vitest 类型声明
 * 注意：此文件仅用于补充类型，不覆盖原有模块导出
 */

// 扩展 vitest 模块（而非覆盖）
import 'vitest'

declare module 'vitest' {
  interface Assertion {
    toBeInTheDocument(): void
    toHaveClass(className: string): void
    toHaveAttribute(attr: string, value?: string): void
    toHaveStyle(style: Record<string, string>): void
    toBeVisible(): void
    toBeDisabled(): void
    toBeEmpty(): void
    toBeEmptyDOMElement(): void
    toBeInvalid(): void
    toBeRequired(): void
    toBeValid(): void
    toContainElement(element: Element | null): void
    toContainHTML(html: string): void
    toHaveAccessibleDescription(description?: string | RegExp): void
    toHaveAccessibleName(name?: string | RegExp): void
    toHaveDisplayValue(value?: string | RegExp | Array<string | RegExp>): void
    toHaveFocus(): void
    toHaveFormValues(values: Record<string, unknown>): void
    toHaveStyle(css: Record<string, unknown>): void
    toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): void
    toHaveValue(value?: string | RegExp | Array<string | RegExp>): void
    toHaveValue(values: Array<string | RegExp>): void
  }
}

// 扩展 @vue/test-utils 模块（而非覆盖）
import '@vue/test-utils'

declare module '@vue/test-utils' {
  import { Component, ComponentPublicInstance, Ref, ComputedRef } from 'vue'

  export interface VueWrapper<T = ComponentPublicInstance> {
    readonly vm: T
    readonly element: Element
    props(): Record<string, unknown>
    props<K extends keyof T['$props']>(selector: K): T['$props'][K]
    emitted<T = unknown>(): Record<string, T[]>
    emitted<T = unknown>(eventName: string): undefined | T[]
    find<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>
    find<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>
    find<T extends Element>(selector: string): DOMWrapper<T>
    findAll<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>[]
    findAll<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>[]
    findAll<T extends Element>(selector: string): DOMWrapper<T>[]
    findComponent<T extends Component>(component: T): VueWrapper<InstanceType<T>>
    findComponent(options: { name: string } | { ref: string }): VueWrapper<any>
    exists(): boolean
    isVisible(): boolean
    html(): string
    text(): string
    classes(): string[]
    attributes(): Record<string, string>
    attributes(key: string): string | undefined
    setProps(props: Partial<T['$props']>): Promise<void>
    setData(data: Record<string, unknown>): Promise<void>
    setValue(value: unknown, prop?: string): Promise<void>
    trigger(event: string, payload?: unknown): Promise<void>
    unmount(): void
  }

  export interface DOMWrapper<T extends Element> {
    readonly element: T
    exists(): boolean
    isVisible(): boolean
    html(): string
    text(): string
    classes(): string[]
    attributes(): Record<string, string>
    attributes(key: string): string | undefined
    find<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>
    find<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>
    find<E extends Element>(selector: string): DOMWrapper<E>
    findAll<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>[]
    findAll<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>[]
    findAll<E extends Element>(selector: string): DOMWrapper<E>[]
    trigger(event: string, payload?: unknown): Promise<void>
    setValue(value: unknown): Promise<void>
  }
}
