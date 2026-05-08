# ExportFormatDialog 使用示例

## 基本使用

### 单文档导出

```vue
<template>
  <div>
    <button @click="showExportDialog = true">导出文档</button>

    <ExportFormatDialog
      v-model="showExportDialog"
      :document-id="documentId"
      :project-id="projectId"
      :is-project="false"
      @confirm="handleExportConfirm"
      @cancel="handleExportCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ExportFormatDialog from '@/modules/writer/components/ExportFormatDialog.vue'

const showExportDialog = ref(false)
const documentId = ref('doc-123')
const projectId = ref('project-456')

function handleExportConfirm(taskId: string) {
  console.log('导出任务已创建:', taskId)
  // 可以打开进度对话框
}

function handleExportCancel() {
  console.log('用户取消导出')
}
</script>
```

### 项目导出

```vue
<template>
  <div>
    <button @click="showExportDialog = true">导出项目</button>

    <ExportFormatDialog
      v-model="showExportDialog"
      :project-id="projectId"
      :is-project="true"
      @confirm="handleExportConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ExportFormatDialog from '@/modules/writer/components/ExportFormatDialog.vue'

const showExportDialog = ref(false)
const projectId = ref('project-456')

function handleExportConfirm(taskId: string) {
  console.log('项目导出任务已创建:', taskId)
}
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | boolean | - | 控制对话框显示/隐藏（v-model） |
| documentId | string | - | 文档ID（单文档导出时必填） |
| projectId | string | - | 项目ID（必填） |
| isProject | boolean | false | 是否为项目导出 |

## Events

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | value: boolean | 对话框显示状态变化 |
| confirm | taskId: string | 确认导出，返回任务ID |
| cancel | - | 取消导出 |

## 功能特性

1. **格式选择**
   - TXT 文本：纯文本格式，兼容性最强
   - Markdown：支持富文本语法，便于编辑
   - Word 文档：标准办公文档格式
   - ZIP 压缩包：包含所有文件和资源

2. **高级选项**
   - 生成目录
   - 添加页码
   - 包含注释
   - 包含标签

3. **UI特性**
   - 响应式布局
   - 加载状态提示
   - 毛玻璃背景效果
   - 平滑动画过渡

## 注意事项

1. 确保在调用前已正确配置 `exportApi`
2. 项目ID必填，单文档导出时也需要项目ID
3. 导出成功后会返回任务ID，可用于后续进度查询
