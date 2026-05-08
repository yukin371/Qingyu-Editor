<template>
  <div class="min-h-screen bg-gradient-to-br from-[var(--gradient-from)] via-white to-[var(--gradient-to)] py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] bg-clip-text text-transparent mb-4">
          QyBadge Component Demo
        </h1>
        <p class="text-slate-600 text-lg">CVA 重构后的徽章组件展示</p>
        <div class="mt-4 flex justify-center">
          <ThemeSwitcher />
        </div>
      </div>

      <!-- QyBadge Demo -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyBadge</h2>
        <QyCard>
          <div class="space-y-8">
            <!-- Number Badges -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Number Badges</h3>
              <div class="flex flex-wrap items-center gap-6">
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="5" color="primary" />
                  <span class="text-sm text-slate-600">Primary (5)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="10" color="info" />
                  <span class="text-sm text-slate-600">Info (10)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="3" color="success" />
                  <span class="text-sm text-slate-600">Success (3)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="150" :max="99" color="danger" />
                  <span class="text-sm text-slate-600">Danger (150+)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="7" color="warning" />
                  <span class="text-sm text-slate-600">Warning (7)</span>
                </div>
              </div>
            </div>

            <!-- Number Badge Sizes -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Number Badge Sizes</h3>
              <div class="flex flex-wrap items-center gap-6">
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="5" color="primary" size="sm" />
                  <span class="text-sm text-slate-600">Small</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="10" color="primary" size="md" />
                  <span class="text-sm text-slate-600">Medium</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="99" color="primary" size="lg" />
                  <span class="text-sm text-slate-600">Large</span>
                </div>
              </div>
            </div>

            <!-- Text Badges -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Text Badges</h3>
              <div class="flex flex-wrap gap-4">
                <QyBadge type="text" value="Active" color="success" />
                <QyBadge type="text" value="Pending" color="warning" />
                <QyBadge type="text" value="Inactive" color="danger" />
                <QyBadge type="text" value="Processing" color="info" />
                <QyBadge type="text" value="New" color="primary" />
                <QyBadge type="text" color="primary">
                  Custom Slot
                </QyBadge>
              </div>
            </div>

            <!-- Text Badge Sizes -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Text Badge Sizes</h3>
              <div class="flex flex-wrap items-center gap-4">
                <QyBadge type="text" value="Small" color="primary" size="sm" />
                <QyBadge type="text" value="Medium" color="primary" size="md" />
                <QyBadge type="text" value="Large" color="primary" size="lg" />
              </div>
            </div>

            <!-- Dot Badges -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Dot Badges</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-slate-600 mb-2">Different Sizes:</p>
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="primary" size="sm" />
                      <span class="text-sm text-slate-600">Small</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="info" size="md" />
                      <span class="text-sm text-slate-600">Medium</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="success" size="lg" />
                      <span class="text-sm text-slate-600">Large</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p class="text-sm text-slate-600 mb-2">Different Colors:</p>
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="success" />
                      <span class="text-sm text-slate-600">Online</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="warning" />
                      <span class="text-sm text-slate-600">Away</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="danger" />
                      <span class="text-sm text-slate-600">Offline</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="info" />
                      <span class="text-sm text-slate-600">Busy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- isDot Prop Demo -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">isDot Prop (Alternative to type="dot")</h3>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <QyBadge :is-dot="true" color="success" />
                  <span class="text-sm text-slate-600">Online (isDot)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge :is-dot="true" color="danger" size="lg" />
                  <span class="text-sm text-slate-600">Offline (isDot, large)</span>
                </div>
              </div>
            </div>

            <!-- showZero Prop Demo -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">showZero Prop</h3>
              <div class="flex flex-wrap items-center gap-6">
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="0" :show-zero="true" color="primary" />
                  <span class="text-sm text-slate-600">showZero=true (显示0)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="0" :show-zero="false" color="primary" />
                  <span class="text-sm text-slate-600">showZero=false (不显示)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="5" :show-zero="false" color="primary" />
                  <span class="text-sm text-slate-600">showZero=false, value=5 (正常显示)</span>
                </div>
              </div>
            </div>

            <!-- Badge on Button -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Badge on Button</h3>
              <div class="flex flex-wrap gap-4">
                <div class="relative inline-block">
                  <QyButton>Notifications</QyButton>
                  <div class="absolute -top-2 -right-2">
                    <QyBadge type="number" :value="5" color="danger" />
                  </div>
                </div>
                <div class="relative inline-block">
                  <QyButton variant="secondary">Messages</QyButton>
                  <div class="absolute -top-2 -right-2">
                    <QyBadge type="number" :value="99" :max="99" color="primary" />
                  </div>
                </div>
                <div class="relative inline-block">
                  <QyButton variant="ghost">Updates</QyButton>
                  <div class="absolute -top-1 -right-1">
                    <QyBadge type="dot" color="success" size="sm" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Max Value Demo -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Max Value Demo</h3>
              <div class="flex flex-wrap items-center gap-6">
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="50" :max="99" color="primary" />
                  <span class="text-sm text-slate-600">value=50, max=99</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="100" :max="99" color="primary" />
                  <span class="text-sm text-slate-600">value=100, max=99 (显示99+)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="number" :value="999" :max="999" color="primary" />
                  <span class="text-sm text-slate-600">value=999, max=999 (显示999+)</span>
                </div>
              </div>
            </div>

            <!-- All Colors -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">All Color Variants</h3>
              <div class="space-y-4">
                <div class="flex flex-wrap gap-4">
                  <QyBadge type="number" :value="5" color="primary" />
                  <QyBadge type="number" :value="5" color="success" />
                  <QyBadge type="number" :value="5" color="warning" />
                  <QyBadge type="number" :value="5" color="danger" />
                  <QyBadge type="number" :value="5" color="info" />
                </div>
                <div class="flex flex-wrap gap-4">
                  <QyBadge type="text" value="Primary" color="primary" />
                  <QyBadge type="text" value="Success" color="success" />
                  <QyBadge type="text" value="Warning" color="warning" />
                  <QyBadge type="text" value="Danger" color="danger" />
                  <QyBadge type="text" value="Info" color="info" />
                </div>
                <div class="flex flex-wrap items-center gap-4">
                  <div class="flex items-center gap-2">
                    <QyBadge type="dot" color="primary" />
                    <span class="text-sm text-slate-600">Primary</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <QyBadge type="dot" color="success" />
                    <span class="text-sm text-slate-600">Success</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <QyBadge type="dot" color="warning" />
                    <span class="text-sm text-slate-600">Warning</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <QyBadge type="dot" color="danger" />
                    <span class="text-sm text-slate-600">Danger</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <QyBadge type="dot" color="info" />
                    <span class="text-sm text-slate-600">Info</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Interactive Demo -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Interactive Demo</h3>
              <QyCard class="bg-slate-50">
                <div class="space-y-4">
                  <div class="flex items-center gap-4">
                    <label class="text-sm font-medium text-slate-700 w-24">Value:</label>
                    <input
                      v-model.number="interactiveValue"
                      type="number"
                      class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <QyBadge type="number" :value="interactiveValue" color="primary" />
                  </div>
                  <div class="flex items-center gap-4">
                    <label class="text-sm font-medium text-slate-700 w-24">Max:</label>
                    <input
                      v-model.number="interactiveMax"
                      type="number"
                      class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span class="text-sm text-slate-500">当前显示: {{ displayValue }}</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <label class="text-sm font-medium text-slate-700 w-24">Color:</label>
                    <select
                      v-model="interactiveColor"
                      class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="primary">Primary</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="danger">Danger</option>
                      <option value="info">Info</option>
                    </select>
                    <QyBadge type="number" :value="interactiveValue" :max="interactiveMax" :color="interactiveColor" />
                  </div>
                  <div class="flex items-center gap-4">
                    <label class="text-sm font-medium text-slate-700 w-24">Size:</label>
                    <select
                      v-model="interactiveSize"
                      class="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                    </select>
                    <QyBadge type="number" :value="interactiveValue" :max="interactiveMax" :color="interactiveColor" :size="interactiveSize" />
                  </div>
                </div>
              </QyCard>
            </div>
          </div>
        </QyCard>
      </section>

      <!-- Footer -->
      <footer class="text-center text-slate-500 text-sm py-8 border-t border-slate-200">
        <p>QyBadge Component - CVA重构版本</p>
        <p class="mt-1">Built with Vue 3 + TypeScript + Tailwind CSS + CVA</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { QyBadge, QyButton, QyCard } from '@/design-system/components'
import ThemeSwitcher from '@/design-system/other/ThemeSwitcher.vue'

// Interactive demo state
const interactiveValue = ref(5)
const interactiveMax = ref(99)
const interactiveColor = ref<'primary' | 'success' | 'warning' | 'danger' | 'info'>('primary')
const interactiveSize = ref<'sm' | 'md' | 'lg'>('md')

// Computed display value
const displayValue = computed(() => {
  if (interactiveValue.value > interactiveMax.value) {
    return `${interactiveMax.value}+`
  }
  return interactiveValue.value.toString()
})
</script>
