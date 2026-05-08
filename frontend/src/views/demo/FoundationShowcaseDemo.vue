<template>
  <div class="foundation-demo">
    <header class="foundation-hero">
      <div class="hero-content">
        <p class="eyebrow">Tailwind v4 Foundation</p>
        <h1>Apple + Material 3 inspired controls <span>for Element Plus replacement</span></h1>
        <p class="hero-copy">
          精选 Button、Input、Card、Select 与 Dialog 组合，验证新语义令牌在真实业务场景中的表现。
          所有控制带动画、阴影与聚焦状态，保持 API 兼容且直接可替换 Element Plus。
        </p>
        <div class="hero-actions">
          <QyButton variant="primary" size="md" @click="scrollToSections">
            立即体验基础组件
            <QyIcon name="sparkles" size="sm" />
          </QyButton>
          <QyButton variant="ghost" size="md" @click="openDialog"> 预览 Dialog 交互 </QyButton>
        </div>
      </div>
      <div class="hero-tokens">
        <div v-for="token in foundationTokens" :key="token.label" class="token-chip">
          <span class="token-name">{{ token.label }}</span>
          <span class="token-detail">{{ token.detail }}</span>
        </div>
      </div>
    </header>

    <section class="foundation-grid" ref="sectionsRef">
      <QyCard class="foundation-card">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">Button System</p>
            <h2>Batch ready CTA styles</h2>
          </div>
          <QyBadge type="text" text="Tokens" color="primary" />
        </div>
        <div class="button-grid">
          <QyButton variant="primary">Primary</QyButton>
          <QyButton variant="secondary">Secondary</QyButton>
          <QyButton variant="gradient">Gradient</QyButton>
          <QyButton variant="danger">Danger</QyButton>
          <QyButton variant="ghost">Ghost</QyButton>
          <QyButton size="sm" variant="outline">Outline Sm</QyButton>
          <QyButton size="lg">Large Action</QyButton>
          <QyButton size="md" :loading="true">Saving</QyButton>
        </div>
      </QyCard>

      <QyCard class="foundation-card">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">Input States</p>
            <h2>Signal clarity with clean focus</h2>
          </div>
        </div>
        <div class="input-grid">
          <div class="input-stack">
            <label>Default</label>
            <QyInput v-model="textInput" placeholder="Enter project name" />
          </div>
          <div class="input-stack">
            <label>Success</label>
            <QyInput v-model="successInput" state="success" placeholder="Valid value" />
          </div>
          <div class="input-stack">
            <label>Error</label>
            <QyInput v-model="errorInput" state="error" placeholder="Missing required field" />
          </div>
          <div class="input-stack">
            <label>Disabled</label>
            <QyInput model-value="Disabled field" disabled />
          </div>
          <div class="input-stack">
            <label>Clearable</label>
            <QyInput v-model="clearableInput" clearable placeholder="Quick reset" />
          </div>
        </div>
      </QyCard>

      <QyCard class="foundation-card">
        <div class="panel-header">
          <p class="panel-eyebrow">Select & Dialog</p>
          <h2>Contextual choices</h2>
        </div>
        <div class="interactive-row">
          <div class="select-frame">
            <p class="select-label">Choose priority</p>
            <QySelect
              v-model="selectedPriority"
              :options="priorityOptions"
              placeholder="Choose an option"
              clearable
              :disabled="false"
            />
          </div>
          <div class="dialog-frame">
            <QyButton variant="outline" @click="openDialog">Open confirmation</QyButton>
          </div>
        </div>
      </QyCard>

      <QyCard class="foundation-card foundation-card--wide">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">Cards & Layout</p>
            <h2>Surface harmony</h2>
          </div>
          <QyBadge type="text" text="Glass" color="info" />
        </div>
        <div class="card-combo">
          <QyCard class="combo-card" variant="glass">
            <h3>Project overview</h3>
            <p>Surface with mild blur, subtle glow and responsive padding.</p>
            <div class="combo-meta">
              <span>42 tasks</span>
              <span>11 owners</span>
            </div>
            <div class="combo-actions">
              <QyButton size="sm" variant="secondary">View</QyButton>
              <QyButton size="sm" variant="primary">Assign</QyButton>
            </div>
          </QyCard>
          <QyCard class="combo-card" variant="outlined">
            <h3>Live metrics</h3>
            <div class="metric-row">
              <div>
                <p class="metric-label">Latency</p>
                <p class="metric-value">82 ms</p>
              </div>
              <div>
                <p class="metric-label">Success</p>
                <p class="metric-value">99.2%</p>
              </div>
            </div>
            <div class="status-row">
              <QyBadge type="text" text="stable" color="success" />
              <QyBadge type="text" text="sync" color="warning" />
            </div>
          </QyCard>
        </div>
      </QyCard>

      <QyCard class="foundation-card identity-card">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">Identity layer</p>
            <h2>Badge · Tag · Avatar · Book</h2>
          </div>
          <QyBadge type="text" text="Identity" color="primary" />
        </div>
        <div class="identity-grid">
          <div class="identity-meta">
            <p class="identity-eyebrow">System-ready tokens</p>
            <div class="identity-tags">
              <Tag v-for="tag in highlightTags" :key="tag" size="sm" variant="info" :round="true">
                {{ tag }}
              </Tag>
            </div>
            <div class="identity-avatars">
              <span class="identity-label">Team</span>
              <QyAvatar
                v-for="(avatar, index) in teamAvatars"
                :key="index"
                type="text"
                :text="avatar.text"
                size="sm"
                :class="index !== 0 ? 'ml-[-8px]' : ''"
              />
              <QyAvatar type="text" text="+5" size="sm" color="purple" class="ml-[-8px]" />
            </div>
          </div>
          <div class="identity-book">
            <QyBookCard
              :title="identityBook.title"
              :author="identityBook.author"
              :cover="identityBook.cover"
              :description="identityBook.description"
              :rating="identityBook.rating"
              :tags="identityBook.tags"
              :read-progress="identityBook.readProgress"
              status="reading"
            />
          </div>
          <div class="identity-cover">
            <QyBookCover :src="identityCover.src" :title="identityCover.title" size="lg" />
            <QyEmpty
              title="No backlog"
              description="Content surfaces stay calm even when lists are empty."
              icon-size="small"
              action-text="Create space"
              @action="openDialog"
            />
          </div>
        </div>
      </QyCard>
    </section>

    <QyDialog
      class="foundation-dialog"
      :visible="dialogVisible"
      title="Confirm vision"
      :center="true"
      @update:visible="dialogVisible = $event"
    >
      <p class="dialog-body">
        保持 Button/Input/Card/Select/Dialog 的交互统一后，就可以直接替代 Element Plus
        提供的控制集。 所有视觉 Token 均来自 Tailwind v4 的主题扩展。
      </p>
      <template #footer>
        <div class="dialog-actions">
          <QyButton variant="ghost" size="sm" @click="dialogVisible = false">Cancel</QyButton>
          <QyButton variant="primary" size="sm" @click="dialogVisible = false">Confirm</QyButton>
        </div>
      </template>
    </QyDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  QyAvatar,
  QyBadge,
  QyBookCard,
  QyBookCover,
  QyCard,
  QyEmpty,
  QyIcon,
  QyInput,
  QyDialog,
  QySelect,
  QyButton,
} from '@/design-system/components'
import { Tag } from '@/design-system/base'

const sectionsRef = ref<HTMLElement | null>(null)
const dialogVisible = ref(false)
const selectedPriority = ref('')
const textInput = ref('')
const successInput = ref('Ready')
const errorInput = ref('')
const clearableInput = ref('Quick value')

const priorityOptions = [
  { label: 'High (Apple accent)', value: 'high' },
  { label: 'Medium (Material 3)', value: 'medium' },
  { label: 'Low (Passive)', value: 'low' },
]

const foundationTokens = [
  { label: 'Primary glow', detail: 'linear gradient • 120°' },
  { label: 'Surface layer', detail: 'rgba(255,255,255,0.85)' },
  { label: 'Shadow', detail: '0 15px 30px rgba(15,23,42,0.25)' },
  { label: 'Radius', detail: '1.25rem / 1.5rem' },
]

const highlightTags = ['Identity', 'Glass layer', 'System ready']

const teamAvatars = [{ text: 'UI' }, { text: 'DS' }, { text: 'OPS' }, { text: 'QA' }]

const identityBook = {
  title: 'Modular UI Playbook',
  author: 'Qingyu Studio',
  cover:
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
  description: 'Practical examples that blend Apple restraint and Material momentum.',
  rating: 4.5,
  tags: ['Tokens', 'Polish', 'Ripple'],
  readProgress: 72,
  status: 'reading',
}

const identityCover = {
  src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80',
  title: 'Surface Grammar',
}

const scrollToSections = () => {
  sectionsRef.value?.scrollIntoView({ behavior: 'smooth' })
}

const openDialog = () => {
  dialogVisible.value = true
}
</script>

<style scoped lang="scss">
.foundation-demo {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.15), transparent 45%),
    radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.12), transparent 40%), #f8fafc;
  padding-bottom: 80px;
}

.foundation-hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  padding: 80px 48px 40px;
  max-width: 1200px;
  margin: 0 auto 24px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 32px;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(24px);
}

.hero-content h1 {
  font-size: clamp(2.75rem, 1.5vw + 2rem, 3.5rem);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.hero-content h1 span {
  display: block;
  font-size: 1.25rem;
  font-weight: 500;
  color: #0ea5e9;
}

.hero-copy {
  margin-top: 12px;
  color: #475569;
  font-size: 1rem;
  max-width: 560px;
}

.hero-actions {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.eyebrow {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 600;
  color: #38bdf8;
}

.hero-tokens {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
}

.token-chip {
  padding: 12px 16px;
  border-radius: 16px;
  background: #e0f2fe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #0369a1;
}

.token-detail {
  font-size: 0.75rem;
  font-weight: 400;
  color: #0f172a;
}

.foundation-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  padding: 0 24px;
}

.foundation-card {
  padding: 28px;
}

.foundation-card--wide {
  grid-column: 1 / -1;
}

.identity-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
}

.identity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.identity-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.identity-eyebrow {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #475569;
}

.identity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.identity-avatars {
  display: flex;
  align-items: center;
  gap: 6px;
}

.identity-label {
  font-size: 0.8rem;
  color: #475569;
  margin-right: 4px;
}

.identity-book {
  display: flex;
  justify-content: center;
}

.identity-cover {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.panel-eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  margin: 0;
  color: #64748b;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.button-grid,
.input-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.input-stack {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-stack label {
  font-size: 0.9rem;
  color: #475569;
  font-weight: 500;
}

.interactive-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.select-frame,
.dialog-frame {
  flex: 1;
}

.select-label {
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: #475569;
}

.card-combo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.combo-card {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.combo-card h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
}

.combo-meta,
.combo-actions,
.metric-row,
.status-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.metric-label {
  margin: 0;
  font-size: 0.85rem;
  color: #475569;
}

.metric-value {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0ea5e9;
}

.dialog-body {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.foundation-dialog {
  --dialog-width: 420px;
}

@media (max-width: 768px) {
  .foundation-demo {
    padding-bottom: 40px;
  }

  .foundation-grid {
    padding: 0 12px;
  }

  .foundation-card {
    padding: 20px;
  }
}
</style>
