# Utils (工具函数)

项目中的工具函数库，提供缓存、错误处理、性能监控等功能。

## 目录

- [request](#request) - HTTP 请求封装
- [cache](#cache) - 缓存管理
- [errorHandler](#errorhandler) - 错误处理
- [performance](#performance) - 性能监控
- [format](#format) - 格式化工具
- [storage](#storage) - 本地存储

## request

基于 Axios 的 HTTP 请求封装，提供统一的请求/响应处理。

### 基本用法

```typescript
import request from '@/utils/request'

// GET 请求
const response = await request.get('/users')

// POST 请求
const response = await request.post('/users', { name: 'John' })

// PUT 请求
const response = await request.put('/users/1', { name: 'Jane' })

// DELETE 请求
const response = await request.delete('/users/1')
```

### 高级配置

```typescript
import request, { type RequestConfig } from '@/utils/request'

// 跳过错误处理
await request.get('/api/data', {
  skipErrorHandler: true
} as RequestConfig)

// 静默模式（不显示错误提示）
await request.get('/api/data', {
  silent: true
} as RequestConfig)
```

### 特性

- ✅ 自动添加认证 Token
- ✅ 统一错误处理
- ✅ 请求/响应拦截
- ✅ 401 自动登出
- ✅ 请求去重（防止重复请求）

## cache

缓存管理工具，支持内存缓存、localStorage、sessionStorage。

### CacheManager

```typescript
import { CacheManager, apiCache, storageCache } from '@/utils/cache'

// 使用默认实例
apiCache.set('user', userData, 60000) // 缓存1分钟
const user = apiCache.get('user')

// 创建自定义缓存管理器
const customCache = new CacheManager({
  expiresIn: 10 * 60 * 1000, // 10分钟
  storage: 'localStorage',
  prefix: 'app:'
})

// 设置缓存
customCache.set('key', 'value', 5000) // 5秒后过期

// 获取缓存
const value = customCache.get('key')

// 删除缓存
customCache.delete('key')

// 清空缓存
customCache.clear()

// 检查是否存在
if (customCache.has('key')) {
  console.log('缓存存在')
}

// 清理过期缓存
customCache.cleanup()
```

### 带缓存的请求

```typescript
import { cacheRequest, apiCache } from '@/utils/cache'
import request from '@/utils/request'

// 自动缓存请求结果
const data = await cacheRequest(
  'user-profile',
  () => request.get('/user/profile'),
  {
    cache: apiCache,
    expiresIn: 5 * 60 * 1000, // 5分钟
    forceRefresh: false // 强制刷新
  }
)
```

### 请求去重

```typescript
import { requestDeduplicator } from '@/utils/cache'

// 防止重复请求
const data1 = requestDeduplicator.deduplicate('user-list', fetchUsers)
const data2 = requestDeduplicator.deduplicate('user-list', fetchUsers)
// data1 和 data2 将共享同一个请求
```

### LRU 缓存

```typescript
import { LRUCache } from '@/utils/cache'

const lru = new LRUCache<User>(100) // 最多缓存100项

lru.set('user1', userData)
const user = lru.get('user1')
lru.delete('user1')
```

## errorHandler

统一错误处理工具。

### 基本用法

```typescript
import { handleError, ErrorHandler } from '@/utils/errorHandler'

try {
  await someAsyncOperation()
} catch (error) {
  // 自动显示错误提示
  handleError(error)
}
```

### 高级配置

```typescript
import { ErrorHandler } from '@/utils/errorHandler'

ErrorHandler.handle(error, {
  showMessage: true, // 显示错误消息
  messageType: 'notification', // 使用通知而非消息
  silent: false, // 非静默模式
  logToConsole: true, // 打印到控制台
  onError: (appError) => {
    // 自定义错误处理
    console.log('错误代码:', appError.code)
  }
})
```

### 静默处理

```typescript
import { handleErrorSilently } from '@/utils/errorHandler'

try {
  await backgroundTask()
} catch (error) {
  // 不显示提示，只记录日志
  handleErrorSilently(error)
}
```

### 异步错误捕获

```typescript
import { catchAsync } from '@/utils/errorHandler'

const [error, data] = await catchAsync(
  request.get('/api/data')
)

if (error) {
  console.log('请求失败:', error.message)
} else {
  console.log('数据:', data)
}
```

### 重试机制

```typescript
import { retry } from '@/utils/errorHandler'

const data = await retry(
  () => request.get('/api/unstable'),
  {
    maxRetries: 3,
    delay: 1000,
    onRetry: (attempt, error) => {
      console.log(`第 ${attempt} 次重试...`)
    }
  }
)
```

### Vue 全局错误处理

```typescript
// main.ts
import { createApp } from 'vue'
import { createVueErrorHandler, createPromiseRejectionHandler } from '@/utils/errorHandler'

const app = createApp(App)

// Vue 错误处理
app.config.errorHandler = createVueErrorHandler()

// 未捕获的 Promise 拒绝
window.addEventListener('unhandledrejection', createPromiseRejectionHandler())
```

### 错误代码

```typescript
import { ErrorCode } from '@/utils/errorHandler'

switch (error.code) {
  case ErrorCode.UNAUTHORIZED:
    // 处理未授权
    break
  case ErrorCode.NETWORK_ERROR:
    // 处理网络错误
    break
  case ErrorCode.SERVER_ERROR:
    // 处理服务器错误
    break
}
```

## performance

性能监控工具。

### 性能监控

```typescript
import { performanceMonitor } from '@/utils/performance'

// 收集页面性能指标
const metrics = performanceMonitor.collectPageMetrics()
console.log('页面加载时间:', metrics.loadTime)
console.log('DOM就绪时间:', metrics.domReadyTime)
console.log('首次绘制:', metrics.firstPaintTime)

// 获取性能报告
console.log(performanceMonitor.getReport())
```

### 性能标记和测量

```typescript
import { performanceMonitor } from '@/utils/performance'

// 标记开始
performanceMonitor.mark('task-start')

// 执行任务
await heavyTask()

// 标记结束
performanceMonitor.mark('task-end')

// 测量时间
const duration = performanceMonitor.measure('task-duration', 'task-start', 'task-end')
console.log('任务耗时:', duration, 'ms')
```

### FPS 监控

```typescript
import { FPSMonitor } from '@/utils/performance'

const fpsMonitor = new FPSMonitor()

fpsMonitor.start((fps) => {
  console.log('当前 FPS:', fps)
  
  if (fps < 30) {
    console.warn('性能较差')
  }
})

// 停止监控
fpsMonitor.stop()
```

### 网络信息

```typescript
import { getNetworkInfo } from '@/utils/performance'

const network = getNetworkInfo()
if (network) {
  console.log('网络类型:', network.effectiveType) // '4g', '3g', etc.
  console.log('下行速度:', network.downlink, 'Mbps')
  console.log('往返时间:', network.rtt, 'ms')
  console.log('省流量模式:', network.saveData)
}
```

### 首屏渲染时间

```typescript
import { measureFirstScreenTime } from '@/utils/performance'

measureFirstScreenTime((time) => {
  console.log('首屏渲染时间:', time, 'ms')
  
  // 上报到分析平台
  analytics.track('first-screen-time', { time })
})
```

### Web Vitals

```typescript
import { measureWebVitals } from '@/utils/performance'

const vitals = await measureWebVitals()
console.log('FCP:', vitals.FCP) // First Contentful Paint
console.log('LCP:', vitals.LCP) // Largest Contentful Paint
console.log('TTFB:', vitals.TTFB) // Time to First Byte
```

### 性能装饰器

```typescript
import { measurePerformance } from '@/utils/performance'

class DataService {
  @measurePerformance('fetchUserData')
  async fetchUsers() {
    // 自动测量执行时间
    return await request.get('/users')
  }
}
```

## format

格式化工具函数。

```typescript
import {
  formatNumber,
  formatRelativeTime,
  formatDate,
  formatFileSize,
  formatReadingTime,
  formatPrice,
  truncateText,
  formatPercentage
} from '@/utils/format'

// 数字格式化
formatNumber(12345) // '1.2万'

// 相对时间
formatRelativeTime(Date.now() - 3600000) // '1小时前'

// 日期格式化
formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')

// 文件大小
formatFileSize(1024 * 1024 * 5) // '5.00 MB'

// 阅读时间
formatReadingTime(150000) // '2分30秒'

// 价格
formatPrice(12.5) // '¥12.50'

// 文本截断
truncateText('这是一段很长的文本...', 10, '...') // '这是一段很长...'

// 百分比
formatPercentage(0.856, 1) // '85.6%'
```

## storage

本地存储工具（详见 `storage.js`）。

```typescript
import { setItem, getItem, removeItem } from '@/utils/storage'

// 存储（自动序列化）
setItem('user', { name: 'John', age: 30 })

// 读取（自动反序列化）
const user = getItem('user')

// 删除
removeItem('user')
```

## 最佳实践

### 1. 错误处理

```typescript
// ❌ 不好的做法
try {
  const data = await fetchData()
} catch (error) {
  console.error(error)
  ElMessage.error('请求失败')
}

// ✅ 推荐做法
try {
  const data = await fetchData()
} catch (error) {
  handleError(error) // 统一错误处理
}
```

### 2. 缓存使用

```typescript
// ❌ 每次都请求
async function getUserProfile() {
  return await request.get('/user/profile')
}

// ✅ 使用缓存
async function getUserProfile() {
  return await cacheRequest(
    'user-profile',
    () => request.get('/user/profile'),
    { expiresIn: 5 * 60 * 1000 }
  )
}
```

### 3. 性能监控

```typescript
// 在关键操作中添加性能监控
async function loadBookList() {
  performanceMonitor.mark('load-books-start')
  
  try {
    const books = await request.get('/books')
    performanceMonitor.mark('load-books-end')
    
    const duration = performanceMonitor.measure(
      'load-books',
      'load-books-start',
      'load-books-end'
    )
    
    // 如果加载时间过长，记录警告
    if (duration > 3000) {
      console.warn('书籍列表加载较慢:', duration, 'ms')
    }
    
    return books
  } catch (error) {
    handleError(error)
  }
}
```

### 4. 请求去重

```typescript
// 在组件中防止重复请求
import { requestDeduplicator } from '@/utils/cache'

const loadData = async () => {
  return requestDeduplicator.deduplicate('book-list', async () => {
    return await request.get('/books')
  })
}
```

## 注意事项

1. **缓存过期时间**：根据数据更新频率合理设置缓存时间
2. **错误处理粒度**：关键业务逻辑使用自定义错误处理
3. **性能监控开销**：生产环境适度使用性能监控
4. **浏览器兼容性**：部分 API 需要检查浏览器支持
5. **内存泄漏**：及时清理不需要的缓存和监听器


