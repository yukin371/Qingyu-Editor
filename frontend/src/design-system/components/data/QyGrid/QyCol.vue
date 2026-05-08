<template>
  <div :class="colClasses" :style="colStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ColProps } from './types'

const props = withDefaults(defineProps<ColProps>(), {
  span: 24,
  offset: 0,
})

const colClasses = computed(() => {
  const classes = ['qy-col']

  // Base span
  if (props.span) {
    classes.push(`qy-col--span-${props.span}`)
  }

  // Offset
  if (props.offset) {
    classes.push(`qy-col--offset-${props.offset}`)
  }

  // Responsive breakpoints
  const breakpoints: Array<keyof Pick<ColProps, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>> = [
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    'xxl',
  ]
  breakpoints.forEach((bp) => {
    const val = props[bp]
    if (val !== undefined) {
      if (typeof val === 'number') {
        classes.push(`qy-col--${bp}-${val}`)
      } else if (typeof val === 'object') {
        const colObj = val as { span?: number; offset?: number }
        if (colObj.span !== undefined) {
          classes.push(`qy-col--${bp}-${colObj.span}`)
        }
        if (colObj.offset !== undefined) {
          classes.push(`qy-col--${bp}-offset-${colObj.offset}`)
        }
      }
    }
  })

  return classes
})

const colStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (parentGutter.value !== undefined) {
    const gutter = Number(parentGutter.value)
    styles.paddingLeft = `${gutter / 2}px`
    styles.paddingRight = `${gutter / 2}px`
  }

  return styles
})

// Make gutter available from parent row
const parentGutter = defineModel<number>('gutter', { default: 0 })

defineOptions({ name: 'QyCol' })
</script>

<style scoped lang="scss">
// Grid System - Apple/Google elegant style
// 24-column grid with refined spacing

.qy-col {
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

// Span classes (1-24)
@for $i from 1 through 24 {
  .qy-col--span-#{$i} {
    width: calc($i / 24 * 100%);
    max-width: calc($i / 24 * 100%);
  }

  .qy-col--offset-#{$i} {
    margin-left: calc($i / 24 * 100%);
  }
}

// Responsive breakpoints
// Extra small (<576px)
@media screen and (max-width: 575px) {
  @for $i from 1 through 24 {
    .qy-col--xs-#{$i} {
      width: calc($i / 24 * 100%);
      max-width: calc($i / 24 * 100%);
    }

    .qy-col--xs-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
  }
}

// Small (≥576px)
@media screen and (min-width: 576px) {
  @for $i from 1 through 24 {
    .qy-col--sm-#{$i} {
      width: calc($i / 24 * 100%);
      max-width: calc($i / 24 * 100%);
    }

    .qy-col--sm-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
  }
}

// Medium (≥768px)
@media screen and (min-width: 768px) {
  @for $i from 1 through 24 {
    .qy-col--md-#{$i} {
      width: calc($i / 24 * 100%);
      max-width: calc($i / 24 * 100%);
    }

    .qy-col--md-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
  }
}

// Large (≥1024px)
@media screen and (min-width: 1024px) {
  @for $i from 1 through 24 {
    .qy-col--lg-#{$i} {
      width: calc($i / 24 * 100%);
      max-width: calc($i / 24 * 100%);
    }

    .qy-col--lg-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
  }
}

// Extra large (≥1280px)
@media screen and (min-width: 1280px) {
  @for $i from 1 through 24 {
    .qy-col--xl-#{$i} {
      width: calc($i / 24 * 100%);
      max-width: calc($i / 24 * 100%);
    }

    .qy-col--xl-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
  }
}

// Extra extra large (≥1536px)
@media screen and (min-width: 1536px) {
  @for $i from 1 through 24 {
    .qy-col--xxl-#{$i} {
      width: calc($i / 24 * 100%);
      max-width: calc($i / 24 * 100%);
    }

    .qy-col--xxl-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
  }
}
</style>
