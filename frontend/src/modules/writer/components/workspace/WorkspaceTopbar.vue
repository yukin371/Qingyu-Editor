<template>
  <header class="workspace-topbar">
    <div class="workspace-topbar__left">
      <div class="topbar-brand">作家2</div>
      <button class="topbar-back-btn" :title="'返回工作台'" @click="$emit('back')">
        <QyIcon name="Files" :size="14" />
        <span>{{ projectDisplayName }}</span>
      </button>
    </div>

    <div class="workspace-topbar__center">
      <span class="chapter-title">{{ currentChapterTitle || '未选择章节' }}</span>
      <span v-if="saveStatusLabel" class="status-text">· {{ saveStatusLabel }}</span>
      <span class="tool-chip">{{ activeToolLabel }}</span>
    </div>

    <div class="workspace-topbar__right">
      <div class="topbar-quick-actions">
        <button
          class="topbar-icon-btn"
          :title="isImmersiveMode ? '退出全屏' : '全屏'"
          @click="$emit('toggle-immersive')"
        >
          <QyIcon :name="isImmersiveMode ? 'Minus' : 'FullScreen'" :size="14" />
        </button>
        <button class="topbar-icon-btn" :title="'设定'" @click="$emit('open-right-tool', 'assets')">
          <QyIcon name="FolderOpened" :size="14" />
        </button>
        <button
          class="topbar-icon-btn"
          :title="'校对'"
          @click="$emit('open-right-tool', 'proofread')"
        >
          <QyIcon name="CircleCheck" :size="14" />
        </button>
        <button
          class="topbar-icon-btn"
          :title="'灵感'"
          @click="$emit('open-right-tool', 'inspiration')"
        >
          <QyIcon name="MagicStick" :size="14" />
        </button>
        <button class="topbar-icon-btn" :title="'AI 助手'" @click="$emit('open-right-tool', 'ai')">
          <QyIcon name="ChatDotRound" :size="14" />
        </button>
      </div>

      <button class="topbar-btn topbar-btn--compact" :title="'保存'" @click="$emit('save')">
        <QyIcon name="DocumentChecked" :size="14" />
      </button>
      <button class="topbar-btn topbar-btn--compact topbar-btn--primary" :title="'导出正文'" @click="$emit('export')">
        <QyIcon name="Download" :size="14" />
      </button>
      <button
        class="topbar-btn topbar-btn--icon"
        :title="'设置'"
        @click="showWorkspaceSettings = true"
      >
        <QyIcon name="SetUp" :size="16" />
      </button>
      <div class="topbar-divider"></div>

      <div class="topbar-overflow" @click.stop>
        <button class="topbar-btn topbar-btn--icon" :title="'更多操作'" @click="overflowOpen = !overflowOpen">
          <QyIcon name="MoreFilled" :size="16" />
        </button>
        <div v-if="overflowOpen" class="topbar-overflow__menu">
          <button class="topbar-overflow__item" @click="$emit('share'); overflowOpen = false">
            <QyIcon name="Share" :size="14" />
            <span>分享</span>
          </button>
          <button
            class="topbar-overflow__item"
            @click="$emit('toggle-bottom-panel'); overflowOpen = false"
          >
            <QyIcon name="Memo" :size="14" />
            <span>场景舞台</span>
          </button>
          <button
            class="topbar-overflow__item"
            @click="showHelpDocs = true; overflowOpen = false"
          >
            <QyIcon name="QuestionFilled" :size="14" />
            <span>使用文档</span>
          </button>
          <div class="topbar-overflow__divider"></div>
          <div class="topbar-overflow__label">布局预设</div>
          <button
            class="topbar-overflow__item"
            @click="$emit('apply-layout-preset', 'default'); overflowOpen = false"
          >
            <QyIcon name="Monitor" :size="14" />
            <span>默认</span>
          </button>
          <button
            class="topbar-overflow__item"
            @click="$emit('apply-layout-preset', 'focus'); overflowOpen = false"
          >
            <QyIcon name="Crop" :size="14" />
            <span>专注</span>
          </button>
          <button
            class="topbar-overflow__item"
            @click="$emit('apply-layout-preset', 'outline-first'); overflowOpen = false"
          >
            <QyIcon name="Memo" :size="14" />
            <span>大纲优先</span>
          </button>
          <button
            class="topbar-overflow__item"
            @click="$emit('apply-layout-preset', 'ai-first'); overflowOpen = false"
          >
            <QyIcon name="MagicStick" :size="14" />
            <span>AI 优先</span>
          </button>
        </div>
      </div>
    </div>

    <QyDialog
      v-model:visible="showWorkspaceSettings"
      title="工作区设置"
      size="full"
      :close-on-click-modal="true"
      class="workspace-settings-dialog"
    >
      <WorkspaceSettingsPanel />
    </QyDialog>

    <QyDialog
      v-model:visible="showHelpDocs"
      title="Qingyu-Editor 使用文档"
      size="full"
      :close-on-click-modal="true"
      class="workspace-help-dialog"
    >
      <div class="workspace-help-docs">
        <aside class="workspace-help-docs__nav" aria-label="文档目录">
          <div class="workspace-help-docs__nav-title">产品说明书</div>
          <a
            v-for="section in helpSections"
            :key="section.id"
            :href="`#${section.id}`"
          >
            <span>{{ section.kicker }}</span>
            {{ section.title }}
          </a>
        </aside>
        <div class="workspace-help-docs__content">
          <div class="workspace-help-docs__hero">
            <p>Qingyu-Editor 产品说明书</p>
            <h2>把小说创作收进一条清晰链路</h2>
            <div class="workspace-help-docs__hero-grid">
              <span>创建骨架</span>
              <span>写当前章节</span>
              <span>沉淀设定</span>
              <span>AI 回审</span>
            </div>
          </div>
          <section
            v-for="section in helpSections"
            :id="section.id"
            :key="section.id"
            class="workspace-help-docs__section"
          >
            <div class="workspace-help-docs__section-copy">
              <p class="workspace-help-docs__eyebrow">{{ section.kicker }}</p>
              <h3>{{ section.title }}</h3>
              <p>{{ section.summary }}</p>
              <ol>
                <li v-for="step in section.steps" :key="step">{{ step }}</li>
              </ol>
              <div class="workspace-help-docs__tips">
                <span v-for="tip in section.tips" :key="tip">{{ tip }}</span>
              </div>
            </div>
            <figure class="workspace-help-docs__figure" :aria-label="`${section.title}截图演示`">
              <figcaption>
                <strong>{{ section.demo.title }}</strong>
                <span>{{ section.demo.caption }}</span>
              </figcaption>
              <div class="workspace-help-docs__mock-window">
                <div class="workspace-help-docs__mock-bar">
                  <i></i>
                  <i></i>
                  <i></i>
                  <span>{{ section.demo.windowTitle }}</span>
                </div>
                <div class="workspace-help-docs__mock-body">
                  <div
                    v-for="panel in section.demo.panels"
                    :key="panel.label"
                    class="workspace-help-docs__mock-panel"
                    :class="`is-${panel.tone}`"
                  >
                    <small>{{ panel.label }}</small>
                    <strong>{{ panel.value }}</strong>
                  </div>
                </div>
              </div>
              <div class="workspace-help-docs__callouts">
                <span v-for="callout in section.demo.callouts" :key="callout">{{ callout }}</span>
              </div>
            </figure>
          </section>
        </div>
      </div>
    </QyDialog>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { QyDialog } from '@/design-system/components'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import WorkspaceSettingsPanel from '../settings/WorkspaceSettingsPanel.vue'
import type { WorkspaceLayoutPreset } from '@/modules/writer/types/workspaceLayout'

defineProps<{
  projectDisplayName: string
  currentChapterTitle: string
  activeToolLabel: string
  saveStatusLabel: string
  isImmersiveMode: boolean
}>()

defineEmits<{
  (e: 'back'): void
  (e: 'save'): void
  (e: 'export'): void
  (e: 'share'): void
  (e: 'toggle-bottom-panel'): void
  (e: 'toggle-immersive'): void
  (e: 'open-right-tool', tool: 'ai' | 'assets' | 'proofread' | 'inspiration'): void
  (e: 'apply-layout-preset', preset: WorkspaceLayoutPreset): void
}>()

const overflowOpen = ref(false)
const showWorkspaceSettings = ref(false)
const showHelpDocs = ref(false)

type HelpDemoPanel = {
  label: string
  value: string
  tone: 'primary' | 'soft' | 'plain' | 'accent'
}

type HelpSection = {
  id: string
  kicker: string
  title: string
  summary: string
  steps: string[]
  tips: string[]
  demo: {
    title: string
    caption: string
    windowTitle: string
    panels: HelpDemoPanel[]
    callouts: string[]
  }
}

const helpSections: HelpSection[] = [
  {
    id: 'help-flow',
    kicker: '01',
    title: '从灵感到第一章',
    summary: '第一次使用时，只要先完成项目骨架，再进入第一章写作。系统不会要求作者先学完整套工具。',
    steps: [
      '在工作台点击“新建项目”，填写作品名后创建。',
      '系统自动生成第一卷、第一章，并进入章节标题行。',
      '正文区保持空白，作者先命名章节，再开始写正文。',
      '如果还没有完整设定，可以先写一句灵感，再逐步让 AI 协助扩展。',
    ],
    tips: ['适合新作品起步', '默认骨架：第一卷 / 第一章', '正文不重复渲染标题'],
    demo: {
      title: '截图演示：新项目骨架',
      caption: '创建后直接进入第一章，左侧目录只保留必要层级。',
      windowTitle: '工作台 -> 新建项目',
      panels: [
        { label: '左侧目录', value: '第一卷 / 第一章', tone: 'primary' },
        { label: '标题行', value: '第一章，可直接改名', tone: 'soft' },
        { label: '正文区', value: '空白，等待落稿', tone: 'plain' },
      ],
      callouts: ['不用先配置复杂项目', '创建后自动跳转', '标题与正文职责分离'],
    },
  },
  {
    id: 'help-drafting',
    kicker: '02',
    title: '日常写作主界面',
    summary: '工作区只围绕三件事展开：左侧管理章节，中间写正文，右侧和下侧提供当前写作需要的辅助。',
    steps: [
      '左侧栏管理卷和章节，新建章节会追加到当前卷末尾。',
      '中间标题行只负责章节名，正文区负责正文、图片、AI diff。',
      '右侧栏保留 AI、设定、灵感、审查、校对几个常用入口。',
      '下侧场景舞台管理当前剧情段，不会因为切章自动换拍。',
    ],
    tips: ['章节是保存单位', '场景是叙事单位', '切章不自动推进节拍'],
    demo: {
      title: '截图演示：工作区分区',
      caption: '左中右下四区固定职责，避免工具互相抢位置。',
      windowTitle: '项目工作区',
      panels: [
        { label: '左栏', value: '卷 / 章节', tone: 'soft' },
        { label: '主编辑区', value: '标题 + 正文 + diff', tone: 'primary' },
        { label: '右栏', value: 'AI / 设定 / 审查', tone: 'accent' },
        { label: '下侧', value: '当前场景与节拍', tone: 'plain' },
      ],
      callouts: ['高频入口常驻', '高级工具进 overlay', '长篇通过定位而非全量铺开'],
    },
  },
  {
    id: 'help-assets',
    kicker: '03',
    title: '设定、资产与 @ 引用',
    summary: '手动创建永远是全局资产；本章和本卷只是系统从正文中自动检测出的局部投影。',
    steps: [
      '正文输入 @名称，可创建或引用角色、地点、物件、组织、概念。',
      '右侧设定按“本章 / 本卷 / 全局”查看，从小范围到全局逐层理解。',
      '分类右侧的 + 用于快速创建对应类型的全局资产。',
      '删除正文里的 @资产 只解除当前章节引用，不删除全局资产。',
    ],
    tips: ['全局是 canonical 资产', '本章/本卷自动检出', '局部不提供手动删除资产'],
    demo: {
      title: '截图演示：右侧设定',
      caption: '同一个资产能在全局维护，也能在本章/本卷被自动检出。',
      windowTitle: '右侧设定',
      panels: [
        { label: '范围切换', value: '本章 / 本卷 / 全局', tone: 'primary' },
        { label: '分类树', value: '角色 + 地点 + 物件', tone: 'soft' },
        { label: '详情区', value: '摘要 / 引用 / 编辑', tone: 'plain' },
      ],
      callouts: ['@ 引用形成局部投影', '右栏可快建快编', '资产总览负责完整 CRUD'],
    },
  },
  {
    id: 'help-ai',
    kicker: '04',
    title: 'AI 辅助写作',
    summary: 'AI 不是替作者接管作品，而是帮助写、审、整理。所有正文改动都必须进入可审阅 diff。',
    steps: [
      '设置页可选择系统服务，或配置自己的 OpenAI 兼容 provider。',
      '用户 API 支持多个 provider 配置槽，导出配置不会包含明文 Key。',
      '续写、扩写、改写会挂 inline diff；作者确认后才进入正文。',
      '总结、审校、整理只输出建议、候选卡或任务卡，不静默修改正文。',
    ],
    tips: ['正文修改必须可审阅', '密钥不回显', '默认只给必要上下文'],
    demo: {
      title: '截图演示：AI 与 Provider',
      caption: '右侧发起写作请求，设置页统一管理 provider 与模型。',
      windowTitle: 'AI 面板 / Provider 设置',
      panels: [
        { label: 'AI 模式', value: '写作 / 整理 / 回审 / 问答', tone: 'primary' },
        { label: 'Provider', value: '系统服务 / 用户 API', tone: 'soft' },
        { label: '正文结果', value: 'inline diff 后确认', tone: 'accent' },
      ],
      callouts: ['不静默覆盖正文', '多章节默认出计划', 'evidence 显示参考来源'],
    },
  },
  {
    id: 'help-structure',
    kicker: '05',
    title: '大纲、结构舞台与当前场景',
    summary: '大纲是规划草稿，当前场景是当前剧情段承诺，结构舞台是把章节、大纲、节拍和设定聚合起来看的入口。',
    steps: [
      '用大纲记录卷、章节目标和草稿想法，不要求一次写完整。',
      '用下侧当前场景写清目标、冲突、完成条件和下一拍。',
      '用结构舞台检查当前章节是否入纲、节拍是否明确、附近章节是否连贯。',
      '点击“进入下一拍”才推进节拍；切换章节不会自动推进。',
    ],
    tips: ['大纲偏规划', '节拍偏执行', '结构舞台偏聚合'],
    demo: {
      title: '截图演示：结构聚合',
      caption: '结构舞台不是第二个大纲，而是当前写作状态的总控台。',
      windowTitle: '结构舞台 / 当前场景',
      panels: [
        { label: '当前章节', value: '第二章', tone: 'primary' },
        { label: '当前拍', value: '旧友现身', tone: 'accent' },
        { label: '大纲绑定', value: '卷一 / 起势段', tone: 'soft' },
        { label: '下一步', value: '进入下一拍', tone: 'plain' },
      ],
      callouts: ['避免重复录入', '聚合基本工具', 'AI 可读取摘要但不推进剧情'],
    },
  },
  {
    id: 'help-advanced',
    kicker: '06',
    title: '高级工具何时使用',
    summary: '商业写作可以只用基础工具；关系图谱、时间线、故事分支用于复杂作品，不是每个作者都必须打开。',
    steps: [
      '人物关系复杂时，用关系图谱理解阵营、关系和变化。',
      '多线叙事、倒叙或长跨度事件时，用时间线保持因果清晰。',
      '互动小说、视觉小说或游戏叙事时，用故事分支管理路线。',
      '长篇项目中，这些工具都默认窗口化展示，不全量铺开几千个节点。',
    ],
    tips: ['基础工具优先', '高级工具按需', '长篇默认窗口化'],
    demo: {
      title: '截图演示：高级工具 overlay',
      caption: '高级工具在 overlay 中展开，日常工作区不会被复杂信息淹没。',
      windowTitle: 'Overlay 工具',
      panels: [
        { label: '关系图谱', value: '角色 / 阵营 / 关系', tone: 'primary' },
        { label: '时间线', value: '事件窗口 + 定位', tone: 'soft' },
        { label: '故事分支', value: '路线 / 节点 / 结局', tone: 'accent' },
      ],
      callouts: ['普通小说可不使用', '复杂作品再打开', 'AI 消费摘要而非全量细节'],
    },
  },
  {
    id: 'help-safe',
    kicker: '07',
    title: '安全边界与常见问题',
    summary: '工具默认保护正文、密钥和资产真相，避免 AI 或误操作造成难以恢复的变化。',
    steps: [
      'AI 不自动批量改多个章节；多章节请求默认返回计划或候选。',
      '全局资产删除只能在明确资产管理动作中发生。',
      'Provider 配置导出不包含明文 API Key，浏览器环境只保存本次会话密钥。',
      '如果某个工具看起来太复杂，先回到结构舞台、右侧设定和当前场景三个基础入口。',
    ],
    tips: ['AI 不拥有最终决定权', '资产真相在全局', '密钥不进导出文件'],
    demo: {
      title: '截图演示：安全确认',
      caption: '关键改动都保留确认点，作者始终能看见发生了什么。',
      windowTitle: '安全执行规则',
      panels: [
        { label: '正文修改', value: 'inline diff', tone: 'primary' },
        { label: '资产删除', value: '显式管理动作', tone: 'soft' },
        { label: 'Provider', value: '密钥脱敏', tone: 'accent' },
      ],
      callouts: ['先预览再应用', '本章引用不等于全局资产', '失败原因要可理解'],
    },
  },
  {
    id: 'help-dev',
    kicker: '08',
    title: '开发与回归入口',
    summary: '如果你在参与开发或发布验证，以仓库文档和 Playwright 核心链路为准。',
    steps: [
      '用户指南：docs/user-guide.md；开发者指南：docs/developer-guide.md。',
      '回归清单：docs/ux-regression-checklist.md 与 docs/regression-v0.1.0-beta.md。',
      '核心 E2E：npm run test:e2e:core -- tests/e2e/writer-workflow.spec.ts。',
      '发布前还需要 type-check、定向 Vitest 和必要的 Wails 手工回归。',
    ],
    tips: ['文档与产品入口同步', 'E2E 覆盖主流程', 'Wails secret 仍需手工验收'],
    demo: {
      title: '截图演示：回归矩阵',
      caption: '产品说明书会告诉测试者从哪里验证，不再只靠口头清单。',
      windowTitle: '发布验证',
      panels: [
        { label: '自动化', value: 'type-check + Vitest + E2E', tone: 'primary' },
        { label: '手工', value: 'Wails / provider / 暗色模式', tone: 'soft' },
        { label: '文档', value: '回归清单 + 发布说明', tone: 'plain' },
      ],
      callouts: ['测试入口固定', '报告产物不提交', '真实 provider 单独验收'],
    },
  },
]

function closeOverflow() {
  overflowOpen.value = false
}

onMounted(() => document.addEventListener('click', closeOverflow))
onUnmounted(() => document.removeEventListener('click', closeOverflow))
</script>

<style scoped lang="scss">
.workspace-topbar {
  height: 48px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 96%, transparent),
    color-mix(
      in srgb,
      var(--editor-layer-soft, var(--editor-bg-surface, #f5f7fa)) 92%,
      var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 8%
    )
  );
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.workspace-topbar__left {
  min-width: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  background: var(--editor-bg-elevated, #e8edf5);
  color: var(--editor-text-secondary, #334155);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.topbar-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 88%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 88%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
  white-space: nowrap;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: var(--editor-bg-elevated, var(--editor-bg-base, #ffffff));
    border-color: var(--editor-accent-soft-border, #93c5fd);
    color: var(--editor-text-primary, #0f172a);
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.workspace-topbar__center {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
}

.chapter-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--editor-text-primary, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 360px;
}

.status-text {
  font-size: 11px;
  color: var(--editor-text-ghost, #94a3b8);
  white-space: nowrap;
  flex-shrink: 0;
}

.tool-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--editor-bg-elevated, #eef2f7);
  color: var(--editor-text-secondary, #475569);
  font-size: 11px;
  font-weight: 600;
}

.workspace-help-docs {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;
  height: min(78vh, 860px);
  color: var(--editor-text-primary, #0f172a);
}

.workspace-help-docs__nav {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--editor-bg-base, #ffffff) 96%, transparent), color-mix(in srgb, var(--editor-bg-elevated, #eef2f7) 68%, transparent));
  border-right: 1px solid var(--editor-border, #e2e8f0);

  .workspace-help-docs__nav-title {
    margin-bottom: 4px;
    color: var(--editor-text-ghost, #64748b);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  a {
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid transparent;
    color: var(--editor-text-secondary, #475569);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;
    line-height: 1.35;
    background: transparent;
    transition:
      background 120ms ease,
      color 120ms ease,
      border-color 120ms ease,
      transform 120ms ease;

    &:hover {
      background: color-mix(in srgb, var(--editor-accent-soft, #dbeafe) 24%, transparent);
      border-color: color-mix(in srgb, var(--editor-accent-soft-border, #93c5fd) 38%, transparent);
      color: var(--editor-text-primary, #0f172a);
      transform: translateX(2px);
    }

    span {
      color: var(--editor-text-ghost, #64748b);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
  }
}

.workspace-help-docs__content {
  min-width: 0;
  overflow: auto;
  padding: 4px 6px 18px 0;
  display: grid;
  gap: 22px;
}

.workspace-help-docs__hero {
  display: grid;
  gap: 8px;
  padding: 20px 22px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 84%, transparent);
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--editor-accent-soft, #dbeafe) 34%, transparent), transparent 52%),
    linear-gradient(180deg, color-mix(in srgb, var(--editor-bg-base, #ffffff) 98%, transparent), color-mix(in srgb, var(--editor-bg-elevated, #eef2f7) 78%, transparent));
  box-shadow: 0 16px 34px color-mix(in srgb, #0f172a 8%, transparent);

  p {
    margin: 0;
    color: var(--editor-accent-strong, #1d4ed8);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    color: var(--editor-text-primary, #0f172a);
    font-size: 30px;
    line-height: 1.15;
  }
}

.workspace-help-docs__hero-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: 0 12px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--editor-bg-elevated, #eef2f7) 74%, transparent);
    color: var(--editor-text-secondary, #475569);
    font-size: 12px;
    font-weight: 700;
  }
}

.workspace-help-docs__section {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  gap: 18px;
  padding: 22px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  border-radius: 20px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--editor-bg-base, #ffffff) 98%, transparent), color-mix(in srgb, var(--editor-bg-elevated, #eef2f7) 84%, transparent));
  box-shadow: 0 12px 28px color-mix(in srgb, #0f172a 5%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 70%, transparent);

  &:last-child {
    border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 72%, transparent);
  }

  .workspace-help-docs__section-copy {
    display: grid;
    gap: 12px;
    align-content: start;
  }

  h3 {
    margin: 0;
    color: var(--editor-text-primary, #0f172a);
    font-size: 20px;
    line-height: 1.35;
  }

  p {
    margin: 0;
    color: var(--editor-text-secondary, #475569);
    font-size: 13px;
    line-height: 1.7;
  }

  ol {
    display: grid;
    gap: 8px;
    margin: 0;
    padding-left: 20px;
  }

  ol li {
    color: var(--editor-text-secondary, #475569);
    font-size: 13px;
    line-height: 1.65;
  }
}

.workspace-help-docs__eyebrow {
  color: var(--editor-accent-strong, #1d4ed8) !important;
  font-size: 11px !important;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.workspace-help-docs__tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--editor-accent-soft, #dbeafe) 22%, transparent);
    color: var(--editor-accent-strong, #1d4ed8);
    font-size: 11px;
    font-weight: 700;
  }
}

.workspace-help-docs__figure {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 82%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, var(--editor-bg-base, #ffffff) 98%, transparent), color-mix(in srgb, var(--editor-bg-elevated, #eef2f7) 86%, transparent));
}

.workspace-help-docs__figure figcaption {
  display: grid;
  gap: 4px;

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 13px;
    font-weight: 800;
  }

  span {
    color: var(--editor-text-ghost, #64748b);
    font-size: 12px;
    line-height: 1.5;
  }
}

.workspace-help-docs__mock-window {
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 84%, transparent);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--editor-bg-base, #ffffff) 98%, transparent), color-mix(in srgb, var(--editor-bg-elevated, #eef2f7) 92%, transparent));
  box-shadow: inset 0 1px 0 color-mix(in srgb, #ffffff 74%, transparent);
}

.workspace-help-docs__mock-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 78%, transparent);
  background: color-mix(in srgb, var(--editor-bg-elevated, #eef2f7) 72%, transparent);

  i {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--editor-accent-soft, #dbeafe) 40%, #94a3b8);
  }

  span {
    margin-left: 4px;
    color: var(--editor-text-secondary, #475569);
    font-size: 11px;
    font-weight: 700;
  }
}

.workspace-help-docs__mock-body {
  display: grid;
  gap: 10px;
  padding: 12px;
}

.workspace-help-docs__mock-panel {
  display: grid;
  gap: 5px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 80%, transparent);
  background: color-mix(in srgb, var(--editor-bg-base, #ffffff) 92%, transparent);

  small {
    color: var(--editor-text-ghost, #64748b);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 13px;
    font-weight: 700;
  }

  &.is-primary {
    border-color: color-mix(in srgb, var(--editor-accent-soft-border, #93c5fd) 54%, transparent);
    background: color-mix(in srgb, var(--editor-accent-soft, #dbeafe) 30%, transparent);
  }

  &.is-soft {
    background: color-mix(in srgb, var(--editor-bg-elevated, #eef2f7) 72%, transparent);
  }

  &.is-accent {
    border-color: color-mix(in srgb, var(--color-warning-300, #f59e0b) 42%, transparent);
    background: color-mix(in srgb, var(--color-warning-100, #fef3c7) 52%, transparent);
  }
}

.workspace-help-docs__callouts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 76%, transparent);
    background: var(--editor-bg-base, #ffffff);
    color: var(--editor-text-secondary, #475569);
    font-size: 11px;
    font-weight: 700;
  }
}

@media (max-width: 960px) {
  .workspace-help-docs {
    grid-template-columns: 1fr;
    height: min(78vh, 820px);
  }

  .workspace-help-docs__nav {
    display: flex;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid var(--editor-border, #e2e8f0);

    .workspace-help-docs__nav-title {
      display: none;
    }

    a {
      min-width: 150px;
    }
  }

  .workspace-help-docs__section {
    grid-template-columns: 1fr;
  }

  .workspace-help-docs__hero-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.workspace-topbar__right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.topbar-quick-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 88%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--editor-layer-glass, var(--editor-bg-base, #ffffff)) 90%, transparent);
}

.topbar-icon-btn {
  display: inline-flex;
  align-items: center;
  height: 30px;
  width: 30px;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--editor-text-secondary, #475569);
  cursor: pointer;
  transition:
    background 120ms ease,
    color 120ms ease;

  &:hover {
    background: var(--editor-bg-elevated, #eef2f7);
    color: var(--editor-text-primary, #0f172a);
  }
}

.topbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 88%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--editor-layer-panel, var(--editor-bg-base, #ffffff)) 94%, transparent);
  color: var(--editor-text-secondary, #475569);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  white-space: nowrap;

  &:hover {
    background: var(--editor-bg-elevated, var(--editor-bg-base, #ffffff));
    border-color: var(--editor-accent-soft-border, #93c5fd);
    color: var(--editor-text-primary, #0f172a);
  }

  &--primary {
    background: var(--editor-accent, #2563eb);
    border-color: var(--editor-accent, #2563eb);
    color: var(--editor-text-inverse, #ffffff);

    &:hover {
      background: var(--editor-accent-hover, #1d4ed8);
      border-color: var(--editor-accent-hover, #1d4ed8);
      color: var(--editor-text-inverse, #ffffff);
    }
  }

  &--icon {
    padding: 0 8px;
  }

  &--compact {
    width: 32px;
    justify-content: center;
    padding: 0;
  }
}

.topbar-divider {
  width: 1px;
  height: 20px;
  background: color-mix(in srgb, var(--editor-border, #cbd5e1) 88%, transparent);
  margin: 0 2px;
}

.topbar-overflow {
  position: relative;
}

.topbar-overflow__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--editor-layer-panel, var(--editor-bg-base, #ffffff));
  border: 1px solid color-mix(in srgb, var(--editor-border, #cbd5e1) 88%, transparent);
  border-radius: 10px;
  box-shadow: var(--editor-shadow-lg, 0 16px 32px rgba(15, 23, 42, 0.1));
  padding: 6px;
  z-index: 100;
  min-width: 160px;
}

.topbar-overflow__item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-primary, #0f172a);
  }
}

.topbar-overflow__divider {
  height: 1px;
  background: var(--editor-border, #e2e8f0);
  margin: 4px 8px;
}

.topbar-overflow__label {
  padding: 4px 10px 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--editor-text-ghost, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

</style>

<style lang="scss">
.workspace-settings-dialog {
  width: min(920px, calc(100vw - 48px));
  height: min(760px, calc(100vh - 72px));
  max-width: min(920px, calc(100vw - 48px)) !important;
  max-height: min(760px, calc(100vh - 72px));
  margin: 0;
  border-radius: 28px;
}

.workspace-settings-dialog > .flex-1 {
  padding: 0;
}
</style>
