# Qingyu Editor Frontend

> 一个基于 Vue 3 + TypeScript 的独立写作编辑器前端

## 项目简介

当前前端用于独立编辑器桌面宿主，默认只服务 writer 工作区，并通过 AI 工具链为创作过程提供辅助能力。

### 核心特性

- **Writer 工作区** - 项目、章节、结构舞台、正文编辑、自动保存
- **AI 创作辅助** - 续写、润色、扩写、改写、结构规划、工作台工具
- **桌面宿主适配** - Wails 桥接、本地数据回退、桌面运行态兼容
- **设计系统** - 可复用组件、主题令牌、统一交互基线

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite 7.x
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **UI组件**: Element Plus
- **HTTP客户端**: Axios
- **图表**: ECharts
- **样式**: SCSS + Tailwind CSS
- **Markdown**: Marked

## 项目结构

```
Qingyu-Editor/frontend/
├── src/
│   ├── modules/              # 真实业务 owner
│   │   ├── writer/           # 写作工作区、项目/章节/结构/正文链路
│   │   └── ai/               # AI facade、workbench、请求适配
│   ├── design-system/        # 基础组件与设计令牌
│   ├── core/                 # 配置、HTTP 服务、运行时基础设施
│   ├── router/               # 路由配置
│   ├── stores/               # 宿主级轻量状态
│   ├── utils/                # 通用工具
│   ├── types/                # TypeScript类型定义
│   ├── composables/          # 组合式函数
│   ├── App.vue               # 根组件
│   └── main.ts               # 入口文件
├── scripts/                  # 工程脚本
├── vite.config.ts            # Vite配置
├── tsconfig.json             # TypeScript配置
└── package.json              # 项目依赖
```

## 快速开始

> 💡 **首次使用？** 查看 [快速开始指南](./docs/QUICK_START.md) 获取详细步骤

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

### 安装与启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:8080 (需单独启动)
```

如需手动开启 `Vue DevTools` 插件链，可使用：

```bash
VITE_ENABLE_VUE_DEVTOOLS=true npm run dev
```

### 联调模式（独立编辑器前端 + 可选平台后端）

```bash
# 终端1: 启动后端
cd Qingyu_backend
go run cmd/server/main.go

# 终端2: 启动独立编辑器前端
cd Qingyu-Editor/frontend
npm run dev
```

### 生产构建

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview
```

---

📚 **更多文档：**

- [快速开始指南](./docs/QUICK_START.md) - 5分钟上手
- [使用指南](./docs/USER_GUIDE.md) - 完整功能说明
- [API连接配置](./docs/api-connection-guide.md) - 环境配置
- [部署指南](./docs/deployment-guide.md) - 生产部署

---

## 开发指南

### 代码规范

- 使用 TypeScript 类型注解
- 遵循 Vue 3 Composition API 最佳实践
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case 或 PascalCase（组件文件）

### 路由配置

路由按模块组织，每个模块有自己的路由配置文件：

```typescript
// src/modules/writer/routes.ts
export default [
  {
    path: '/',
    component: () => import('@/modules/writer/views/ProjectWorkspace.vue'),
    meta: { requiresAuth: false, layout: 'editor' },
  },
]
```

### API调用

使用统一的 `httpService` 进行 API 调用：

```typescript
import { httpService } from '@/core/services/http.service'

export const getProjects = () => {
  return httpService.get('/api/v1/projects')
}

export const saveDocument = (documentId: string, content: string) => {
  return httpService.put(`/api/v1/documents/${documentId}/content`, { content })
}
```

每个模块都有自己的API文件，位于 `src/modules/{module}/api/`：

```typescript
// 使用模块API
import { getProjects, saveDocument } from '@writer/api/wrapper'
import { polishText, storyGenerate } from '@ai/api'
```

### 状态管理

使用 Pinia 进行状态管理：

```typescript
// src/modules/writer/stores/editorStore.ts
import { defineStore } from 'pinia'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    currentProjectId: null as string | null,
    currentChapterId: null as string | null,
    content: '',
  }),
})
```

## 性能优化

项目已实现以下优化措施：

### 构建优化

- **代码分割** - 手动配置 vendor chunks，分离 Vue、Element Plus、ECharts 等库
- **路由懒加载** - 所有页面组件使用动态 import
- **Tree Shaking** - 自动移除未使用的代码
- **CSS 代码分割** - 每个组件的 CSS 独立打包
- **Terser 压缩** - 生产环境自动移除 console 和 debugger

### 运行时优化

- **图片懒加载** - 使用 v-lazy 指令
- **虚拟滚动** - 长列表使用虚拟滚动
- **防抖节流** - 搜索、滚动等操作使用防抖节流
- **组件缓存** - 使用 keep-alive 缓存页面
- **性能监控** - 集成性能监控工具

### 构建产物

主 bundle 大小：

- 未压缩: ~1,122 KB
- Gzip: ~372 KB
- 符合性能要求（< 500KB gzip）

## 环境配置

项目支持三种环境配置：

- `.env.development` - 本地开发环境
- `.env.staging` - 预发布/测试环境
- `.env.production` - 生产环境

### 开发环境配置

开发环境使用 Vite Proxy 代理API请求，无需额外配置：

```bash
# .env.development（已配置）
VITE_API_BASE_URL=/api/v1
VITE_WS_BASE_URL=/ws
```

启动开发服务器：

```bash
npm run dev
```

### 生产环境配置

根据部署平台修改 `.env.production`：

**腾讯云 CloudBase：**

```bash
VITE_API_BASE_URL=https://your-env-id.service.tcloudbase.com/api/v1
```

**自有服务器：**

```bash
VITE_API_BASE_URL=https://yourdomain.com/api/v1
```

详细的配置说明请参考 [API连接配置指南](./docs/api-connection-guide.md)

### 构建命令

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预发布构建
npm run build:staging

# 类型检查
npm run type-check
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 模块功能说明

### Writer 模块

- 作品管理
- 章节创作
- 结构舞台与大纲编辑
- 富文本编辑器与自动保存
- 本地桌面桥接与回退链路

### AI 模块

- 聊天、续写、润色、扩写、改写
- 结构规划与工作台工具
- 与 writer 主链路协同的辅助能力
- 仅作为写作工作区的配角能力，不独立长出平台后台

## 常见问题

### 开发相关

**Q: 如何修改 API 地址？**
A: 编辑对应环境的 `.env` 文件（如 `.env.development`），修改 `VITE_API_BASE_URL`

**Q: 开发环境跨域如何解决？**
A: Vite 已配置代理，API请求会自动转发到后端。确保后端运行在 `localhost:8080`

**Q: 如何添加新模块？**
A: 在 `src/modules` 下创建新模块目录，包含 api、views、components 等。详见[使用指南](./docs/USER_GUIDE.md)

**Q: 构建失败怎么办？**
A:

1. 检查 Node.js 版本（>= 18.0.0）
2. 删除 `node_modules` 和 `package-lock.json`
3. 重新安装依赖：`npm install`
4. 如果仍有问题，尝试使用 `npm run build` 跳过类型检查

**Q: 如何启用 API 健康检查？**
A: 开发环境自动启用，启动项目后查看控制台输出

### 部署相关

**Q: 如何部署到生产环境？**
A: 参考 [API连接配置指南](./docs/api-connection-guide.md) 和 [部署指南](./docs/deployment-guide.md)

**Q: 支持哪些部署平台？**
A:

- 腾讯云 CloudBase（推荐，国内访问快）
- 阿里云 Serverless
- Vercel（海外用户）
- 自有服务器 + Nginx

**Q: 如何配置环境变量？**
A: 复制 `.env.example` 为 `.env.production`，修改其中的配置值

## 项目文档

- **[使用指南](./docs/USER_GUIDE.md)** - 开发者和用户完整使用指南
- **[API连接配置](./docs/api-connection-guide.md)** - 环境配置和多平台部署
- **[部署指南](./docs/deployment-guide.md)** - 生产环境部署详细说明
- **[集成测试报告](./docs/integration-test-results.md)** - 功能测试验证
- **[API迁移文档](./docs/api-migration.md)** - API架构迁移说明

### 外部文档

- [Vite 文档](https://vitejs.dev/)
- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## License

MIT

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 联系方式

- 项目地址: [GitHub](https://github.com/your-org/qingyu)
- 问题反馈: [Issues](https://github.com/your-org/qingyu/issues)
