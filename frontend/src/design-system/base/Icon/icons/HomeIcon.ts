/**
 * Home Icon - Heroicons
 * MIT License
 */

import { h, defineComponent } from 'vue'

export const HomeIconSolid = defineComponent({
  name: 'HomeIconSolid',
  props: {
    class: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      class: props.class,
    }, [
      h('path', {
        d: 'M11.47 3.841a.75.75 0 0 1 1.06 0l8.692 8.692A.75.75 0 0 1 20.75 14.25v9.5a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1-.75-.75v-9.5a.75.75 0 0 1-.22-.53l8.692-8.692Z',
      }),
    ])
  },
})

export const HomeIconOutline = defineComponent({
  name: 'HomeIconOutline',
  props: {
    class: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '1.5',
      stroke: 'currentColor',
      class: props.class,
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'm2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
      }),
    ])
  },
})
