# 流量监控

## 概述

流量监控模块拦截和记录所有 LLM API 请求，提供 Token 统计、历史查询和分析功能。

## 目录结构

```
src-tauri/src/flow_monitor/
├── mod.rs              # 模块入口
├── interceptor.rs      # 请求拦截器
├── storage.rs          # 存储层
├── query.rs            # 查询接口
└── stats.rs            # 统计分析
```

## 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      HTTP 请求                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Flow Interceptor                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  请求拦截                                                    ││
│  │  - 请求 ID 生成                                              ││
│  │  - 请求体捕获                                                ││
│  │  - 时间戳记录                                                ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Provider 处理                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Flow Interceptor                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  响应拦截                                                    ││
│  │  - 响应体捕获                                                ││
│  │  - Token 计数                                                ││
│  │  - 延迟计算                                                  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Flow Storage                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ SQLite      │  │ 内存缓存    │  │ 事件发送                │  │
│  │ 持久化      │  │ (最近 N 条) │  │ (前端通知)              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 数据模型

### FlowRecord

```rust
pub struct FlowRecord {
    pub id: String,                 // 请求 ID
    pub timestamp: i64,             // 时间戳
    pub provider: String,           // Provider 类型
    pub model: String,              // 模型名称
    pub request: FlowRequest,       // 请求数据
    pub response: Option<FlowResponse>,  // 响应数据
    pub status: FlowStatus,         // 状态
    pub latency_ms: Option<u64>,    // 延迟 (毫秒)
}

pub struct FlowRequest {
    pub messages: Vec<Message>,     // 消息列表
    pub tools: Option<Vec<Tool>>,   // 工具定义
    pub stream: bool,               // 是否流式
}

pub struct FlowResponse {
    pub content: String,            // 响应内容
    pub tool_calls: Option<Vec<ToolCall>>,  // 工具调用
    pub usage: TokenUsage,          // Token 使用
}

pub struct TokenUsage {
    pub prompt_tokens: u32,         // 输入 Token
    pub completion_tokens: u32,     // 输出 Token
    pub total_tokens: u32,          // 总 Token
}
```

### 数据库表

```sql
CREATE TABLE flow_records (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    request_json TEXT NOT NULL,
    response_json TEXT,
    status TEXT NOT NULL,
    latency_ms INTEGER,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    created_at INTEGER NOT NULL
);

CREATE INDEX idx_flow_timestamp ON flow_records(timestamp);
CREATE INDEX idx_flow_provider ON flow_records(provider);
CREATE INDEX idx_flow_model ON flow_records(model);
```

## 拦截器实现

```rust
pub struct FlowInterceptor {
    storage: Arc<FlowStorage>,
    event_sender: mpsc::Sender<FlowEvent>,
}

impl FlowInterceptor {
    pub async fn intercept_request(&self, req: &Request) -> String {
        let request_id = generate_uuid();
        
        let record = FlowRecord {
            id: request_id.clone(),
            timestamp: current_timestamp(),
            provider: extract_provider(req),
            model: extract_model(req),
            request: parse_request(req),
            response: None,
            status: FlowStatus::Pending,
            latency_ms: None,
        };
        
        self.storage.insert(&record).await;
        self.event_sender.send(FlowEvent::RequestStarted(record)).await;
        
        request_id
    }
    
    pub async fn intercept_response(
        &self,
        request_id: &str,
        response: &Response,
        latency: Duration,
    ) {
        let flow_response = parse_response(response);
        
        self.storage.update_response(
            request_id,
            &flow_response,
            latency.as_millis() as u64,
        ).await;
        
        self.event_sender.send(FlowEvent::ResponseReceived {
            request_id: request_id.to_string(),
            response: flow_response,
        }).await;
    }
}
```

## 查询接口

### 分页查询

```rust
pub struct FlowQuery {
    pub provider: Option<String>,
    pub model: Option<String>,
    pub start_time: Option<i64>,
    pub end_time: Option<i64>,
    pub status: Option<FlowStatus>,
    pub page: u32,
    pub page_size: u32,
}

pub async fn query_flows(query: FlowQuery) -> Result<PagedResult<FlowRecord>> {
    // 构建 SQL 查询
    // 执行分页查询
    // 返回结果
}
```

### 统计查询

```rust
pub struct FlowStats {
    pub total_requests: u64,
    pub total_tokens: u64,
    pub avg_latency_ms: f64,
    pub by_provider: HashMap<String, ProviderStats>,
    pub by_model: HashMap<String, ModelStats>,
}

pub async fn get_stats(time_range: TimeRange) -> Result<FlowStats> {
    // 聚合统计
}
```

## 前端事件

### 事件类型

```typescript
interface FlowEvent {
    type: 'request_started' | 'response_received' | 'error';
    data: FlowRecord;
}
```

### 事件监听

```typescript
// 前端监听
import { listen } from '@tauri-apps/api/event';

listen<FlowEvent>('flow-event', (event) => {
    switch (event.payload.type) {
        case 'request_started':
            addPendingRequest(event.payload.data);
            break;
        case 'response_received':
            updateRequest(event.payload.data);
            break;
    }
});
```

## Tauri Commands

```rust
#[tauri::command]
async fn get_flow_records(query: FlowQuery) -> Result<PagedResult<FlowRecord>>;

#[tauri::command]
async fn get_flow_stats(time_range: TimeRange) -> Result<FlowStats>;

#[tauri::command]
async fn get_flow_detail(id: String) -> Result<FlowRecord>;

#[tauri::command]
async fn clear_flow_records(before: Option<i64>) -> Result<u64>;

#[tauri::command]
async fn export_flow_records(format: ExportFormat) -> Result<String>;
```

## 相关文档

- [server.md](server.md) - HTTP 服务器
- [database.md](database.md) - 数据库层
- [components.md](components.md) - 前端组件
