# Export API 迁移指南

## 概述

前端export API已经过重构，以与后端API契约保持一致。本文档帮助开发者从旧的API迁移到新的API。

## 后端路由

新的API遵循以下后端路由：

```http
POST   /api/v1/writer/documents/:id/export        # 导出文档
POST   /api/v1/writer/projects/:id/export         # 导出项目
GET    /api/v1/writer/exports/:id                 # 获取导出任务
GET    /api/v1/writer/projects/:projectId/exports # 列出项目的导出任务
GET    /api/v1/writer/exports/:id/download        # 下载导出文件
DELETE /api/v1/writer/exports/:id                 # 删除导出任务
POST   /api/v1/writer/exports/:id/cancel          # 取消导出任务
```

## API变更

### 1. 导出文档

**旧API（已废弃）：**
```typescript
import { createExportTask } from '@/modules/writer/api/export'

// 旧方式：使用bookId
const task = await createExportTask(bookId, {
  format: 'markdown',
  scope: 'book',
  include_metadata: true
})
```

**新API：**
```typescript
import { exportApi } from '@/modules/writer/api/export'
import type { ExportDocumentRequest } from '@/modules/writer/types/export'

// 新方式：使用documentId和projectId
const task = await exportApi.exportDocument(
  documentId,
  projectId,
  {
    format: 'md',
    includeMeta: true,
    options: {
      toc: true,
      pageNumbers: true
    }
  }
)
```

### 2. 导出项目

**旧API（已废弃）：**
```typescript
import { createExportTask } from '@/modules/writer/api/export'

const task = await createExportTask(bookId, {
  format: 'epub',
  scope: 'book'
})
```

**新API：**
```typescript
import { exportApi } from '@/modules/writer/api/export'
import type { ExportProjectRequest } from '@/modules/writer/types/export'

const task = await exportApi.exportProject(projectId, {
  includeDocuments: true,
  includeCharacters: true,
  includeLocations: false,
  includeTimeline: false,
  documentFormats: 'md',
  options: {
    toc: true,
    pageNumbers: true
  }
})
```

### 3. 获取导出任务状态

**旧API（已废弃）：**
```typescript
import { getExportTaskStatus } from '@/modules/writer/api/export'

const task = await getExportTaskStatus(taskId)
```

**新API：**
```typescript
import { exportApi } from '@/modules/writer/api/export'

const task = await exportApi.getTask(taskId)
```

### 4. 列出导出任务

**旧API（已废弃）：**
```typescript
import { getExportHistory } from '@/modules/writer/api/export'

const history = await getExportHistory(bookId, {
  page: 1,
  page_size: 20
})
```

**新API：**
```typescript
import { exportApi } from '@/modules/writer/api/export'

const result = await exportApi.listTasks(projectId, 1, 20)
// result.items: ExportTask[]
// result.total: number
// result.page: number
// result.pageSize: number
```

### 5. 下载导出文件

**旧API（已废弃）：**
```typescript
import { downloadExportFile } from '@/modules/writer/api/export'

const blob = await downloadExportFile(taskId)
```

**新API：**
```typescript
import { exportApi } from '@/modules/writer/api/export'

const blob = await exportApi.downloadFile(taskId)
```

### 6. 取消导出任务

**旧API（已废弃）：**
```typescript
import { cancelExportTask } from '@/modules/writer/api/export'

await cancelExportTask(taskId)
```

**新API：**
```typescript
import { exportApi } from '@/modules/writer/api/export'

await exportApi.cancelTask(taskId)
```

### 7. 删除导出任务

**旧API（已废弃）：**
```typescript
import { deleteExportTask } from '@/modules/writer/api/export'

await deleteExportTask(taskId)
```

**新API：**
```typescript
import { exportApi } from '@/modules/writer/api/export'

await exportApi.deleteTask(taskId)
```

## 类型变更

### 导出格式

**旧格式：**
```typescript
type ExportFormat = 'txt' | 'docx' | 'pdf' | 'markdown' | 'epub' | 'html'
```

**新格式：**
```typescript
type ExportFormat = 'txt' | 'md' | 'docx' | 'zip'
```

**变更映射：**
- `'markdown'` → `'md'`
- `'pdf'` → 不再支持
- `'epub'` → 不再支持
- `'html'` → 不再支持

### 导出任务状态

**旧状态：**
```typescript
type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed'
```

**新状态：**
```typescript
type ExportTaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
```

### 导出选项

**旧选项：**
```typescript
interface ExportOptions {
  format: ExportFormat
  scope: ExportScope
  include_metadata?: boolean
  include_comments?: boolean
  include_toc?: boolean
  page_breaks?: boolean
  toc_title?: string
}
```

**新选项：**
```typescript
interface ExportOptions {
  toc?: boolean
  pageNumbers?: boolean
  includeNotes?: boolean
  includeTags?: boolean
  header?: string
  footer?: string
  fontSize?: number
  lineSpacing?: number
  excludeChapters?: string[]
}
```

### 导出任务对象

**旧对象：**
```typescript
interface ExportTask {
  id: string
  book_id: string
  chapter_id?: string
  format: ExportFormat
  scope: ExportScope
  status: TaskStatus
  progress: number
  file_url?: string
  file_size?: number
  error_message?: string
  created_at: string
  completed_at?: string
}
```

**新对象：**
```typescript
interface ExportTask {
  id: string
  type: ExportType        // 'document' | 'project'
  resourceId: string
  resourceTitle: string
  format: ExportFormat
  status: ExportTaskStatus
  progress: number
  fileSize: number
  fileUrl?: string
  expiresAt: string
  errorMsg?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}
```

## 已移除的功能

以下功能后端不支持，已被移除：

1. **导出选中内容** (`exportSelection`) - 后端不支持
2. **导出模板管理** (`getExportTemplates`, `saveExportTemplate`) - 后端不支持
3. **批量导出** (`batchExport`) - 后端不支持
4. **全局导出历史** (`getAllExportHistory`) - 后端不支持
5. **单独导出章节** (`exportChapter`) - 请使用`exportDocument`代替

## 迁移检查清单

- [ ] 将所有`createExportTask`调用改为`exportApi.exportDocument`或`exportApi.exportProject`
- [ ] 更新导出格式：`'markdown'` → `'md'`
- [ ] 移除不再支持的格式：`'pdf'`, `'epub'`, `'html'`
- [ ] 更新`ExportTask`对象的使用方式
- [ ] 将`book_id`改为使用`projectId`和`documentId`
- [ ] 移除对已废弃功能的调用（模板、批量导出等）
- [ ] 更新错误处理逻辑（新的错误字段为`errorMsg`）

## 示例：完整迁移

### 迁移前

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { createExportTask, getExportTaskStatus, downloadExportFile } from '@/modules/writer/api/export'

const bookId = ref('book-123')
const isExporting = ref(false)

async function exportBook() {
  isExporting.value = true
  try {
    const task = await createExportTask(bookId.value, {
      format: 'markdown',
      scope: 'book',
      include_metadata: true
    })

    // 轮询任务状态
    const interval = setInterval(async () => {
      const status = await getExportTaskStatus(task.id)
      if (status.status === 'completed') {
        clearInterval(interval)
        const blob = await downloadExportFile(task.id)
        // 下载文件...
        isExporting.value = false
      }
    }, 1000)
  } catch (error) {
    console.error('Export failed:', error)
    isExporting.value = false
  }
}
</script>
```

### 迁移后

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { exportApi } from '@/modules/writer/api/export'
import type { ExportProjectRequest } from '@/modules/writer/types/export'

const projectId = ref('project-123')
const isExporting = ref(false)

async function exportProject() {
  isExporting.value = true
  try {
    const task = await exportApi.exportProject(
      projectId.value,
      {
        includeDocuments: true,
        documentFormats: 'md',
        options: {
          toc: true,
          pageNumbers: true
        }
      }
    )

    // 轮询任务状态
    const interval = setInterval(async () => {
      const status = await exportApi.getTask(task.id)
      if (status.status === 'completed') {
        clearInterval(interval)
        const blob = await exportApi.downloadFile(task.id)
        // 下载文件...
        isExporting.value = false
      } else if (status.status === 'failed') {
        clearInterval(interval)
        console.error('Export failed:', status.errorMsg)
        isExporting.value = false
      }
    }, 1000)
  } catch (error) {
    console.error('Export failed:', error)
    isExporting.value = false
  }
}
</script>
```

## 常见问题

### Q: 为什么导出格式变少了？

A: 后端目前只支持`txt`、`md`、`docx`和`zip`格式。`pdf`、`epub`和`html`格式将在未来版本中考虑支持。

### Q: 如何处理旧的`bookId`？

A: 新的API使用`projectId`（项目）和`documentId`（文档）的概念。请根据你的业务逻辑将`bookId`映射到相应的ID。

### Q: 旧的API还能用吗？

A: 旧的API函数仍然存在，但已标记为`@deprecated`，并在调用时会输出警告。建议尽快迁移到新API。

### Q: 如何处理导出选项的变更？

A: 请参考上面的类型定义，将旧的选项映射到新的选项。例如：
- `include_toc: true` → `options: { toc: true }`
- `page_breaks: true` → `options: { pageNumbers: true }`

## 需要帮助？

如果遇到迁移问题，请：
1. 检查本文档的示例代码
2. 查看类型定义：`src/modules/writer/types/export.ts`
3. 查看API实现：`src/modules/writer/api/export.ts`
4. 联系后端开发团队确认API行为
