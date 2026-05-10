# API 导入规范指南

> 说明：本文主要保留历史平台 API 网关迁移经验。当前独立编辑器运行态以 `src/modules/writer` 与 `src/modules/ai` 的 facade 为主，不再把 admin 作为默认前端 owner。

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
│    Service Layer                    │ 业务逻辑、数据处理、缓存
│  (src/modules/*/services/)          │
└────────────┬────────────────────────┘
             │ 使用 API Gateway
             ▼
┌─────────────────────────────────────┐
│    API Gateway (Optional)           │ 统一入口、日志、监控
│  (src/core/services/              │
│   api-gateway.service.ts)          │
└────────────┬────────────────────────┘
             │ 或直接导入
             ▼
┌─────────────────────────────────────┐
│    API Layer                        │ API 函数、请求/响应处理
│  (src/api/bookstore/               │
│   src/api/reading/                 │
│   src/api/user/, ...)              │
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

### 1️⃣ 方式一：在 Service 层直接导入 API

**最推荐** - 直接、高效、易于维护

```typescript
// src/modules/bookstore/services/bookstore.service.ts
import { bookstore } from '@/api'  // 命名空间导入（推荐）
// 或
import * as bookstoreAPI from '@/api/bookstore'  // 别名导入（也推荐）

class BookstoreService {
  async getHomepage() {
    return await bookstore.getHomepage()
  }

  async searchBooks(params) {
    return await bookstoreAPI.searchBooks(params)
  }
}

export const bookstoreService = new BookstoreService()
```

### 2️⃣ 方式二：通过 API Gateway 导入（可选）

**当需要集中管理、日志记录、性能监控时使用**

```typescript
// src/modules/bookstore/services/bookstore.service.ts
import { apiGateway } from '@/core/services/api-gateway.service'

class BookstoreService {
  async getHomepage() {
    return await apiGateway.bookstore.getHomepage()
  }

  async searchBooks(params) {
    return await apiGateway.bookstore.searchBooks(params)
  }

  // 动态调用 API
  async call(moduleName: string, methodName: string, ...args: any[]) {
    return await apiGateway.call(moduleName, methodName, ...args)
  }
}
```

### 3️⃣ Component 中的导入

**始终从 Service 层导入，不直接导入 API**

```typescript
// src/modules/bookstore/views/HomeView.vue
import { bookstoreService } from '../services/bookstore.service'

export default {
  setup() {
    const getHomepage = async () => {
      const data = await bookstoreService.getHomepage()
      return data
    }

    return { getHomepage }
  }
}
```

### 4️⃣ API 层的导入方式

```typescript
// src/api/bookstore/homepage.ts
// ✅ 正确：导入 HTTP Service
import { httpService } from '@/core/services/http.service'

export function getHomepage() {
  return httpService.get<HomepageData>('/bookstore/homepage')
}
```

---

## ❌ DON'T - 不要这样做

### ❌ 1. 在 Component 中直接导入 API

```typescript
// ❌ 不推荐
import { getHomepage } from '@/api/bookstore'

export default {
  setup() {
    const data = ref(null)
    const load = async () => {
      data.value = await getHomepage()  // ❌ 违反分层规则
    }
  }
}
```

**为什么？**
- 破坏分层架构
- 无法复用业务逻辑
- 测试困难
- 难以维护

### ❌ 2. 在 Component 中导入 httpService

```typescript
// ❌ 不推荐
import { httpService } from '@/core/services/http.service'

export default {
  setup() {
    const getBooks = () => {
      return httpService.get('/bookstore/books')  // ❌ 绕过 Service 层
    }
  }
}
```

**为什么？**
- 绕过业务逻辑层
- 无法进行缓存、验证等处理
- 代码重复
- 难以统一管理

### ❌ 3. 在 API 层导入 utils/request

```typescript
// ❌ 不推荐（已废弃）
import request from '@/utils/request'

export function getHomepage() {
  return request.get('/bookstore/homepage')  // ❌ 使用旧的请求工具
}
```

**为什么？**
- utils/request 已被 httpService 取代
- 缺少现代化特性
- 不支持新的错误处理机制

### ❌ 4. 在多个 Service 中重复导入同一 API

```typescript
// ❌ 不推荐
// bookstore.service.ts
import * as bookstoreAPI from '@/api/bookstore'

// another-service.ts  
import * as bookstoreAPI from '@/api/bookstore'  // ❌ 重复导入
```

**为什么？**
- 导入逻辑分散
- 难以维护
- 可能不一致

**更好的做法：**
```typescript
// 创建一个统一的 api 文件或 gateway
export const bookstoreAPI = ...  // 集中导入
```

### ❌ 5. 混合导入方式

```typescript
// ❌ 不推荐
import { bookstore } from '@/api'
import * as readingAPI from '@/api/reading'  // ❌ 混合不同的导入方式
import { storyGenerate } from '@/modules/ai/api'

// 应该保持一致的风格
```

---

## 📦 统一导入方式

### 推荐使用：命名空间导入

```typescript
// src/modules/bookstore/services/bookstore.service.ts
import { bookstore, reading, user, shared, writing, recommendation } from '@/api'

class BookstoreService {
  async getHomepage() {
    return await bookstore.getHomepage()
  }

  async getBooks(params) {
    return await bookstore.getBooks(params)
  }
}
```

### 也可以：别名导入

```typescript
import * as bookstoreAPI from '@/api/bookstore'
import * as readingAPI from '@/api/reading'

class BookstoreService {
  async getHomepage() {
    return await bookstoreAPI.getHomepage()
  }

  async getChapters(bookId) {
    return await readingAPI.getChapters(bookId)
  }
}
```

### 避免：混合导入

```typescript
// ❌ 不推荐混合
import { getHomepage } from '@/api/bookstore'      // 直接导入函数
import { bookstore } from '@/api'                   // 命名空间导入
import * as readingAPI from '@/api/reading'        // 别名导入
```

---

## 🔄 导入检查清单

在代码审查时检查以下项：

- [ ] **API 导入位置**
  - API 导入仅在 `/api` 目录中
  - 所有 Service 从 `@/api` 导入
  - 所有 Component 从 Service 导入

- [ ] **没有循环依赖**
  - Service 不导入 Component
  - API 不导入 Service
  - HTTP Service 不导入 API

- [ ] **统一的导入风格**
  - 全项目使用相同的命名约定
  - 如选择命名空间导入，则全项目使用
  - 如选择别名导入，则全项目使用

- [ ] **没有旧的请求工具**
  - 没有 `import request from '@/utils/request'`
  - 所有请求使用 `httpService`

- [ ] **没有重复的 API 目录**
  - 不存在 `modules/*/api/` 目录
  - 所有 API 在 `src/api/` 中

- [ ] **正确的导入使用**
  - Component 仅从 Service 导入
  - Service 仅从 API/Gateway 导入
  - API 仅从 httpService 导入

---

## 🎯 API 模块对应关系

| 前端模块 | API 路径 | 使用场景 |
|---------|---------|---------|
| 书城系统 | `/api/bookstore/` | 书籍、分类、排行榜、Banner |
| 阅读系统 | `/api/reading/` | 章节、进度、评论、书签 |
| 用户中心 | `/api/user/` | 个人资料、安全设置 |
| 共享服务 | `/api/shared/` | 认证、钱包、存储 |
| 写作系统 | `src/modules/writer` / `src/modules/ai` | writer 工作区、AI facade、工作流工具 |
| 推荐系统 | `/api/recommendation/` | 个性化推荐、行为记录 |

---

## 🚀 Service 层最佳实践

```typescript
// src/modules/bookstore/services/bookstore.service.ts
import { bookstore } from '@/api'
import type { Book, HomepageData } from '@/types/bookstore'

/**
 * 书城服务 - 处理书城相关业务逻辑
 */
class BookstoreService {
  /**
   * 获取首页数据（可添加缓存）
   */
  async getHomepageData(): Promise<HomepageData> {
    // TODO: 添加缓存逻辑
    return await bookstore.getHomepage()
  }

  /**
   * 获取书籍详情
   */
  async getBookDetail(bookId: string): Promise<Book> {
    const book = await bookstore.getBookById(bookId)
    
    // 在后台增加浏览量（不阻塞）
    this.incrementBookView(bookId).catch(err => 
      console.error('Failed to increment view:', err)
    )
    
    return book
  }

  /**
   * 私有方法：增加书籍浏览量
   */
  private async incrementBookView(bookId: string): Promise<void> {
    try {
      await bookstore.incrementBookView(bookId)
    } catch (error) {
      console.error('Failed to increment book view:', error)
    }
  }
}

export const bookstoreService = new BookstoreService()
export default bookstoreService
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
- `src/core/services/api-gateway.service.ts` - API 网关（可选）
- `src/api/index.ts` - API 统一导出
- `src/api/*/index.ts` - 各模块 API 导出

---

## 📚 参考文档

- [API 接口文档](../api/README.md)
- [HTTP 服务说明](./http.service.ts)
- [后端 API 文档](../../../Qingyu_backend/doc/api/)

---

**最后更新**: 2025-10-31  
**维护者**: 青羽前端架构团队
