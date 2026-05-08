<!--
  TemplatePreview组件使用示例

  这个文件展示了如何在其他组件中使用TemplatePreview组件
-->
<template>
  <div>
    <!-- 打开预览按钮 -->
    <button
      @click="showPreview = true"
      class="px-4 py-2 bg-secondary-500 text-white rounded hover:bg-secondary-600"
    >
      预览模板
    </button>

    <!-- 使用TemplatePreview组件 -->
    <TemplatePreview
      v-model="showPreview"
      :template="template"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TemplatePreview from './TemplatePreview.vue'
import type { TemplateVariable } from './TemplatePreview.vue'

// 控制预览对话框显示
const showPreview = ref(false)

// 模板数据示例
const template = ref({
  content: `# {{var:title}}

## 作者：{{var:author}}

### 简介
{{var:description}}

### 正文
{{var:content}}

---
*创建于 {{var:date}}*`,
  variables: [
    {
      name: 'title',
      label: '标题',
      type: 'text',
      placeholder: '请输入标题',
      defaultValue: '未命名章节',
      required: true,
      order: 1
    },
    {
      name: 'author',
      label: '作者',
      type: 'text',
      placeholder: '请输入作者名称',
      defaultValue: '匿名作者',
      required: true,
      order: 2
    },
    {
      name: 'description',
      label: '简介',
      type: 'textarea',
      placeholder: '请输入章节简介',
      required: false,
      order: 3
    },
    {
      name: 'content',
      label: '正文内容',
      type: 'textarea',
      placeholder: '请输入正文内容',
      required: true,
      order: 4
    },
    {
      name: 'date',
      label: '创建日期',
      type: 'text',
      placeholder: '请输入日期',
      defaultValue: new Date().toLocaleDateString('zh-CN'),
      required: false,
      order: 5
    }
  ] as TemplateVariable[]
})
</script>
