<template>
  <Teleport to="body">
    <Transition name="graph-overlay-fade">
      <div
        v-if="visible"
        class="graph-overlay"
        @keyup.esc="handleClose"
      >
        <!-- 顶部标题栏 -->
        <header class="graph-overlay__header">
          <h3 class="header-title">角色关系图谱</h3>

          <!-- 范围切换按钮组 -->
          <div class="scope-switcher">
            <button
              class="scope-btn"
              :class="{ active: currentScope === 'project' }"
              @click="handleScopeChange('project')"
            >
              项目全局
            </button>
            <button
              class="scope-btn"
              :class="{ active: currentScope === 'volume' }"
              @click="handleScopeChange('volume')"
            >
              当前卷
            </button>
            <button
              class="scope-btn"
              :class="{ active: currentScope === 'chapter' }"
              @click="handleScopeChange('chapter')"
            >
              当前章节
            </button>
          </div>

          <!-- 关闭按钮 -->
          <button class="graph-overlay__close" @click="handleClose">
            ✕
          </button>
        </header>

        <!-- 主内容区 -->
        <main class="graph-overlay__main">
          <!-- 加载状态 -->
          <div v-if="loading" class="graph-overlay__loading">
            <div class="loading-spinner"></div>
            <span class="loading-text">加载图谱中...</span>
          </div>

          <!-- 空状态 -->
          <div v-else-if="!nodes.length" class="graph-overlay__empty">
            <div class="empty-icon">⊙</div>
            <p class="empty-text">暂无角色关系数据</p>
            <p class="empty-hint">请先在章节中添加角色并建立关系</p>
          </div>

          <!-- 图谱组件 -->
          <CharacterGraph
            v-else
            :nodes="nodes"
            :links="links"
            :show-link-labels="true"
            :view-mode="viewMode"
            :chapter-title="chapterTitle"
            @node-click="handleNodeClick"
            @node-double-click="handleNodeDoubleClick"
            @create-link="handleCreateLink"
            @refresh="handleRefresh"
            @add-character="handleAddCharacter"
            @view-mode-change="handleViewModeChange"
          />
        </main>

        <!-- 节点详情浮窗 -->
        <Transition name="detail-fade">
          <div
            v-if="selectedNode"
            class="graph-overlay__detail"
            :style="detailPosition"
          >
            <h4 class="detail-name">{{ selectedNode.name }}</h4>

            <div v-if="selectedNode.importance" class="detail-meta">
              <span class="meta-label">重要度:</span>
              <span class="meta-value">{{ selectedNode.importance }}</span>
            </div>

            <!-- 关系列表 -->
            <div v-if="nodeRelations.length" class="detail-relations">
              <h5 class="relations-title">关系网络</h5>
              <ul class="relations-list">
                <li
                  v-for="relation in nodeRelations"
                  :key="relation.id"
                  class="relation-item"
                >
                  <span class="relation-type">{{ relation.type }}</span>
                  <span class="relation-strength">
                    {{ getStrengthLabel(relation.strength) }}
                  </span>
                </li>
              </ul>
            </div>

            <!-- 操作按钮 -->
            <button
              class="detail-btn"
              @click="handleViewEncyclopedia(selectedNode.id)"
            >
              在百科中查看
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CharacterGraph from '@/modules/writer/components/editor/CharacterGraph.vue'

interface GraphNode {
  id: string
  name: string
  avatar?: string
  importance?: number
}

interface GraphLink {
  source: string
  target: string
  type: string
  strength: number
  id?: string
}

interface Props {
  visible: boolean
  projectId: string
  chapterId?: string
  chapterTitle?: string
  loading?: boolean
  nodes: GraphNode[]
  links: GraphLink[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  projectId: '',
  chapterId: '',
  chapterTitle: '',
  loading: false,
  nodes: () => [],
  links: () => [],
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'scope-change', scope: string): void
  (e: 'view-encyclopedia', nodeId: string): void
}>()

// 内部状态
const currentScope = ref<string>('project')
const viewMode = ref<'project' | 'chapter'>('project')
const selectedNode = ref<GraphNode | null>(null)
const detailPosition = ref({ left: '0px', top: '0px' })

// 计算节点关系列表
const nodeRelations = computed(() => {
  if (!selectedNode.value) return []

  return props.links
    .filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source
      const targetId = typeof link.target === 'string' ? link.target : link.target
      return sourceId === selectedNode.value?.id || targetId === selectedNode.value?.id
    })
    .map(link => ({
      ...link,
      id: `${link.source}-${link.target}-${link.type}`,
    }))
})

// 获取关系强度标签
function getStrengthLabel(strength: number): string {
  if (strength >= 80) return '紧密'
  if (strength >= 60) return '较强'
  if (strength >= 40) return '一般'
  return '较弱'
}

// 事件处理
function handleClose() {
  emit('close')
}

function handleScopeChange(scope: string) {
  currentScope.value = scope
  viewMode.value = scope === 'chapter' ? 'chapter' : 'project'
  emit('scope-change', scope)
}

function handleNodeClick(node: GraphNode) {
  selectedNode.value = node
  // 设置详情浮窗位置（默认位置，可以根据需要调整）
  detailPosition.value = {
    left: '20px',
    top: '80px',
  }
}

function handleNodeDoubleClick(node: GraphNode) {
  handleViewEncyclopedia(node.id)
}

function handleCreateLink(fromId: string, toId: string) {
  // 可以在这里添加创建关系的逻辑
  console.log('创建关系:', fromId, toId)
}

function handleRefresh() {
  // 刷新图谱数据
  console.log('刷新图谱')
}

function handleAddCharacter() {
  // 添加角色
  console.log('添加角色')
}

function handleViewModeChange(mode: 'project' | 'chapter') {
  viewMode.value = mode
  currentScope.value = mode === 'chapter' ? 'chapter' : 'project'
}

function handleViewEncyclopedia(nodeId: string) {
  emit('view-encyclopedia', nodeId)
}

// 监听 visible 变化，重置状态
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    selectedNode.value = null
  }
})
</script>

<style scoped lang="scss">
.graph-overlay {
  position: fixed;
  inset: 0;
  z-index: 8000;
  background: rgba(15, 23, 42, 0.95);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(4px);
}

// 顶部标题栏
.graph-overlay__header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: rgba(22, 27, 34, 0.98);
  border-bottom: 1px solid rgba(48, 54, 61, 0.6);
  gap: 20px;

  .header-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #e6edf3;
    font-family: 'Noto Serif SC', Georgia, serif;
    white-space: nowrap;
  }

  .scope-switcher {
    display: flex;
    gap: 4px;
    background: rgba(201, 169, 98, 0.1);
    padding: 3px;
    border-radius: 6px;
  }

  .scope-btn {
    padding: 6px 14px;
    font-size: 13px;
    border: none;
    background: transparent;
    color: #8b949e;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: #e6edf3;
      background: rgba(201, 169, 98, 0.15);
    }

    &.active {
      background: #c9a962;
      color: #0d1117;
      font-weight: 500;
    }
  }

  .graph-overlay__close {
    margin-left: auto;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #8b949e;
    font-size: 20px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(248, 81, 73, 0.15);
      color: #f85149;
    }
  }
}

// 主内容区
.graph-overlay__main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

// 加载状态
.graph-overlay__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(48, 54, 61, 0.6);
    border-top-color: #c9a962;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    font-size: 14px;
    color: #8b949e;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 空状态
.graph-overlay__empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  .empty-icon {
    font-size: 64px;
    color: rgba(201, 169, 98, 0.3);
    margin-bottom: 8px;
  }

  .empty-text {
    margin: 0;
    font-size: 16px;
    color: #e6edf3;
    font-weight: 500;
  }

  .empty-hint {
    margin: 0;
    font-size: 13px;
    color: #8b949e;
  }
}

// 节点详情浮窗
.graph-overlay__detail {
  position: absolute;
  width: 260px;
  background: rgba(22, 27, 34, 0.98);
  border: 1px solid rgba(48, 54, 61, 0.8);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 100;

  .detail-name {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #c9a962;
    font-family: 'Noto Serif SC', Georgia, serif;
  }

  .detail-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(48, 54, 61, 0.6);

    .meta-label {
      font-size: 12px;
      color: #8b949e;
    }

    .meta-value {
      font-size: 12px;
      color: #e6edf3;
      font-weight: 500;
    }
  }

  .detail-relations {
    margin-bottom: 16px;

    .relations-title {
      margin: 0 0 8px 0;
      font-size: 12px;
      font-weight: 600;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .relations-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .relation-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        background: rgba(48, 54, 61, 0.4);
        border-radius: 6px;
        font-size: 12px;

        .relation-type {
          color: #e6edf3;
        }

        .relation-strength {
          color: #8b949e;
          font-size: 11px;
        }
      }
    }
  }

  .detail-btn {
    width: 100%;
    padding: 8px 16px;
    border: 1px solid rgba(201, 169, 98, 0.4);
    border-radius: 6px;
    background: rgba(201, 169, 98, 0.1);
    color: #c9a962;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(201, 169, 98, 0.2);
      border-color: #c9a962;
    }
  }
}

// 过渡动画
.graph-overlay-fade-enter-active,
.graph-overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.graph-overlay-fade-enter-from,
.graph-overlay-fade-leave-to {
  opacity: 0;
}

.detail-fade-enter-active,
.detail-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.detail-fade-enter-from,
.detail-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
