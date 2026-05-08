/**
 * 组件测试工具
 * 提供Vue组件测试的辅助函数
 */

import { mount, VueWrapper } from '@vue/test-utils'
import { ComponentPublicInstance, h, defineComponent } from 'vue'

// vitest globals are enabled in vitest.config.ts

/**
 * 创建完整的QyButton组件mock
 */
export const MockQyButton = defineComponent({
  name: 'QyButton',
  props: {
    variant: { type: String, default: 'default' },
    size: { type: String, default: 'medium' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    type: { type: String, default: 'button' },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const classes = ['qy-button', `qy-button--${props.variant}`, `qy-button--${props.size}`]
    if (props.disabled) classes.push('is-disabled')
    if (props.loading) classes.push('is-loading')

    return () =>
      h(
        'button',
        {
          class: classes,
          disabled: props.disabled,
          type: props.type,
          onClick: (e: MouseEvent) => emit('click', e),
        },
        [h('slot')],
      )
  },
})

/**
 * 创建完整的QyInput组件mock
 */
export const MockQyInput = defineComponent({
  name: 'QyInput',
  props: {
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    rows: { type: Number, default: 3 },
    maxlength: { type: Number },
    showCount: { type: Boolean, default: false },
    size: { type: String, default: 'medium' },
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus'],
  setup(props, { emit }) {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement
      emit('update:modelValue', target.value)
      emit('change', target.value)
    }
    return () =>
      h(
        props.type === 'textarea' ? 'textarea' : 'input',
        {
          class: 'qy-input',
          placeholder: props.placeholder,
          disabled: props.disabled,
          readonly: props.readonly,
          rows: props.rows,
          maxlength: props.maxlength,
          value: props.modelValue,
          onInput: handleInput,
        },
        props.modelValue !== undefined ? [h('slot')] : [],
      )
  },
})

/**
 * 创建完整的QyBadge组件mock
 */
export const MockQyBadge = defineComponent({
  name: 'QyBadge',
  props: {
    variant: { type: String, default: 'default' },
    size: { type: String, default: 'medium' },
    closable: { type: Boolean, default: false },
  },
  emits: ['click', 'close'],
  setup(props, { emit }) {
    return () =>
      h(
        'span',
        {
          class: ['qy-badge', `qy-badge--${props.variant}`, `qy-badge--${props.size}`],
          onClick: () => emit('click'),
        },
        [
          h('slot'),
          props.closable
            ? h(
                'span',
                {
                  class: 'close-btn',
                  onClick: (e: Event) => {
                    e.stopPropagation()
                    emit('close')
                  },
                },
                'x',
              )
            : null,
        ],
      )
  },
})

/**
 * 创建完整的QyAvatar组件mock
 */
export const MockQyAvatar = defineComponent({
  name: 'QyAvatar',
  props: {
    src: { type: String },
    name: { type: String, default: '' },
    size: { type: String, default: 'md' },
  },
  setup(props) {
    return () =>
      h(
        'div',
        { class: ['qy-avatar', `qy-avatar--${props.size}`] },
        props.name || props.src ? [props.name || ''] : [],
      )
  },
})

/**
 * 创建完整的QyIcon组件mock
 */
export const MockQyIcon = defineComponent({
  name: 'QyIcon',
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 16 },
  },
  setup(props) {
    return () =>
      h('i', { class: `qy-icon qy-icon--${props.name}`, style: { fontSize: `${props.size}px` } })
  },
})

/**
 * 创建完整的QyCard组件mock
 */
export const MockQyCard = defineComponent({
  name: 'QyCard',
  props: {
    shadow: { type: String, default: 'always' },
    bodyStyle: { type: Object },
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: ['qy-card', `qy-card--${props.shadow}`] }, [
        slots.default ? slots.default() : h('slot'),
      ])
  },
})

/**
 * 组件挂载选项的扩展类型
 */
export interface ComponentMountOptions {
  props?: Record<string, unknown>
  slots?: Record<string, string>
  global?: {
    stubs?: Record<string, boolean | Record<string, unknown>>
    mocks?: Record<string, unknown>
    plugins?: unknown[]
  }
}

/**
 * 创建一个组件wrapper的便捷方法
 * @param component Vue组件
 * @param options 挂载选项
 */

export const createWrapper = <V extends ComponentPublicInstance = any>(
  component: unknown,
  options: ComponentMountOptions = {},
): VueWrapper<V> => {
  // vitest globals are enabled

  const vi = (globalThis as any).vi
  return mount(component as Parameters<typeof mount>[0], {
    props: options.props,
    slots: options.slots,
    global: {
      stubs: options.global?.stubs,
      mocks: {
        $router: {
          push: vi?.fn?.() || (() => {}),
          replace: vi?.fn?.() || (() => {}),
          go: vi?.fn?.() || (() => {}),
          back: vi?.fn?.() || (() => {}),
          forward: vi?.fn?.() || (() => {}),
        },
        $route: {
          path: '/',
          params: {},
          query: {},
          meta: {},
        },
        ...options.global?.mocks,
      },
      plugins: (options.global?.plugins || []) as any,
    },
  }) as VueWrapper<V>
}

/**
 * 等待组件更新完成
 * @param wrapper 组件wrapper
 */
export const waitForUpdate = async (
  wrapper: VueWrapper<ComponentPublicInstance>,
): Promise<void> => {
  const vm = (wrapper as any).vm
  if (vm && typeof vm.$nextTick === 'function') {
    await vm.$nextTick()
  }
  await new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * 等待异步操作完成
 * @param callback 异步回调函数
 * @param timeout 超时时间 (默认1000ms)
 */
export const waitFor = async (
  callback: () => boolean | Promise<boolean>,
  timeout: number = 1000,
): Promise<void> => {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const result = await callback()
    if (result) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 10))
  }

  throw new Error(`waitFor timeout after ${timeout}ms`)
}

/**
 * 触发组件事件
 * @param wrapper 组件wrapper
 * @param eventName 事件名称
 * @param payload 事件载荷
 */
export const emitEvent = <T = unknown>(
  wrapper: VueWrapper<ComponentPublicInstance>,
  eventName: string,
  payload?: T,
): void => {
  const vm = (wrapper as any).vm
  if (vm && typeof vm.$emit === 'function') {
    vm.$emit(eventName, payload)
  }
}

/**
 * 验证组件是否渲染了特定文本
 * @param wrapper 组件wrapper
 * @param text 期望的文本
 * @param shouldContain 是否应该包含 (默认true)
 */
export const expectTextContent = (
  wrapper: VueWrapper<ComponentPublicInstance>,
  text: string,
  shouldContain: boolean = true,
): void => {
  const actual = wrapper.text()
  if (shouldContain) {
    expect(actual).toContain(text)
  } else {
    expect(actual).not.toContain(text)
  }
}

/**
 * 验证组件是否存在特定元素
 * @param wrapper 组件wrapper
 * @param selector CSS选择器
 * @param shouldExist 是否应该存在 (默认true)
 */
export const expectElementExists = (
  wrapper: VueWrapper<ComponentPublicInstance>,
  selector: string,
  shouldExist: boolean = true,
): void => {
  const element = wrapper.find(selector)
  if (shouldExist) {
    expect(element.exists()).toBe(true)
  } else {
    expect(element.exists()).toBe(false)
  }
}

/**
 * 获取组件的props
 * @param wrapper 组件wrapper
 * @param propName prop名称
 */
export const getProp = <T = unknown>(
  wrapper: VueWrapper<ComponentPublicInstance>,
  propName: string,
): T | undefined => {
  return (wrapper as any).props(propName) as T
}

/**
 * 设置组件的props
 * @param wrapper 组件wrapper
 * @param props props对象
 */
export const setProps = async (
  wrapper: VueWrapper<ComponentPublicInstance>,
  props: Record<string, unknown>,
): Promise<void> => {
  if (typeof (wrapper as any).setProps === 'function') {
    await (wrapper as any).setProps(props)
  }
}

/**
 * 获取组件发出的特定事件
 * @param wrapper 组件wrapper
 * @param eventName 事件名称
 */
export const getEmittedEvents = <T = unknown>(
  wrapper: VueWrapper<ComponentPublicInstance>,
  eventName: string,
): T[] | undefined => {
  if (typeof (wrapper as any).emitted === 'function') {
    return (wrapper as any).emitted(eventName) as T[]
  }
  return undefined
}

/**
 * 验证组件是否发出了特定事件
 * @param wrapper 组件wrapper
 * @param eventName 事件名称
 * @param count 期望的事件数量 (可选)
 */
export const expectEventEmitted = (
  wrapper: VueWrapper<ComponentPublicInstance>,
  eventName: string,
  count?: number,
): void => {
  const events =
    typeof (wrapper as any).emitted === 'function' ? (wrapper as any).emitted(eventName) : undefined
  expect(events).toBeDefined()

  if (count !== undefined) {
    expect(events?.length).toBe(count)
  }
}
