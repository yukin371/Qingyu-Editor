# Root Stores

> 最后更新：2026-05-10

## 职责

这里只保留真正的根级通用 store。独立编辑器的业务状态 owner 已迁回 `src/modules/writer/stores`，不应再在根级 `src/stores` 保留第二套 writer 状态。

## 当前内容

- `counter.ts`：示例/最小 Pinia 基座

## Must not own

- 不再新增 writer 业务 store
- 不再承接平台时代的跨域业务状态集合

## 约定

- 业务状态优先就近放在对应 `src/modules/*/stores`
- 如果未来确实需要新的根级 store，必须先说明为什么模块内 store 不足以承担
