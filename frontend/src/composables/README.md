# Composables

这里收口前端宿主里可复用的有状态逻辑。它们负责状态、监听、生命周期与副作用清理，不负责具体 UI 渲染。

如果你准备在多个组件里复制一段 `watch`、防抖、手势监听、自动保存或流式请求逻辑，先来这里找现成能力。

## 当前导出面

`index.ts` 当前统一导出了以下能力：

### 编辑器与 AI 协作

| 文件 | 用途 |
|------|------|
| `useAutoSave.ts` | 编辑器自动保存与保存节流 |
| `useAIStream.ts` | AI 流式响应处理 |
| `useChatHistory.ts` | 对话历史编排 |
| `useTypewriter.ts` | 打字机式展示或逐步输出 |

### 宿主级基础逻辑

| 文件 | 用途 |
|------|------|
| `useDebounce.ts` | 防抖工具 |
| `usePagination.ts` | 分页状态封装 |
| `useStorage.ts` | 存储读写封装 |
| `useLocalStorage.ts` | LocalStorage 便捷封装 |
| `useErrorHandler.ts` | 统一错误处理辅助 |
| `useI18n.ts` | 本地化辅助 |

### 布局与交互

| 文件 | 用途 |
|------|------|
| `useResponsive.ts` | 响应式断点与窗口状态 |
| `useResponsiveLayout.ts` | 宿主布局层响应式编排 |
| `useBreakpoints.ts` | 断点常量与衍生逻辑 |
| `useTouch.ts` | 基础触摸事件封装 |
| `useTouchGestures.ts` | 通用手势识别 |
| `useMobileGesture.ts` | 偏移动端的交互手势 |

### 性能与资源加载

| 文件 | 用途 |
|------|------|
| `useLazyLoad.ts` | 懒加载与观察器封装 |
| `useLazyLoadImage.ts` | 图片懒加载专用逻辑 |

### 历史阅读器能力

| 文件 | 用途 |
|------|------|
| `useReadingProgress.ts` | 阅读进度逻辑 |
| `useReaderGestures.ts` | 阅读器手势封装 |

这些能力并不一定都服务当前 writer 主链，但它们仍然是目录里的事实能力；新增 composable 时，先确认是否应该继续放在宿主公共层，还是应进入某个业务模块的 `composables/`。

## 什么时候该放在这里

适合放在 `src/composables/` 的情况：

- 多个模块都会复用
- 只封装状态、副作用与生命周期，不绑定具体页面
- 不拥有 writer/ai 的业务语义真相

不适合放在这里的情况：

- 只服务某个模块的页面交互
- 依赖特定业务模型、字段语义或接口契约
- 本质上是模块服务、bridge 或 store 逻辑

如果是 writer 专属逻辑，优先考虑 `src/modules/writer/composables`。

## 使用示例

### 自动保存

```ts
import { useAutoSave } from '@/composables/useAutoSave'

const { triggerSave, saving, lastSavedAt } = useAutoSave({
  delay: 2000,
  onSave: async () => {
    await saveDocument()
  },
})
```

### 响应式布局

```ts
import { useResponsive } from '@/composables/useResponsive'

const { isMobile, isDesktop, currentBreakpoint } = useResponsive()
```

### 资源懒加载

```ts
import { useLazyLoadImage } from '@/composables/useLazyLoadImage'

const { imageSrc, isLoaded } = useLazyLoadImage('/cover.png')
```

## 编写约定

- 文件命名使用 `useXxx.ts`
- 对外导出函数保持同名 `useXxx`
- 所有事件监听、计时器、订阅都必须在 composable 内部负责清理
- 能抽象成参数配置的，不要把页面常量硬编码进通用层
- 如果 composable 需要额外测试，优先补 `*.spec.ts`

## 常见坑

### 把业务语义塞进公共 composable

例如把 writer 专属字段、AI provider 语义、工作台状态耦合进 `src/composables`，会让公共层迅速失去边界。

### 只抽了一半

如果组件里还残留同一组副作用、watch 或 cleanup，说明 composable 抽象可能还没有真正收口。

### 清理不完整

触摸监听、窗口监听、SSE、定时器和 IntersectionObserver 如果不在 composable 内部释放，最容易造成隐性内存泄漏。

## 相关文档

- [MODULE.md](./MODULE.md)
- [../../README.md](../../README.md)
