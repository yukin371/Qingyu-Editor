# 占位图片说明

## 问题
`via.placeholder.com` 在中国大陆无法访问，导致书籍封面显示失败。

## 解决方案

### 方案1：添加本地占位图（推荐）

在当前目录（`public/`）添加以下图片：

1. **`placeholder-book.png`** - 书籍封面占位图（300x400px）
2. **`placeholder-avatar.png`** - 用户头像占位图（200x200px）
3. **`placeholder-banner.jpg`** - Banner 占位图（1200x400px）

### 方案2：使用纯色SVG

创建 `placeholder.svg`：

```xml
<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="400" fill="#409eff"/>
  <text x="150" y="200" 
        font-family="Arial" 
        font-size="20" 
        fill="white" 
        text-anchor="middle">
    书籍封面
  </text>
</svg>
```

### 方案3：修改后端测试数据

修改 `Qingyu_backend/cmd/prepare_test_data/main.go`：

```go
// 使用本地占位图
CoverURL: "/placeholder-book.png"
```

或使用国内可访问的图片服务：

```go
// dummyimage.com（国内可访问）
CoverURL: fmt.Sprintf("https://dummyimage.com/300x400/409eff/ffffff&text=%s", 
          url.QueryEscape(title))

// 或使用随机图片服务
CoverURL: "https://picsum.photos/300/400"
```

## 快速创建占位图

### 使用 ImageMagick
```bash
# 安装 ImageMagick（如果没有）
# https://imagemagick.org/script/download.php

# 创建书籍封面
magick -size 300x400 xc:#409eff \
       -gravity center \
       -pointsize 24 \
       -fill white \
       -annotate +0+0 "书籍封面" \
       placeholder-book.png

# 创建头像
magick -size 200x200 xc:#67c23a \
       -gravity center \
       -pointsize 20 \
       -fill white \
       -annotate +0+0 "用户头像" \
       placeholder-avatar.png

# 创建Banner
magick -size 1200x400 xc:#e6a23c \
       -gravity center \
       -pointsize 32 \
       -fill white \
       -annotate +0+0 "Banner 图片" \
       placeholder-banner.jpg
```

### 使用 PowerShell（Windows）

```powershell
# 下载占位图（使用dummyimage.com）
Invoke-WebRequest -Uri "https://dummyimage.com/300x400/409eff/ffffff&text=Book" `
                   -OutFile "placeholder-book.png"

Invoke-WebRequest -Uri "https://dummyimage.com/200x200/67c23a/ffffff&text=Avatar" `
                   -OutFile "placeholder-avatar.png"

Invoke-WebRequest -Uri "https://dummyimage.com/1200x400/e6a23c/ffffff&text=Banner" `
                   -OutFile "placeholder-banner.jpg"
```

### 使用 Node.js 脚本

创建 `create-placeholders.js`：

```javascript
const fs = require('fs')
const https = require('https')

const images = [
  { url: 'https://dummyimage.com/300x400/409eff/ffffff&text=Book', file: 'placeholder-book.png' },
  { url: 'https://dummyimage.com/200x200/67c23a/ffffff&text=Avatar', file: 'placeholder-avatar.png' },
  { url: 'https://dummyimage.com/1200x400/e6a23c/ffffff&text=Banner', file: 'placeholder-banner.jpg' }
]

images.forEach(({ url, file }) => {
  https.get(url, (res) => {
    const stream = fs.createWriteStream(file)
    res.pipe(stream)
    stream.on('finish', () => {
      stream.close()
      console.log(`✓ 创建成功: ${file}`)
    })
  })
})
```

运行：
```bash
node create-placeholders.js
```

## 修改前端代码

### 在组件中使用

```vue
<template>
  <el-image 
    :src="book.coverUrl || '/placeholder-book.png'" 
    :alt="book.title"
    fit="cover"
  >
    <template #error>
      <div class="image-slot">
        <el-icon><Picture /></el-icon>
      </div>
    </template>
  </el-image>
</template>
```

### 在 Store 中设置默认值

```typescript
// bookstore.store.ts
const DEFAULT_COVER = '/placeholder-book.png'

const book = {
  ...data,
  coverUrl: data.coverUrl || DEFAULT_COVER
}
```

## 测试

添加图片后，访问：
- `http://localhost:5173/placeholder-book.png`
- 应该能看到占位图

---

**更新时间**：2025-10-26  
**优先级**：中等  
**可选**：可以暂时忽略图片错误，不影响功能测试






