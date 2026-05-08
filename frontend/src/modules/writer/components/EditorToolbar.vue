<template>
  <div class="editor-toolbar" :class="{ 'is-simple': isSimpleMode }">
    <!-- 1. 历史操作组 (撤销/重做) -->
    <div class="toolbar-group history-group" v-if="!isSimpleMode">
      <el-tooltip content="撤销 (Ctrl+Z)" :show-after="500">
        <el-button text class="tool-btn" @click="emitCommand('undo')" :disabled="!canUndo">
          <QyIcon name="RefreshLeft"  />
        </el-button>
      </el-tooltip>
      <el-tooltip content="重做 (Ctrl+Y)" :show-after="500">
        <el-button text class="tool-btn" @click="emitCommand('redo')" :disabled="!canRedo">
          <QyIcon name="RefreshRight"  />
        </el-button>
      </el-tooltip>
    </div>

    <el-divider direction="vertical" v-if="!isSimpleMode" />

    <!-- 2. 标题下拉菜单 -->
    <div class="toolbar-group">
      <el-tooltip content="标题设置" :show-after="500">
        <el-dropdown trigger="click" @command="emitCommand">
          <el-button text class="tool-btn heading-btn">
            <span class="btn-text">H</span>
            <el-icon class="el-icon--right">
              <QyIcon name="ArrowDown"  />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="heading1">
                <h1>H1 一级标题</h1>
              </el-dropdown-item>
              <el-dropdown-item command="heading2">
                <h2>H2 二级标题</h2>
              </el-dropdown-item>
              <el-dropdown-item command="heading3">
                <h3>H3 三级标题</h3>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <!-- 3. 文本样式组 -->
    <div class="toolbar-group">
      <el-tooltip content="粗体 (Ctrl+B)" :show-after="500">
        <el-button text class="tool-btn" @click="emitCommand('bold')">
          <el-icon><br /><b>B</b></el-icon> <!-- 使用 CSS 模拟图标 -->
        </el-button>
      </el-tooltip>

      <el-tooltip content="斜体 (Ctrl+I)" :show-after="500">
        <el-button text class="tool-btn" @click="emitCommand('italic')">
          <el-icon><i>I</i></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="删除线" :show-after="500" v-if="!isSimpleMode">
        <el-button text class="tool-btn" @click="emitCommand('strikethrough')">
          <el-icon><span style="text-decoration: line-through;">S</span></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <!-- 4. 段落与列表 -->
    <div class="toolbar-group">
      <el-tooltip content="引用" :show-after="500">
        <el-button text class="tool-btn" @click="emitCommand('quote')">
          <QyIcon name="ChatLineSquare"  />
        </el-button>
      </el-tooltip>

      <el-tooltip content="无序列表" :show-after="500">
        <el-button text class="tool-btn" @click="emitCommand('list')">
          <QyIcon name="Operation"  />
        </el-button>
      </el-tooltip>

      <el-tooltip content="有序列表" :show-after="500" v-if="!isSimpleMode">
        <el-button text class="tool-btn" @click="emitCommand('orderedList')">
          <QyIcon name="finished"  />
        </el-button>
      </el-tooltip>
    </div>

    <el-divider direction="vertical" v-if="!isSimpleMode" />

    <!-- 5. 插入对象 -->
    <div class="toolbar-group" v-if="!isSimpleMode">
      <el-tooltip content="代码块" :show-after="500">
        <el-button text class="tool-btn" @click="emitCommand('code')">
          <QyIcon name="files"  />
        </el-button>
      </el-tooltip>

      <el-tooltip content="链接 (Ctrl+K)" :show-after="500">
        <el-button text class="tool-btn" @click="emitCommand('link')">
          <QyIcon name="Link"  />
        </el-button>
      </el-tooltip>

      <el-tooltip content="图片" :show-after="500">
        <el-button text class="tool-btn" @click="emitCommand('image')">
          <QyIcon name="Picture"  />
        </el-button>
      </el-tooltip>

      <el-tooltip content="分隔线" :show-after="500">
        <el-button text class="tool-btn" @click="emitCommand('line')">
          <QyIcon name="Minus"  />
        </el-button>
      </el-tooltip>
    </div>

    <!-- 6. 右侧功能区 (使用 auto margin 顶到右边) -->
    <div class="toolbar-group right-group">
      <el-divider direction="vertical" />
      <el-tooltip :content="showPreview ? '隐藏预览' : '双栏预览'" :show-after="500">
        <el-button text class="tool-btn" :class="{ 'is-active': showPreview }" @click="emitTogglePreview">
          <QyIcon name="View"  />
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyIcon } from '@/design-system/components'
interface Props {
  isSimpleMode?: boolean
  showPreview?: boolean
  canUndo?: boolean // 可选：父组件传入是否可撤销
  canRedo?: boolean // 可选
}

withDefaults(defineProps<Props>(), {
  isSimpleMode: false,
  showPreview: true,
  canUndo: false,
  canRedo: false
})

// 定义发射的事件，将逻辑解耦，只传递命令类型
const emit = defineEmits<{
  (e: 'command', type: string): void
  (e: 'togglePreview'): void
}>()

const emitCommand = (type: string) => {
  emit('command', type)
}

const emitTogglePreview = () => {
  emit('togglePreview')
}
</script>

<style scoped lang="scss">
.editor-toolbar {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  gap: 4px;
  flex-wrap: wrap;
  transition: background-color 0.3s;
  height: 42px; // 固定高度防止抖动
  box-sizing: border-box;

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  // 将预览按钮顶到最右侧
  .right-group {
    margin-left: auto;
  }

  // 统一按钮样式
  .tool-btn {
    padding: 6px;
    height: 32px;
    width: 32px;
    border-radius: 8px;
    color: #475569;
    transition: all 0.2s;

    &:hover {
      background-color: #eff6ff;
      color: #1d4ed8;
    }

    &.is-active {
      background-color: #dbeafe;
      color: #1d4ed8;
    }

    :deep(.el-icon) {
      font-size: 16px;
    }

    // 针对 B, I, S 这种文字图标的特殊样式
    b,
    i {
      font-family: serif;
      font-size: 14px;
    }
  }

  // 标题下拉按钮特殊处理
  .heading-btn {
    width: auto;
    padding: 0 6px;

    .btn-text {
      font-weight: bold;
      margin-right: 2px;
    }
  }

  // 分隔线样式
  .el-divider--vertical {
    height: 18px;
    margin: 0 4px;
    border-color: #dbe3ef;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .editor-toolbar {
    overflow-x: auto;
    flex-wrap: nowrap;
    height: 48px;

    // 隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }

    .right-group {
      margin-left: 0; // 移动端不需要顶到右边，跟随流布局
      border-left: 1px solid #dbe3ef;
      padding-left: 4px;
    }
  }
}

// 下拉菜单内的标题样式
h1,
h2,
h3 {
  margin: 0;
  line-height: 1.2;
}

h1 {
  font-size: 20px;
  font-weight: bold;
}

h2 {
  font-size: 16px;
  font-weight: bold;
}

h3 {
  font-size: 14px;
  font-weight: bold;
}
</style>
