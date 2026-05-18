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
          <a
            v-for="section in helpSections"
            :key="section.id"
            :href="`#${section.id}`"
          >
            {{ section.title }}
          </a>
        </aside>
        <div class="workspace-help-docs__content">
          <section
            v-for="section in helpSections"
            :id="section.id"
            :key="section.id"
            class="workspace-help-docs__section"
          >
            <p class="workspace-help-docs__eyebrow">{{ section.kicker }}</p>
            <h3>{{ section.title }}</h3>
            <p>{{ section.summary }}</p>
            <ul>
              <li v-for="item in section.items" :key="item">{{ item }}</li>
            </ul>
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
const helpSections = [
  {
    id: 'help-flow',
    kicker: '用户指南',
    title: '推荐创作流程',
    summary: '先确定作品方向和基础骨架，再围绕当前场景写正文，最后用 AI 和工具回审。',
    items: [
      '新项目默认生成第一卷和第一章，创建后进入章节标题行。',
      '大纲负责规划，当前场景负责当前剧情段承诺，章节负责正文保存。',
      '结构舞台是默认聚合入口，右侧设定和下侧场景舞台服务日常写作。',
    ],
  },
  {
    id: 'help-assets',
    kicker: '资产闭环',
    title: '设定、资产与 @ 引用',
    summary: '全局资产由作者创建和维护，本章/本卷资产由系统从正文引用自动检出。',
    items: [
      '正文中输入 @名称 可创建或引用角色、地点、物件、组织、概念。',
      '右侧设定支持本章、本卷、全局视图；资产总览提供完整增删改查。',
      '删除正文中的 @资产 只解除局部引用，不会删除全局资产。',
    ],
  },
  {
    id: 'help-ai',
    kicker: 'AI 协作',
    title: 'AI Provider 与正文 diff',
    summary: 'AI 只辅助写作、审查和整理，正文修改必须进入可审阅 diff。',
    items: [
      '设置页支持系统服务和用户 API，用户 API 可保存多个 provider 配置槽。',
      'API Key 不回显，导出配置不包含明文密钥；桌面端通过 secret store 保存。',
      '改写、扩写、续写会挂正文 inline diff；总结、审校、整理只输出建议。',
    ],
  },
  {
    id: 'help-tools',
    kicker: '工具分层',
    title: '基础工具与高级工具',
    summary: '基础工具保持简单，高级工具只在复杂作品需要时介入。',
    items: [
      '结构舞台、当前场景、设定是日常工具，建议优先使用。',
      '关系图谱、时间线、故事分支适合复杂人物关系、多线叙事和互动作品。',
      '长篇作品通过搜索、定位、窗口化和范围地图管理，不默认铺开全量节点。',
    ],
  },
  {
    id: 'help-dev',
    kicker: '开发者',
    title: '开发与回归入口',
    summary: '完整文档位于 Qingyu-Editor/docs，发布前以 v0.1.0-beta 回归清单为准。',
    items: [
      '用户指南：docs/user-guide.md；开发者指南：docs/developer-guide.md。',
      '回归清单：docs/ux-regression-checklist.md 与 docs/regression-v0.1.0-beta.md。',
      '发布说明：docs/release-notes-v0.1.0-beta.md。',
    ],
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
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 18px;
  height: min(72vh, 760px);
  color: var(--editor-text-primary, #0f172a);
}

.workspace-help-docs__nav {
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 12px;
  border-right: 1px solid var(--editor-border, #e2e8f0);

  a {
    padding: 9px 10px;
    border-radius: 10px;
    color: var(--editor-text-secondary, #475569);
    font-size: 12px;
    font-weight: 700;
    text-decoration: none;

    &:hover {
      background: var(--editor-bg-elevated, #eef2f7);
      color: var(--editor-text-primary, #0f172a);
    }
  }
}

.workspace-help-docs__content {
  min-width: 0;
  overflow: auto;
  padding: 4px 8px 18px 0;
}

.workspace-help-docs__section {
  padding: 18px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--editor-border, #e2e8f0) 70%, transparent);

  &:first-child {
    padding-top: 0;
  }

  h3 {
    margin: 4px 0 8px;
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

  ul {
    display: grid;
    gap: 8px;
    margin: 12px 0 0;
    padding-left: 18px;
  }

  li {
    color: var(--editor-text-secondary, #475569);
    font-size: 13px;
    line-height: 1.65;
  }
}

.workspace-help-docs__eyebrow {
  color: var(--editor-accent-strong, #1d4ed8) !important;
  font-size: 11px !important;
  font-weight: 800;
  letter-spacing: 0.08em;
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
