<template>
  <div class="filter-container">
    <div class="filter-header">
      <div class="header-left">
        <QyIcon name="Filter"  />
        <span class="title">筛选检索</span>
      </div>
      <el-button link type="primary" class="reset-btn" :disabled="!hasActiveFilters" @click="handleReset">
        <QyIcon name="RefreshLeft"  /> 重置
      </el-button>
    </div>

    <!-- 已选条件展示 (仅当有筛选时显示) -->
    <transition name="el-fade-in-linear">
      <div v-if="hasActiveFilters" class="active-filters-section">
        <div class="active-tags-wrapper">
          <el-tag v-for="filter in activeFiltersList" :key="filter.key" closable round effect="light" class="active-tag"
            @close="handleRemoveFilter(filter.key)">
            {{ filter.label }}
          </el-tag>
        </div>
      </div>
    </transition>

    <div class="filter-scroll-area">
      <!-- 分类筛选 (多选 Grid 布局) -->
      <section v-if="showCategory" class="filter-group">
        <div class="group-title">分类</div>
        <div class="options-grid">
          <div v-for="cat in categories" :key="cat.id" class="grid-option"
            :class="{ active: selectedCategories.includes(cat.id) }" @click="toggleCategory(cat.id)">
            <span class="option-text">{{ cat.name }}</span>
            <!-- <span v-if="cat.count" class="option-count">{{ formatCount(cat.count) }}</span> -->
          </div>
        </div>
      </section>

      <!-- 状态筛选 (胶囊单选) -->
      <section v-if="showStatus" class="filter-group">
        <div class="group-title">连载状态</div>
        <div class="pills-wrapper">
          <div class="filter-pill" :class="{ active: !selectedStatus }" @click="selectedStatus = ''">全部</div>
          <div class="filter-pill" :class="{ active: selectedStatus === 'ongoing' }"
            @click="selectedStatus = 'ongoing'">连载中</div>
          <div class="filter-pill" :class="{ active: selectedStatus === 'completed' }"
            @click="selectedStatus = 'completed'">已完结</div>
        </div>
      </section>

      <!-- 字数筛选 (胶囊单选) -->
      <section v-if="showWordCount" class="filter-group">
        <div class="group-title">字数篇幅</div>
        <div class="pills-wrapper">
          <div v-for="opt in wordCountOptions" :key="opt.value" class="filter-pill"
            :class="{ active: selectedWordCount === opt.value }" @click="selectedWordCount = opt.value">
            {{ opt.label }}
          </div>
        </div>
      </section>

      <!-- 更新时间 (胶囊单选) -->
      <section v-if="showUpdateTime" class="filter-group">
        <div class="group-title">更新时间</div>
        <div class="pills-wrapper">
          <div v-for="opt in updateTimeOptions" :key="opt.value" class="filter-pill"
            :class="{ active: selectedUpdateTime === opt.value }" @click="selectedUpdateTime = opt.value">
            {{ opt.label }}
          </div>
        </div>
      </section>

      <!-- 评分 (胶囊单选) -->
      <section v-if="showRating" class="filter-group">
        <div class="group-title">评分筛选</div>
        <div class="pills-wrapper">
          <div v-for="opt in ratingOptions" :key="opt.value" class="filter-pill"
            :class="{ active: selectedRating === opt.value }" @click="selectedRating = opt.value">
            {{ opt.label }}
          </div>
        </div>
      </section>

      <!-- 标签筛选 (流式布局) -->
      <section v-if="showTags && tags.length > 0" class="filter-group">
        <div class="group-title">热门标签</div>
        <div class="tags-cloud">
          <span v-for="tag in tags" :key="tag.id" class="cloud-tag" :class="{ active: selectedTags.includes(tag.id) }"
            @click="handleTagChange(tag.id)">
            # {{ tag.name }}
          </span>
        </div>
      </section>
    </div>

    <!-- 底部应用按钮 -->
    <div class="filter-footer">
      <el-button type="primary" round block class="apply-btn" @click="handleApply">
        应用筛选结果
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { QyIcon } from '@/design-system/components'
// import type { Category, Tag } from '@/types/models'

// 类型定义占位
interface Category { id: string; name: string; count?: number }
interface Tag { id: string; name: string }

export interface FilterValues {
  categories?: string[]
  status?: string
  wordCount?: string
  updateTime?: string
  tags?: string[]
  rating?: string
}

interface Props {
  showCategory?: boolean
  showStatus?: boolean
  showWordCount?: boolean
  showUpdateTime?: boolean
  showTags?: boolean
  showRating?: boolean
  categories?: Category[]
  tags?: Tag[]
  initialFilters?: FilterValues
}

interface Emits {
  (e: 'change', filters: FilterValues): void
  (e: 'apply', filters: FilterValues): void
}

const props = withDefaults(defineProps<Props>(), {
  showCategory: true,
  showStatus: true,
  showWordCount: true,
  showUpdateTime: true,
  showTags: true,
  showRating: true,
  categories: () => [],
  tags: () => [],
  initialFilters: () => ({})
})

const emit = defineEmits<Emits>()

// --- 状态管理 ---
const selectedCategories = ref<string[]>(props.initialFilters.categories || [])
const selectedStatus = ref(props.initialFilters.status || '')
const selectedWordCount = ref(props.initialFilters.wordCount || '')
const selectedUpdateTime = ref(props.initialFilters.updateTime || '')
const selectedTags = ref<string[]>(props.initialFilters.tags || [])
const selectedRating = ref(props.initialFilters.rating || '')

// --- 选项配置 (静态数据移出模板，保持整洁) ---
const wordCountOptions = [
  { label: '不限', value: '' },
  { label: '< 30万', value: '0-300000' },
  { label: '30-50万', value: '300000-500000' },
  { label: '50-100万', value: '500000-1000000' },
  { label: '> 100万', value: '1000000-' },
]

const updateTimeOptions = [
  { label: '不限', value: '' },
  { label: '今天', value: '1' },
  { label: '3天内', value: '3' },
  { label: '7天内', value: '7' },
  { label: '30天内', value: '30' },
]

const ratingOptions = [
  { label: '不限', value: '' },
  { label: '9分+', value: '9' },
  { label: '8分+', value: '8' },
  { label: '7分+', value: '7' },
  { label: '6分+', value: '6' },
]

// --- 计算属性 ---

const currentFilters = computed((): FilterValues => ({
  categories: selectedCategories.value.length > 0 ? selectedCategories.value : undefined,
  status: selectedStatus.value || undefined,
  wordCount: selectedWordCount.value || undefined,
  updateTime: selectedUpdateTime.value || undefined,
  tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
  rating: selectedRating.value || undefined
}))

const hasActiveFilters = computed(() => {
  return Object.values(currentFilters.value).some(val => val !== undefined)
})

const activeFiltersList = computed(() => {
  const filters: { key: string; label: string }[] = []

  if (selectedCategories.value.length > 0) {
    selectedCategories.value.forEach(catId => {
      const cat = props.categories.find(c => c.id === catId)
      if (cat) filters.push({ key: `category_${catId}`, label: cat.name })
    })
  }

  if (selectedStatus.value) {
    filters.push({ key: 'status', label: selectedStatus.value === 'ongoing' ? '连载中' : '已完结' })
  }

  const wcOpt = wordCountOptions.find(o => o.value === selectedWordCount.value)
  if (wcOpt && wcOpt.value) filters.push({ key: 'wordCount', label: wcOpt.label })

  const utOpt = updateTimeOptions.find(o => o.value === selectedUpdateTime.value)
  if (utOpt && utOpt.value) filters.push({ key: 'updateTime', label: `${utOpt.label}更新` })

  const rtOpt = ratingOptions.find(o => o.value === selectedRating.value)
  if (rtOpt && rtOpt.value) filters.push({ key: 'rating', label: rtOpt.label })

  selectedTags.value.forEach(tagId => {
    const tag = props.tags.find(t => t.id === tagId)
    if (tag) filters.push({ key: `tag_${tagId}`, label: tag.name })
  })

  return filters
})

// --- 方法 ---

const toggleCategory = (id: string) => {
  const index = selectedCategories.value.indexOf(id)
  if (index > -1) selectedCategories.value.splice(index, 1)
  else selectedCategories.value.push(id)
  emitChange()
}

const handleTagChange = (tagId: string) => {
  const index = selectedTags.value.indexOf(tagId)
  if (index > -1) selectedTags.value.splice(index, 1)
  else selectedTags.value.push(tagId)
  emitChange()
}

const handleReset = () => {
  selectedCategories.value = []
  selectedStatus.value = ''
  selectedWordCount.value = ''
  selectedUpdateTime.value = ''
  selectedTags.value = []
  selectedRating.value = ''
  emitChange()
}

const handleRemoveFilter = (key: string) => {
  if (key.startsWith('category_')) {
    selectedCategories.value = selectedCategories.value.filter(id => id !== key.replace('category_', ''))
  } else if (key === 'status') selectedStatus.value = ''
  else if (key === 'wordCount') selectedWordCount.value = ''
  else if (key === 'updateTime') selectedUpdateTime.value = ''
  else if (key === 'rating') selectedRating.value = ''
  else if (key.startsWith('tag_')) {
    selectedTags.value = selectedTags.value.filter(id => id !== key.replace('tag_', ''))
  }
  emitChange()
}

const emitChange = () => {
  emit('change', currentFilters.value)
}

const handleApply = () => {
  emit('apply', currentFilters.value)
}

// 监听筛选变化 (如果是即时筛选模式)
watch(currentFilters, () => {
  // 可以在这里做防抖处理
})
</script>

<style scoped lang="scss">
.filter-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  /* 如果在侧边栏，通常需要占满 */
  max-height: 100vh;
  /* 防止过长 */
}

.filter-header {
  padding: 20px 20px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f5f7fa;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1a1a1a;
    font-weight: 700;
    font-size: 16px;
  }

  .reset-btn {
    font-size: 13px;
    color: #8590a6;

    &:hover {
      color: #409eff;
    }
  }
}

.active-filters-section {
  padding: 12px 20px;
  background: #f9fafc;
  border-bottom: 1px solid #f0f2f5;

  .active-tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .active-tag {
      border: none;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      color: #409eff;
    }
  }
}

.filter-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  /* 隐藏滚动条但保持功能 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #e0e3e9;
    border-radius: 4px;
  }
}

.filter-group {
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
  }

  .group-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    display: flex;
    align-items: center;

    &::before {
      content: '';
      display: block;
      width: 3px;
      height: 12px;
      background: #409eff;
      border-radius: 2px;
      margin-right: 8px;
    }
  }
}

/* Grid Options (Category) */
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  .grid-option {
    padding: 8px 12px;
    background: #f4f6f8;
    border-radius: 8px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
    border: 1px solid transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;

    &:hover {
      background: #eef1f6;
      color: #303133;
    }

    &.active {
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
      border-color: rgba(64, 158, 255, 0.2);
      font-weight: 500;
    }

    .option-count {
      font-size: 11px;
      opacity: 0.7;
    }
  }
}

/* Pills (Single Select) */
.pills-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .filter-pill {
    padding: 6px 16px;
    background: #f4f6f8;
    border-radius: 20px;
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: #409eff;
      background: #ecf5ff;
    }

    &.active {
      background: #409eff;
      color: #fff;
      box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);
    }
  }
}

/* Cloud Tags (Multi Select) */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .cloud-tag {
    font-size: 13px;
    color: #8590a6;
    cursor: pointer;
    transition: color 0.2s;
    padding: 2px 4px;

    &:hover {
      color: #409eff;
      text-decoration: underline;
    }

    &.active {
      color: #409eff;
      font-weight: 600;
    }
  }
}

.filter-footer {
  padding: 16px 20px;
  border-top: 1px solid #f5f7fa;
  background: #fff;

  .apply-btn {
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  }
}
</style>
