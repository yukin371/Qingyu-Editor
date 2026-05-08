<template>
  <div class="search-container" :class="{ 'is-focus': isFocused }">
    <el-autocomplete ref="autocompleteRef" v-model="searchText" :fetch-suggestions="querySearch"
      :placeholder="placeholder" :debounce="300" :trigger-on-focus="true" class="custom-search-input"
      popper-class="search-autocomplete-popper" @select="handleSelect" @focus="isFocused = true"
      @blur="isFocused = false" @keyup.enter="handleSearch">
      <!-- 前缀图标 -->
      <template #prefix>
        <el-icon class="search-icon">
          <QyIcon name="Search"  />
        </el-icon>
      </template>

      <!-- 自定义下拉项模板 -->
      <template #default="{ item }">
        <div class="suggestion-item" :class="{ 'is-history': item.isHistory }">
          <!-- 左侧内容 -->
          <div class="item-main">
            <el-icon class="item-icon">
              <component :is="item.isHistory ? 'Clock' : getItemIcon(item.type)" />
            </el-icon>

            <!-- 支持高亮显示 -->
            <span class="item-text" v-safe-html="highlightText(item.value)"></span>
          </div>

          <!-- 右侧标签或操作 -->
          <div class="item-meta">
            <el-tag v-if="item.type && !item.isHistory" size="small" :type="getTagType(item.type)" effect="plain"
              class="type-tag">
              {{ getTypeLabel(item.type) }}
            </el-tag>

            <!-- 删除历史记录按钮 -->
            <el-icon v-if="item.isHistory" class="delete-icon" @click.stop="removeHistoryItem(item.value)">
              <QyIcon name="Close"  />
            </el-icon>
          </div>
        </div>
      </template>

      <!-- 下拉列表底部：清空历史 -->
      <template #append v-if="history.length > 0 && !searchText">
        <!-- Element Autocomplete append slot is for input, not dropdown footer.
              For dropdown footer, we usually use a custom implementation or just last item logic.
              Here we keep the input append button. -->
      </template>
    </el-autocomplete>

    <!-- 独立的搜索按钮 (比 append slot 更灵活好看) -->
    <el-button type="primary" round class="search-btn" @click="handleSearch">
      搜索
    </el-button>

    <!-- 热门搜索标签 -->
    <div v-if="showHotTags && hotTags.length > 0" class="hot-section">
      <span class="hot-label"><QyIcon name="Trophy"  /> 热门搜索</span>
      <div class="tags-wrapper">
        <span v-for="(tag, index) in hotTags" :key="tag" class="hot-tag" :class="`rank-${index + 1}`"
          @click="handleHotTagClick(tag)">
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, User, Collection, Search } from '@element-plus/icons-vue'
// --- 类型定义 ---
interface SearchSuggestion {
  value: string
  type?: 'book' | 'author' | 'tag'
  id?: string
  isHistory?: boolean // 标记是否为历史记录
  [key: string]: any
}

interface Props {
  modelValue?: string
  placeholder?: string
  showHotTags?: boolean
  hotTags?: string[]
  fetchSuggestions?: (queryString: string) => Promise<SearchSuggestion[]>
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', keyword: string): void
  (e: 'select', suggestion: SearchSuggestion): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索书名、作者、标签...',
  showHotTags: false,
  hotTags: () => []
})

const emit = defineEmits<Emits>()
const router = useRouter()
const autocompleteRef = ref()
const searchText = ref(props.modelValue)
const isFocused = ref(false)
const history = ref<string[]>([])

// --- 核心逻辑 ---

// 初始化加载历史
onMounted(() => {
  history.value = getSearchHistory()
})

// 搜索建议逻辑分流
const querySearch = async (queryString: string, cb: (results: SearchSuggestion[]) => void) => {
  const keyword = queryString.trim()

  // 1. 如果输入为空，显示搜索历史
  if (!keyword) {
    const historyItems = history.value.map(v => ({
      value: v,
      isHistory: true
    }))
    // 可以在最后追加一个“清空历史”的特殊选项（视需求而定）
    cb(historyItems)
    return
  }

  // 2. 如果有输入，调用外部 API 或 过滤历史
  let results: SearchSuggestion[] = []

  if (props.fetchSuggestions) {
    try {
      results = await props.fetchSuggestions(keyword)
    } catch (error) {
      console.error('Fetch suggestions error:', error)
    }
  } else {
    // 默认行为：仅过滤历史
    results = history.value
      .filter(item => item.toLowerCase().includes(keyword.toLowerCase()))
      .map(v => ({ value: v, isHistory: true }))
  }

  cb(results)
}

// 高亮匹配文本
const highlightText = (text: string) => {
  if (!searchText.value) return text
  const reg = new RegExp(`(${searchText.value})`, 'gi')
  return text.replace(reg, '<span class="highlight">$1</span>')
}

// --- 历史记录管理 ---

const getSearchHistory = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('search_history') || '[]')
  } catch {
    return []
  }
}

const saveSearchHistory = (keyword: string) => {
  if (!keyword.trim()) return
  let list = getSearchHistory()
  // 移除旧的，插入新的到头部
  list = list.filter(item => item !== keyword)
  list.unshift(keyword)
  // 限制10条
  list = list.slice(0, 10)
  localStorage.setItem('search_history', JSON.stringify(list))
  history.value = list
}

const removeHistoryItem = (val: string) => {
  const list = history.value.filter(item => item !== val)
  localStorage.setItem('search_history', JSON.stringify(list))
  history.value = list
  // 强制刷新下拉列表
  autocompleteRef.value?.focus()
}

// --- 事件处理 ---

const handleSearch = () => {
  const keyword = searchText.value.trim()
  if (!keyword) return

  saveSearchHistory(keyword)
  emit('update:modelValue', keyword)
  emit('search', keyword)

  // 关闭下拉
  autocompleteRef.value?.blur()

  router.push({ path: '/bookstore/search', query: { q: keyword } })
}

const handleSelect = (item: SearchSuggestion) => {
  if (item.isHistory) {
    searchText.value = item.value
    handleSearch()
    return
  }

  emit('select', item)

  // 智能跳转
  if (item.type === 'book' && item.id) {
    router.push(`/bookstore/books/${item.id}`)
  } else if (item.type === 'author' && item.id) {
    router.push(`/author/${item.id}`)
  } else {
    searchText.value = item.value
    handleSearch()
  }
}

const handleHotTagClick = (tag: string) => {
  searchText.value = tag
  handleSearch()
}

// --- 辅助函数 ---
const getItemIcon = (type?: string) => {
  const map: Record<string, any> = { book: Document, author: User, tag: Collection }
  return map[type || ''] || Search
}

const getTypeLabel = (type?: string) => {
  const map: Record<string, string> = { book: '书籍', author: '作者', tag: '标签' }
  return map[type || ''] || ''
}

const getTagType = (type?: string) => {
  const map: Record<string, string> = { book: '', author: 'warning', tag: 'info' }
  return map[type || ''] || ''
}

watch(() => props.modelValue, (val) => searchText.value = val)

defineExpose({
  focus: () => autocompleteRef.value?.focus(),
  blur: () => autocompleteRef.value?.blur()
})
</script>

<style scoped lang="scss">
.search-container {
  position: relative;
  width: 100%;
  max-width: 680px;
  /* 限制最大宽度 */
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;

  // 聚焦时的外发光效果
  &.is-focus {
    .custom-search-input :deep(.el-input__wrapper) {
      box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
      border-color: #409eff;
      background-color: #fff;
    }
  }
}

.custom-search-input {
  flex: 1;

  :deep(.el-input__wrapper) {
    border-radius: 50px;
    padding: 8px 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); // 默认柔和阴影
    border: 1px solid transparent; // 预留边框位置
    background-color: rgba(255, 255, 255, 0.9);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

    &.is-focus {
      box-shadow: none !important; // 移除 element 默认的丑阴影
    }
  }

  :deep(.el-input__inner) {
    height: 32px;
    font-size: 15px;
    color: #333;
  }

  .search-icon {
    font-size: 18px;
    color: #a8abb2;
    margin-right: 8px;
  }
}

.search-btn {
  padding: 12px 28px;
  font-weight: 600;
  height: 48px; // 保持与输入框视觉高度一致
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: transform 0.1s;

  &:active {
    transform: scale(0.96);
  }
}

.hot-section {
  position: absolute;
  top: 100%;
  left: 20px; // 对齐输入框文字
  right: 0;
  margin-top: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .hot-label {
    font-size: 13px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    margin-top: 4px;
  }

  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hot-tag {
    font-size: 13px;
    color: #606266;
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.03);
    transition: all 0.2s;

    &:hover {
      color: #409eff;
      background: rgba(64, 158, 255, 0.1);
    }

    // 给前三个热门加一点特殊样式
    &.rank-1 {
      color: #f56c6c;
      background: rgba(245, 108, 108, 0.1);
    }

    &.rank-2 {
      color: #e6a23c;
      background: rgba(230, 162, 60, 0.1);
    }

    &.rank-3 {
      color: #409eff;
      background: rgba(64, 158, 255, 0.1);
    }
  }
}
</style>

<style lang="scss">
/* 注意：Popper 是 append 到 body 的，所以这部分样式不能 scoped，或者使用 :global */
.search-autocomplete-popper {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  border: none !important;

  .el-autocomplete-suggestion__wrap {
    padding: 8px 0;
    max-height: 320px;
  }

  li {
    padding: 0 !important; // 重置默认 padding
  }

  .suggestion-item {
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: background 0.2s;
    font-size: 14px;

    &:hover {
      background-color: #f5f7fa;

      .delete-icon {
        opacity: 1; // hover 时显示删除按钮
      }
    }

    &.is-history {
      .item-text {
        color: #606266;
      }
    }

    .item-main {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      overflow: hidden;

      .item-icon {
        color: #909399;
        font-size: 16px;
      }

      .item-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #303133;

        /* 高亮文字样式 */
        .highlight {
          color: #409eff;
          font-weight: 600;
        }
      }
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 12px;

      .delete-icon {
        font-size: 14px;
        color: #c0c4cc;
        opacity: 0;
        padding: 4px;
        border-radius: 50%;
        transition: all 0.2s;

        &:hover {
          color: #f56c6c;
          background-color: rgba(245, 108, 108, 0.1);
        }
      }
    }
  }
}
</style>
