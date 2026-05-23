# Writer 模块文档索引

本目录存放 **只对 `frontend/src/modules/writer` 本地实现直接负责** 的设计说明与模块内索引。

它不是父仓 `docs/plans/v3/` 的替代品。更准确地说：

- 这里记录贴近模块运行态、组件组织和局部交互收口的文档
- 父仓 `docs/plans/v3/` 负责跨仓库产品方向、双中枢口径和长期实施计划

## 先看什么

如果你要进入 writer 前端主链，推荐顺序如下：

1. `Qingyu-Editor/frontend/MODULE.md`
2. `Qingyu-Editor/frontend/src/modules/writer/MODULE.md`
3. 本 README
4. 相关局部设计文档
5. 父仓 `docs/plans/v3/implementation/*` 中对应的长期方案

## 当前文档

### 工具面板与工作区收口

- [tool-overlay-unification.md](./tool-overlay-unification.md)
  说明 writer 工作区如何把结构舞台、关系图谱、时间线、故事分支等工具入口统一到全屏工具面板。

## 什么应该写在这里

适合落在本目录的内容：

- writer 前端局部交互方案
- 组件组织、面板拆分、工作区编排说明
- 只对本模块运行态有效的设计约束
- 与当前目录内组件、store、composable 强耦合的说明

不适合落在这里的内容：

- 跨仓库 roadmap
- Editor V3 长期阶段计划
- 独立编辑器与平台端的全局边界决策
- 已经沉淀为父仓标准或 ADR 的内容

这些内容应继续放在父仓 `docs/`。

## 维护约定

### 新增文档时

- 文件名尽量体现主题，不要写成泛化的 `notes.md`
- 在本 README 补一条索引
- 如果文档依赖父仓计划，补出对应链接

### 文档过期时

- 先判断它是应该删除、归档，还是上收父仓 `docs/`
- 不要让本目录长期堆积成“旧方案墓地”

### 改代码时

如果改动涉及以下变化，应该回头检查这里是否要同步：

- 工具面板入口与切换方式
- 工作区左右栏职责
- 结构舞台、资产总览、图谱等局部交互口径
- writer 前端局部组件边界

## 相关入口

- [../../../../../docs/creative-workflow-design.md](../../../../../docs/creative-workflow-design.md)
- [../../../../../docs/developer-guide.md](../../../../../docs/developer-guide.md)
- [../MODULE.md](../MODULE.md)
