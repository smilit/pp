# Provider 测试用例

> OAuth 认证和 API 调用的测试用例

## 概述

Provider 模块负责与各个 AI 服务提供商的交互，包括：
- OAuth 认证流程
- Token 刷新
- API 调用
- 错误处理

## 测试用例

### 1. Kiro Provider

#### TC-KIRO-001: 凭证加载

```rust
#[test]
fn test_kiro_credential_loading() {
    let credential_json = r#"{
        "access_token": "test-access",
        "refresh_token": "test-refresh",
        "expires_at": "2026-01-30T12:00:00Z"
    }"#;
    
    let cred = KiroCredential::from_json(credential_json).unwrap();
    
    assert_eq!(cred.access_token, "test-access");
    assert_eq!(cred.refresh_token, "test-refresh");
}
```

#### TC-KIRO-002: Token 刷新

```rust
#[tokio::test]
async fn test_kiro_token_refresh() {
    let mock_server = setup_mock_oauth_server().await;
    let provider = KiroProvider::new_with_endpoint(&mock_server.uri());
    
    let new_token = provider.refresh_token("old-refresh-token").await.unwrap();
    
    assert!(!new_token.access_token.is_empty());
    assert!(new_token.expires_at > Utc::now());
}
```

#### TC-KIRO-003: 过期 Token 检测

```rust
#[test]
fn test_kiro_token_expiry_check() {
    let expired_cred = KiroCredential {
        access_token: "test".into(),
        refresh_token: "test".into(),
        expires_at: Utc::now() - Duration::hours(1),
    };
    
    assert!(expired_cred.is_expired());
    
    let valid_cred = KiroCredential {
        access_token: "test".into(),
        refresh_token: "test".into(),
        expires_at: Utc::now() + Duration::hours(1),
    };
    
    assert!(!valid_cred.is_expired());
}
```

### 2. Gemini Provider

#### TC-GEMINI-001: OAuth 流程

```rust
#[tokio::test]
async fn test_gemini_oauth_flow() {
    let mock_server = setup_mock_google_oauth().await;
    let provider = GeminiProvider::new_with_endpoint(&mock_server.uri());
    
    let auth_url = provider.get_auth_url();
    
    assert!(auth_url.contains("accounts.google.com"));
    assert!(auth_url.contains("scope="));
}
```

#### TC-GEMINI-002: API 调用

```rust
#[tokio::test]
async fn test_gemini_api_call() {
    let mock_server = setup_mock_gemini_api().await;
    let provider = GeminiProvider::new_with_endpoint(&mock_server.uri());
    
    let response = provider.chat(&[
        Message { role: "user".into(), content: "Hello".into() }
    ]).await.unwrap();
    
    assert!(!response.content.is_empty());
}
```

### 3. OpenAI Provider

#### TC-OPENAI-001: API Key 验证

```rust
#[test]
fn test_openai_api_key_validation() {
    // 有效的 API Key
    assert!(OpenAIProvider::validate_api_key("sk-1234567890abcdef"));
    
    // 无效的 API Key
    assert!(!OpenAIProvider::validate_api_key("invalid"));
    assert!(!OpenAIProvider::validate_api_key(""));
}
```

#### TC-OPENAI-002: 流式响应处理

```rust
#[tokio::test]
async fn test_openai_streaming() {
    let mock_server = setup_mock_openai_streaming().await;
    let provider = OpenAIProvider::new_with_endpoint(&mock_server.uri());
    
    let mut stream = provider.chat_stream(&[
        Message { role: "user".into(), content: "Hello".into() }
    ]).await.unwrap();
    
    let mut chunks = Vec::new();
    while let Some(chunk) = stream.next().await {
        chunks.push(chunk);
    }
    
    assert!(!chunks.is_empty());
}
```

### 4. 错误处理

#### TC-PROV-ERR-001: 网络错误

```rust
#[tokio::test]
async fn test_network_error_handling() {
    let provider = KiroProvider::new_with_endpoint("http://invalid-host:9999");
    
    let result = provider.refresh_token("test").await;
    
    assert!(result.is_err());
    assert!(matches!(result.unwrap_err(), ProviderError::NetworkError(_)));
}
```

#### TC-PROV-ERR-002: 认证错误

```rust
#[tokio::test]
async fn test_auth_error_handling() {
    let mock_server = setup_mock_oauth_error(401).await;
    let provider = KiroProvider::new_with_endpoint(&mock_server.uri());
    
    let result = provider.refresh_token("invalid-token").await;
    
    assert!(result.is_err());
    assert!(matches!(result.unwrap_err(), ProviderError::AuthError(_)));
}
```

#### TC-PROV-ERR-003: 速率限制

```rust
#[tokio::test]
async fn test_rate_limit_handling() {
    let mock_server = setup_mock_rate_limit().await;
    let provider = OpenAIProvider::new_with_endpoint(&mock_server.uri());
    
    let result = provider.chat(&[
        Message { role: "user".into(), content: "Hello".into() }
    ]).await;
    
    assert!(result.is_err());
    assert!(matches!(result.unwrap_err(), ProviderError::RateLimited(_)));
}
```

### 5. 凭证池集成

#### TC-POOL-001: 凭证轮询

```rust
#[tokio::test]
async fn test_credential_rotation() {
    let pool = CredentialPool::new();
    
    pool.add(create_credential("cred1")).await;
    pool.add(create_credential("cred2")).await;
    
    let first = pool.get_next().await.unwrap();
    let second = pool.get_next().await.unwrap();
    let third = pool.get_next().await.unwrap();
    
    assert_ne!(first.id, second.id);
    assert_eq!(first.id, third.id); // 回到第一个
}
```

#### TC-POOL-002: 健康检查

```rust
#[tokio::test]
async fn test_health_check() {
    let pool = CredentialPool::new();
    let cred = create_credential("test");
    
    pool.add(cred.clone()).await;
    
    // 标记为不健康
    pool.mark_unhealthy(&cred.id).await;
    
    // 不应该返回不健康的凭证
    let result = pool.get_next().await;
    assert!(result.is_none());
}
```

## 测试矩阵

| 测试 ID | Provider | 场景 | 优先级 |
|---------|----------|------|--------|
| TC-KIRO-001 | Kiro | 凭证加载 | P0 |
| TC-KIRO-002 | Kiro | Token 刷新 | P0 |
| TC-GEMINI-001 | Gemini | OAuth 流程 | P0 |
| TC-OPENAI-001 | OpenAI | API Key 验证 | P0 |
| TC-PROV-ERR-001 | 通用 | 网络错误 | P1 |
| TC-POOL-001 | 凭证池 | 轮询 | P0 |

## Mock 服务设置

```rust
async fn setup_mock_oauth_server() -> MockServer {
    let server = MockServer::start().await;
    
    Mock::given(method("POST"))
        .and(path("/oauth/token"))
        .respond_with(ResponseTemplate::new(200)
            .set_body_json(json!({
                "access_token": "new-access-token",
                "refresh_token": "new-refresh-token",
                "expires_in": 3600
            })))
        .mount(&server)
        .await;
    
    server
}

async fn setup_mock_oauth_error(status: u16) -> MockServer {
    let server = MockServer::start().await;
    
    Mock::given(method("POST"))
        .and(path("/oauth/token"))
        .respond_with(ResponseTemplate::new(status)
            .set_body_json(json!({
                "error": "invalid_grant",
                "error_description": "Token expired"
            })))
        .mount(&server)
        .await;
    
    server
}
```

## 运行测试

```bash
cd src-tauri && cargo test provider::
```
