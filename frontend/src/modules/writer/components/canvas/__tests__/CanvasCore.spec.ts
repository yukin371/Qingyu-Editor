import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CanvasCore from '../CanvasCore.vue'

describe('CanvasCore', () => {
  it('renders selection box in container-relative coordinates instead of viewport coordinates', async () => {
    const wrapper = mount(CanvasCore, {
      attachTo: document.body,
      props: {
        showGrid: true,
      },
    })

    const container = wrapper.get('.canvas-core')
    Object.defineProperty(container.element, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 120,
        top: 80,
        right: 720,
        bottom: 480,
        width: 600,
        height: 400,
        x: 120,
        y: 80,
        toJSON: () => ({}),
      }),
    })

    await container.trigger('mousedown', {
      button: 0,
      clientX: 170,
      clientY: 130,
    })

    window.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 260,
        clientY: 220,
      }),
    )
    await wrapper.vm.$nextTick()

    const selectionBox = wrapper.get('.canvas-core__selection-box')
    expect(selectionBox.attributes('style')).toContain('left: 50px;')
    expect(selectionBox.attributes('style')).toContain('top: 50px;')
    expect(selectionBox.attributes('style')).toContain('width: 90px;')
    expect(selectionBox.attributes('style')).toContain('height: 90px;')

    window.dispatchEvent(new MouseEvent('mouseup'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.canvas-core__selection-box').exists()).toBe(false)

    wrapper.unmount()
  })

  it('normalizes selection coordinates when the canvas is rendered under CSS scaling', async () => {
    const wrapper = mount(CanvasCore, {
      attachTo: document.body,
      props: {
        showGrid: true,
      },
    })

    const container = wrapper.get('.canvas-core')
    Object.defineProperty(container.element, 'clientWidth', {
      configurable: true,
      value: 600,
    })
    Object.defineProperty(container.element, 'clientHeight', {
      configurable: true,
      value: 400,
    })
    Object.defineProperty(container.element, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        left: 120,
        top: 80,
        right: 1020,
        bottom: 680,
        width: 900,
        height: 600,
        x: 120,
        y: 80,
        toJSON: () => ({}),
      }),
    })

    await container.trigger('mousedown', {
      button: 0,
      clientX: 270,
      clientY: 230,
    })

    window.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: 420,
        clientY: 380,
      }),
    )
    await wrapper.vm.$nextTick()

    const selectionBox = wrapper.get('.canvas-core__selection-box')
    expect(selectionBox.attributes('style')).toContain('left: 100px;')
    expect(selectionBox.attributes('style')).toContain('top: 100px;')
    expect(selectionBox.attributes('style')).toContain('width: 100px;')
    expect(selectionBox.attributes('style')).toContain('height: 100px;')

    window.dispatchEvent(new MouseEvent('mouseup'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.canvas-core__selection-box').exists()).toBe(false)

    wrapper.unmount()
  })
})
