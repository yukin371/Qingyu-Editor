# Composables

> 最后更新：2026-03-29

## 职责

Vue 3 组合式函数集合，封装可复用的有状态逻辑（自动保存、AI 流式响应、阅读手势、响应式布局、触摸交互等）。不包含 UI 渲染逻辑。

## 数据流

```
Vue Component → useXxx(options?) → 返回响应式 Ref/Method → 组件模板绑定
                                        ↓
                                watch/onUnmounted（生命周期管理）
```

## 约定 & 陷阱

- **useAutoSave 防抖**：内部使用 `useDebounce` 控制保存频率，`delay` 默认值需根据场景调整（编辑器推荐 2000ms）
- **useAIStream SSE**：使用 EventSource 接收 AI 服务的流式响应，断线重连逻辑在 composable 内部处理
- **useReaderGestures**：依赖 `useTouch` 和 `useMobileGesture`，仅在阅读器页面使用
- **命名约定**：文件名 `useXxx.ts`，导出同名函数 `useXxx`
- **清理逻辑**：所有 composable 必须在 `onUnmounted` 中清理定时器/事件监听/订阅，避免内存泄漏
- **Mock 支持**：`useBusinessMock`/`useMockData` 仅用于开发/测试，生产构建时应 tree-shake 掉
