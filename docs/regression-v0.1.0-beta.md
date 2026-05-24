# Qingyu-Editor v0.1.0-beta 发布冒烟手册

> 目标：在发布前用最小成本确认 `Qingyu-Editor` 的核心创作闭环可用，避免“能启动但不能正常写作”的假通过。

## 0. 本轮自动化基线

最近一次发布前自动化回归结果：

- `npm run type-check`：通过
- `npm run type-check:full`：通过
- `npm run test:ci`：83 项通过
- `npm run test:e2e`：24 项通过，覆盖 Chromium 与 Mobile Chrome
- `npm run lint:styles`：通过
- `npm run build`：通过
- `npm audit --audit-level=high`：0 vulnerabilities
- `wails build`：通过，生成 `build/bin/Qingyu-Editor.exe`
- `go test ./...`：通过，`frontend/dist/.gitkeep` 提供 Go embed 占位，清理构建产物后仍可直接测试
- Wails exe 启动存活检查：通过，构建产物启动后 8 秒仍存活
- Wails 首屏渲染复核：通过，按窗口句柄截屏可见 `青羽编辑器` 已进入“作者工作台 / 开始今天的创作”
- `.\scripts\release-check.ps1 -Profile quick`：通过，已验证脚本化 quick 闸门可执行
- `git diff --check`：通过，仅提示既有文档 LF/CRLF 工作区换行警告

未自动化验证：Wails GUI 内真实点击创建项目、provider key 保存后重启、系统远程服务不可用提示仍需人工执行；当前环境里 Windows UI Automation 仅能识别 `BrowserRootView` 外壳，Win32 模拟点击也未稳定触发页面导航，因此本轮仅确认构建、Go 包测试、exe 可启动与首屏真实渲染。

额外提示：当前这台机器的桌面用户库 `%APPDATA%\\Qingyu-Editor\\qingyu-editor.db` 内，历史项目 `青羽项目` 已观测到重复 `sort_order`（至少一组卷排序重复、至少一组同卷章节排序重复）。现有 `chapter_service` 集成测试已经覆盖重排后顺序重写，因此这更像旧 profile 遗留数据。发布前人工冒烟请优先使用清洁 profile 或全新空白项目，不要直接拿这份本机历史项目作为 `SMOKE-03` 的唯一判断依据。

## 1. 适用范围

- 版本：`v0.1.0-beta`
- 宿主：Wails Windows 桌面端优先，浏览器 fallback 作为补充验证
- 验证对象：新项目骨架、正文编辑、自动保存、资产闭环、AI provider、AI diff、基础工具联动、主题与布局

## 2. 发布阻断标准

- `P0 阻断`
  - 无法启动编辑器或无法进入工作台
  - 无法创建项目
  - 无法编辑章节标题或正文
  - 自动保存失效，重开后数据丢失
  - AI 请求静默覆盖正文，未经过 inline diff
  - API Key 明文进入导出配置、仓库文件或可见日志
- `P1 高优先级`
  - 多卷章节追加错位
  - `@资产` 创建或自动检出失效
  - provider 配置不能保存或切换
  - 暗色模式大面积硬编码白底
  - 场景舞台/结构舞台误导主流程，导致切章错乱
- `P2 可延期`
  - 高级工具局部样式不和谐
  - 空状态文案不够精炼
  - 长篇窗口化体验还有轻微卡顿但不阻断核心写作

## 3. 环境准备

### 3.1 运行矩阵

- `必测`
  - Wails 桌面端
  - 明色主题
  - 暗色主题
- `建议补测`
  - 浏览器 fallback
  - 系统服务 provider 模式
  - 用户 API provider 模式
  - Mobile Chrome 响应式入口检查

说明：`v0.1.0-beta` 发布目标仍以 Windows 桌面端和桌面浏览器 fallback 为准。Mobile Chrome 可用于提前发现响应式风险，但不作为本版本发布阻断；若全量 `npm run test:e2e` 中仅 Mobile Chrome 失败，需在发布记录中标注失败范围和截图路径。

### 3.2 测试数据

- `项目 A：空白新项目`
  - 用于验证默认骨架、标题聚焦、正文空态、自动保存
- `项目 B：复杂样例项目`
  - 至少 2 卷
  - 每卷至少 3 章
  - 至少 3 个 `@资产` 引用
  - 至少 1 个场景舞台条目

### 3.3 前置约束

- provider 如需真实验证，提前准备一个可用 key
- 本地若没有远程 AI 服务，要额外验证“失败原因是否明确”
- 发布前至少做一次“关闭编辑器再重开”的持久化检查
- 若当前机器已有历史桌面 profile，建议先使用 `.\scripts\launch-clean-smoke.ps1` 启动干净 `APPDATA` 会话，再执行桌面人工冒烟

## 4. 自动化闸门

先跑自动化，再做手工冒烟。自动化失败时，不建议继续手工确认“是否可发布”。

推荐入口：

```powershell
cd E:\Github\Qingyu\Qingyu-Editor
.\scripts\release-check.ps1 -Profile quick
```

桌面人工 smoke 如需隔离历史 profile，可先执行：

```powershell
cd E:\Github\Qingyu\Qingyu-Editor
.\scripts\launch-clean-smoke.ps1
```

桌面人工 smoke 结束后，如需补一份本地数据库证据摘要，可执行：

```powershell
cd E:\Github\Qingyu\Qingyu-Editor
.\scripts\inspect-clean-smoke.ps1
```

如需把人工 smoke 后的数据库摘要作为最小闸门，可执行：

```powershell
cd E:\Github\Qingyu\Qingyu-Editor
.\scripts\inspect-clean-smoke.ps1 -MinProjects 1 -MinVolumes 1 -MinChapters 1 -FailOnDuplicateSort
```

若本轮已经执行 `SMOKE-04` 标题 / 正文 / 自动保存，可把正文落盘也纳入闸门：

```powershell
cd E:\Github\Qingyu\Qingyu-Editor
.\scripts\inspect-clean-smoke.ps1 -MinProjects 1 -MinVolumes 1 -MinChapters 1 -MinTotalChapterWords 1 -RequireChapterText -FailOnDuplicateSort
```

若本轮使用了明确的 smoke 标题和正文，可继续追加期望值，确认读取到的是本轮人工操作产生的数据，而不是历史残留：

```powershell
cd E:\Github\Qingyu\Qingyu-Editor
.\scripts\inspect-clean-smoke.ps1 -MinProjects 1 -MinVolumes 1 -MinChapters 1 -MinTotalChapterWords 1 -RequireChapterText -ExpectProjectTitleContains "冒烟" -ExpectChapterTitleContains "回归标题" -ExpectChapterTextContains "回归正文" -FailOnDuplicateSort
```

说明：

- 默认会读取最新 clean smoke 会话
- 会在对应 session 目录下额外写出 `inspection.md` 与 `inspection.json`
- 若检测到卷或章节 `sort_order` 重复，会直接在终端与报告里标红提醒
- 加上 `-MinProjects`、`-MinVolumes`、`-MinChapters` 或 `-FailOnDuplicateSort` 后，不满足条件会返回失败退出码
- 加上 `-MinTotalChapterWords` 与 `-RequireChapterText` 后，可确认正文 plain text 已写入本地数据库
- 加上 `-ExpectProjectTitleContains`、`-ExpectChapterTitleContains`、`-ExpectChapterTextContains` 后，可确认 smoke 证据命中本轮指定标题和正文片段

完整发布前检查：

```powershell
cd E:\Github\Qingyu\Qingyu-Editor
.\scripts\release-check.ps1 -Profile full
```

说明：

- `quick` 会清理临时产物、保留 `frontend/dist/.gitkeep`，并执行 Go 测试、前端主类型检查、定向 Vitest、桌面 Chromium E2E 与 `git diff --check`。
- `full` 会在 `quick` 基础上补完整类型检查、样式 lint、前端构建、依赖高危审计、完整 Playwright、Wails 构建与 exe 启动存活检查。
- 可先执行 `.\scripts\release-check.ps1 -Profile full -PlanOnly` 预览将要执行的检查项，不实际运行命令。
- 需要发布前深挖隐藏风险时，可追加 `-IncludeDeepChecks`，额外执行 `go vet ./...`、`go test -race ./...` 与 `wails doctor`。
- 需要归档自动化结果时，可追加 `-ReportPath .tmp-release-check.json` 输出 JSON 报告，或使用 `.md` 扩展名输出 Markdown 摘要；这类 `.tmp-*` 报告属于临时产物，不应提交。
- 无 GUI 或 CI 环境可临时追加 `-SkipExeSmoke`，但发布记录必须标注未做桌面可启动验证。
- 若只需要清理测试报告和构建临时产物，可执行 `.\scripts\release-check.ps1 -CleanOnly`。

手工拆解命令：

```powershell
cd E:\Github\Qingyu\Qingyu-Editor\frontend
npm run type-check
npm run test -- WorkspaceTopbar WorkspaceSettingsPanel ShortcutSettingsPanel
npm run test -- provider aiProviderStore WorkspaceSettingsPanel
npm run test -- ProjectWorkspace WorkspaceSceneStagePanel
npm run test -- EncyclopediaView AssetListPanel TimelineOutlineView StoryBranchView
npm run test:e2e:core -- tests/e2e/writer-workflow.spec.ts
cd ..
git diff --check
```

通过标准：

- 所有命令返回成功
- 无 `git diff --check` 空白错误
- E2E 至少覆盖新建项目、使用文档、provider、资产快建、场景舞台这条核心链
- `test:e2e:core` 只覆盖 Desktop Chromium。发布前可额外执行 `npm run test:e2e` 暴露 Mobile Chrome 风险，但 Mobile 失败需单独归类，不能覆盖桌面通过结论。

当前 `writer-workflow.spec.ts` 已自动覆盖的 smoke 子集：

- `SMOKE-02` 新项目骨架与自动进入第一章
- `SMOKE-02A` 新建项目后状态栏会提示“已打开：第一章（可直接改标题）”
- `SMOKE-03` 卷内章节压栈追加
- `SMOKE-04` 标题/正文自动保存
- `SMOKE-05` 刷新后的标题/正文恢复
- `SMOKE-07` `@实体` 创建与本章资产投影
- `SMOKE-09` 删除正文引用后仅解除本章投影、保留全局资产
- `SMOKE-11` `SMOKE-12` `SMOKE-13` provider 配置、多配置槽与失败健康检查
- `SMOKE-18` 场景舞台不随切章自动换拍
- `SMOKE-20` 石墨主题暗色切换
- 额外覆盖：左侧边栏隐藏/显示后章节目录仍可访问、使用文档入口可正常打开
- 额外覆盖：工作台最近项目可继续创作并回到最近章节，且状态栏会提示“继续创作：当前章节”
- 额外覆盖：第二卷新增章节可压栈到第二卷末尾

### 4.1 深度检查项

下面命令不替代核心发布闸门，但用于发布前发现隐藏风险：

```powershell
cd E:\Github\Qingyu\Qingyu-Editor\frontend
npm run type-check:full
npm audit --audit-level=high
npm audit fix --dry-run
cd ..
go vet ./...
go test -race ./...
wails doctor
```

当前已知结论：

- `npm run type-check:full` 会检查 stories 与测试文件；若失败，先按“测试类型债 / Storybook 类型债 / 业务类型债”归类，不等同于 `tsconfig.app.json` 主应用类型失败。
- `npm audit --audit-level=high` 若命中直接运行时依赖高危，不建议对外发布正式包；内部 beta 可在发布记录中明确依赖风险后继续试用。
- `npm audit fix --dry-run` 当前可能被 Storybook 与 Vite peer 关系阻塞，依赖治理需单独开任务，不建议使用 `--force` 直接改锁文件。

## 5. 手工冒烟主链路

下面每条都按“步骤 + 预期 + 失败级别”执行。

### 5.1 启动与进入工作台

`SMOKE-01`

- 步骤
  - 启动 Wails 编辑器
  - 进入首页并打开任意项目或新建项目入口
- 预期
  - 应用能正常启动
  - 无空白页、无遮挡层、无明显报错弹窗
  - 首页主操作可点击
- 失败级别
  - 失败即 `P0`
- 当前补充结论（2026-05-23）
  - 已确认：发布 zip 内桌面宿主可以进入作者工作台首屏，不是停留在进程存活层。
  - 未确认：本机自动化环境下仍无法稳定驱动首页按钮点击，因此“主操作可点击”还不能代替人工 smoke 打勾。
  - 辅助链路：可先运行 `.\scripts\launch-clean-smoke.ps1` 创建干净会话，再在人工 smoke 后运行 `.\scripts\inspect-clean-smoke.ps1` 导出项目/卷/章摘要，减少只靠肉眼判断的歧义。

### 5.2 新建项目骨架

`SMOKE-02`

- 步骤
  - 创建一个全新项目
  - 观察左侧目录和主编辑区
- 预期
  - 自动生成“第一卷”“第一章”
  - 自动跳转到第一章
  - 状态栏出现“已打开：第一章（可直接改标题）”一类显性提示
  - 光标聚焦在章节标题
  - 正文区为空，不预写模板正文
- 失败级别
  - 骨架缺失或跳转错误为 `P0`
  - 标题未聚焦为 `P1`

### 5.3 章节追加与卷内顺序

`SMOKE-03`

- 步骤
  - 在第一卷下连续新增两章
  - 新增第二卷，再在第二卷下新增两章
  - 来回切换章节
- 预期
  - 新章节按当前卷末尾压栈追加
  - 第二卷章节不会串到第一卷
  - 切换章节不会改变章节原始顺序
  - 当前选中项不会被挪到列表首行
- 失败级别
  - 顺序错乱为 `P1`
- 执行提醒
  - 若本机已有历史 profile，先确认测试项目不是旧脏数据样本；推荐优先用新建空白项目复核本条。

### 5.3A 工作台继续创作入口

`SMOKE-03A`

- 步骤
  - 返回作者工作台
  - 点击最近项目卡上的“继续创作”
- 预期
  - 回到最近章节
  - 状态栏出现“继续创作：章节名”一类显性提示
  - 不主动抢正文标题焦点
- 失败级别
  - 回到错误章节为 `P1`
  - 无提示但流程可用为 `P2`

### 5.4 标题、正文、自动保存

`SMOKE-04`

- 步骤
  - 编辑章节标题
  - 输入两段正文
  - 停止输入，观察保存状态
  - 切换到另一章再切回
- 预期
  - 标题和正文都可编辑
  - 保存状态有防抖，不会每击键闪烁
  - 停止输入后状态更新为已保存
  - 切回后内容保持一致
- 失败级别
  - 无法编辑或内容丢失为 `P0`
  - 保存状态异常但数据未丢为 `P1`

### 5.5 重启持久化

`SMOKE-05`

- 步骤
  - 关闭编辑器
  - 重新打开项目
- 预期
  - 标题、正文、章节顺序、当前项目仍然存在
  - 不出现自动回退到错误章节
- 失败级别
  - 数据丢失为 `P0`

### 5.6 字数统计

`SMOKE-06`

- 步骤
  - 在正文中输入中文、英文单词、标点、拟声词如 `hahaha`
- 预期
  - 汉字计数正常
  - 单词按词计数
  - 标点不计入
  - 连续字母拟声词按 1 词处理
- 失败级别
  - 统计轻微偏差为 `P2`
  - 完全不更新为 `P1`

## 6. 资产与设定闭环

### 6.1 正文内创建资产

`SMOKE-07`

- 步骤
  - 在正文输入 `@角色甲`
  - 使用快捷创建完成建档
- 预期
  - 正文中保留 `@角色甲` 引用
  - 右侧设定的“本章”视图能看到该引用
  - “全局”视图出现 canonical 资产
- 失败级别
  - 无法创建或无法出现在右栏为 `P1`

### 6.2 本章 / 本卷 / 全局投影

`SMOKE-08`

- 步骤
  - 在同卷另一章再引用一个已有资产
  - 切换右栏作用域查看 `本章 / 本卷 / 全局`
- 预期
  - 本章只显示当前章引用
  - 本卷聚合当前卷章节引用
  - 全局显示资产 canonical 记录
  - 作用域顺序是 `本章 -> 本卷 -> 全局`
- 失败级别
  - 作用域数据错位为 `P1`

### 6.3 删除章节引用

`SMOKE-09`

- 步骤
  - 删除正文中的 `@角色甲`
  - 观察右栏和资产总览
- 预期
  - 本章引用消失
  - 全局资产仍存在
  - 不会误删 canonical 资产
- 失败级别
  - 误删全局资产为 `P0`

### 6.4 资产总览 CRUD

`SMOKE-10`

- 步骤
  - 从资产总览或右栏分类 `+` 新建一个地点资产
  - 编辑摘要
  - 删除该资产
- 预期
  - 能按类型快速新建
  - 编辑立即反映到详情与列表
  - 删除动作只影响全局资产，且有明确反馈
- 失败级别
  - CRUD 不可用为 `P1`

## 7. AI Provider 与 AI 写作

### 7.1 Provider 配置

`SMOKE-11`

- 步骤
  - 打开工作区设置
  - 切换系统服务 / 用户 API 模式
  - 在用户 API 中选择一个模板 provider
  - 填服务地址、模型、API Key
- 预期
  - 模式切换正常
  - 模板列表至少包含 `Qwen / DeepSeek / Kimi / GLM / Gemini / GPT / Claude / 本地服务 / 自定义`
  - API Key 不回显
  - 配置保存后状态显示已载入或已配置
- 失败级别
  - 模式不能切换为 `P1`
  - Key 明文回显/导出为 `P0`

### 7.2 多 provider 配置槽

`SMOKE-12`

- 步骤
  - 新增一个 provider 配置槽
  - 切换 active 槽
  - 删除非唯一配置槽
- 预期
  - 可新增、切换、删除
  - 只剩一个配置槽时删除按钮禁用
  - 切换 active 后 UI 状态同步更新
- 失败级别
  - 配置槽错乱为 `P1`

### 7.3 健康检查

`SMOKE-13`

- 步骤
  - 在可用 provider 下执行健康检查
  - 再切到一个故意无效的地址或停掉远程服务后重试
- 预期
  - 成功时显示当前模式和可用状态
  - 失败时显示明确原因，而不是泛化成空错误
- 失败级别
  - 无结果或原因不明为 `P1`

### 7.4 当前章节改写

`SMOKE-14`

- 步骤
  - 在当前章节写一小段正文
  - 发送“改写当前章节”
- 预期
  - 只生成 inline diff
  - 不直接静默覆盖正文
  - evidence 能说明参考了哪些上下文
- 失败级别
  - 静默写正文为 `P0`
  - 不显示 diff 为 `P1`

### 7.5 接受 / 放弃 diff

`SMOKE-15`

- 步骤
  - 对上一步 diff 先放弃，再重新发起一次并接受
- 预期
  - 放弃后正文恢复原样
  - 接受后正文更新为 AI 结果
- 失败级别
  - 放弃无效或接受后正文异常为 `P1`

### 7.6 跨章节请求

`SMOKE-16`

- 步骤
  - 发一个会命中多个章节的请求，例如“找提到某资产的章节并分析”
- 预期
  - 出现候选卡
  - 不自动切章
  - 用户确认后才进入后续动作
- 失败级别
  - 自动切章或错挂 diff 为 `P1`

## 8. 工具联动与布局

### 8.1 右侧工具入口

`SMOKE-17`

- 步骤
  - 依次打开 AI、设定、审查、校对、灵感
- 预期
  - 每个入口都能正常打开
  - 右栏背景、按钮、输入框符合主题
  - 不出现大段重复说明文字
- 失败级别
  - 无法打开为 `P1`

### 8.2 场景舞台

`SMOKE-18`

- 步骤
  - 打开底部当前场景
  - 调整高度
  - 切换章节
  - 点击“进入下一拍”
- 预期
  - 底栏可拖拽，不遮挡正文
  - 切章不自动换拍
  - 只有点击“进入下一拍”才推进
- 失败级别
  - 自动换拍为 `P1`
  - 遮挡正文为 `P1`

### 8.3 结构舞台与 overlay

`SMOKE-19`

- 步骤
  - 打开结构舞台
  - 再从其中进入时间线、关系图谱、分支工具
- 预期
  - 结构舞台保持聚合入口角色
  - overlay 能打开并关闭
  - 不会把主编辑区打乱
- 失败级别
  - 工具打不开为 `P2`
  - 打开后破坏主布局为 `P1`

## 9. 视觉与主题

### 9.1 暗色模式

`SMOKE-20`

- 步骤
  - 切换到暗色模式
  - 检查工作区、右栏、底栏、设置页、资产总览、空状态
- 预期
  - 无大面积纯白底
  - 文本、边框、按钮、选中态都走 theme token
  - 主标题存在时不重复副标题
- 失败级别
  - 大面积白底为 `P1`

### 9.2 空状态

`SMOKE-21`

- 步骤
  - 查看无资产、无时间线、无分支、无 AI 结果等空状态
- 预期
  - 空状态简洁，只说明当前状态和下一步动作
  - 不出现教程式长文案和多层套卡
- 失败级别
  - 仅文案冗长为 `P2`

## 10. 长篇压力样本

`SMOKE-22`

- 步骤
  - 使用 500+ 章节样本打开目录、结构舞台、章节搜索
- 预期
  - 当前章节可定位
  - 搜索命中不挪到首行
  - 结构舞台不全量铺开所有章节
- 失败级别
  - 定位失效或顺序错乱为 `P1`

`SMOKE-23`

- 步骤
  - 使用大量事件/分支样本检查时间线与分支
- 预期
  - 时间线默认窗口化
  - 分支默认收束
  - 定位后保持原有关系位置
- 失败级别
  - 大量数据直接全量铺开导致不可用为 `P1`

## 11. 缺陷记录模板

每发现一个问题，至少记录：

- 编号：`SMOKE-xx`
- 环境：`Wails / 浏览器 fallback`，明/暗主题
- 前置数据：空白项目或复杂样例项目
- 实际现象
- 预期现象
- 级别：`P0 / P1 / P2`
- 是否可稳定复现

## 12. 发布结论模板

### 可发布

- 所有 `P0` 为 0
- 所有 `P1` 已修复或有明确降级方案且不影响核心创作闭环
- 自动化闸门全部通过
- 手工冒烟主链路全部通过

### 不可发布

- 任一 `P0` 未关闭
- 存在会导致数据丢失、正文误覆盖、密钥泄露的风险
- 项目创建 / 编辑 / 保存 / AI diff / 资产闭环任一主链路失败
