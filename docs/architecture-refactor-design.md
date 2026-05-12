# Qingyu-Editor 架构重整设计

**日期**: 2026-05-09
**状态**: writer 核心收尾完成，持续演进
**范围**: Qingyu-Editor 全栈（Go 后端 + Vue 前端）
**目标**: 从"前端搬运 + 后端空壳"重整为"仅保留 writer 的独立桌面应用"

---

## 一、现状诊断

### 0.1 方向校正（2026-05-10）

这份设计需要先做一个方向修正：`Qingyu-Editor` 不应继续以“尽量兼容原在线系统”为前提，而应明确收敛为 **桌面写作宿主**。

新的硬边界如下：

- **运行时只服务 writer**：根入口、根路由、启动链只为写作工作区服务。
- **平台能力不是兼容保留，而是待隔离/待移除**：publish、revenue、statistics、community、reader、social、admin、notification、vip 等不再视为桌面主链能力。
- **桌面端唯一数据路径**：`writer -> data bridge -> Wails -> Go service -> SQLite/本地文件`。
- **显式兼容优先于隐式强绑**：`?test=true`、mock 数据、旧链接重定向可以保留，但只能作为显式兼容层，不能继续强制注入到桌面宿主启动链。
- **目标不是回放在线产品，而是维护一个简洁、可扩展的桌面编辑器**。

因此，后续实施优先级应从“补齐所有平台映射”调整为“先切断在线平台依赖，再收口 writer 内核”。

### 0.2 核心收尾落地（2026-05-12）

本轮 writer 架构收尾已把几个仍会默认回流远端 HTTP 的核心缺口收住：

- **运行时改为显式 remote opt-in**：`frontend/src/modules/writer/data-bridge/wails.ts` 新增 `isRemoteWriterMode()`；浏览器独立宿主默认视为本地 writer runtime，只有显式 `?remote=true` 才恢复远端联调语义。
- **启动链不再默认探测原后端**：`frontend/src/main.ts`、`frontend/src/utils/api-health.ts`、`frontend/src/utils/syncService.ts` 现在只在 `?remote=true` 时探测 `/api/v1/system/health` 或 `/health`；本地 bridge / standalone-local 宿主直接视为在线。
- **writer facade 默认 owner 收口到本地链路**：`api/document.ts` 已为本地/Wails 宿主补齐文档复制与重排；`api/wrapper.ts` 已把关键词检索收口为本地聚合匹配；`api/editor.ts` 已把字数统计收口为本地计算；`api/project.ts` 的统计刷新在本地宿主退化为本地一致性 no-op，不再默认打远端。
- **右侧设定区移除假动作**：`ToolRightPanel.vue` 已删除仅弹 `TODO` 的设定新建/编辑/删除按钮。当前右栏设定区明确是“只读速查 + 展开全屏 handoff”，直到 canonical owner 明确前不再伪装成本地 CRUD。

这意味着 writer 默认主链现在明确收敛为：

```text
writer workspace
  -> facade
    -> Wails bridge
    -> standalone-local
    -> 显式 ?remote=true 兼容路径
```

### 1.1 问题总览

从主仓迁移 writer 模块到独立编辑器时，做了"文件搬运"而非"架构适配"。结果是前端带了 240+ 文件过来，但后端只有一个 SQLite DDL 空壳。

| 层 | 现状 | 问题 |
|---|------|------|
| **Go 后端** | 5 张表 DDL + 2 个 Wails 方法 | CRUD 全缺，业务逻辑为零 |
| **数据桥** | 不存在 | 前端仍用 axios 调云端 REST API，桌面端根本没有后端服务 |
| **前端 API 层** | 24 个文件指向云端 | publish/revenue/statistics 等在桌面端全部无效 |
| **前端组件** | 164 个 Vue 组件 | 含大量平台专属组件（发布管理、收入统计、社交） |
| **编辑器** | editor/ + editor-new/ + v3/ 三套并存 | 无统一收口 |
| **巨型组件** | 多个 30-100KB 组件 | CharacterGraphView 104KB、ProjectWorkspace 52KB、AIPanel 43KB |

### 1.2 具体问题清单

#### P0：数据桥断裂（阻塞性）

前端 API 层（`src/modules/writer/api/`）全部通过 axios 调用云端 REST API。桌面端没有云端后端，这些 API 调用全部会失败。

```
当前：Vue 组件 → composable → api/*.ts → axios → 云端 REST API → MongoDB
需要：Vue 组件 → composable → data-bridge → Wails bindings → Go Service → SQLite
```

涉及的 24 个 API 文件中：

| 可复用（核心写作） | 需移除（平台专属） | 需重写（数据源切换） |
|---|---|---|
| document.ts | publish.ts | project.ts |
| editor.ts | revenue.ts | chapter.ts |
| outline.ts | statistics.ts | volume.ts |
| entities.ts | dashboard.ts | snapshot.ts |
| character.ts | batch-operation.ts | export.ts |
| concept.ts | template.ts | settings.ts |
| location.ts | story-harness.ts | ai.ts |
| timeline.ts | wrapper.ts | |

#### P1：Go 后端空壳

原始迁移时只有极少量 Wails 绑定；到 `2026-05-10`，当前实际已补到：

```go
func (a *App) InitDatabase() error
func (a *App) AICall(cfg ai.Config, prompt string, context string) (string, error)
func (a *App) CreateProject(input database.CreateProjectInput) (database.Project, error)
func (a *App) GetProject(id string) (database.Project, error)
func (a *App) ListProjects() ([]database.Project, error)
func (a *App) UpdateProject(id string, update database.ProjectUpdate) (database.Project, error)
func (a *App) DeleteProject(id string) error
func (a *App) CreateVolume(input database.CreateVolumeInput) (database.Volume, error)
func (a *App) ListVolumes(projectID string) ([]database.Volume, error)
func (a *App) UpdateVolume(id string, update database.VolumeUpdate) error
func (a *App) DeleteVolume(id string) error
func (a *App) ReorderVolumes(input database.ReorderVolumesInput) error
func (a *App) CreateChapter(input database.CreateChapterInput) (database.Chapter, error)
func (a *App) GetChapter(id string) (database.Chapter, error)
func (a *App) ListChapters(projectID string) ([]database.Chapter, error)
func (a *App) UpdateChapter(id string, update database.ChapterUpdate) (database.Chapter, error)
func (a *App) DeleteChapter(id string) error
func (a *App) ReorderChapters(input database.ReorderChaptersInput) error
func (a *App) MoveChapter(input database.MoveChapterInput) error
```

缺失的核心绑定：

- 项目 CRUD（Create/Get/List/Update/Delete）
- 章节 CRUD + 排序 + 移动
- 卷 CRUD
- 快照创建/恢复/删除
- 导出（Markdown/TXT/DOCX）
- 设置读写
- 统计查询

#### P2：前端死重

以下模块在桌面端完全无用，应移除或隔离：

| 模块 | 文件数 | 原因 |
|------|-------|------|
| `api/publish.ts` | 1 | 发布到平台，桌面端无平台 |
| `api/revenue.ts` | 1 | 收入统计，桌面端无财务 |
| `api/statistics.ts` | 1 | 平台统计，桌面端无平台数据 |
| `api/dashboard.ts` | 1 | 平台仪表板 |
| `views/PublishManagement.vue` | 1 | 发布管理页 |
| `views/RevenueView.vue` | 1 | 收入页 |
| `views/StatisticsView.vue` | 1 | 统计页 |
| `views/BecomeAuthor.vue` | 1 | 平台入驻页 |
| `components/publish/` | 8 | 发布相关组件 |
| `components/digital-atelier/` | 2 | 数字工作室（平台功能） |
| `stores/v3/storyHarnessStore.ts` | 1 | 半成品，未接入 |

#### P3：巨型组件

| 组件 | 大小 | 职责 |
|------|------|------|
| `CharacterGraphView.vue` | 104KB | 图谱渲染 + 数据加载 + 交互逻辑 + UI 全部耦合 |
| `ProjectWorkspace.vue` | 52KB | 项目宿主 + 事件桥接 + 路由协调 + 状态装配 |
| `AIPanel.vue` | 43KB | 对话 + 工具面板 + 上下文 + 结果渲染 |
| `EncyclopediaView.vue` | 28KB | 分类列表 + 详情 + 搜索 + CRUD |
| `AIWorkbench.vue` | 27KB | AI 工作台 + 多工具集成 |
| `StoryBranchView.vue` | 30KB | 故事分支可视化 |

#### P4：编辑器多版本

| 目录 | 状态 | 说明 |
|------|------|------|
| `components/editor/` | 旧版 | MarkdownEditor + 旧版 AI 集成 |
| `components/editor-new/` | 过渡 | TipTapEditorView，已是主力 |
| `components/v3/` | 半成品 | Story Harness 集成，未完成 |

---

## 二、目标架构

### 2.0 桌面化目标

桌面版目标架构应比当前文档更强硬：

```text
App Shell（桌面宿主）
  -> writer routes
    -> ProjectWorkspace
      -> WorkspaceShell / Editor / Right Panel / Overlay
        -> writer stores & composables
          -> data-bridge/wails
            -> Go services
              -> SQLite / 本地文件 / AI provider
```

不再保留以下运行时前提：

- 全局 auth session
- websocket 页面守卫
- 在线平台 test-mode 强制注入
- 书城/社区/财务/用户中心等平台导航壳

保留项仅限于：

- 旧 writer 链接兼容重定向
- 显式 `?test=true` 的 mock fallback
- 仍未完成 Wails 化的 writer 内部临时桥接

### 2.1 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                    Vue 3 前端                            │
│                                                         │
│  views/           → 页面级组件（路由入口）                 │
│  components/      → UI 组件（纯展示 + 交互）              │
│  composables/     → 业务逻辑（状态编排 + 数据桥调用）      │
│  stores/          → 全局状态（Pinia）                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                 Data Bridge 层                           │
│                                                         │
│  data-bridge/     → Wails 调用封装 + 类型映射             │
│  api/             → 接口抽象（可切换 Wails/HTTP 后端）     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                Wails Bindings（自动生成）                  │
│                    wailsjs/go/main/App.js                │
├─────────────────────────────────────────────────────────┤
│                   Go 后端                                │
│                                                         │
│  app.go           → Wails 绑定入口                       │
│  services/        → 业务逻辑层（CRUD + 业务规则）         │
│  database/        → SQLite 数据访问层                    │
│  ai/              → AI 提供商抽象                        │
│  storage/         → 文件导出                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
Vue 组件
  → composable（业务编排）
    → store（状态管理）
      → data-bridge（Wails 调用封装）
        → wailsjs/go/main/App（自动生成的 JS 桥）
          → Go App 方法
            → Go Service（业务逻辑）
              → SQLite（数据持久化）
```

### 2.3 与主仓的关系

| 层 | 主仓 | Editor | 共享策略 |
|---|------|--------|---------|
| UI 组件 | Vue + Element Plus | Vue + 设计系统 | 设计系统共享，业务组件独立 |
| 业务逻辑 | composables | composables | 接口契约共享，实现独立 |
| 数据源 | axios → REST API → MongoDB | data-bridge → Wails → SQLite | 后端无关的接口抽象 |
| AI | 后端 gRPC → AI Service | 直连 AI Provider | Provider 抽象共享 |

---

## 三、Go 后端重整

### 3.1 目录结构（目标）

```
Qingyu-Editor/
├── main.go                    # Wails 入口
├── app.go                     # Wails 绑定入口
├── services/                  # 业务逻辑层（新增）
│   ├── project_service.go     # 项目 CRUD + 统计
│   ├── chapter_service.go     # 章节 CRUD + 排序 + 字数统计
│   ├── volume_service.go      # 卷 CRUD + 排序
│   ├── snapshot_service.go    # 快照创建/恢复/删除/对比
│   ├── export_service.go      # Markdown/TXT/DOCX 导出
│   ├── settings_service.go    # 应用设置读写
│   └── stats_service.go       # 写作统计查询
├── database/                  # 数据访问层
│   ├── db.go                  # 数据库连接管理（嵌入 schema.sql 执行迁移）
│   ├── models.go              # Wails/前端消费的数据模型定义
│   ├── schema.sql             # SQLite schema 真相源
│   ├── queries/               # sqlc 查询定义
│   └── sqlc/                  # sqlc 生成查询代码
├── sqlc.yaml                  # sqlc 生成配置
├── ai/                        # AI 提供商
│   ├── provider.go            # 接口定义
│   ├── openai.go              # OpenAI 实现
│   └── anthropic.go           # Anthropic 实现
├── storage/                   # 文件导出
│   └── exporter.go            # 导出实现
└── frontend/                  # Vue 前端
```

### 3.2 Wails 绑定清单

```go
// === 项目管理 ===
CreateProject(title, description string) (Project, error)
GetProject(id string) (Project, error)
ListProjects() ([]Project, error)
UpdateProject(id string, data ProjectUpdate) (Project, error)
DeleteProject(id string) error

// === 卷管理 ===
CreateVolume(projectId, title string) (Volume, error)
ListVolumes(projectId string) ([]Volume, error)
UpdateVolume(id string, data VolumeUpdate) error
DeleteVolume(id string) error
ReorderVolumes(projectId string, orderedIds []string) error

// === 章节管理 ===
CreateChapter(projectId, volumeId, title string) (Chapter, error)
GetChapter(id string) (Chapter, error)
ListChapters(projectId string) ([]Chapter, error)
UpdateChapter(id string, data ChapterUpdate) (Chapter, error)
DeleteChapter(id string) error
ReorderChapters(volumeId string, orderedIds []string) error
MoveChapter(chapterId, targetVolumeId string, targetIndex int) error

// === 快照 ===
CreateSnapshot(chapterId, label, trigger string) (Snapshot, error)
ListSnapshots(projectId string, chapterId *string) ([]Snapshot, error)
RestoreSnapshot(snapshotId string) (Chapter, error)
DeleteSnapshot(id string) error

// === 导出 ===
ExportProject(projectId string, format string, outputPath string) error
ExportChapter(chapterId string, format string, outputPath string) error

// === 设置 ===
GetSetting(key string) (string, error)
SetSetting(key, value string) error
GetAllSettings() (map[string]string, error)

// === 统计 ===
GetProjectStats(projectId string) (ProjectStats, error)
GetWordCountHistory(projectId string, days int) ([]WordCountEntry, error)

// === AI（已有） ===
AICall(cfg AIConfig, prompt string, context string) (string, error)
```

### 3.3 SQLite Schema 扩展

现有 5 张表需扩展，新增 2 张表：

```sql
-- 新增：实体表（角色/物品/地点/组织/概念）
CREATE TABLE entities (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,      -- character/item/location/organization/concept
    name        TEXT NOT NULL,
    attributes  TEXT DEFAULT '{}',  -- JSON
    relations   TEXT DEFAULT '[]',  -- JSON
    sort_order  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 新增：灵感表
CREATE TABLE inspirations (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    content     TEXT DEFAULT '',
    tags        TEXT DEFAULT '[]',  -- JSON
    chapter_id  TEXT,               -- 可选关联章节
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.4 数据模型（Go structs）

```go
// models.go
type Project struct {
    ID          string `json:"id"`
    Title       string `json:"title"`
    Description string `json:"description"`
    CoverPath   string `json:"coverPath"`
    WordCount   int    `json:"wordCount"`
    Status      string `json:"status"`
    CreatedAt   string `json:"createdAt"`
    UpdatedAt   string `json:"updatedAt"`
}

type Chapter struct {
    ID        string `json:"id"`
    ProjectID string `json:"projectId"`
    VolumeID  string `json:"volumeId"`
    Title     string `json:"title"`
    Content   string `json:"content"`     // TipTap JSON
    PlainText string `json:"plainText"`
    WordCount int    `json:"wordCount"`
    SortOrder int    `json:"sortOrder"`
    Status    string `json:"status"`
    CreatedAt string `json:"createdAt"`
    UpdatedAt string `json:"updatedAt"`
}

type ChapterUpdate struct {
    Title   *string `json:"title,omitempty"`
    Content *string `json:"content,omitempty"`
    Status  *string `json:"status,omitempty"`
}

// ... 其余模型类似
```

---

## 四、前端 Data Bridge 层

### 4.1 设计原则

Data Bridge 是前端与 Wails 后端之间的适配层：

- **接口抽象**：composable 不直接调用 Wails，而是调用 data-bridge 提供的接口
- **类型安全**：所有 Go struct 在 TypeScript 端有对应的类型定义
- **桌面优先**：默认以 Wails 为唯一真实后端；HTTP 只作为 `?test=true` 或尚未迁完链路的显式兼容 fallback，不再把“平台回流”作为架构前提

### 4.4 前端清理优先级（修正版）

在桌面宿主里，前端清理顺序应重排为四层，而不是继续按“在线系统平移”思路扩张：

#### Phase A：入口层去平台化

目标：

- `main.ts` 不再强制注入 auth/mock session/websocket 语义
- `router/guards.ts` 收口为桌面最小守卫
- `writer/routes.ts` 去掉 `requiresAuth`

退出条件：

- 应用启动无需登录态
- 根路由只承载 writer desktop
- 显式 `?test=true` 仍可保留

#### Phase B：writer 内部泄漏点收口

目标：

- 去掉 `useChapterManager` 对 auth / publish bridge 的强耦合
- 让 `workspaceMock` 不再依赖书城 Demo 数据
- 抽离 `QyTipTapEditor` 的本地上传 owner，停止直连在线 storage API

退出条件：

- writer mock 与 writer runtime 不再依赖 bookstore / workflow / shared online storage

#### Phase C：物理模块隔离与归档

目标：

- 先做引用面盘点，再归档/删除非 writer 模块与非 writer store
- 用当前 git 提交作为恢复基线，避免误删

优先对象：

- `frontend/src/modules/admin`
- `bookstore`
- `community`
- `reader`
- `social`
- `finance`
- `notification`
- `vip`
- `workflow`
- 根级 `frontend/src/stores` 非 writer store

退出条件：

- 根入口与 writer 主链不再依赖这些模块
- 物理目录完成归档或删除，并有可恢复基线

当前进展（2026-05-10）：

- 已完成第一批物理清理，恢复基线为 commit `be4d59e` / tag `backup/editor-desktop-predelete-20260510`
- 已从 `frontend/src` 物理移除非 writer 运行时模块：`achievement / admin / announcements / booklist / bookstore / community / discovery / finance / notification / reader / reading-stats / recommendation / review / reward / shared / social / system / user / vip / workflow`
- 已同步移除根级非 writer store、旧 `MainLayout/AdminLayout`、demo 页面、旧测试模式拦截器，以及不再服务桌面写作宿主的零散公共壳
- `main.ts` 不再初始化冗余的全局测试模式拦截器；`?test=true` 兼容继续由 writer mock 路径和 `http.service` 内的 `mock-data-manager` 承接
- 当前 `npm run type-check` 与 writer 定向测试已通过，说明桌面主链已能脱离这些历史平台模块继续运行
- 已完成第二批 writer 内部孤岛清理：移除了旧 `components/ai/*`、模板工作流组件、废弃 `OutlineView*`、旧 `WorkspaceFullscreenOverlay` 与一批不再接入主链的 legacy editor 组件
- 当前桌面主链仍稳定落在 `ProjectWorkspace -> WorkspaceShell -> EditorLayout / WorkspaceToolOverlay / WorkspaceRightPanel / StoryHarness`，后续收口应继续围绕这条链，而不是恢复历史平台页

#### Phase D：writer 内核继续瘦身

目标：

- 评估 `storyHarness`、`batchOperationStore`、旧 `editor/` 与 `v3/` 残留
- 保留仍属于桌面写作闭环的能力，移除只属于历史平台实验的半成品

退出条件：

- writer 内部只保留清晰的桌面产品语义
- 组件与 store 结构能支撑后续长期维护

#### Phase E：数据桥现状校正（2026-05-10）

现状复核后，原文档里的 `Phase 0 / Phase 1` 需要校正：

- `app.go`、`services/project_service.go`、`services/volume_service.go`、`services/chapter_service.go` 已经不是“空壳”，项目/卷/章节的本地 CRUD 与排序绑定已存在
- `frontend/src/modules/writer/data-bridge/wails.ts` 已落地，且 `api/project.ts`、`api/document.ts`、`api/editor.ts` 已经是 **Wails 优先、HTTP fallback** 模式
- `frontend/src/modules/writer/api/outline.ts` 已开始并入本地主链：桌面端默认从本地文档树派生大纲树，卷/章节型节点的增删改也优先委托 Wails 文档桥
- `frontend/src/modules/writer/api/entities.ts` 与 `api/concept.ts` 已改为 **桌面显式降级**：本地运行时不再默认请求在线统一实体/概念接口；列表读取降级为空集，写操作显式报“待本地化”
- `frontend/src/modules/writer/api/timeline.ts` 已改为 **桌面显式降级**：本地运行时不再默认请求在线时间线接口；读取降级为空列表，写操作显式提示“待本地化”
- `frontend/src/modules/writer/api/character.ts` 与 `api/location.ts` 已完成 **Wails-first 本地化**：当前桌面端角色/地点 CRUD 与关系读写默认走 `data-bridge/wails.ts -> App bindings -> Go services -> SQLite`，不再把在线接口当成默认真相源
- Go 侧已补第一批资产 owner：`Character / CharacterRelation / Location / LocationRelation` 的 schema、service 与 Wails 绑定均已存在；当前位置可以继续在此基础上补 `entities / concept / timeline`
- 真正未完成的不是“从零建立 data bridge”，而是 **把仍然直连在线 REST 的 writer 能力继续收口，直到桌面主链不再依赖远端接口**

修正后的实施优先级应为：

1. **保住已跑通的本地主链**：`project / document / editor` 继续以 Wails-first 为准，不再重做一层泛化“可切换多后端”抽象
2. **只迁当前运行态需要的 API**：优先 `outline / entities / character / concept / location / timeline`，因为它们仍被 `ProjectWorkspace`、overlay 与右栏资产速查直接使用
3. **把 HTTP writer API 视为兼容债务，而不是长期架构**：`story-harness / export / template / batch-operation / generated writer wrapper` 若不服务当前桌面主链，应继续裁撤；若服务主链，则迁到本地 owner。`search keywords / duplicate / word-count / health check` 这类默认工作区能力已完成本轮收口，不再允许回流成默认远端路径
4. **mock 只做显式兼容层**：`?test=true` 与 `mock-data-manager` 继续保留，但不允许再次成为默认数据源

### 4.2 目录结构

```
frontend/src/
├── data-bridge/                    # 数据桥层（新增）
│   ├── index.ts                    # 统一导出
│   ├── types.ts                    # Go 模型对应的 TS 类型
│   ├── project.ts                  # 项目数据操作
│   ├── chapter.ts                  # 章节数据操作
│   ├── volume.ts                   # 卷数据操作
│   ├── snapshot.ts                 # 快照数据操作
│   ├── export.ts                   # 导出操作
│   ├── settings.ts                 # 设置操作
│   ├── stats.ts                    # 统计查询
│   └── ai.ts                       # AI 调用（封装现有 Wails 绑定）
```

### 4.3 实现示例

```typescript
// data-bridge/chapter.ts
import { CreateChapter, UpdateChapter, DeleteChapter } from '../../wailsjs/go/main/App'
import type { Chapter, ChapterUpdate } from './types'

export const chapterBridge = {
  async create(projectId: string, volumeId: string, title: string): Promise<Chapter> {
    return CreateChapter(projectId, volumeId, title)
  },

  async get(id: string): Promise<Chapter> {
    return GetChapter(id)
  },

  async list(projectId: string): Promise<Chapter[]> {
    return ListChapters(projectId)
  },

  async update(id: string, data: ChapterUpdate): Promise<Chapter> {
    return UpdateChapter(id, data)
  },

  async delete(id: string): Promise<void> {
    return DeleteChapter(id)
  },

  async reorder(volumeId: string, orderedIds: string[]): Promise<void> {
    return ReorderChapters(volumeId, orderedIds)
  },

  async move(chapterId: string, targetVolumeId: string, targetIndex: number): Promise<void> {
    return MoveChapter(chapterId, targetVolumeId, targetIndex)
  },
}
```

### 4.4 composable 如何使用

```typescript
// composables/useChapterManager.ts（改造后）

import { chapterBridge } from '@/data-bridge'
import { useChapterStore } from '@/modules/writer/stores/chapterStore'

export function useChapterManager() {
  const store = useChapterStore()

  async function createChapter(projectId: string, volumeId: string, title: string) {
    const chapter = await chapterBridge.create(projectId, volumeId, title)
    store.addChapter(chapter)
    return chapter
  }

  async function saveChapter(id: string, content: string) {
    const plainText = extractPlainText(content)
    const wordCount = countWords(plainText)
    const chapter = await chapterBridge.update(id, {
      content,
      plainText,
      wordCount,
    })
    store.updateChapter(chapter)
    return chapter
  }

  // ... 其他方法
}
```

---

## 五、前端模块清理

### 5.1 移除清单

以下文件/目录应从 Editor 中移除（归档到 `_archive/` 而非删除）：

| 路径 | 类型 | 原因 |
|------|------|------|
| `modules/writer/api/publish.ts` | 文件 | 平台发布，桌面端无平台 |
| `modules/writer/api/revenue.ts` | 文件 | 平台收入，桌面端无财务 |
| `modules/writer/api/statistics.ts` | 文件 | 平台统计，桌面端无数据 |
| `modules/writer/api/dashboard.ts` | 文件 | 平台仪表板 |
| `modules/writer/api/batch-operation.ts` | 文件 | 批量操作，依赖平台 API |
| `modules/writer/api/wrapper.ts` | 文件 | API 包装器，平台专属 |
| `modules/writer/api/story-harness.ts` | 文件 | 半成品 CLI 集成 |
| `modules/writer/views/PublishManagement.vue` | 文件 | 平台发布管理 |
| `modules/writer/views/RevenueView.vue` | 文件 | 平台收入页 |
| `modules/writer/views/StatisticsView.vue` | 文件 | 平台统计页 |
| `modules/writer/views/BecomeAuthor.vue` | 文件 | 平台入驻页 |
| `modules/writer/views/DigitalAtelierView.vue` | 文件 | 数字工作室（平台功能） |
| `modules/writer/components/publish/` | 目录 | 发布组件（8个文件） |
| `modules/writer/components/digital-atelier/` | 目录 | 数字工作室组件 |
| `modules/writer/stores/v3/` | 目录 | 半成品 Story Harness 集成 |
| `modules/writer/components/v3/` | 目录 | 半成品 v3 组件 |

**预估移除**：约 30 个文件，减少 ~8000 行代码。

### 5.2 重写清单

以下 API 文件仍需继续收口；其中前 3 项已进入 **Wails 优先 + HTTP fallback** 状态，其余仍主要是 axios/在线接口：

| 文件 | 改造方式 |
|------|---------|
| `api/project.ts` | → 已接 Wails/standalone-local 优先桥；默认本地宿主不再请求远端 statistics refresh |
| `api/editor.ts` | → 已接 Wails/standalone-local 优先桥；字数统计已收口为本地计算 |
| `api/document.ts` | → 已接 Wails/standalone-local 优先桥；复制与重排已补本地 owner |
| `api/outline.ts` | → 重写为 data-bridge 调用 |
| `api/entities.ts` | → 重写为 data-bridge 调用 |
| `api/character.ts` | → 重写为 data-bridge 调用 |
| `api/concept.ts` | → 重写为 data-bridge 调用 |
| `api/location.ts` | → 重写为 data-bridge 调用 |
| `api/timeline.ts` | → 重写为 data-bridge 调用 |
| `api/export.ts` | → 评估是否保留；若保留则改为本地导出 owner |
| `api/template.ts` | → 移除远程模板，改为本地模板或直接删除 |

### 5.3 巨型组件分解

#### ProjectWorkspace.vue (52KB → 拆为 5 个)

| 原职责 | 目标组件 | 预估大小 |
|--------|---------|---------|
| 项目宿主 + 生命周期 | ProjectWorkspace.vue | ~5KB |
| 章节树 + 导航 | WorkspaceLeftPanel.vue | ~8KB（已有） |
| 编辑器内容区 | WorkspaceEditorContent.vue | ~5KB（已有） |
| AI 事件桥接 | useAIEventBridge.ts | ~3KB（composable） |
| 数据装配 | useWorkspaceData.ts | ~5KB（composable） |

#### AIPanel.vue (43KB → 拆为 4 个)

| 原职责 | 目标组件 | 预估大小 |
|--------|---------|---------|
| 面板容器 + 路由 | AIPanel.vue | ~5KB |
| 聊天消息列表 | AIChatMessages.vue | ~15KB（已有） |
| 输入区域 | AIInputArea.vue | ~8KB（已有） |
| 结果卡片渲染 | AIResultCards.vue | ~10KB（新建） |

#### CharacterGraphView.vue (104KB → 拆为 4 个)

| 原职责 | 目标组件 | 预估大小 |
|--------|---------|---------|
| 图谱容器 + 数据加载 | CharacterGraphView.vue | ~10KB |
| 力导向图渲染 | ForceGraphRenderer.vue | ~30KB（新建） |
| 节点/边交互 | GraphInteraction.ts | ~20KB（composable） |
| 实体详情面板 | EntityDetailDrawer.vue | ~15KB（新建） |

### 5.4 编辑器统一

收口三套编辑器为一套：

| 目录 | 动作 |
|------|------|
| `components/editor/` | 移除旧版 MarkdownEditor，保留有用的工具组件 |
| `components/editor-new/` | **收口为正式版**，TipTapEditorView 作为唯一编辑器 |
| `components/v3/` | 移除半成品，后续按创作流程设计重新实现 |

---

## 六、Store 重整

### 6.1 现有 Store 职责梳理

| Store | 大小 | 职责 | 动作 |
|-------|------|------|------|
| writerStore | 49KB | 项目/章节/AI/角色/时间线全堆在一起 | **拆分** |
| editorStore | 17KB | 编辑器状态 + 当前章节 + 保存状态 | **保留，瘦身** |
| chapterStore | 6.5KB | 章节树 | 保留 |
| documentStore | 4.3KB | 文档内容 | 保留 |
| projectStore | 2.9KB | 项目列表 | 保留 |
| workspaceLayoutStore | — | 工作区布局 | 保留 |
| panelStore | 2.9KB | 面板状态 | 保留 |
| batchOperationStore | 6.5KB | 批量操作 | **移除**（平台功能） |
| editorThemeStore | 2.2KB | 编辑器主题 | 保留 |
| aiStore | 914B | AI 状态 | 保留 |
| worldStore | 2KB | 世界观 | **迁移到 entities 统一管理** |
| storyHarnessStore | 8KB | Story Harness | **移除**（半成品） |

### 6.2 writerStore 拆分方案

当前 writerStore 是一个 49KB 的巨型 store，承担了太多职责。应拆分为：

```
writerStore (49KB)
  → projectStore     — 项目元数据（已有）
  → chapterStore     — 章节数据（已有，扩展）
  → editorStore      — 编辑器状态（已有，瘦身）
  → entityStore      — 实体管理（新建，统一角色/物品/地点/组织）
  → aiStore          — AI 状态（已有，扩展）
  → outlineStore     — 大纲数据（新建）
  → foreshadowStore  — 伏笔追踪（新建，后续 Wave）
  → inspirationStore — 灵感数据（新建，后续 Wave）
```

拆分后每个 store 控制在 5-10KB。

### 6.3 Store 与 Data Bridge 的关系

```
Store（状态缓存 + 响应式）
  ↕ 双向同步
Data Bridge（Wails 调用封装）
  ↕ 单向调用
Go Service（业务逻辑）
  ↕
SQLite（持久化）
```

- **读**：Go → Data Bridge → Store → Component
- **写**：Component → Store → Data Bridge → Go → SQLite → 返回更新 → Store 刷新
- **缓存**：Store 作为前端缓存层，避免每次操作都调用 Wails

---

## 七、实施阶段

### Phase 0：Go Service Layer（已部分完成，继续补齐）

**目标**：在现有 `project / volume / chapter` 基础上继续补齐 Wails 后端 CRUD

**任务**：
1. 保留已落地的 `project_service / volume_service / chapter_service`
2. 继续补 `snapshot / export / settings / stats` 等缺失 service
3. 在 `app.go` 中继续补齐对应 Wails 绑定
4. 补充 `database/models.go` 类型定义
5. 当前已改为 `database/schema.sql + sqlc.yaml + database/queries/*.sql` 管理 schema 与查询；`db.go` 通过 embed 执行迁移
6. 实现 Anthropic provider

**验收标准**：
- [ ] 前端通过 Wails 绑定可完成项目/章节/卷/快照的完整 CRUD
- [ ] AI 调用支持 OpenAI + Anthropic
- [ ] 导出功能支持 Markdown + TXT

### Phase 1：Data Bridge + 前端 API 重写

**目标**：扩展现有数据桥，继续减少 writer 主链对 HTTP/在线 REST 的依赖

**任务**：
1. 在现有 `data-bridge/wails.ts` 基础上补 `outline / entities / export / settings / stats`
2. 将当前桌面运行链仍会触发的 writer API 切到 Wails-first
3. 把只服务在线平台的 API 直接删除，而不是继续为其补桌面兼容层
4. 等 `api/wrapper.ts` / `generated/writer.ts` 的唯一调用者迁完后，再删除这层在线契约残留

**验收标准**：
- [ ] 编辑器可正常打开项目、切换章节、编辑正文、自动保存
- [ ] 快照功能正常工作
- [ ] 导出功能正常工作
- [ ] 当前桌面默认工作区的所有核心操作通过 Wails bindings 完成

### Phase 2：前端清理 + 组件分解

**目标**：移除死重，分解巨型组件

**任务**：
1. 归档平台专属代码（~30 文件 → `_archive/`）
2. 分解 ProjectWorkspace.vue
3. 分解 AIPanel.vue
4. 分解 CharacterGraphView.vue
5. 统一编辑器（收口到 TipTapEditorView）
6. 移除 editor/ 和 v3/ 旧代码

**验收标准**：
- [ ] 无平台专属代码残留
- [ ] 无超过 20KB 的 Vue 组件
- [ ] 单一编辑器入口（TipTap）

### Phase 3：Store 拆分 + 新数据模型接入

**目标**：拆分 writerStore，接入实体和灵感数据

**任务**：
1. 拆分 writerStore 为 6 个独立 store
2. 新增 entities 表 + inspiration 表的 Go service
3. 新增 entityStore + inspirationStore
4. Data Bridge 扩展实体和灵感模块

**验收标准**：
- [ ] 每个 store 不超过 10KB
- [ ] 可创建/编辑/删除实体（角色/物品/地点/组织）
- [ ] 可创建/编辑/删除灵感卡片

### Phase 4：创作流程集成

**目标**：按 `docs/creative-workflow-design.md` 接入五阶段和 Gate 机制

**任务**：
1. 实现 Gate 状态机（TypeScript 端）
2. SQLite 新增 gate_status 表
3. Go 端新增 Gate 检查服务
4. 前端左侧步骤条 UI
5. Next Actions 面板

**验收标准**：
- [ ] draft_gate 和 review_gate 正常工作
- [ ] 左侧步骤条显示五阶段状态
- [ ] Next Actions 面板显示阻塞项和建议

---

## 八、文件变更估算

### Go 后端（新增）

| 文件 | 类型 | 说明 |
|------|------|------|
| `services/project_service.go` | 新增 | 项目 CRUD |
| `services/chapter_service.go` | 新增 | 章节 CRUD + 排序 |
| `services/volume_service.go` | 新增 | 卷 CRUD |
| `services/snapshot_service.go` | 新增 | 快照管理 |
| `services/export_service.go` | 新增 | 导出实现 |
| `services/settings_service.go` | 新增 | 设置管理 |
| `services/stats_service.go` | 新增 | 统计查询 |
| `database/models.go` | 新增 | 数据模型 |
| `database/schema.sql` | 已落地 | Schema 真相源 |
| `database/queries/*.sql` | 已落地 | sqlc 查询定义 |
| `database/sqlc/*.go` | 已落地 | sqlc 生成查询代码 |
| `sqlc.yaml` | 已落地 | sqlc 生成配置 |

### 前端（新增）

| 文件/目录 | 类型 | 说明 |
|-----------|------|------|
| `data-bridge/` | 新增目录 | 9 个文件，数据桥层 |
| `stores/entityStore.ts` | 新增 | 实体管理 |
| `stores/outlineStore.ts` | 新增 | 大纲管理 |
| `stores/inspirationStore.ts` | 新增 | 灵感管理 |
| `stores/gateStore.ts` | 新增 | Gate 状态机 |
| `composables/useAIEventBridge.ts` | 新增 | AI 事件桥 |
| `composables/useWorkspaceData.ts` | 新增 | 工作区数据装配 |
| `components/workspace/ForceGraphRenderer.vue` | 新增 | 图谱渲染 |
| `components/workspace/EntityDetailDrawer.vue` | 新增 | 实体详情 |
| `components/workspace/AIResultCards.vue` | 新增 | AI 结果卡片 |

### 前端（移除/归档）

| 文件/目录 | 数量 | 原因 |
|-----------|------|------|
| `api/publish.ts` 等 11 个 API | 11 | 平台专属 |
| `views/PublishManagement.vue` 等 5 个页面 | 5 | 平台专属 |
| `components/publish/` | 8 | 发布组件 |
| `components/digital-atelier/` | 2 | 平台功能 |
| `components/v3/` | 4 | 半成品 |
| `stores/v3/` | 1 | 半成品 |
| **合计** | **~31** | — |

### 前端（重写/修改）

| 文件 | 改动量 | 说明 |
|------|-------|------|
| `app.go` | 大 | 暴露所有新绑定 |
| `stores/writerStore.ts` | 大 | 拆分到 6 个 store |
| `composables/useChapterManager.ts` | 中 | 改用 data-bridge |
| `composables/useAIContext.ts` | 中 | 改用 data-bridge |
| `views/ProjectWorkspace.vue` | 大 | 分解为 composable + 子组件 |
| `components/ai/AIPanel.vue` | 大 | 分解为子组件 |
| `views/CharacterGraphView.vue` | 大 | 分解为子组件 |

---

## 九、风险与约束

1. **Phase 0 是全局阻塞项** — Go Service Layer 不完成，后续所有前端工作都无法推进
2. **数据迁移** — 现有 SQLite 数据（如果有用户正在使用）需要兼容迁移脚本
3. **Wails 代码生成** — Go 方法签名变更后需重新 `wails generate`，前端类型才会更新
4. **AI Provider 兼容** — Anthropic provider 需实现不同于 OpenAI 的消息格式
5. **大型组件分解需谨慎** — ProjectWorkspace 涉及大量事件桥接，拆分时需保证功能不回归
6. **writerStore 拆分影响面广** — 几乎所有 composable 都引用 writerStore，需逐一迁移引用路径
