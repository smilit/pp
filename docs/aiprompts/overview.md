# ProxyCast 项目架构概览

## 概述

ProxyCast 是一个 Tauri 桌面应用，作为 LLM API 代理网关，支持多 Provider 凭证池管理、协议转换、流量监控等功能。

## 项目结构

```
proxycast/
├── src/                 # React 前端
│   ├── components/      # UI 组件
│   ├── pages/           # 页面组件
│   ├── hooks/           # React Hooks
│   ├── lib/             # 工具库
│   └── stores/          # 状态管理
├── src-tauri/           # Rust 后端
│   └── src/
│       ├── commands/    # Tauri 命令
│       ├── providers/   # Provider 实现
│       ├── services/    # 业务服务
│       ├── converter/   # 协议转换
│       ├── server/      # HTTP 服务器
│       └── ...
├── plugins/             # 插件目录
└── docs/                # 文档
```

## 核心模块

### 后端 (src-tauri/src/)

| 模块 | 说明 |
|------|------|
| `providers/` | LLM Provider 认证和 API 实现 |
| `services/` | 业务服务层 |
| `converter/` | 协议转换 (OpenAI ↔ CW/Claude) |
| `server/` | HTTP API 服务器 |
| `credential/` | 凭证池管理 |
| `flow_monitor/` | 流量监控 |
| `terminal/` | 内置终端 |

### 前端 (src/)

| 模块 | 说明 |
|------|------|
| `components/` | React 组件 |
| `hooks/` | 业务逻辑 Hooks |
| `lib/` | 工具函数和 API 封装 |
| `pages/` | 页面组件 |

## 数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                     客户端请求 (Cursor/Continue)                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HTTP Server                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ OpenAI API  │  │ Claude API  │  │ Flow Monitor            │  │
│  │ 兼容端点    │  │ 兼容端点    │  │ (请求拦截)              │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Router / Processor                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ 模型路由    │  │ 协议转换    │  │ 弹性策略                │  │
│  │ (规则匹配)  │  │ (Converter) │  │ (重试/超时)             │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Provider Pool Service                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ 凭证轮询    │  │ 健康检查    │  │ Token 刷新              │  │
│  │ (负载均衡)  │  │ (自动剔除)  │  │ (OAuth)                 │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Providers                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Kiro    │  │ Gemini  │  │ Claude  │  │ OpenAI  │  ...       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 关键特性

### 1. 多 Provider 支持
- OAuth: Kiro, Gemini, Qwen, Claude, Antigravity
- API Key: OpenAI, Claude, 自定义

### 2. 凭证池管理
- 多凭证轮询负载均衡
- 自动健康检查和剔除
- Token 自动刷新

### 3. 协议转换
- OpenAI ↔ CodeWhisperer
- OpenAI ↔ Claude
- OpenAI ↔ Antigravity

### 4. 流量监控
- 请求/响应拦截
- Token 统计
- 历史查询

## 文档索引

### 核心系统
- [providers.md](providers.md) - Provider 系统
- [credential-pool.md](credential-pool.md) - 凭证池管理
- [converter.md](converter.md) - 协议转换
- [server.md](server.md) - HTTP 服务器

### 前端模块
- [components.md](components.md) - 组件系统
- [hooks.md](hooks.md) - React Hooks
- [lib.md](lib.md) - 工具库

### 功能模块
- [flow-monitor.md](flow-monitor.md) - 流量监控
- [terminal.md](terminal.md) - 内置终端
- [mcp.md](mcp.md) - MCP 服务器
- [plugins.md](plugins.md) - 插件系统

### 配置与服务
- [commands.md](commands.md) - Tauri 命令
- [services.md](services.md) - 业务服务
- [database.md](database.md) - 数据库层
