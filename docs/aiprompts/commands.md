# Tauri 命令

## 概述

Tauri 命令是前端与 Rust 后端通信的桥梁，通过 `invoke` 调用。

## 目录结构

```
src-tauri/src/commands/
├── mod.rs              # 模块入口
├── credential.rs       # 凭证管理命令
├── provider.rs         # Provider 命令
├── server.rs           # 服务器控制命令
├── flow.rs             # 流量监控命令
├── config.rs           # 配置命令
├── mcp.rs              # MCP 服务器命令
└── terminal.rs         # 终端命令
```

## 命令分类

### 凭证管理

```rust
#[tauri::command]
async fn add_credential(
    provider: String,
    file_path: String,
) -> Result<CredentialInfo, String>;

#[tauri::command]
async fn remove_credential(id: String) -> Result<(), String>;

#[tauri::command]
async fn list_credentials() -> Result<Vec<CredentialInfo>, String>;

#[tauri::command]
async fn refresh_credential(id: String) -> Result<(), String>;

#[tauri::command]
async fn get_credential_status(id: String) -> Result<CredentialStatus, String>;
```

### 服务器控制

```rust
#[tauri::command]
async fn start_server(config: ServerConfig) -> Result<(), String>;

#[tauri::command]
async fn stop_server() -> Result<(), String>;

#[tauri::command]
async fn get_server_status() -> Result<ServerStatus, String>;

#[tauri::command]
async fn update_server_config(config: ServerConfig) -> Result<(), String>;
```

### 流量监控

```rust
#[tauri::command]
async fn get_flow_records(query: FlowQuery) -> Result<PagedResult<FlowRecord>, String>;

#[tauri::command]
async fn get_flow_stats(time_range: TimeRange) -> Result<FlowStats, String>;

#[tauri::command]
async fn clear_flow_records(before: Option<i64>) -> Result<u64, String>;
```

## 前端调用

```typescript
import { invoke } from '@tauri-apps/api/core';

// 添加凭证
const credential = await invoke<CredentialInfo>('add_credential', {
    provider: 'kiro',
    filePath: '/path/to/credential.json',
});

// 获取服务器状态
const status = await invoke<ServerStatus>('get_server_status');

// 查询流量记录
const records = await invoke<PagedResult<FlowRecord>>('get_flow_records', {
    query: { page: 1, pageSize: 20 },
});
```

## 错误处理

```rust
// 命令返回 Result<T, String>
// 错误信息会传递到前端

#[tauri::command]
async fn example_command() -> Result<Data, String> {
    do_something()
        .await
        .map_err(|e| e.to_string())
}
```

## 相关文档

- [services.md](services.md) - 业务服务
- [hooks.md](hooks.md) - 前端 Hooks
