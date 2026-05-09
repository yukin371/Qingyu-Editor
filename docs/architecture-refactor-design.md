# Qingyu-Editor 架构重整设计

**日期**: 2026-05-09
**状态**: 设计中
**范围**: Qingyu-Editor 全栈（Go 后端 + Vue 前端）
**目标**: 从"前端搬运 + 后端空壳"重整为"数据桥驱动的独立桌面应用"

---

## 一、现状诊断

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

当前 Wails 绑定只有：

```go
func (a *App) InitDatabase() error
func (a *App) AICall(cfg ai.Config, prompt string, context string) (string, error)
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
│   ├── db.go                  # 数据库连接管理
│   ├── models.go              # 数据模型定义
│   └── migrations.go          # Schema 迁移管理
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
- **可切换**：未来可切换为 HTTP 后端（平台回流时），只需替换 data-bridge 实现

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

以下 API 文件需要重写，数据源从 axios → Wails bindings：

| 文件 | 改造方式 |
|------|---------|
| `api/project.ts` | → 重写为 data-bridge 调用 |
| `api/editor.ts` | → 重写，移除 axios 依赖 |
| `api/document.ts` | → 重写为 data-bridge 调用 |
| `api/outline.ts` | → 重写为 data-bridge 调用 |
| `api/entities.ts` | → 重写为 data-bridge 调用 |
| `api/character.ts` | → 重写为 data-bridge 调用 |
| `api/concept.ts` | → 重写为 data-bridge 调用 |
| `api/location.ts` | → 重写为 data-bridge 调用 |
| `api/timeline.ts` | → 重写为 data-bridge 调用 |
| `api/export.ts` | → 重写为 Wails 导出调用 |
| `api/template.ts` | → 移除远程模板，改为本地模板 |

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

### Phase 0：Go Service Layer（阻塞后续所有前端工作）

**目标**：补齐 Wails 后端 CRUD

**任务**：
1. 创建 `services/` 目录和 6 个 service 文件
2. 为每个 service 实现 CRUD 方法
3. 在 `app.go` 中暴露所有 Wails 绑定
4. 补充 `database/models.go` 类型定义
5. 补充 `database/migrations.go` schema 管理
6. 实现 Anthropic provider

**验收标准**：
- [ ] 前端通过 Wails 绑定可完成项目/章节/卷/快照的完整 CRUD
- [ ] AI 调用支持 OpenAI + Anthropic
- [ ] 导出功能支持 Markdown + TXT

### Phase 1：Data Bridge + 前端 API 重写

**目标**：建立数据桥，前端切换到 Wails 调用

**任务**：
1. 创建 `data-bridge/` 目录和类型定义
2. 实现所有 data-bridge 模块（project/chapter/volume/snapshot/export/settings/stats/ai）
3. 重写现有 composables 使用 data-bridge 替代 axios
4. 移除 `api/` 目录中指向云端的所有文件

**验收标准**：
- [ ] 编辑器可正常打开项目、切换章节、编辑正文、自动保存
- [ ] 快照功能正常工作
- [ ] 导出功能正常工作
- [ ] 所有操作通过 Wails bindings 完成，无 axios 调用

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
| `database/migrations.go` | 新增 | Schema 迁移 |

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
