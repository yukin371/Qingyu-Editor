<script setup lang="ts">
/**
 * Anchor 锚点组件
 *
 * 用于展示页面锚点，支持点击滚动到对应位置
 * 支持垂直/水平方向，支持嵌套锚点
 */

import { ref, computed, onMounted, onUnmounted, watch, nextTick, h, type VNode } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { AnchorProps, AnchorEmits, AnchorItem } from './types'
import { anchorDefaults } from './types'

// 使用 CVA 定义容器变体
const anchorVariants = cva(
  // 基础样式
  'relative',
  {
    variants: {
      direction: {
        vertical: 'py-2',
        horizontal: 'flex items-center gap-6 py-2',
      },
    },
    defaultVariants: {
      direction: 'vertical',
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<AnchorProps>(), anchorDefaults)

// 组件 Emits
const emit = defineEmits<AnchorEmits>()

// 内部状态
const currentActiveLink = ref<string>('')
const linksMap = ref<Map<string, HTMLElement>>(new Map())
const animating = ref(false)

// 计算容器类名
const classes = computed(() =>
  cn(
    anchorVariants({
      direction: props.direction,
    }),
    'text-neutral-700 dark:text-neutral-300',
    props.class
  )
)

// 计算固定定位样式
const affixStyle = computed(() => {
  if (!props.affix) return {}
  return {
    position: 'sticky',
    top: `${props.offsetTop}px`,
  }
})

// 获取滚动容器
const getScrollContainer = (): HTMLElement => {
  if (typeof props.container === 'function') {
    return props.container()
  }
  const el = document.querySelector(props.container as string)
  if (el) {
    return el as HTMLElement
  }
  return document.body
}

// 获取所有锚点元素
const getAllAnchorLinks = (): HTMLElement[] => {
  const container = getScrollContainer()
  const links = Array.from(container.querySelectorAll('a[href^="#"]'))
  return links.filter((link) => {
    const href = link.getAttribute('href')
    if (!href) return false
    const target = document.getElementById(href.slice(1))
    return target !== null
  }) as HTMLElement[]
}

// 收集锚点链接映射
const collectLinksMap = () => {
  const links = getAllAnchorLinks()
  const map = new Map<string, HTMLElement>()
  
  links.forEach((link) => {
    const href = link.getAttribute('href')
    if (href) {
      map.set(href, link)
    }
  })
  
  linksMap.value = map
}

// 获取当前激活的锚点
const getCurrentActiveAnchor = (): string => {
  if (props.getCurrentAnchor) {
    return props.getCurrentAnchor(currentActiveLink.value)
  }
  
  const container = getScrollContainer()
  const containerRect = container.getBoundingClientRect()
  const offset = props.offset + props.bounds
  
  let activeLink = ''
  
  // 遍历所有锚点，找到当前可见的锚点
  linksMap.value.forEach((_link, href) => {
    const targetId = href.slice(1)
    const target = document.getElementById(targetId)
    if (!target) return
    
    const targetRect = target.getBoundingClientRect()
    const relativeTop = targetRect.top - containerRect.top
    
    // 判断目标元素是否在视口范围内
    if (relativeTop <= offset && relativeTop >= -containerRect.height) {
      activeLink = href
    }
  })
  
  return activeLink
}

// 处理滚动事件
const handleScroll = () => {
  if (animating.value) return
  
  const activeLink = getCurrentActiveAnchor()
  
  if (activeLink && activeLink !== currentActiveLink.value) {
    currentActiveLink.value = activeLink
    emit('change', activeLink.slice(1)) // 去掉 # 号
  }
}

// 滚动到指定锚点
const scrollToAnchor = (href: string) => {
  if (!href || href[0] !== '#') return
  
  const targetId = href.slice(1)
  const target = document.getElementById(targetId)
  
  if (!target) {
    console.warn(`Anchor: 目标元素 #${targetId} 未找到`)
    return
  }
  
  const container = getScrollContainer()
  const containerRect = container.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  
  // 计算滚动位置
  const scrollTop =
    targetRect.top -
    containerRect.top +
    container.scrollTop -
    props.offset
  
  animating.value = true
  
  if (props.smooth) {
    // 平滑滚动
    container.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    })
    
    // 动画结束后重置状态
    setTimeout(() => {
      animating.value = false
      currentActiveLink.value = href
      emit('change', targetId)
    }, 500)
  } else {
    // 直接跳转
    container.scrollTop = scrollTop
    animating.value = false
    currentActiveLink.value = href
    emit('change', targetId)
  }
}

// 处理点击事件
const handleClick = (e: MouseEvent, item: AnchorItem) => {
  emit('click', e, {
    href: item.href,
    title: item.title,
    key: item.key,
  })
  
  scrollToAnchor(item.href)
}

// 判断锚点是否激活
const isLinkActive = (href: string): boolean => {
  if (props.activeLink !== undefined) {
    return props.activeLink === href.slice(1)
  }
  return currentActiveLink.value === href
}

// 渲染锚点项
const renderAnchorItem = (item: AnchorItem, level: number = 0): VNode => {
  const isActive = isLinkActive(item.href)
  const hasChildren = item.children && item.children.length > 0

  const children: VNode[] = []

  // 线条
  if (props.direction === 'vertical' && props.showLine && level === 0) {
    children.push(
      h('span', {
        class: cn(
          'absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700',
          'transition-colors duration-200'
        )
      })
    )
  }

  // 标记
  if (props.marker && props.direction === 'vertical') {
    children.push(
      h('span', {
        class: cn(
          'absolute left-0 top-3 w-2 h-2 rounded-full border-2 transition-all duration-200',
          isActive
            ? 'bg-primary-500 border-primary-500 scale-125'
            : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-600'
        ),
        style: { transform: isActive ? 'translateX(-1px)' : 'translateX(-3px)' }
      })
    )
  }

  // 锚点链接
  children.push(
    h('a', {
      href: item.href,
      class: cn(
        'relative flex items-center py-2 px-3 text-sm transition-all duration-200',
        'hover:text-primary-600 dark:hover:text-primary-400',
        'z-10',
        {
          'text-neutral-600 dark:text-neutral-400': !isActive,
          'text-primary-600 dark:text-primary-400 font-medium': isActive,
          'pl-6': props.direction === 'vertical',
        }
      ),
      onClick: (e: MouseEvent) => handleClick(e, item)
    }, item.title)
  )

  // 子锚点
  if (hasChildren) {
    children.push(
      h('ul', { class: 'relative mt-1 space-y-1' },
        item.children!.map((child) => renderAnchorItem(child, level + 1))
      )
    )
  }

  return h('li', {
    key: item.key,
    class: 'list-none relative',
    style: {
      marginLeft: props.direction === 'vertical' && level > 0 ? '16px' : '0',
    }
  }, children)
}

// 组件挂载
onMounted(() => {
  collectLinksMap()
  
  const container = getScrollContainer()
  container.addEventListener('scroll', handleScroll, { passive: true })
  
  // 初始化当前激活锚点
  nextTick(() => {
    handleScroll()
  })
})

// 组件卸载
onUnmounted(() => {
  const container = getScrollContainer()
  container.removeEventListener('scroll', handleScroll)
})

// 监听容器变化
watch(
  () => props.container,
  () => {
    // 重新绑定滚动监听
    const oldContainer = getScrollContainer()
    oldContainer.removeEventListener('scroll', handleScroll)
    
    collectLinksMap()
    handleScroll()
    
    const newContainer = getScrollContainer()
    newContainer.addEventListener('scroll', handleScroll, { passive: true })
  }
)

// 监听 items 变化
watch(
  () => props.items,
  () => {
    nextTick(() => {
      collectLinksMap()
      handleScroll()
    })
  },
  { deep: true }
)

// 暴露方法给父组件
defineExpose({
  scrollToAnchor,
  currentActiveLink,
})
</script>

<template>
  <div :class="classes" :style="{ ...affixStyle, ...style }">
    <!-- 锚点列表 -->
    <ul
      :class="cn(
        'm-0 p-0 list-none',
        direction === 'horizontal' ? 'flex items-center gap-6' : 'space-y-1'
      )"
    >
      <template v-if="items && items.length > 0">
        <template v-for="item in items" :key="item.key">
          <component :is="renderAnchorItem(item)" />
        </template>
      </template>
      
      <!-- 默认插槽：自定义渲染锚点 -->
      <slot v-else />
    </ul>
  </div>
</template>

<style scoped>
/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .bg-primary-500 {
    background-color: rgb(59 130 246);
  }
  
  .border-primary-500 {
    border-color: rgb(59 130 246);
  }
  
  .text-primary-600 {
    color: rgb(96 165 250);
  }
}

/* 平滑过渡 */
* {
  transition-property: color, background-color, border-color, transform;
}
</style>
