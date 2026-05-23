# Wails Build 资源目录

本目录存放 `Qingyu-Editor` 的 Wails 打包模板、平台资源与安装器配置。它不是业务代码目录，而是桌面宿主的构建外壳。

## 目录职责

```text
build/
├── appicon.png              应用主图标源
├── darwin/                  macOS 构建资源
├── windows/                 Windows 构建资源与安装器模板
└── README.md                本说明
```

Wails 在执行 `wails build` 时会读取这里的文件，拼装出平台相关的可执行文件与安装器资源。

## 什么时候会改这里

以下情况适合改 `build/`：

- 应用图标、产品名称、版权信息调整
- Windows 安装器文案或资源更新
- macOS `Info.plist` 相关元数据调整
- 平台打包行为需要细化定制

以下情况不应该改这里：

- writer/ai 业务逻辑
- 前端组件、主题或页面布局
- SQLite schema、service 或 Wails bridge

## Windows 资源

`windows/` 目录当前包含：

- `icon.ico`：Windows 应用图标
- `info.json`：安装器与应用属性元数据模板
- `installer/`：安装器脚本模板
- `wails.exe.manifest`：Windows manifest

如果只是替换应用图标，优先更新：

1. `build/appicon.png`
2. `build/windows/icon.ico`

如果要改安装器展示信息，再看 `windows/info.json` 与 `windows/installer/*`。

## macOS 资源

`darwin/` 目录当前包含：

- `Info.plist`
- `Info.dev.plist`

通常只有在这些场景下需要调整：

- Bundle 元数据变化
- 开发态与构建态信息不一致
- 签名或平台集成要求变更

## 常用命令

```bash
# 开发态宿主
wails dev

# 生产构建
wails build
```

`wails.json` 会定义前端安装与构建命令，因此打包问题不要只盯着 `build/`，也要回头检查仓库根的 `wails.json` 和 `frontend/package.json`。

## 维护建议

- 先改模板资源，再执行一次 `wails build` 验证效果
- 不要把一次性构建产物手工塞回这里，`build/` 更适合存放模板而不是输出结果
- 改安装器或平台资源时，最好同步记录在发布说明或开发指南中
