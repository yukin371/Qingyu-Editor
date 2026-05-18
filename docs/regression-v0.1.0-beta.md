# v0.1.0-beta 发布回归清单

> 目标：确认 Qingyu-Editor 已具备 beta 版本最小创作闭环，可供用户试用和开发者继续迭代。

## 1. 环境

- Windows 桌面 Wails 运行。
- 浏览器 fallback 运行。
- 明色主题与暗色主题各检查一次。
- 至少一个新项目和一个含多卷、多章、资产引用的样例项目。

## 2. 用户主流程

- 创建项目后出现第一卷、第一章。
- 创建后自动进入第一章，标题可编辑，正文区为空。
- 新建章节按当前卷末尾追加。
- 第二卷内新建章节不串到第一卷。
- 切换章节不会改变章节顺序。
- 保存状态防抖更新，停止输入后显示已保存。
- 关闭并重新打开项目后正文、标题、章节顺序仍在。

## 3. 资产闭环

- 正文输入 `@角色名` 后可创建角色。
- 正文输入 `@物品名` 后可创建物件。
- 创建后正文引用存在，右侧设定本章视图出现该资产。
- 本卷视图聚合卷内章节引用。
- 全局视图显示 canonical 资产。
- 删除正文中的 `@资产` 后，本章投影消失，全局资产仍存在。
- 资产总览可新增、编辑、删除全局资产。

## 4. AI Provider

- 设置页可切换系统服务 / 用户 API。
- 用户 API 可从模板选择 Qwen、DeepSeek、Kimi、GLM、Gemini、GPT、Claude、本地服务或自定义。
- 可新增、切换、删除 provider 配置槽。
- 只剩一个配置槽时删除按钮禁用。
- API Key 输入后不回显，状态显示已载入。
- 导出配置不包含明文 Key。
- 健康检查能显示成功或明确失败原因。

## 5. AI 写作链路

- “改写当前章节”只生成 inline diff。
- 接受 diff 后正文更新。
- 放弃 diff 后正文回到原状态。
- 跨章节多命中时显示候选卡，不自动切章。
- 总结、审校只输出建议或候选，不静默修改正文。
- AI evidence 显示本次使用的章节、场景、资产或结构摘要。

## 6. 工具联动

- 结构舞台显示当前章节、附近章节、当前节拍、大纲绑定和资产入口。
- 场景舞台覆盖范围从当前章节向前连续选择。
- 切章不自动进入下一拍。
- 点击“进入下一拍”才推进当前拍。
- 右侧设定可从本章、本卷、全局查看资产。
- 关系图谱、时间线、分支工具能从 overlay 打开。

## 7. 长篇与复杂项目

- 500+ 章节项目左侧目录可定位当前章节。
- 搜索章节后不把命中项挪到首行。
- 结构舞台不全量铺开几千章。
- 时间线大量事件默认窗口化展示。
- 分支大量路线默认收束。

## 8. 视觉与可访问性

- 暗色模式下无硬编码白底。
- 输入框、按钮、empty、选中态使用主题 token。
- 主标题存在时不重复副标题。
- 空状态只提示当前状态和一个下一步动作。
- 工作台内“使用文档”可以从更多操作打开。

## 9. 自动化验证

```powershell
cd frontend
npm run type-check
npm run test -- WorkspaceTopbar WorkspaceSettingsPanel ShortcutSettingsPanel
npm run test -- provider aiProviderStore WorkspaceSettingsPanel
npm run test -- ProjectWorkspace WorkspaceSceneStagePanel
npm run test -- EncyclopediaView AssetListPanel TimelineOutlineView StoryBranchView
cd ..
git diff --check
```

## 10. 发布判定

- 阻断级：无法创建项目、无法编辑/保存章节、AI diff 静默覆盖正文、密钥明文进入导出配置或仓库文件。
- 高优先级：多卷章节顺序混乱、资产引用无法扫描、暗色模式大面积白底、provider 配置无法保存。
- 可延期：高级工具局部样式不完美、复杂多 provider 按用途自动路由、深度语义检索。

