<template>
  <div
    ref="containerRef"
    :class="['qy-date-picker', `qy-date-picker--${size}`, { 'qy-date-picker--disabled': disabled }]"
  >
    <!-- Trigger -->
    <div class="qy-date-picker__trigger" @click="togglePicker">
      <span class="qy-date-picker__icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
      <input
        type="text"
        class="qy-date-picker__input"
        :value="displayValue"
        :placeholder="placeholder"
        readonly
        :disabled="disabled"
      />
    </div>

    <!-- Calendar Dropdown -->
    <Transition name="picker-fade">
      <div v-if="isOpen && !disabled" class="qy-date-picker__dropdown">
        <!-- Header -->
        <div class="qy-date-picker__header">
          <button class="qy-date-picker__nav" @click="prevMonth">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span class="qy-date-picker__title">{{ currentMonthYear }}</span>
          <button class="qy-date-picker__nav" @click="nextMonth">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <!-- Week days -->
        <div class="qy-date-picker__weekdays">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>

        <!-- Days grid -->
        <div class="qy-date-picker__days">
          <!-- Empty cells for offset -->
          <span v-for="n in firstDayOffset" :key="`empty-${n}`" class="qy-date-picker__day qy-date-picker__day--empty" />

          <!-- Day cells -->
          <button
            v-for="day in daysInMonth"
            :key="day"
            type="button"
            :class="[
              'qy-date-picker__day',
              { 'qy-date-picker__day--selected': isSelected(day) },
              { 'qy-date-picker__day--today': isToday(day) },
              { 'qy-date-picker__day--disabled': isDisabled(day) }
            ]"
            :disabled="isDisabled(day)"
            @click="selectDate(day)"
          >
            {{ day }}
          </button>
        </div>

        <!-- Time (for datetime type) -->
        <div v-if="type === 'datetime'" class="qy-date-picker__time">
          <input type="time" class="qy-date-picker__time-input" v-model="timeValue" />
        </div>

        <!-- Footer -->
        <div class="qy-date-picker__footer">
          <button class="qy-date-picker__btn qy-date-picker__btn--today" @click="goToToday">今天</button>
          <button class="qy-date-picker__btn qy-date-picker__btn--clear" @click="clearDate">清除</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { DatePickerProps } from './types'

const props = withDefaults(defineProps<DatePickerProps>(), {
  modelValue: null,
  type: 'date',
  size: 'default',
  disabled: false,
  placeholder: '选择日期',
  format: 'YYYY-MM-DD'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | Date | null]
  'change': [value: string | Date | null]
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement>()
const currentDate = ref(new Date())
const timeValue = ref('00:00')

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  const date = props.modelValue instanceof Date ? props.modelValue : new Date(props.modelValue)
  return formatDate(date)
})

const currentMonthYear = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年 ${month}月`
})

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
})

const firstDayOffset = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month, 1).getDay()
})

const togglePicker = () => {
  if (!isOpen.value && props.modelValue) {
    currentDate.value = props.modelValue instanceof Date ? props.modelValue : new Date(props.modelValue)
  }
  isOpen.value = !isOpen.value
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const isSelected = (day: number) => {
  if (!props.modelValue) return false
  const date = props.modelValue instanceof Date ? props.modelValue : new Date(props.modelValue)
  const target = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  return date.toDateString() === target.toDateString()
}

const isToday = (day: number) => {
  const today = new Date()
  const target = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  return today.toDateString() === target.toDateString()
}

const isDisabled = (day: number) => {
  const target = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  if (props.minDate && target < props.minDate) return true
  if (props.maxDate && target > props.maxDate) return true
  return false
}

const selectDate = (day: number) => {
  const selected = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  if (props.type === 'datetime') {
    const [hours, minutes] = timeValue.value.split(':')
    selected.setHours(parseInt(hours), parseInt(minutes))
  }
  emit('update:modelValue', selected)
  emit('change', selected)
  isOpen.value = false
}

const goToToday = () => {
  currentDate.value = new Date()
  selectDate(new Date().getDate())
}

const clearDate = () => {
  emit('update:modelValue', null)
  emit('change', null)
  isOpen.value = false
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Close on click outside
const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(isOpen, (val) => {
  if (val && props.modelValue) {
    currentDate.value = props.modelValue instanceof Date ? props.modelValue : new Date(props.modelValue)
  }
})

defineOptions({ name: 'QyDatePicker' })
</script>

<style scoped lang="scss">
// Apple style date picker
// Clean, minimal with smooth animations

.qy-date-picker {
  position: relative;
  display: inline-block;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    height: 40px;
    background: #fff;
    border: 1px solid #d1d1d6;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #007aff;
    }
  }

  &__icon {
    display: flex;
    color: #6e6e73;
  }

  &__input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    color: #1d1d1f;
    background: transparent;
    cursor: pointer;

    &::placeholder {
      color: #c7c7cc;
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 1000;
    width: 300px;
    background: #fff;
    border-radius: 16px;
    box-shadow:
      0 10px 40px rgba(0, 0, 0, 0.15),
      0 0 1px rgba(0, 0, 0, 0.1);
    padding: 16px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__nav {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #007aff;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: #f5f5f7;
    }
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
  }

  &__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 8px;

    span {
      text-align: center;
      font-size: 12px;
      font-weight: 500;
      color: #6e6e73;
      padding: 4px;
    }
  }

  &__days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  &__day {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: transparent;
    font-size: 14px;
    color: #1d1d1f;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled):not(.qy-date-picker__day--selected) {
      background: #f5f5f7;
    }

    &--selected {
      background: #007aff !important;
      color: #fff !important;
    }

    &--today {
      font-weight: 600;
      color: #007aff;
    }

    &--disabled {
      color: #c7c7cc;
      cursor: not-allowed;
    }

    &--empty {
      cursor: default;
    }
  }

  &__time {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e5e5e5;

    &-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d1d6;
      border-radius: 8px;
      font-size: 14px;
      outline: none;

      &:focus {
        border-color: #007aff;
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e5e5e5;
  }

  &__btn {
    padding: 6px 12px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;

    &--today {
      background: #007aff;
      color: #fff;

      &:hover {
        background: #0071e3;
      }
    }

    &--clear {
      background: #f5f5f7;
      color: #6e6e73;

      &:hover {
        background: #e8e8ed;
      }
    }
  }

  // Size variants
  &--small {
    .qy-date-picker__trigger {
      height: 32px;
      padding: 0 10px;
      border-radius: 8px;
    }

    .qy-date-picker__input {
      font-size: 13px;
    }
  }

  &--large {
    .qy-date-picker__trigger {
      height: 48px;
      padding: 0 18px;
      border-radius: 12px;
    }

    .qy-date-picker__input {
      font-size: 16px;
    }
  }

  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

// Transitions
.picker-fade-enter-active,
.picker-fade-leave-active {
  transition: all 0.2s ease;
}

.picker-fade-enter-from,
.picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
