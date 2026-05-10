# shared/components/design-system

> 最后更新：2026-05-10

## 职责

当前只保留迁移说明，不再承担任何运行时代码职责。历史 `@/shared/components/design-system` 导入路径对应的组件壳与 token 壳已在 2026-05-11 归档退场。

## 数据流

```
旧导入路径 -> README / MODULE 迁移说明
          -> 归档备份目录
          -> src/design-system / src/design-system/tokens / src/design-system/services
```

## 约定 & 陷阱

- 新代码不要再从 `@/shared/components/design-system` 引入基础能力；组件走 `@/design-system` 或 `@/design-system/components`，Token 走 `@/design-system/tokens`。
- `tokens` 的 canonical owner 已收口到 `src/design-system/tokens`；shared 目录下的 token 实现已归档到 `frontend/.cleanup-backups/2026-05-11-legacy-compat/`。
- `layouts / forms / feedback / index.ts` 等历史运行时代码壳已归档到 `frontend/.cleanup-backups/2026-05-11-shared-design-system-runtime-shell/`，不要再把这里当成可复用 owner。
- 该目录当前不在前端运行时主链上；若后续又出现新运行时引用，说明架构边界发生回退，需要先纠正依赖路径，再决定是否恢复历史代码。
