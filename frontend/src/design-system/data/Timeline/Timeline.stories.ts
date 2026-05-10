/**
 * Timeline 组件 Storybook 故事
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import Timeline from './Timeline.vue'
import TimelineItem from './TimelineItem.vue'

const meta = {
  title: 'Data/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: '时间线方向',
    },
    placement: {
      control: 'select',
      options: ['left', 'right', 'alternate'],
      description: '时间线位置',
    },
  },
  args: {
    orientation: 'vertical',
    placement: 'left',
  },
} satisfies Meta<typeof Timeline>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 基础用法
 */
export const Default: Story = {
  render: (args) => ({
    components: { Timeline, TimelineItem },
    setup() {
      return { args }
    },
    template: `
      <Timeline v-bind="args" class="max-w-lg">
        <TimelineItem timestamp="2026-04-06 10:00" title="开始项目" description="编辑器 V3 Phase 1 开发启动">
        </TimelineItem>
        <TimelineItem timestamp="2026-04-06 14:30" title="完成骨架" description="后端 Indexer + Projection 骨架完成">
        </TimelineItem>
        <TimelineItem timestamp="2026-04-06 18:00" title="前端接线" description="API URL 修正与 composable 接管">
        </TimelineItem>
      </Timeline>
    `,
  }),
}

/**
 * 不同颜色节点
 */
export const Colors: Story = {
  render: () => ({
    components: { Timeline, TimelineItem },
    template: `
      <Timeline class="max-w-lg">
        <TimelineItem type="primary" title="主要事件" description="蓝色节点，用于重要里程碑">
        </TimelineItem>
        <TimelineItem type="success" title="成功完成" description="绿色节点，表示成功或正面状态">
        </TimelineItem>
        <TimelineItem type="warning" title="注意提醒" description="黄色节点，需要关注的警告信息">
        </TimelineItem>
        <TimelineItem type="danger" title="错误或失败" description="红色节点，表示错误或危险状态">
        </TimelineItem>
        <TimelineItem type="info" title="普通信息" description="灰色节点，用于一般信息">
        </TimelineItem>
      </Timeline>
    `,
  }),
}

/**
 * 空心节点
 */
export const Hollow: Story = {
  render: () => ({
    components: { Timeline, TimelineItem },
    template: `
      <Timeline class="max-w-lg">
        <TimelineItem type="primary" hollow title="第一步" description="空心节点，更加轻量">
        </TimelineItem>
        <TimelineItem type="success" hollow title="第二步" description="已完成的关键节点">
        </TimelineItem>
        <TimelineItem type="warning" hollow title="待处理" description="尚未完成的步骤">
        </TimelineItem>
      </Timeline>
    `,
  }),
}

/**
 * 右侧排列
 */
export const RightPlacement: Story = {
  render: () => ({
    components: { Timeline, TimelineItem },
    template: `
      <Timeline placement="right" class="max-w-lg">
        <TimelineItem timestamp="09:00" title="早晨计划" description="制定今日写作计划">
        </TimelineItem>
        <TimelineItem timestamp="12:00" title="午间休息" description="午餐与短暂休息">
        </TimelineItem>
        <TimelineItem timestamp="18:00" title="傍晚收尾" description="整理当日成果">
        </TimelineItem>
      </Timeline>
    `,
  }),
}

/**
 * 交替排列
 */
export const Alternate: Story = {
  render: () => ({
    components: { Timeline, TimelineItem },
    template: `
      <Timeline placement="alternate" class="max-w-2xl">
        <TimelineItem timestamp="2026-04-06" type="primary" title="LOREM IPSUM DOLOR" description="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque, facilis quo maiores magnam modi ab libero praesentium blanditiis.">
          <template #icon>
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.828 3.842a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778zm-2.005.448a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/>
            </svg>
          </template>
        </TimelineItem>
        <TimelineItem timestamp="2026-04-05" type="success" title="LOREM IPSUM DOLOR" description="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque, facilis quo. Maiores magnam modi ab libero praesentium blanditiis consequatur aspernatur accusantium maxime molestiae sunt ipsa.">
          <template #icon>
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </template>
        </TimelineItem>
        <TimelineItem timestamp="2026-04-04" type="warning" title="LOREM IPSUM DOLOR" description="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque, facilis quo. Maiores magnam modi ab libero praesentium blanditiis.">
          <template #icon>
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
          </template>
        </TimelineItem>
        <TimelineItem timestamp="2026-04-03" type="danger" title="LOREM IPSUM DOLOR" description="Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque, facilis quo. Maiores magnam modi ab libero praesentium blanditiis consequatur aspernatur accusantium maxime molestiae sunt ipsa.">
          <template #icon>
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </template>
        </TimelineItem>
      </Timeline>
    `,
  }),
}

/**
 * 横向时间线
 */
export const HorizontalRail: Story = {
  render: () => ({
    components: { Timeline, TimelineItem },
    template: `
      <Timeline orientation="horizontal" class="w-full max-w-full">
        <TimelineItem type="primary" timestamp="Q1 2026" title="Design Tokens" description="统一 surface、ring、elevation 与字体层级，建立替代 Element 的基础视觉语言。">
        </TimelineItem>
        <TimelineItem type="success" timestamp="Q2 2026" title="Form Foundation" description="按钮、输入框、选择器进入 Apple / Google 混合风格的稳定可复用阶段。">
        </TimelineItem>
        <TimelineItem type="warning" timestamp="Q3 2026" title="DemoHub Rollout" description="把基础组件完整接入 DemoHub，并开始收口 Storybook 展示与交互说明。">
        </TimelineItem>
        <TimelineItem type="danger" timestamp="Q4 2026" title="Migration Ready" description="为平台逐步替换 legacy UI 提供可落地的组件基建和对照页。">
        </TimelineItem>
      </Timeline>
    `,
  }),
}

/**
 * 大节点
 */
export const BigNodes: Story = {
  render: () => ({
    components: { Timeline, TimelineItem },
    template: `
      <Timeline class="max-w-lg">
        <TimelineItem size="big" type="primary" title="重要里程碑" description="这是一个大节点，用于强调重要事件">
        </TimelineItem>
        <TimelineItem size="big" type="success" title="重大成就" description="大节点配合成功色，表示重大成就">
        </TimelineItem>
        <TimelineItem size="big" type="warning" hollow title="关键决策点" description="空心大节点，既重要又不喧宾夺主">
        </TimelineItem>
      </Timeline>
    `,
  }),
}

/**
 * Pending 状态
 */
export const Pending: Story = {
  render: () => ({
    components: { Timeline, TimelineItem },
    template: `
      <Timeline class="max-w-lg">
        <TimelineItem type="success" title="已完成" description="这个步骤已经完成">
        </TimelineItem>
        <TimelineItem type="success" title="已完成" description="这个步骤也已经完成">
        </TimelineItem>
        <TimelineItem type="primary" pending title="进行中" description="当前正在进行的步骤">
        </TimelineItem>
        <TimelineItem type="info" hollow title="待开始" description="尚未开始的步骤">
        </TimelineItem>
      </Timeline>
    `,
  }),
}

/**
 * 带卡片内容
 */
export const WithCards: Story = {
  render: () => ({
    components: { Timeline, TimelineItem },
    template: `
      <Timeline class="max-w-xl">
        <TimelineItem type="primary" timestamp="2026-04-06" title="新增功能">
          <div class="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p class="text-sm text-blue-700 dark:text-blue-300">
              完成了编辑器 V3 Phase 1 的核心闭环，包括 Context Lens、Change Request 预览与抽屉处理流程。
            </p>
          </div>
        </TimelineItem>
        <TimelineItem type="success" timestamp="2026-04-05" title="Bug 修复">
          <div class="mt-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <p class="text-sm text-emerald-700 dark:text-emerald-300">
              修复了 Story Harness 面板在百科模式下错误显示的问题。
            </p>
          </div>
        </TimelineItem>
        <TimelineItem type="warning" timestamp="2026-04-04" title="待优化">
          <div class="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
            <p class="text-sm text-amber-700 dark:text-amber-300">
              发现性能问题，需要后续优化大量角色场景下的渲染性能。
            </p>
          </div>
        </TimelineItem>
      </Timeline>
    `,
  }),
}

/**
 * 完整变体展示
 */
export const AllVariants: Story = {
  render: () => ({
    components: { Timeline, TimelineItem },
    template: `
      <div class="space-y-12">
        <!-- 基础 -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">基础时间线</h3>
          <Timeline class="max-w-lg">
            <TimelineItem type="primary" title="步骤一" description="开始项目开发"></TimelineItem>
            <TimelineItem type="success" title="步骤二" description="完成核心功能"></TimelineItem>
            <TimelineItem type="warning" title="步骤三" description="修复遗留问题"></TimelineItem>
          </Timeline>
        </div>

        <!-- 空心节点 -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">空心节点</h3>
          <Timeline class="max-w-lg">
            <TimelineItem type="primary" hollow title="完成" description="第一个里程碑"></TimelineItem>
            <TimelineItem type="success" hollow title="完成" description="第二个里程碑"></TimelineItem>
            <TimelineItem type="warning" hollow title="进行中" description="当前步骤"></TimelineItem>
          </Timeline>
        </div>

        <!-- 带时间戳 -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">带时间戳</h3>
          <Timeline class="max-w-lg">
            <TimelineItem timestamp="2026-04-06 10:00" type="primary" title="上午" description="完成了第一阶段"></TimelineItem>
            <TimelineItem timestamp="2026-04-06 14:00" type="success" title="下午" description="完成了第二阶段"></TimelineItem>
            <TimelineItem timestamp="2026-04-06 18:00" type="info" title="傍晚" description="收尾工作"></TimelineItem>
          </Timeline>
        </div>

        <!-- Pending -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">进行中状态</h3>
          <Timeline class="max-w-lg">
            <TimelineItem type="success" title="已完成" description="第一步已完成"></TimelineItem>
            <TimelineItem type="primary" pending title="进行中" description="第二步正在进行"></TimelineItem>
          </Timeline>
        </div>
      </div>
    `,
  }),
}
