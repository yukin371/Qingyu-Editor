# 青羽编辑器 (Qingyu-Editor)

独立多平台小说写作工具，基于 Wails + Capacitor + Vue3 + TipTap。

## 技术栈

| 层 | 桌面端 | 移动端 |
|----|--------|--------|
| UI | Vue3 + TipTap | 同左 |
| 原生壳 | Wails v2 | Capacitor 8 |
| 后端 | Go + SQLite | Capacitor 插件 |

## 功能（V1 规划）

- 核心写作编辑（TipTap / ProseMirror）
- 章节大纲管理（拖拽排序、分卷）
- 版本控制（自动快照 + 手动里程碑）
- 可插拔 AI（OpenAI / Anthropic / Ollama，自带 Key）

## 项目结构

```
Qingyu-Editor/
├── frontend/          # Vue3 前端（Wails & Capacitor 共用）
│   └── src/
│       ├── editor/    # TipTap 编辑器
│       ├── outline/   # 章节大纲
│       ├── version/   # 版本历史
│       ├── ai/        # AI 插件层
│       └── services/platform/  # 平台抽象层
├── database/          # SQLite 数据库层
├── storage/           # 文件导入导出
├── ai/                # AI Provider 接口
├── version/           # 快照管理
├── main.go            # Wails 入口
└── app.go             # 应用绑定
```

## 开发

```bash
# 安装前端依赖
cd frontend && npm install

# 开发模式
wails dev

# 构建
wails build
```

Windows 下也可以直接在 `Qingyu-Editor` 目录执行：

```powershell
.\dev-wails.ps1
```

如果希望双击启动，可直接运行：

```bat
dev-wails.cmd
```

## 文档

- 用户使用指南：`docs/user-guide.md`
- 开发者指南：`docs/developer-guide.md`
- 体验回归清单：`docs/ux-regression-checklist.md`
- v0.1.0-beta 发布回归：`docs/regression-v0.1.0-beta.md`
- v0.1.0-beta 发布说明：`docs/release-notes-v0.1.0-beta.md`

## 状态

当前进入 v0.1.0-beta 发布收口阶段，重点是创作主流程、工具联动、AI provider、回归清单与工作台内置文档。
