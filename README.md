# 青羽编辑器（Qingyu-Editor）

独立写作桌面宿主，当前默认口径是 `Wails + Go + SQLite + Vue 3 + TipTap`。

它不是平台前端的另一份拷贝，而是面向作者创作闭环的本地优先编辑器：桌面壳负责宿主与本地能力，Go service 负责业务编排与 SQLite 持久化，前端负责 writer 工作区、AI 辅助工作台与设计系统。

## 这是什么

当前仓库重点承接以下几件事：

- 本地项目、卷、章节、快照等写作资产管理
- Writer 工作区的正文编辑、结构辅助、右栏工具与状态编排
- AI provider 配置、密钥管理、请求 facade 与写作辅助能力
- Wails 桌面宿主、SQLite 数据链路与前端桥接

当前默认主线已经收口为 **Wails 桌面编辑器**。如果未来恢复移动宿主或其他平台形态，需要单独设计，不属于本仓 README 的当前默认口径。

## 运行架构

```text
Wails Host
  -> app.go / main.go
  -> services/* 本地业务服务
  -> database/* SQLite schema + sqlc 查询
  -> wailsjs/go/main/App 前端桥接
  -> frontend/src/modules/writer 与 frontend/src/modules/ai
```

## 仓库地图

```text
Qingyu-Editor/
├── app.go / main.go          Wails 应用入口与绑定
├── database/                 SQLite schema、迁移与 sqlc 查询
├── services/                 本地业务服务与编排
├── frontend/                 Vue 3 前端宿主
├── build/                    Wails 打包模板与平台资源
├── docs/                     用户、开发与回归文档
├── storage/                  导入导出与文件侧能力
├── version/                  版本与快照相关实现
├── ai/                       AI 相关本地实现/适配
├── wails.json                Wails 构建配置
└── MODULE.md                 仓库级边界说明
```

如果你要继续细看前端结构，先读：

- [frontend/README.md](./frontend/README.md)
- [frontend/src/design-system/README.md](./frontend/src/design-system/README.md)
- [frontend/src/composables/README.md](./frontend/src/composables/README.md)
- [frontend/src/modules/writer/docs/README.md](./frontend/src/modules/writer/docs/README.md)

## 快速开始

### 环境要求

- Go `1.23+`
- Node.js `18+`
- npm `9+`
- Wails CLI `v2`

### 首次启动

```bash
cd Qingyu-Editor/frontend
npm install --legacy-peer-deps

cd ..
wails dev
```

### Windows 便捷启动

```powershell
.\dev-wails.ps1
```

如果你希望双击启动开发环境，可使用：

```bat
dev-wails.cmd
```

`dev-wails.ps1` 会检查 `wails` 与 `npm` 是否存在；若 `frontend/node_modules` 不存在，会自动执行 `npm install --legacy-peer-deps`。

## 常用命令

```bash
# Wails 桌面开发
wails dev

# 桌面构建
wails build

# 前端类型检查
cd frontend && npm run type-check

# 前端 Vitest
cd frontend && npm run test:vitest:run

# 前端 Playwright
cd frontend && npm run test:e2e

# Storybook
cd frontend && npm run storybook
```

## 开发约定

- 默认把本仓看作 **独立编辑器产品**，不是 `Qingyu_fronted` 的页面镜像。
- 前端真实业务 owner 在 `frontend/src/modules/writer` 与 `frontend/src/modules/ai`。
- 本地数据真相在 `database/schema.sql`、`database/queries/*.sql` 与 `services/*`，不要把持久化规则散回前端。
- Wails 暴露方法签名变更时，要同步检查前端 bridge、相关文档与回归路径。
- 若只是调整 UI 或工作台行为，优先复用 `frontend/src/design-system`，不要在业务页面复制一套基础控件。

## 文档入口

- [docs/user-guide.md](./docs/user-guide.md)：面向使用者的操作说明
- [docs/developer-guide.md](./docs/developer-guide.md)：本仓开发与调试入口
- [docs/creative-workflow-design.md](./docs/creative-workflow-design.md)：写作工作流与产品意图
- [docs/ux-regression-checklist.md](./docs/ux-regression-checklist.md)：交互回归清单
- [docs/regression-v0.1.0-beta.md](./docs/regression-v0.1.0-beta.md)：beta 回归记录
- [docs/release-notes-v0.1.0-beta.md](./docs/release-notes-v0.1.0-beta.md)：发布说明

## 当前状态

当前仍处于 `v0.1.0-beta` 收口期，重点不是再铺新宿主，而是把以下主链稳定下来：

- 写作主流程与正文工作区
- 工具面板和右栏协同
- AI provider 配置与工作台调用
- 本地数据链路与回归清单
- 工作台内置文档与接手入口
