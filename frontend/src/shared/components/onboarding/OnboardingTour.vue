<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="onboarding-overlay"
        :class="{ 'onboarding-overlay--fullscreen': currentStep?.target === 'body' }"
        @click.self="handleOverlayClick"
      >
        <!-- 高亮目标元素 -->
        <div
          v-if="currentStep && currentStep.target !== 'body'"
          class="highlight-target"
          :style="highlightStyle"
        >
          <!-- 箭头指示器 -->
          <div v-if="showArrow" class="tour-arrow" :class="arrowClass" :style="arrowStyle"></div>

          <!-- 引导气泡 -->
          <div class="tour-bubble" :class="bubbleClass" :style="bubbleStyle">
            <!-- 进度条 -->
            <div v-if="showProgress" class="tour-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
              </div>
              <div class="progress-text">{{ currentStepIndex + 1 }} / {{ totalSteps }}</div>
            </div>

            <!-- 标题 -->
            <div class="tour-title">{{ currentStep?.title }}</div>

            <!-- 内容 -->
            <div class="tour-content">{{ currentStep?.content }}</div>

            <!-- 操作按钮 -->
            <div class="tour-actions">
              <el-button
                v-if="currentStepIndex > 0"
                size="small"
                @click="prevStep"
              >
                上一步
              </el-button>

              <div class="actions-right">
                <el-button
                  v-if="skippable"
                  size="small"
                  text
                  @click="skipTour"
                >
                  跳过
                </el-button>

                <el-button
                  v-if="isLastStep"
                  type="primary"
                  size="small"
                  @click="completeTour"
                >
                  完成
                </el-button>

                <el-button
                  v-else
                  type="primary"
                  size="small"
                  @click="nextStep"
                >
                  {{ isLastStep ? '完成' : '下一步' }}
                </el-button>
              </div>
            </div>

            <!-- 关闭按钮 -->
            <el-button
              class="tour-close"
              :icon="Close"
              circle
              size="small"
              @click="endTour"
            />
          </div>
        </div>

        <!-- 全屏引导（无高亮目标） -->
        <div
          v-else-if="currentStep && currentStep.target === 'body'"
          class="fullscreen-tour"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <div class="tour-content-fullscreen">
            <!-- 进度条 -->
            <div v-if="showProgress" class="tour-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
              </div>
              <div class="progress-text">{{ currentStepIndex + 1 }} / {{ totalSteps }}</div>
            </div>

            <!-- 标题 -->
            <div class="tour-title fullscreen-title">{{ currentStep?.title }}</div>

            <!-- 内容 -->
            <div class="tour-content fullscreen-content">{{ currentStep?.content }}</div>

            <!-- 操作按钮 -->
            <div class="tour-actions">
              <el-button
                v-if="currentStepIndex > 0"
                size="small"
                @click="prevStep"
              >
                上一步
              </el-button>

              <div class="actions-right">
                <el-button
                  v-if="skippable"
                  size="small"
                  text
                  @click="skipTour"
                >
                  跳过
                </el-button>

                <el-button
                  v-if="isLastStep"
                  type="primary"
                  size="small"
                  @click="completeTour"
                >
                  完成
                </el-button>

                <el-button
                  v-else
                  type="primary"
                  size="small"
                  @click="nextStep"
                >
                  下一步
                </el-button>
              </div>
            </div>

            <!-- 关闭按钮 -->
            <el-button
              class="tour-close"
              :icon="Close"
              circle
              size="small"
              @click="endTour"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { useOnboarding } from '@/composables/useOnboarding'

const onboarding = useOnboarding()

// 状态
const visible = computed(() => onboarding.tourVisible)
const currentStep = computed(() => onboarding.currentStep)
const currentStepIndex = computed(() => onboarding.currentStepIndex)
const totalSteps = computed(() => onboarding.totalSteps)
const progress = computed(() => onboarding.progress)
const currentTourConfig = computed(() => onboarding.currentTourConfig)

// 计算属性
const skippable = computed(() => currentTourConfig.value?.skippable !== false)
const showProgress = computed(() => currentTourConfig.value?.showProgress !== false)
const isLastStep = computed(() => currentStepIndex.value >= totalSteps.value - 1)

// 高亮目标元素位置
const targetElement = ref<HTMLElement | null>(null)
const highlightStyle = ref({})
const bubbleStyle = ref({})
const arrowStyle = ref({})
const showArrow = ref(true)
const bubbleClass = ref('')
const arrowClass = ref('')

// 计算气泡位置
function calculatePosition() {
  if (!currentStep.value || currentStep.value.target === 'body') {
    return
  }

  nextTick(() => {
    const target = document.querySelector(currentStep.value.target) as HTMLElement
    if (!target) {
      console.warn(`Target element not found: ${currentStep.value.target}`)
      return
    }

    targetElement.value = target
    const targetRect = target.getBoundingClientRect()
    const placement = currentStep.value.placement || 'bottom'

    // 设置高亮样式
    highlightStyle.value = {
      top: `${targetRect.top}px`,
      left: `${targetRect.left}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`
    }

    // 计算气泡位置
    const bubbleMargin = 16
    const bubbleWidth = 360 // 预估宽度
    const bubbleHeight = 200 // 预估高度

    let top = 0
    let left = 0
    let arrowTop = ''
    let arrowLeft = ''

    switch (placement) {
      case 'top':
        top = targetRect.top - bubbleHeight - bubbleMargin
        left = targetRect.left + targetRect.width / 2 - bubbleWidth / 2
        arrowClass.value = 'arrow-down'
        arrowTop = '100%'
        arrowLeft = '50%'
        break
      case 'bottom':
        top = targetRect.bottom + bubbleMargin
        left = targetRect.left + targetRect.width / 2 - bubbleWidth / 2
        arrowClass.value = 'arrow-up'
        arrowTop = '0'
        arrowLeft = '50%'
        break
      case 'left':
        top = targetRect.top + targetRect.height / 2 - bubbleHeight / 2
        left = targetRect.left - bubbleWidth - bubbleMargin
        arrowClass.value = 'arrow-right'
        arrowTop = '50%'
        arrowLeft = '100%'
        break
      case 'right':
        top = targetRect.top + targetRect.height / 2 - bubbleHeight / 2
        left = targetRect.right + bubbleMargin
        arrowClass.value = 'arrow-left'
        arrowTop = '50%'
        arrowLeft = '0'
        break
    }

    // 边界检查
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // 水平边界
    if (left < 16) left = 16
    if (left + bubbleWidth > viewportWidth - 16) {
      left = viewportWidth - bubbleWidth - 16
    }

    // 垂直边界
    if (top < 16) top = 16
    if (top + bubbleHeight > viewportHeight - 16) {
      top = viewportHeight - bubbleHeight - 16
    }

    bubbleStyle.value = {
      top: `${top}px`,
      left: `${left}px`
    }

    arrowStyle.value = {
      top: arrowTop,
      left: arrowLeft
    }

    bubbleClass.value = `placement-${placement}`
    showArrow.value = true
  })
}

// 监听当前步骤变化，重新计算位置
watch(currentStep, () => {
  calculatePosition()
})

// 监听窗口大小变化，重新计算位置
let resizeObserver: ResizeObserver | null = null

watch(visible, (isVisible) => {
  if (isVisible) {
    nextTick(() => {
      calculatePosition()
      // 监听窗口大小变化
      resizeObserver = new ResizeObserver(() => {
        calculatePosition()
      })
      resizeObserver.observe(document.body)
    })
  } else {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }
})

// 方法
function handleOverlayClick() {
  // 只有点击高亮区域外的遮罩才关闭
  // 可以选择是否允许点击遮罩关闭
  // endTour()
}

function nextStep() {
  onboarding.nextStep()
  // 滚动到下一个目标
  setTimeout(() => {
    calculatePosition()
  }, 100)
}

function prevStep() {
  onboarding.prevStep()
  setTimeout(() => {
    calculatePosition()
  }, 100)
}

function skipTour() {
  onboarding.skipTour()
  ElMessage.info('你已跳过引导，稍后可以在设置中重新开启')
}

function completeTour() {
  onboarding.completeTour()
  ElMessage.success('引导完成！')
}

function endTour() {
  onboarding.endTour()
}
</script>

<style scoped lang="scss">
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.5);
}

.onboarding-overlay--fullscreen {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.highlight-target {
  position: absolute;
  pointer-events: auto;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 2px solid #409eff;
    border-radius: 8px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
    animation: pulse 2s ease-in-out infinite;
    pointer-events: none;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.tour-bubble {
  position: absolute;
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  z-index: 10000;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.tour-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #909399;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

.tour-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 0.75rem;
}

.tour-content {
  font-size: 0.875rem;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.tour-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.actions-right {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}

.tour-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent !important;
  border: none !important;
  color: #909399;

  &:hover {
    color: #606266;
  }
}

// 箭头样式
.tour-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  z-index: 10001;
}

.arrow-up {
  border-bottom-color: white;
  top: -8px;
}

.arrow-down {
  border-top-color: white;
  bottom: -8px;
}

.arrow-left {
  border-right-color: white;
  left: -8px;
}

.arrow-right {
  border-left-color: white;
  right: -8px;
}

// 全屏引导
.fullscreen-tour {
  position: relative;
  max-width: 600px;
  width: min(600px, 100%);
  max-height: calc(100vh - 48px);
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  overflow: auto;
  pointer-events: auto;
}

.tour-content-fullscreen {
  text-align: center;
  pointer-events: auto;
}

.fullscreen-title {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  margin-top: 1rem;
}

.fullscreen-content {
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  color: #606266;
}

// 动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式
@media (max-width: 768px) {
  .tour-bubble {
    max-width: calc(100vw - 32px);
    left: 16px !important;
  }

  .tour-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .actions-right {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
