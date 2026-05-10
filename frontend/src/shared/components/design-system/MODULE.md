# shared/components/design-system

> 最后更新：2026-05-10

## 职责

作为历史兼容壳，承接早期 `@/shared/components/design-system` 导入路径，帮助旧页面逐步迁移到 `src/design-system` 的 canonical owner；不再拥有新的基础 UI、Token 或交互规范。

## 数据流

```
旧导入路径 -> shared/components/design-system 兼容壳
          -> src/design-system / src/design-system/tokens
          -> Qy* 组件、主题 token、反馈服务
```

## 约定 & 陷阱

- 新代码不要再从 `@/shared/components/design-system` 引入基础能力；组件走 `@/design-system` 或 `@/design-system/components`，Token 走 `@/design-system/tokens`。
- `tokens` 的 canonical owner 已收口到 `src/design-system/tokens`；shared 目录下仅保留兼容导出，不应再维护第二套 token 真相。
- `layouts / forms / feedback` 里仍有少量 legacy wrapper，它们只服务历史调用方；如果要继续清理，应优先确认引用面，再物理退场，避免直接删除。
- 该目录当前不在前端运行时主链上；若后续又出现新运行时引用，说明架构边界发生回退，需要先纠正 owner 再继续开发。
