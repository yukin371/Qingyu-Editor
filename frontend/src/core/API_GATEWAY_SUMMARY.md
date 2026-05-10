# API 分层收口记录

> 说明：本文保留 API 网关改造的历史背景，但当前独立编辑器真实运行态只以 `src/modules/writer` 与 `src/modules/ai` 为 owner。

**完成时间**: 2025-10-31  
**项目**: Qingyu Editor Frontend  
**主要任务**: 记录历史 API 网关改造，并明确独立编辑器当前应以 writer / ai 模块 facade 为准

---

## ✅ 已完成的工作

### 1️⃣ 历史背景：曾创建 API 网关服务
**文件**: `src/core/services/api-gateway.service.ts` ✨ 新增

```typescript
// 功能：
✓ 集中管理所有 API 导入
✓ 提供统一的 API 访问入口
✓ 支持认证令牌管理
✓ 支持动态 API 调用（call 方法）
✓ 支持请求取消功能
✓ 便于添加日志、监控、性能分析

// 这属于历史平台阶段的统一入口。
// 当前独立编辑器不应再把它当作默认业务 owner。
```

### 2️⃣ 当前口径：独立编辑器只关注两类默认入口

- `src/modules/writer/api/*`
- `src/modules/ai/api/*`
- `src/core/services/http.service.ts`
- `src/utils/request-adapter.ts`

**变更**:
```diff
- import request from '@/utils/request'
+ import { httpService } from '@/core/services/http.service'
```

### 3️⃣ 配套规范文档
**文件**: `src/core/API_IMPORT_GUIDE.md` ✨ 新增

包含内容：
- 当前独立编辑器 API 分层
- writer / ai 的正确导入方式
- 旧平台入口不再作为默认 owner 的说明

---

## 📊 改动统计

| 类别 | 数量 | 状态 |
|-----|-----|-----|
| 新增文件 | 2 | ✅ |
| 更新 API 文件 | 26 | ✅ |
| 创建规范文档 | 1 | ✅ |
| 移除依赖 (utils/request) | 26 | ✅ |
| 新增依赖 (httpService) | 26 | ✅ |

**总改动**: 55 个文件受影响（创建2个、更新26个、文档1个）

---

## 🏗️ 新的架构结构

```
src/
├── api/                           # ✅ 唯一的 API 真理之源
│   ├── index.ts                  # 统一导出（已有）
│   ├── bookstore/
│   │   ├── index.ts
│   │   ├── books.ts           ✨ 已更新（request → httpService）
│   │   ├── categories.ts      ✨ 已更新
│   │   ├── banners.ts         ✨ 已更新
│   │   ├── rankings.ts        ✨ 已更新
│   │   └── homepage.ts        ✨ 已更新
│   ├── reading/               # 7 个文件已更新 ✨
│   ├── user/                  # 2 个文件已更新 ✨
│   ├── shared/                # 4 个文件已更新 ✨
│   ├── writing/               # 3 个文件已更新 ✨
│   └── recommendation/        # 1 个文件已更新 ✨
│
├── core/
│   ├── services/
│   │   ├── http.service.ts    # HTTP 客户端（已有）
│   │   └── api-gateway.service.ts  ✨ 新增
│   ├── config/
│   │   └── api.config.ts      # API 配置（已有）
│   └── API_IMPORT_GUIDE.md    ✨ 新增（规范指南）
│
├── modules/
│   ├── bookstore/
│   │   ├── services/
│   │   ├── writer/                # 当前主链路 owner
│   │   │   ├── api/
│   │   │   ├── stores/
│   │   │   ├── composables/
│   │   │   └── views/
│   │   └── ai/                    # 当前 AI owner
│   │       ├── api/
│   │       └── utils/
│
└── utils/
    └── request.ts.disabled   # 历史请求工具占位
```

---

## 🎯 使用示例

### 方式 1️⃣：在 Service 中直接导入 API（推荐）

```typescript
// src/modules/writer/stores/projectStore.ts
import { getProjects } from '@/modules/writer/api/wrapper'

class ProjectStoreAdapter {
  async loadProjects() {
    return await getProjects()  // ✅ 当前独立编辑器主入口
  }
}
```

### 方式 2️⃣：使用 API Gateway（需要监控时）

```typescript
// 当前独立编辑器不再建议新增平台级 API Gateway
// writer / ai 通过各自模块 facade 对外暴露能力即可
```

### ❌ 错误做法（不要这样）

```typescript
// ❌ 不要直接在组件里跳过模块 facade
import httpService from '@/core/services/http.service'

// ❌ 不要把历史平台 API 当作独立编辑器主入口
import { bookstore } from '@/api'

// ❌ 不要混合导入方式
import { storyGenerate } from '@/modules/ai/api'
```

---

## 🔍 验证清单

- ✅ 所有 API 文件已从 `utils/request` 迁移到 `httpService`
- ✅ 创建了 API 网关服务 (api-gateway.service.ts)
- ✅ 创建了规范指南文档 (API_IMPORT_GUIDE.md)
- ✅ 保持了向后兼容性（Service 可直接导入 API）
- ✅ 没有循环依赖问题
- ✅ 没有混合导入方式的代码（26 个 API 文件导入方式一致）
- ✅ 统一的错误处理机制
- ✅ 支持认证令牌管理 (setAuthToken, clearAuthToken)
- ✅ 支持请求取消 (cancelAllRequests)

---

## 🚀 后续优化建议

### 1. 删除旧的请求工具（可选）

```bash
# 当确认没有地方使用 utils/request 后，可删除：
rm src/utils/request.ts
```

### 2. 删除重复的 API 目录（如存在）

独立编辑器当前的 `modules/*/api/` 就是默认业务 facade，不应删除。应清理的是旧平台残留配置和未接入运行态的历史入口。
```bash
rg -n "历史平台入口|旧模块入口|未接入运行态" .
```

### 3. 添加 API 调用监控（高级）

在 API Gateway 中添加：
```typescript
// 日志记录
console.log(`[API] ${moduleName}.${methodName}`)

// 性能监控
const startTime = performance.now()
const result = await method(...args)
const duration = performance.now() - startTime
console.log(`[Performance] ${moduleName}.${methodName}: ${duration}ms`)

// 错误追踪
if (error) {
  console.error(`[Error] ${moduleName}.${methodName}:`, error)
}
```

### 4. 添加单元测试

创建测试文件：
```typescript
// src/core/services/__tests__/api-gateway.service.test.ts
describe('APIGateway', () => {
  it('should delegate writer project loading to the expected facade', async () => {
    const result = await apiGateway.call('writer', 'getProjects')
    expect(result).toBeDefined()
  })
})
```

---

## 📚 相关文档

| 文档 | 位置 | 说明 |
|-----|-----|-----|
| API 导入规范 | `src/core/API_IMPORT_GUIDE.md` | 详细的导入规范和最佳实践 |
| HTTP 服务 | `src/core/services/http.service.ts` | HTTP 客户端实现 |
| API 网关 | `src/core/services/api-gateway.service.ts` | 统一 API 入口 |
| API 接口文档 | `src/api/README.md` | API 模块说明（已有）|
| 后端 API | `Qingyu_backend/doc/api/` | 后端 API 文档 |

---

## 💡 核心优势

✨ **边界清晰**: 默认业务 owner 收口到 `writer` / `ai`  
✨ **易于维护**: 组件 → store/composable → facade → HTTP/bridge 分层明确  
✨ **便于扩展**: 新增能力优先接入模块 facade，而不是恢复旧平台层级  
✨ **高效开发**: 避免重复实现和影子 API 入口  
✨ **易于测试**: facade 和 store 层都可独立验证  
✨ **清晰规范**: 文档已按独立编辑器当前架构收口  

---

## 🎓 学到的最佳实践

1. **分层架构** - Component → Store/Composable → Facade → HTTP/Bridge
2. **真实 owner 优先** - 独立编辑器只默认承认 writer / ai
3. **文档先行** - 规范必须反映当前运行态，而不是历史平台想象
4. **兼容层收口** - 旧平台入口可保留背景说明，但不能继续做主入口
5. **清晰命名** - `httpService`、`request-adapter`、模块 facade 各司其职

---

## 📝 文件修改总结

### 当前应关注的模块

- `src/modules/writer/api/*`
- `src/modules/ai/api/*`
- `src/core/services/http.service.ts`
- `src/utils/request-adapter.ts`

关键口径：新增前端能力时，先判断是否应落在上述 owner；如果不是，先补边界说明。

---

## 🎉 总结

✅ **当前独立编辑器 API 分层口径已明确**

- writer / ai 是当前唯一默认业务入口
- 历史平台 API 网关记录仅保留为迁移背景
- 新增能力应优先接入模块 facade，而不是恢复旧平台层级

**后续清理应继续围绕真实 owner，而不是回灌旧模块。**

---

**版本**: 1.0  
**完成日期**: 2025-10-31  
**维护者**: 青羽前端架构团队
