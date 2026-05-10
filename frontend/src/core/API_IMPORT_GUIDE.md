# API 导入规范指南

> 说明：本文已按独立编辑器当前运行态收口。默认前端 owner 只有 `src/modules/writer` 与 `src/modules/ai`。

## 📋 概述

本文档定义了青羽前端项目中 API 导入的统一规范，确保代码清晰、可维护和高效。

---

## 🏗️ 架构层级

```
┌─────────────────────────────────────┐
│    Vue Components / Pages           │ 仅负责渲染和用户交互
└────────────┬────────────────────────┘
             │ 导入 Service
             ▼
┌─────────────────────────────────────┐
│    Store / Composable Layer         │ 业务状态、交互编排
│  (src/modules/*/stores|composables) │
└────────────┬────────────────────────┘
             │ 调用模块 facade
             ▼
┌─────────────────────────────────────┐
│    Module API Facade                │ writer / ai 能力入口
│  (src/modules/*/api/)               │
└────────────┬────────────────────────┘
             │ 使用
             ▼
┌─────────────────────────────────────┐
│    Shared HTTP / Bridge Layer       │ HTTP、Wails、本地回退
│  (src/core/services/,               │
│   src/utils/request-adapter.ts)     │
└────────────┬────────────────────────┘
             │ 使用
             ▼
┌─────────────────────────────────────┐
│    HTTP Service                     │ HTTP 客户端、拦截器
│  (src/core/services/              │
│   http.service.ts)                 │
└────────────┬────────────────────────┘
             │ 真实请求
             ▼
┌─────────────────────────────────────┐
│    Backend API Server               │
│  (Qingyu Backend / REST API)        │
└─────────────────────────────────────┘
```

---

## ✅ DO - 正确做法

### 1️⃣ 方式一：在 Store / Composable 中直接导入模块 facade

**最推荐** - 直接、高效、易于维护

```typescript
// src/modules/writer/stores/projectStore.ts
import { getProjects, createProject } from '@/modules/writer/api/wrapper'

class ProjectStoreAdapter {
  async loadProjects() {
    return await getProjects()
  }

  async create(payload) {
    return await createProject(payload)
  }
}
```

### 2️⃣ 方式二：在 writer 内部继续细分 API 文件（可选）

**当模块内需要保持职责拆分时使用**

```typescript
// src/modules/writer/api/wrapper.ts
import * as projectAPI from './project'
import * as documentAPI from './document'

export async function getProjects() {
  return projectAPI.getProjects()
}

export async function createDocument(projectId: string, payload: unknown) {
  return documentAPI.createDocument(projectId, payload)
}
```

### 3️⃣ AI 能力统一从 `src/modules/ai/api` 暴露

```typescript
// src/modules/writer/composables/useAIContext.ts
import { summarizeText, proofreadText } from '@/modules/ai/api'

async function reviewSelection(text: string) {
  const [summary, proofread] = await Promise.all([
    summarizeText(text),
    proofreadText(text),
  ])

  return { summary, proofread }
}
```

### 4️⃣ API 文件内部只面向基础请求层

```typescript
// src/modules/writer/api/project.ts
import httpService from '@/core/services/http.service'

export function getProjects() {
  return httpService.get('/api/v1/projects')
}
```

---

## ❌ DON'T - 不要这样做

### ❌ 1. 在组件中直接拼请求

```typescript
// ❌ 不推荐
import httpService from '@/core/services/http.service'

export default {
  async setup() {
    const projects = await httpService.get('/api/v1/projects')
    return { projects }
  }
}
```

**为什么？**
- 绕过模块 facade
- 难以复用桌面回退和错误处理
- 组件会吞掉业务边界

### ❌ 2. 把 AI 调用散落到 writer 页面各处

```typescript
// ❌ 不推荐
import { continueWriting } from '@/modules/ai/api/ai'
import { polishText } from '@/modules/ai/api/ai'
```

**为什么？**
- 容易形成多套入口
- writer 无法统一接入 AI 能力

### ❌ 3. 在 API 层导入旧请求工具

```typescript
// ❌ 不推荐（已废弃）
import request from '@/utils/request'

export function getProjects() {
  return request.get('/api/v1/projects')
}
```

**为什么？**
- `utils/request` 已退场
- 会绕过当前 HTTP 与桌面适配层

### ❌ 4. 混合不一致的模块入口

```typescript
// ❌ 不推荐
import { getProjects } from '@/modules/writer/api/wrapper'
import { httpService } from '@/core/services/http.service'
import { storyGenerate } from '@/modules/ai/api'

// 同一条业务链不要混用三套入口
```

---

## 🔄 导入检查清单

在代码审查时检查以下项：

- [ ] **API 导入位置**
  - writer 业务链优先从 `src/modules/writer/api` 导入
  - AI 能力优先从 `src/modules/ai/api/index.ts` 导入
  - 组件不直接发请求

- [ ] **没有循环依赖**
  - writer store/composable 不反向被 API 层依赖
  - API 不导入视图组件
  - HTTP Service / bridge 不导入业务页面

- [ ] **统一的导入风格**
  - 同一条业务链只保留一个主入口
  - writer 侧优先走 `wrapper` 或模块导出面
  - ai 侧优先走 `api/index.ts`

- [ ] **没有旧的请求工具**
  - 没有 `import request from '@/utils/request'`
  - 所有请求使用 `httpService` 或当前 bridge 适配层

- [ ] **没有重复的 owner**
  - 不在 `src/api/`、`src/stores/`、`src/shared/` 再造 writer/ai 影子 facade
  - 不把旧平台入口重新接回独立编辑器主链

- [ ] **正确的导入使用**
  - 组件仅从 store/composable/facade 导入
  - facade 仅从 HTTP/bridge 层导入
  - API 文件仅处理请求与响应适配

---

## 🎯 API 模块对应关系

| 前端模块 | API 路径 | 使用场景 |
|---------|---------|---------|
| writer | `src/modules/writer/api/*` | 项目、章节、结构、正文、桌面回退 |
| ai | `src/modules/ai/api/*` | 聊天、续写、润色、结构规划、工作台工具 |
| shared infra | `src/core/services/*` / `src/utils/request-adapter.ts` | HTTP 客户端、桌面桥接、请求基础设施 |
| generated models | `src/api/generated/model.ts` | 历史共享模型产物，默认不作为业务 facade |

---

## 🚀 Service 层最佳实践

```typescript
// src/modules/writer/stores/projectStore.ts
import { defineStore } from 'pinia'
import { getProjects } from '@/modules/writer/api/wrapper'

export const useProjectStore = defineStore('writer-project', {
  state: () => ({
    projects: [],
    isLoading: false,
  }),
  actions: {
    async loadProjects() {
      this.isLoading = true
      try {
        this.projects = await getProjects()
      } finally {
        this.isLoading = false
      }
    }
  },
})
```

---

## 📝 常见问题解答

**Q1: 为什么要有 Service 层？**

A: Service 层提供以下好处：
- 复用业务逻辑
- 集中数据处理
- 便于缓存和性能优化
- 易于单元测试（Mock Service）
- 清晰的关注点分离

**Q2: 什么时候需要 API Gateway？**

A: 当需要以下功能时：
- 集中的日志记录
- 性能监控和分析
- 统一的错误处理增强
- API 版本管理
- 请求速率限制

**Q3: 如何处理多个 API 模块的调用？**

A: 
```typescript
class UserService {
  async getUserWithBalance(userId: string) {
    // 可以调用多个 API 模块
    const user = await user.getUserProfile()
    const wallet = await shared.getBalance()
    
    return { ...user, balance: wallet }
  }
}
```

**Q4: 如何优雅地处理 API 错误？**

A:
```typescript
class BookstoreService {
  async getBooks() {
    try {
      return await bookstore.getBooks()
    } catch (error) {
      console.error('Failed to fetch books:', error)
      // 返回默认值或抛出业务级错误
      throw new Error('Failed to load books')
    }
  }
}
```

---

## 🔗 相关文件

- `src/core/services/http.service.ts` - HTTP 客户端
- `src/modules/writer/api/wrapper.ts` - writer 默认 facade 入口
- `src/modules/ai/api/index.ts` - AI 默认 facade 入口
- `src/utils/request-adapter.ts` - 桌面/请求适配层

---

## 📚 参考文档

- [API 接口文档](../api/README.md)
- [HTTP 服务说明](./http.service.ts)
- [后端 API 文档](../../../Qingyu_backend/doc/api/)

---

**最后更新**: 2025-10-31  
**维护者**: 青羽前端架构团队
