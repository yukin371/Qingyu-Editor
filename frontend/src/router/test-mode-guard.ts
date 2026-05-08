/**
 * Test Mode Parameter Guard
 * 
 * 用于在页面跳转时自动传递 ?test=true 参数
 * 确保在测试 mock 数据时，所有相关页面都保持测试模式
 * 
 * 功能：
 * 1. 检测当前 URL 是否包含 ?test=true 参数
 * 2. 在路由跳转时自动保留 test 参数
 * 3. 提供退出测试模式的机制
 * 4. 添加测试模式标识到页面
 */

import type { Router } from 'vue-router'

const TEST_PARAM_KEY = 'test'
const TEST_MODE_CLASS = 'test-mode-active'
const TEST_MODE_INDICATOR_ID = 'test-mode-indicator'

/**
 * 设置测试模式路由守卫
 */
export function setupTestModeGuard(router: Router) {
  // 在 beforeEach 中处理 test 参数
  router.beforeEach((to, from) => {
    const hasTestParam = hasTestParameter(from.query)
    const targetHasTestParam = hasTestParameter(to.query)

    // 如果来源页面有 test 参数，但目标页面没有，则自动添加
    if (hasTestParam && !targetHasTestParam) {
      // 保留原有的 test 参数
      const newQuery = { ...to.query, [TEST_PARAM_KEY]: 'true' }

      console.log('[TestMode] Auto-adding test parameter to:', to.path)

      // 使用 replace 避免产生额外的历史记录
      return {
        path: to.path,
        query: newQuery,
        params: to.params,
        hash: to.hash,
        replace: true
      }
    }

    // 如果目标页面移除了 test 参数，说明用户想要退出测试模式
    if (!hasTestParam && !targetHasTestParam) {
      removeTestModeIndicator()
    } else if (targetHasTestParam) {
      // 添加测试模式标识
      addTestModeIndicator()
    }

    return true
  })

  // 在 afterEach 中更新测试模式标识
  router.afterEach((to) => {
    const hasTestParam = hasTestParameter(to.query)
    
    if (hasTestParam) {
      addTestModeIndicator()
      console.log('[TestMode] Test mode active for:', to.path)
    } else {
      removeTestModeIndicator()
    }
  })

  // 监听所有路由链接点击，确保 test 参数被保留
  setupLinkInterceptor(router)
}

/**
 * 检查 query 对象是否包含 test=true 参数
 */
function hasTestParameter(query: Record<string, any>): boolean {
  const value = query[TEST_PARAM_KEY]
  if (Array.isArray(value)) {
    return value.some((v) => v === 'true' || v === true)
  }
  return value === 'true' || value === true
}

/**
 * 添加测试模式标识到页面
 */
function addTestModeIndicator() {
  // 添加 CSS class
  document.documentElement.classList.add(TEST_MODE_CLASS)
  
  // 如果标识元素不存在，创建一个
  if (!document.getElementById(TEST_MODE_INDICATOR_ID)) {
    const indicator = document.createElement('div')
    indicator.id = TEST_MODE_INDICATOR_ID
    indicator.className = 'fixed top-4 right-4 z-[10000] cursor-move'
    indicator.innerHTML = `
      <div class="test-mode-badge flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-xs font-semibold shadow-lg transition-all duration-300 hover:shadow-xl">
        <span class="indicator-dot w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span class="indicator-text tracking-wide">Mock Mode</span>
        <button class="demohub-btn ml-1 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200" title="返回 DemoHub">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        <button class="exit-btn ml-1 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-sm transition-all duration-200 hover:scale-110" title="退出 Mock 模式">×</button>
      </div>
    `
    
    document.body.appendChild(indicator)
    
    // 绑定拖动功能
    makeDraggable(indicator)
    
    // 绑定 DemoHub 按钮（返回）
    const demohubBtn = indicator.querySelector('.demohub-btn')
    demohubBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      navigateToDemoHub()
    })
    
    // 绑定退出按钮事件
    const exitBtn = indicator.querySelector('.exit-btn')
    exitBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      exitTestMode()
    })
  }
}

/**
 * 使元素可拖动
 */
function makeDraggable(element: HTMLElement) {
  let isDragging = false
  let currentX = 0
  let currentY = 0
  let initialX = 0
  let initialY = 0
  let xOffset = 0
  let yOffset = 0

  element.addEventListener('mousedown', dragStart)
  document.addEventListener('mouseup', dragEnd)
  document.addEventListener('mousemove', drag)

  function dragStart(e: MouseEvent) {
    const target = e.target as HTMLElement
    
    // 如果点击的是按钮，不拖动
    if (target.closest('button')) {
      return
    }
    
    initialX = e.clientX - xOffset
    initialY = e.clientY - yOffset

    if (e.target === element || element.contains(e.target as Node)) {
      isDragging = true
    }
  }

  function dragEnd() {
    initialX = currentX
    initialY = currentY
    isDragging = false
  }

  function drag(e: MouseEvent) {
    if (isDragging) {
      e.preventDefault()
      
      currentX = e.clientX - initialX
      currentY = e.clientY - initialY

      xOffset = currentX
      yOffset = currentY

      setTranslate(currentX, currentY, element)
    }
  }

  function setTranslate(xPos: number, yPos: number, el: HTMLElement) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`
  }
}

/**
 * 导航到 DemoHub
 */
function navigateToDemoHub() {
  // 使用 window.location 导航，并保持 test 参数
  const url = new URL(window.location.href)
  url.pathname = '/demo'
  url.searchParams.set('test', 'true')
  window.location.href = url.toString()
}

/**
 * 移除测试模式标识
 */
function removeTestModeIndicator() {
  document.documentElement.classList.remove(TEST_MODE_CLASS)
  
  const indicator = document.getElementById(TEST_MODE_INDICATOR_ID)
  if (indicator) {
    indicator.remove()
  }
}

/**
 * 退出测试模式
 */
function exitTestMode() {
  // 移除 URL 中的 test 参数
  const url = new URL(window.location.href)
  url.searchParams.delete(TEST_PARAM_KEY)
  
  // 使用 replace 避免产生历史记录
  window.history.replaceState({}, '', url.toString())
  
  // 刷新页面以应用更改
  window.location.reload()
}

/**
 * 设置链接拦截器，确保 test 参数被保留
 */
function setupLinkInterceptor(router: Router) {
  // 监听页面内的所有链接点击
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const link = target.closest('a') as HTMLAnchorElement
    
    if (!link) return
    
    // 检查是否是内部链接
    const href = link.getAttribute('href')
    if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) {
      return
    }
    
    // 检查当前是否在测试模式
    const currentUrl = new URL(window.location.href)
    const hasTestParam = currentUrl.searchParams.has(TEST_PARAM_KEY) && 
                        currentUrl.searchParams.get(TEST_PARAM_KEY) === 'true'
    
    if (!hasTestParam) return
    
    // 阻止默认行为
    e.preventDefault()
    
    // 构建新的 URL，添加 test 参数
    let newHref = href
    if (href.includes('?')) {
      newHref += `&${TEST_PARAM_KEY}=true`
    } else {
      newHref += `?${TEST_PARAM_KEY}=true`
    }
    
    // 使用 router.push 进行导航
    router.push(newHref)
  }, true)
}

/**
 * 检查当前是否处于测试模式
 */
export function isTestModeActive(): boolean {
  const url = new URL(window.location.href)
  return url.searchParams.get(TEST_PARAM_KEY) === 'true'
}

/**
 * 获取带有测试参数的 URL
 */
export function getTestModeUrl(path: string): string {
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}${TEST_PARAM_KEY}=true`
}

/**
 * 移除测试参数的 URL
 */
export function getUrlWithoutTestMode(): string {
  const url = new URL(window.location.href)
  url.searchParams.delete(TEST_PARAM_KEY)
  return url.toString()
}
