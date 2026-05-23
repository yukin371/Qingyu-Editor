# Qingyu-Editor Frontend

独立编辑器的 Vue 3 前端宿主。默认服务于 `writer` 工作区，并通过 `ai` 模块为创作过程提供配套辅助能力。

## 模块定位

这一层的职责不是拥有业务真相，而是把桌面宿主中的交互、布局、状态与本地桥接组织起来：

- `writer` 模块拥有写作工作区、结构辅助、正文编辑与右栏工具链
- `ai` 模块拥有 provider 配置、请求 facade、工作台与辅助动作
- `design-system` 提供可复用 UI 原语、主题令牌与 Storybook 基线
- `core`、`router`、`stores` 负责宿主级基础设施

如果你想先建立边界感，推荐按以下顺序阅读：

1. [MODULE.md](./MODULE.md)
2. [src/design-system/README.md](./src/design-system/README.md)
3. [src/composables/README.md](./src/composables/README.md)
4. [src/modules/writer/docs/README.md](./src/modules/writer/docs/README.md)

## 技术栈

- Vue 3 + Composition API
- TypeScript
- Vite 7
- Pinia
- Vue Router 4
- Tailwind CSS 4 + SCSS
- TipTap / ProseMirror
- Axios
- Vitest + Playwright + Storybook

## 目录地图

```text
frontend/
├── src/
│   ├── modules/             真实业务 owner（writer / ai）
│   ├── design-system/       基础组件、Qy 组件库、主题与 stories
│   ├── composables/         可复用有状态逻辑
│   ├── core/                配置、HTTP、运行时基础设施
│   ├── router/              路由入口与宿主编排
│   ├── stores/              宿主级轻量状态
│   ├── utils/               工具函数与运行时辅助
│   ├── types/               全局类型
│   ├── App.vue
│   └── main.ts
├── scripts/                 工程脚本
├── package.json             前端命令入口
├── vite.config.ts           构建与开发配置
└── tsconfig*.json           TypeScript 配置
```

## 本地开发

### 安装

```bash
npm install --legacy-peer-deps
```

### 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build
npm run build:staging
npm run build:prod

# 类型检查
npm run type-check
npm run type-check:full

# 单测
npm run test:vitest:run
npm run test:vitest:coverage

# E2E
npm run test:e2e
npm run test:e2e:headed

# Storybook
npm run storybook
npm run build-storybook

# 样式检查
npm run lint:styles
```

### 联调方式

有两种常见场景：

1. 只调前端宿主与静态状态：直接 `npm run dev`
2. 需要联动桌面或后端链路：
   - 桌面宿主：从仓库根目录运行 `wails dev`
   - 平台/远端接口：按对应链路单独启动后端或相关服务

如果你要看最接近真实产品的运行态，优先使用 `wails dev`，不要把纯 Vite 页面预览误当成完整桌面宿主行为。

## 设计与实现边界

- `src/modules/writer` 是默认主业务面，不再回退到旧平台首页心智。
- `src/modules/ai` 只作为 writer 的配角能力，不扩张成独立后台。
- `src/design-system` 是基础 UI owner；业务模块应组合它，而不是复制它。
- `src/api/generated` 已不是当前默认链路；业务 facade 以 `src/modules/*/api` 为准。
- 本地优先与宿主桥接能力应在 `core` / `modules` 内收口，不要在页面中散落环境分支。

## 改动时优先看哪里

### 写作工作区

- `src/modules/writer/views`
- `src/modules/writer/components`
- `src/modules/writer/stores`
- `src/modules/writer/composables`
- `src/modules/writer/data-bridge`

### AI 工具链

- `src/modules/ai/api`
- `src/modules/ai/components`
- `src/modules/ai/stores`

### 基础 UI

- `src/design-system/components`
- `src/design-system/tokens`
- `src/design-system/stories`

## 验证建议

改动前端后，至少按改动范围执行一组最贴近的验证：

- 交互/状态变更：`npm run test:vitest:run`
- 桌面主链或关键工作流：`npm run test:e2e`
- 类型与导出面：`npm run type-check`
- 设计系统或组件行为：`npm run storybook` 或对应组件测试

## 相关文档

- [../docs/developer-guide.md](../docs/developer-guide.md)
- [../docs/user-guide.md](../docs/user-guide.md)
- [../docs/creative-workflow-design.md](../docs/creative-workflow-design.md)
- [src/modules/writer/docs/README.md](./src/modules/writer/docs/README.md)
- [src/design-system/README.md](./src/design-system/README.md)
- [src/composables/README.md](./src/composables/README.md)
