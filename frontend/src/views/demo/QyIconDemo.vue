<template>
  <div class="min-h-screen bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] dark:from-gray-900 dark:to-gray-800 p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        QyIcon Component Demo
      </h1>

      <!-- Size Variants -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Size Variants</h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center gap-6">
          <div class="text-center">
            <QyIcon name="Search" :size="12" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">12px</p>
          </div>
          <div class="text-center">
            <QyIcon name="Search" :size="16" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">16px</p>
          </div>
          <div class="text-center">
            <QyIcon name="Search" :size="20" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">20px</p>
          </div>
          <div class="text-center">
            <QyIcon name="Search" :size="24" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">24px</p>
          </div>
          <div class="text-center">
            <QyIcon name="Search" :size="32" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">32px</p>
          </div>
          <div class="text-center">
            <QyIcon name="Search" :size="48" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">48px</p>
          </div>
        </div>
      </section>

      <!-- Color Variants -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Color Variants</h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center gap-6">
          <div class="text-center">
            <QyIcon name="Star" :size="32" color="currentColor" class="text-gray-600" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Current</p>
          </div>
          <div class="text-center">
            <QyIcon name="Star" :size="32" color="rgb(8 145 178)" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Primary</p>
          </div>
          <div class="text-center">
            <QyIcon name="Star" :size="32" color="rgb(22 163 74)" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Success</p>
          </div>
          <div class="text-center">
            <QyIcon name="Star" :size="32" color="rgb(234 179 8)" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Warning</p>
          </div>
          <div class="text-center">
            <QyIcon name="Star" :size="32" color="rgb(220 38 38)" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Danger</p>
          </div>
          <div class="text-center">
            <QyIcon name="Star" :size="32" color="#FFD700" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Gold</p>
          </div>
        </div>
      </section>

      <!-- Navigation Icons -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Navigation Icons</h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 grid grid-cols-8 gap-4">
          <div v-for="icon in navigationIcons" :key="icon" class="text-center">
            <QyIcon :name="icon" :size="24" class="mx-auto mb-2" />
            <p class="text-xs text-gray-600 dark:text-gray-400">{{ icon }}</p>
          </div>
        </div>
      </section>

      <!-- Action Icons -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Action Icons</h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 grid grid-cols-9 gap-4">
          <div v-for="icon in actionIcons" :key="icon" class="text-center">
            <QyIcon :name="icon" :size="24" class="mx-auto mb-2" />
            <p class="text-xs text-gray-600 dark:text-gray-400">{{ icon }}</p>
          </div>
        </div>
      </section>

      <!-- Status Icons -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Status Icons</h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 grid grid-cols-8 gap-4">
          <div v-for="icon in statusIcons" :key="icon" class="text-center">
            <QyIcon :name="icon" :size="24" class="mx-auto mb-2" />
            <p class="text-xs text-gray-600 dark:text-gray-400">{{ icon }}</p>
          </div>
        </div>
      </section>

      <!-- Rotation -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Rotation</h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center gap-6">
          <div class="text-center">
            <QyIcon name="Refresh" :size="32" :rotate="0" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">0°</p>
          </div>
          <div class="text-center">
            <QyIcon name="Refresh" :size="32" :rotate="90" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">90°</p>
          </div>
          <div class="text-center">
            <QyIcon name="Refresh" :size="32" :rotate="180" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">180°</p>
          </div>
          <div class="text-center">
            <QyIcon name="Refresh" :size="32" :rotate="270" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">270°</p>
          </div>
        </div>
      </section>

      <!-- Flip -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Flip Transformations</h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center gap-6">
          <div class="text-center">
            <QyIcon name="ArrowRight" :size="32" flip="none" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">None</p>
          </div>
          <div class="text-center">
            <QyIcon name="ArrowRight" :size="32" flip="horizontal" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Horizontal</p>
          </div>
          <div class="text-center">
            <QyIcon name="ArrowRight" :size="32" flip="vertical" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Vertical</p>
          </div>
          <div class="text-center">
            <QyIcon name="ArrowRight" :size="32" flip="both" />
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Both</p>
          </div>
        </div>
      </section>

      <!-- Usage Examples -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Usage Examples</h2>
        
        <!-- Search Input -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Search Input</h3>
          <div class="relative max-w-md">
            <QyIcon 
              name="Search" 
              :size="20" 
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input 
              type="text" 
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
              placeholder="Search..."
            />
          </div>
        </div>

        <!-- Button with Icon -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Button with Icon</h3>
          <div class="flex gap-3">
            <button class="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors">
              <QyIcon name="Plus" :size="16" />
              <span>Add New</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <QyIcon name="Edit" :size="16" />
              <span>Edit</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <QyIcon name="Delete" :size="16" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <!-- Status Indicators -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Status Indicators</h3>
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <QyIcon name="CircleCheck" :size="20" color="rgb(22 163 74)" />
              <span class="text-gray-700 dark:text-gray-300">Success</span>
            </div>
            <div class="flex items-center gap-2">
              <QyIcon name="Warning" :size="20" color="rgb(234 179 8)" />
              <span class="text-gray-700 dark:text-gray-300">Warning</span>
            </div>
            <div class="flex items-center gap-2">
              <QyIcon name="CircleClose" :size="20" color="rgb(220 38 38)" />
              <span class="text-gray-700 dark:text-gray-300">Error</span>
            </div>
            <div class="flex items-center gap-2">
              <QyIcon name="Loading" :size="20" class="animate-spin" />
              <span class="text-gray-700 dark:text-gray-300">Loading</span>
            </div>
          </div>
        </div>
      </section>

      <!-- All Icons Grid -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">All Available Icons (50+)</h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div class="grid grid-cols-10 gap-4">
            <div v-for="icon in allIcons" :key="icon" class="text-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <QyIcon :name="icon" :size="24" class="mx-auto mb-1" />
              <p class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ icon }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyIcon } from '@/design-system/components'

// Navigation icons
const navigationIcons = [
  'Search', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Back',
  'Grid', 'HomeFilled', 'Menu', 'Location'
]

// Action icons
const actionIcons = [
  'Plus', 'Minus', 'Close', 'Edit', 'Delete', 'Check', 'Refresh',
  'Share', 'Copy', 'Upload', 'Download', 'FullScreen', 'Sort'
]

// Status icons
const statusIcons = [
  'Star', 'StarFilled', 'Warning', 'WarningFilled', 'InfoFilled',
  'SuccessFilled', 'CircleCheck', 'CircleClose',
  'CircleCloseFilled', 'CircleCheckFilled', 'QuestionFilled'
]

// All available icons
const allIcons = [
  'Search', 'Close', 'Plus', 'Minus', 'Check', 'Edit', 'Delete',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Back',
  'User', 'UserFilled', 'Lock', 'Unlock', 'Setting', 'Refresh', 'MoreFilled', 'Filter',
  'Star', 'StarFilled', 'Download', 'Upload', 'Share',
  'Calendar', 'Clock', 'Timer', 'Folder', 'FolderOpened', 'Document', 'Files',
  'View', 'Picture',
  'ChatDotRound', 'ChatLineSquare',
  'Warning', 'WarningFilled', 'InfoFilled', 'SuccessFilled',
  'CircleCheck', 'CircleClose', 'QuestionFilled',
  'CircleCloseFilled', 'CircleCheckFilled',
  'Loading', 'Trophy',
  'Collection', 'Crown', 'Present', 'ShoppingCart',
  'DataAnalysis', 'TrendCharts', 'Bell', 'FullScreen', 'Sort', 'Memo', 'MagicStick',
  'Grid', 'HomeFilled', 'Menu', 'Location', 'Reading', 'Wallet',
  'EditPen', 'DocumentCopy'
]
</script>
