# Agent 模块

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

AI Agent 集成模块，基于 aster-rust 框架实现。

### 设计决策

- **Aster 框架**：使用 aster-rust 框架获得多 Provider、工具系统、会话管理等能力
- **凭证池桥接**：自动从 ProxyCast 凭证池选择凭证配置 Aster Provider
- **流式响应**：通过 Tauri 事件系统向前端推送流式内容

## 文件索引

| 文件 | 说明 |
|------|------|
| `mod.rs` | 模块入口，导出公共类型 |
| `types.rs` | Agent 相关类型定义 |
| `aster_state.rs` | Aster Agent 状态管理（Provider 配置、取消令牌） |
| `aster_agent.rs` | Aster Agent 包装器（会话管理） |
| `event_converter.rs` | Aster 事件到 Tauri 事件转换 |
| `credential_bridge.rs` | 凭证池桥接（连接 ProxyCast 凭证池与 Aster Provider） |

## 使用方式

### 从凭证池配置（推荐）

```rust
// 初始化
state.init_agent().await?;

// 从凭证池自动选择凭证并配置 Provider
let config = state
    .configure_provider_from_pool(&db, "openai", "gpt-4", &session_id)
    .await?;

// config.credential_uuid 包含使用的凭证 UUID
```

### 手动配置

```rust
// 初始化
state.init_agent().await?;

// 手动配置 Provider
let config = ProviderConfig {
    provider_name: "openai".to_string(),
    model_name: "gpt-4".to_string(),
    api_key: Some("sk-...".to_string()),
    base_url: None,
    credential_uuid: None,
};
state.configure_provider(config, &session_id).await?;
```

### 发送消息

```rust
let user_message = Message::user().with_text("Hello");
let session_config = SessionConfigBuilder::new(&session_id).build();
let stream = agent.reply(user_message, session_config, Some(cancel_token)).await?;
```

## Tauri 命令

| 命令 | 说明 |
|------|------|
| `aster_agent_init` | 初始化 Agent |
| `aster_agent_configure_provider` | 手动配置 Provider |
| `aster_agent_configure_from_pool` | 从凭证池配置 Provider（推荐） |
| `aster_agent_chat_stream` | 流式对话 |
| `aster_agent_stop` | 停止会话 |
| `aster_session_create/list/get` | 会话管理 |

## 凭证池桥接

`credential_bridge.rs` 模块将 ProxyCast 凭证池与 Aster Provider 系统连接：

- 自动从凭证池选择可用凭证
- 支持 OAuth 和 API Key 两种凭证类型
- 自动刷新过期的 OAuth Token
- 记录凭证使用和健康状态

详见 [aster-integration.md](../../../docs/aiprompts/aster-integration.md)
