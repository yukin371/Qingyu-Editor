<script setup lang="ts">
/**
 * Calendar 组件
 *
 * 日历组件，支持单日期选择和范围选择
 */

import { computed, ref, watch } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import {
  generateMonthView,
  cloneDate,
  stringToDate,
  compareDates,
  getWeekdayText,
  getPreviousMonth,
  getNextMonth,
  getPreviousYear,
  getNextYear,
} from './utils'
import type { CalendarProps, CalendarEmits, DateCell, WeekDay } from './types'
import { zhCN, locales } from './types'

// 使用 CVA 定义 Calendar 变体
const calendarVariants = cva(
  'bg-white border border-slate-200 rounded-lg overflow-hidden',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// 日期单元格变体
const dateCellVariants = cva(
  'relative flex items-center justify-center rounded-md transition-all duration-200 cursor-pointer',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
      },
      isSelected: {
        true: 'bg-primary-500 text-white hover:bg-primary-600',
        false: '',
      },
      isCurrentMonth: {
        true: 'text-slate-900',
        false: 'text-slate-400',
      },
      isToday: {
        true: '',
        false: '',
      },
      isDisabled: {
        true: 'cursor-not-allowed opacity-40',
        false: 'hover:bg-slate-100',
      },
      inRange: {
        true: 'bg-primary-100',
        false: '',
      },
      isRangeStart: {
        true: 'rounded-l-md rounded-r-none',
        false: '',
      },
      isRangeEnd: {
        true: 'rounded-r-md rounded-l-none',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      isSelected: false,
      isCurrentMonth: true,
      isToday: false,
      isDisabled: false,
      inRange: false,
      isRangeStart: false,
      isRangeEnd: false,
    },
  }
)

// 组件 Props
const props = withDefaults(defineProps<CalendarProps>(), {
  range: false,
  size: 'md',
  firstDayOfWeek: 0,
  showWeekNumbers: false,
  disabled: false,
  format: 'YYYY-MM-DD',
  locale: 'zh-CN',
  showToday: true,
  showMonthSwitcher: true,
})

// 组件 Emits
const emit = defineEmits<CalendarEmits>()

// 当前显示的年月
const currentDate = ref(new Date())

// 选中的日期
const selectedDate = ref<Date | null>(null)

// 范围选择的开始日期
const rangeStartDate = ref<Date | null>(null)

// 范围选择的结束日期
const rangeEndDate = ref<Date | null>(null)

// 语言包
const currentLocale = computed(() => {
  return locales[props.locale] || zhCN
})

// 初始化选中日期
watch(
  () => props.modelValue,
  (newValue) => {
    if (props.range) {
      if (Array.isArray(newValue) && newValue.length === 2) {
        rangeStartDate.value = newValue[0] ? stringToDate(newValue[0]) : null
        rangeEndDate.value = newValue[1] ? stringToDate(newValue[1]) : null
        // 更新当前显示的日期为开始日期
        if (rangeStartDate.value) {
          currentDate.value = cloneDate(rangeStartDate.value)
        }
      } else {
        rangeStartDate.value = null
        rangeEndDate.value = null
      }
      selectedDate.value = null
    } else {
      if (newValue && !Array.isArray(newValue)) {
        selectedDate.value = stringToDate(newValue)
        // 更新当前显示的日期为选中的日期
        currentDate.value = cloneDate(selectedDate.value)
      } else {
        selectedDate.value = null
      }
      rangeStartDate.value = null
      rangeEndDate.value = null
    }
  },
  { immediate: true }
)

// 计算月视图数据
const monthView = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return generateMonthView(
    year,
    month,
    props.firstDayOfWeek as WeekDay,
    selectedDate.value,
    rangeStartDate.value,
    rangeEndDate.value,
    props.disabledDate,
    props.minDate,
    props.maxDate,
    props.showWeekNumbers
  )
})

// 计算星期标题
const weekdayLabels = computed(() => {
  const labels = []
  for (let i = 0; i < 7; i++) {
    const day = (props.firstDayOfWeek + i) % 7
    labels.push(getWeekdayText(day, currentLocale.value, true))
  }
  return labels
})

// 计算当前年月显示文本
const currentMonthYearText = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return `${year}年 ${month + 1}月`
})

// 处理日期点击
const handleDateClick = (cell: DateCell) => {
  if (cell.isDisabled || props.disabled) {
    return
  }

  const clickedDate = cloneDate(cell.date)

  if (props.range) {
    // 范围选择模式
    if (!rangeStartDate.value || (rangeStartDate.value && rangeEndDate.value)) {
      // 开始新的范围选择
      rangeStartDate.value = clickedDate
      rangeEndDate.value = null
      emit('update:modelValue', [clickedDate, null])
      emit('select', [clickedDate, null])
    } else {
      // 完成范围选择
      if (compareDates(clickedDate, rangeStartDate.value) < 0) {
        // 点击的日期早于开始日期，交换
        rangeEndDate.value = rangeStartDate.value
        rangeStartDate.value = clickedDate
      } else {
        rangeEndDate.value = clickedDate
      }
      emit('update:modelValue', [rangeStartDate.value!, rangeEndDate.value!])
      emit('select', [rangeStartDate.value!, rangeEndDate.value!])
    }
  } else {
    // 单日期选择模式
    selectedDate.value = clickedDate
    emit('update:modelValue', clickedDate)
    emit('select', clickedDate)
  }
}

// 处理上个月
const handlePreviousMonth = () => {
  currentDate.value = getPreviousMonth(currentDate.value)
  emit('month-change', currentDate.value)
}

// 处理下个月
const handleNextMonth = () => {
  currentDate.value = getNextMonth(currentDate.value)
  emit('month-change', currentDate.value)
}

// 处理上一年
const handlePreviousYear = () => {
  currentDate.value = getPreviousYear(currentDate.value)
  emit('year-change', currentDate.value)
}

// 处理下一年
const handleNextYear = () => {
  currentDate.value = getNextYear(currentDate.value)
  emit('year-change', currentDate.value)
}

// 处理今天按钮
const handleToday = () => {
  const today = new Date()
  currentDate.value = today
  if (!props.disabled) {
    if (props.range) {
      rangeStartDate.value = today
      rangeEndDate.value = null
      emit('update:modelValue', [today, null])
      emit('select', [today, null])
    } else {
      selectedDate.value = today
      emit('update:modelValue', today)
      emit('select', today)
    }
  }
}

// 处理面板变化
watch(currentDate, (newDate) => {
  emit('panel-change', newDate)
})

// 计算容器样式类名
const containerClasses = computed(() =>
  cn(
    calendarVariants({
      size: props.size,
    }),
    props.class
  )
)

// 暴露方法
defineExpose({
  // 跳转到指定日期
  goTo: (date: Date | string) => {
    currentDate.value = stringToDate(date)
  },
  // 获取当前选中的日期
  getSelectedDate: () => selectedDate.value,
  // 获取当前范围
  getRange: () => [rangeStartDate.value, rangeEndDate.value],
  // 清空选择
  clear: () => {
    selectedDate.value = null
    rangeStartDate.value = null
    rangeEndDate.value = null
    emit('update:modelValue', null)
  },
})
</script>

<template>
  <div :class="containerClasses">
    <!-- 头部：月份切换 -->
    <div v-if="showMonthSwitcher" class="flex items-center justify-between px-4 py-3 border-b border-slate-200">
      <div class="flex items-center gap-2">
        <!-- 上一年 -->
        <button
          type="button"
          class="p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="disabled"
          @click="handlePreviousYear"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <!-- 上个月 -->
        <button
          type="button"
          class="p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="disabled"
          @click="handlePreviousMonth"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- 当前年月 -->
      <div class="font-medium text-slate-900">
        {{ currentMonthYearText }}
      </div>

      <div class="flex items-center gap-2">
        <!-- 下个月 -->
        <button
          type="button"
          class="p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="disabled"
          @click="handleNextMonth"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <!-- 下一年 -->
        <button
          type="button"
          class="p-1 rounded hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="disabled"
          @click="handleNextYear"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 星期标题 -->
    <div class="grid grid-cols-7 border-b border-slate-200">
      <!-- 周数标题 -->
      <div
        v-if="showWeekNumbers"
        class="py-2 text-center text-xs font-medium text-slate-500 border-r border-slate-200"
      >
        周
      </div>
      <!-- 星期几 -->
      <div
        v-for="(weekday, index) in weekdayLabels"
        :key="index"
        class="py-2 text-center text-xs font-medium text-slate-500"
      >
        {{ weekday }}
      </div>
    </div>

    <!-- 日期网格 -->
    <div class="p-2">
      <div
        v-for="(week, weekIndex) in monthView.dates"
        :key="weekIndex"
        class="grid grid-cols-7 gap-1"
      >
        <!-- 周数 -->
        <div
          v-if="showWeekNumbers && monthView.weekNumbers"
          class="flex items-center justify-center text-xs text-slate-500 border-r border-slate-200 pr-2"
        >
          {{ monthView.weekNumbers[weekIndex] }}
        </div>
        <!-- 日期单元格 -->
        <div
          v-for="(cell, cellIndex) in week"
          :key="cellIndex"
          :class="
            dateCellVariants({
              size,
              isSelected: cell.isSelected,
              isCurrentMonth: cell.isCurrentMonth,
              isToday: cell.isToday,
              isDisabled: cell.isDisabled,
              inRange: cell.inRange,
              isRangeStart: cell.isRangeStart,
              isRangeEnd: cell.isRangeEnd,
            })
          "
          @click="handleDateClick(cell)"
        >
          {{ cell.date.getDate() }}
          <!-- 今天标记 -->
          <span
            v-if="cell.isToday && !cell.isSelected"
            class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"
          />
        </div>
      </div>
    </div>

    <!-- 底部：今天按钮 -->
    <div v-if="showToday" class="px-4 py-2 border-t border-slate-200">
      <button
        type="button"
        class="w-full px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="disabled"
        @click="handleToday"
      >
        {{ currentLocale.today }}
      </button>
    </div>
  </div>
</template>
