# Qingyu-Editor 开发者指南

> 适用版本：v0.1.0-beta

## 1. 仓库定位

`Qingyu-Editor` 是独立桌面写作工具，前端使用 Vue3 + TipTap，桌面宿主使用 Wails，数据优先走本地 SQLite。它不拥有云端主站后端事实，也不承担跨仓库治理规则。

## 2. 本地启动

```powershell
cd E:\Github\Qingyu\Qingyu-Editor
cd frontend
npm install
cd ..
.\dev-wails.ps1
```

也可以在 `Qingyu-Editor` 目录运行：

```powershell
wails dev
```

前端单独调试：

```powershell
cd frontend
npm run dev
```

## 3. 验证命令

```powershell
cd frontend
npm run type-check
npm run test -- WorkspaceTopbar WorkspaceSettingsPanel ShortcutSettingsPanel
npm run test -- provider aiProviderStore WorkspaceSettingsPanel
npm run test -- ProjectWorkspace WorkspaceSceneStagePanel
npm run test -- EncyclopediaView AssetListPanel TimelineOutlineView StoryBranchView
npm run test:e2e:core -- tests/e2e/writer-workflow.spec.ts
cd ..
git diff --check
```

发布前至少执行：

```powershell
cd frontend
npm run type-check
npm run test -- provider aiProviderStore WorkspaceSettingsPanel WorkspaceTopbar
npm run test:e2e:core -- tests/e2e/writer-workflow.spec.ts
cd ..
git diff --check
```

发布评审时，手工冒烟一律以 [regression-v0.1.0-beta.md](/E:/Github/Qingyu/Qingyu-Editor/docs/regression-v0.1.0-beta.md:1) 为准，不再只靠口头检查。

## 4. 模块边界

### 4.1 Go / Wails

- `app.go`、`main.go` 暴露 Wails 绑定。
- `database/` 拥有 SQLite schema、sqlc 查询和迁移执行。
- `services/` 拥有本地业务校验、事务和结果映射。
- 不要把 UI 表现或前端状态写入 Go service。

### 4.2 Writer 前端

- `frontend/src/modules/writer` 拥有工作台、项目工作区、正文编辑、结构舞台、场景舞台、资产工具、右侧工具和 writer AI 编排。
- 正文 diff owner 在 `ProjectWorkspace.handleAIApplyGeneratedText`。
- 工具入口必须收敛到 `WorkspaceRightPanel` 或 `WorkspaceToolOverlay`。
- 快捷键配置唯一入口是设置页。

### 4.3 AI 前端

- `frontend/src/modules/ai` 拥有 provider 配置、密钥/secret、健康检查、请求 facade、错误映射和通用 AI plan。
- `modules/ai` 不得 import writer prompt、writer service 或正文状态。
- writer 通过通用 plan/orchestration 把写作语义交给 AI 模块。

## 5. Provider 与密钥规则

- 用户 API 以 OpenAI 兼容接口为主。
- 多 provider profile 的配置 owner 是 `modules/ai/config/provider.ts` 和 `stores/aiProviderStore.ts`。
- 当前运行时只读取 `activeProviderProfileId`。
- Wails 桌面端真实 API Key 存在 secret store。
- 浏览器 fallback 只使用 sessionStorage。
- localStorage、SQLite settings、导出配置不得保存明文 API Key。
- 删除 provider profile 时要同步清理该 profile 的 session secret 和 Wails secret。

## 6. 写作主流程不变量

- 新项目默认创建第一卷、第一章。
- 模板创建项目只生成骨架，不预写正文。
- 新建章节按同父级压栈追加。
- 章节是正文保存单位，场景/节拍是叙事推进单位。
- 切章不自动换拍，只有显式“进入下一拍”才推进。
- AI 编辑只挂 inline diff，不静默写正文。
- 多章节和新章节 AI 请求默认返回计划卡。

## 7. 文档维护

- 用户指南：`docs/user-guide.md`
- 开发者指南：`docs/developer-guide.md`
- 回归清单：`docs/ux-regression-checklist.md`
- 发布冒烟手册：`docs/regression-v0.1.0-beta.md`
- 发布说明：`docs/release-notes-v0.1.0-beta.md`

如果修改 owner、工具入口、AI provider、正文 diff、场景舞台或资产闭环，必须同步 `frontend/src/modules/writer/MODULE.md` 或 `frontend/src/modules/ai/MODULE.md`。

## 8. 提交与发布

子仓提交后，再回父仓提交子模块指针。

```powershell
git -C E:\Github\Qingyu\Qingyu-Editor status --short
git -C E:\Github\Qingyu\Qingyu-Editor add <files>
git -C E:\Github\Qingyu\Qingyu-Editor commit -m "..."

git -C E:\Github\Qingyu add Qingyu-Editor
git -C E:\Github\Qingyu commit -m "同步编辑器..."
```

Tag 默认打在 `Qingyu-Editor` 子仓对应提交上，并在父仓同步子模块指针提交后补同名或说明性 tag。
