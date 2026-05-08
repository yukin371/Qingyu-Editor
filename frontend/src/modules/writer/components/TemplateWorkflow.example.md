# TemplateWorkflow 组件使用示例

## 组件概述

`TemplateWorkflow` 是一个整合组件，实现了从选择模板到应用到文档的完整流程。

## Props

```typescript
interface Props {
  projectId: string        // 项目ID
  workspaceId: string      // 工作区ID
  documentId: string       // 文档ID
  showButton?: boolean     // 是否显示"应用模板"按钮，默认 true
  buttonText?: string      // 按钮文字，默认"应用模板"
}
```

## Emits

```typescript
interface Emits {
  applied: [content: string]  // 模板应用成功后触发，返回渲染后的内容
}
```

## 基础用法

### 1. 显示按钮并处理应用结果

```vue
<template>
  <TemplateWorkflow
    :project-id="projectId"
    :workspace-id="workspaceId"
    :document-id="documentId"
    @applied="handleTemplateApplied"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TemplateWorkflow from '@/modules/writer/components/TemplateWorkflow.vue'

const projectId = ref('project-123')
const workspaceId = ref('workspace-456')
const documentId = ref('document-789')

function handleTemplateApplied(content: string) {
  // 处理应用后的内容
  console.log('模板应用成功，内容：', content)
  // 可以将内容插入到编辑器中
}
</script>
```

### 2. 不显示按钮，通过其他方式触发

```vue
<template>
  <div>
    <button @click="openWorkflow">打开模板库</button>
    <TemplateWorkflow
      ref="workflowRef"
      :project-id="projectId"
      :workspace-id="workspaceId"
      :document-id="documentId"
      :show-button="false"
      @applied="handleTemplateApplied"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TemplateWorkflow from '@/modules/writer/components/TemplateWorkflow.vue'

const workflowRef = ref<InstanceType<typeof TemplateWorkflow>>()

function openWorkflow() {
  // 通过 ref 调用组件方法
  workflowRef.value?.handleOpenTemplateManager()
}
</script>
```

### 3. 自定义按钮文字

```vue
<template>
  <TemplateWorkflow
    :project-id="projectId"
    :workspace-id="workspaceId"
    :document-id="documentId"
    button-text="选择模板"
    @applied="handleTemplateApplied"
  />
</template>
```

## 组件功能

### 主要功能

1. **模板管理面板**
   - 显示模板列表
   - 搜索和过滤模板
   - 应用模板
   - 创建和编辑模板

2. **变量填写**
   - 自动检测模板变量
   - 动态生成表单
   - 表单验证

3. **模板应用**
   - 调用后端 API 应用模板
   - 返回渲染后的内容
   - 错误处理

### 集成的组件

- `TemplateManagerPanel`: 模板管理面板
- `TemplateVariablesDialog`: 变量填写对话框
- `TemplatePreview`: 模板预览对话框

## 工作流程

```
用户点击"应用模板"按钮
    ↓
打开 TemplateManagerPanel
    ↓
选择模板
    ↓
检查是否有变量
    ↓
    ├─ 有变量 → 打开 TemplateVariablesDialog → 填写变量 → 应用模板
    │
    └─ 无变量 → 直接应用模板
    ↓
触发 @applied 事件，返回渲染后的内容
    ↓
父组件处理内容（如插入到编辑器）
```

## 样式说明

组件使用纯 Tailwind CSS，按钮样式如下：

```html
<button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2">
  <svg class="w-4 h-4">...</svg>
  应用模板
</button>
```

## 可选功能

组件预留了 `handlePreviewTemplate` 方法，可以在未来添加预览功能：

```typescript
// 预览模板
async function handlePreviewTemplate(templateId: string): Promise<void> {
  try {
    const template = await templateApi.getDetail(templateId)
    selectedTemplate.value = template
    showPreviewDialog.value = true
  } catch (error) {
    console.error('获取模板详情失败:', error)
    ElMessage.error('获取模板详情失败')
  }
}
```

## 注意事项

1. 确保 `projectId`、`workspaceId` 和 `documentId` 已正确设置
2. TemplateManagerPanel 已经集成了变量填写和应用逻辑，TemplateWorkflow 主要负责事件转发
3. 组件依赖于 `element-plus` 的 ElMessage 组件用于提示信息
4. 所有 API 调用都包含错误处理

## 扩展建议

如果需要添加更多功能，可以考虑：

1. **最近使用记录**
   - 记录最近使用的模板
   - 快速访问常用模板

2. **收藏模板**
   - 允许用户收藏常用模板
   - 优先显示收藏的模板

3. **模板预览**
   - 在应用前预览模板效果
   - 实时预览变量替换效果

4. **批量应用**
   - 支持批量应用模板到多个文档
   - 批量变量填写
