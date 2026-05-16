# 工具面板统一

**日期**: 2026-03-29
**状态**: 已完成

## 目标

将分散的写作辅助工具整合为统一的工具面板，通过快捷键快速访问。

## 架构

```
┌─────────────────────────────────────────────────────────┐
│  WorkspaceToolOverlay (全屏工具面板)                    │
├────────┬────────────────────────────────────────────────┤
│ ToolSidebar │              工具内容区                    │
│ [关系图谱] │  CharacterGraphView / TimelineOutlineView │
│ [时间线]   │  StoryBranchView / StructureStageView     │
│ [故事分支] │                                                │
│ [结构舞台] │                                                │
└────────┴────────────────────────────────────────────────┘
```

## 核心组件

| 组件                       | 文件                                                | 职责                                          |
| -------------------------- | --------------------------------------------------- | --------------------------------------------- |
| `useToolOverlay`           | `composables/useToolOverlay.ts`                     | overlay 状态管理                              |
| `useWorkspaceShortcuts`    | `composables/useWorkspaceShortcuts.ts`              | 基于 action id 分发工作区快捷键               |
| `workspaceShortcutActions` | `composables/workspaceShortcutActions.ts`           | 统一维护 workspace action id 与默认快捷键定义 |
| `WorkspaceToolOverlay`     | `components/workspace/WorkspaceToolOverlay.vue`     | 容器组件                                      |
| `ToolSidebar`              | `components/workspace/tool-overlay/ToolSidebar.vue` | 侧边栏切换器                                  |

## 快捷键

| 快捷键             | 功能             | 配置 ID                |
| ------------------ | ---------------- | ---------------------- |
| `Ctrl/Cmd+G`       | 打开最近一次工具 | `tool.open`            |
| `Ctrl/Cmd+Shift+G` | 打开关系图谱     | `tool.switchRelations` |
| `Ctrl/Cmd+Shift+T` | 打开时间线       | `tool.switchTimeline`  |
| `Ctrl/Cmd+Shift+B` | 打开故事分支     | `tool.switchBranches`  |
| `Ctrl/Cmd+Shift+S` | 打开结构舞台     | `tool.switchStructure` |
| `Esc`              | 关闭工具面板     | -                      |

主编辑区不再直接接管这些工具视图；即便通过旧 `tool=encyclopedia&encyclopediaView=*` deep-link 进入，工作区也会自动拉起 overlay，并把主路由收回写作态。

快捷键可通过 `useShortcutConfig` 自定义；`useToolOverlay` 本身不再硬编码按键，只暴露 `open / close / switchTool` 等动作，便于后续将编辑器宿主独立出去。

快捷键设置面板也必须复用同一套 action id 口径判断“系统锁定”，不能再按 `Tab` / `Escape` 这类具体键名做 UI 级硬编码，否则会误伤可配置动作。

## 状态管理

`useToolOverlay` 使用单例模式，自动持久化上次使用的工具到 localStorage：

```typescript
// useToolOverlay 关键 API
toolOverlay.open() // 打开（上次使用的工具）
toolOverlay.open('relations') // 打开指定工具
toolOverlay.close() // 关闭
toolOverlay.toggle() // 切换
toolOverlay.switchTool('timeline') // 切换工具

// useWorkspaceShortcuts 负责把 action id 绑定到具体行为
useWorkspaceShortcuts({
  openLatestTool: () => toolOverlay.open(),
  openTool: (tool) => toolOverlay.open(tool),
  closeOverlay: () => toolOverlay.close(),
  isOverlayVisible: () => toolOverlay.visible.value,
  toggleLeftPanel: () => panelStore.toggleLeftCollapsed(),
  toggleRightPanel: () => panelStore.toggleRightCollapsed(),
})
```

## 文件变更

### 新增

- `composables/useToolOverlay.ts`
- `components/workspace/tool-overlay/ToolSidebar.vue`
- `components/workspace/WorkspaceToolOverlay.vue`
- `docs/tool-overlay-unification.md`

### 废弃

- `components/workspace/WorkspaceFullscreenOverlay.vue.deprecated`

### 修改

- `components/workspace/WorkspaceEditorContent.vue` - 集成工具面板
- `components/editor/TipTapEditor.vue` - Ctrl+G 改为 emit 事件
- `components/editor/EditorPanel.vue` - 移除图谱按钮
- `composables/useShortcutConfig.ts` - 添加工具快捷键分类

## 实施记录

| 提交       | 说明                                 |
| ---------- | ------------------------------------ |
| `d1a528b9` | 暂存编辑器状态                       |
| `dafb93bc` | Phase 1-2: 新增 WorkspaceToolOverlay |
| `c848b6b1` | Phase 3: 快捷键配置                  |
| `473aa3b9` | Phase 4: 废弃旧组件                  |

## 待清理

- [x] TipTapEditor 中的 QyGraphOverlay 相关代码 ✅
- [x] CharacterGraph.vue 废弃 ✅
