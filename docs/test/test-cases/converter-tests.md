# 协议转换器测试用例

> OpenAI ↔ Claude 协议转换的测试用例

## 概述

协议转换器是 ProxyCast 的核心模块，负责在不同 API 格式之间转换。测试需要覆盖：
- 消息格式转换
- 流式响应转换
- 工具调用转换
- 边界情况处理

## 测试用例

### 1. 消息格式转换

#### TC-CONV-001: 基础消息转换

```rust
#[test]
fn test_openai_to_claude_basic_message() {
    let openai_msg = OpenAIMessage {
        role: "user".to_string(),
        content: "Hello, world!".to_string(),
    };
    
    let claude_msg = convert_to_claude(&openai_msg);
    
    assert_eq!(claude_msg.role, "user");
    assert_eq!(claude_msg.content, "Hello, world!");
}
```

#### TC-CONV-002: System 消息处理

```rust
#[test]
fn test_system_message_extraction() {
    let messages = vec![
        OpenAIMessage { role: "system".into(), content: "You are helpful.".into() },
        OpenAIMessage { role: "user".into(), content: "Hi".into() },
    ];
    
    let (system, user_msgs) = extract_system_message(&messages);
    
    assert_eq!(system, Some("You are helpful.".to_string()));
    assert_eq!(user_msgs.len(), 1);
}
```

#### TC-CONV-003: 多轮对话转换

```rust
#[test]
fn test_multi_turn_conversation() {
    let messages = vec![
        OpenAIMessage { role: "user".into(), content: "Hello".into() },
        OpenAIMessage { role: "assistant".into(), content: "Hi there!".into() },
        OpenAIMessage { role: "user".into(), content: "How are you?".into() },
    ];
    
    let claude_msgs = convert_messages(&messages);
    
    assert_eq!(claude_msgs.len(), 3);
    assert_eq!(claude_msgs[0].role, "user");
    assert_eq!(claude_msgs[1].role, "assistant");
    assert_eq!(claude_msgs[2].role, "user");
}
```

### 2. 流式响应转换

#### TC-CONV-010: SSE 事件格式

```rust
#[test]
fn test_sse_event_format() {
    let delta = TextDelta { text: "Hello".to_string() };
    let sse = format_sse_event(&delta);
    
    assert!(sse.starts_with("data: "));
    assert!(sse.ends_with("\n\n"));
    assert!(sse.contains("\"delta\""));
}
```

#### TC-CONV-011: 流式开始事件

```rust
#[test]
fn test_stream_start_event() {
    let event = create_stream_start_event("msg-123");
    
    assert_eq!(event.event_type, "message_start");
    assert!(event.data.contains("msg-123"));
}
```

#### TC-CONV-012: 流式结束事件

```rust
#[test]
fn test_stream_stop_event() {
    let event = create_stream_stop_event("end_turn");
    
    assert_eq!(event.event_type, "message_stop");
    assert!(event.data.contains("end_turn"));
}
```

### 3. 工具调用转换

#### TC-CONV-020: 工具定义转换

```rust
#[test]
fn test_tool_definition_conversion() {
    let openai_tool = OpenAITool {
        r#type: "function".into(),
        function: OpenAIFunction {
            name: "get_weather".into(),
            description: "Get weather info".into(),
            parameters: json!({
                "type": "object",
                "properties": {
                    "location": { "type": "string" }
                }
            }),
        },
    };
    
    let claude_tool = convert_tool(&openai_tool);
    
    assert_eq!(claude_tool.name, "get_weather");
    assert_eq!(claude_tool.description, "Get weather info");
}
```

#### TC-CONV-021: 工具调用响应转换

```rust
#[test]
fn test_tool_call_response_conversion() {
    let claude_tool_use = ClaudeToolUse {
        id: "tool-123".into(),
        name: "get_weather".into(),
        input: json!({"location": "Beijing"}),
    };
    
    let openai_tool_call = convert_tool_call(&claude_tool_use);
    
    assert_eq!(openai_tool_call.id, "tool-123");
    assert_eq!(openai_tool_call.function.name, "get_weather");
}
```

#### TC-CONV-022: 工具结果转换

```rust
#[test]
fn test_tool_result_conversion() {
    let openai_result = OpenAIToolResult {
        tool_call_id: "tool-123".into(),
        content: "Sunny, 25°C".into(),
    };
    
    let claude_result = convert_tool_result(&openai_result);
    
    assert_eq!(claude_result.tool_use_id, "tool-123");
    assert_eq!(claude_result.content, "Sunny, 25°C");
}
```

### 4. 边界情况

#### TC-CONV-030: 空消息处理

```rust
#[test]
fn test_empty_message_content() {
    let msg = OpenAIMessage {
        role: "user".into(),
        content: "".into(),
    };
    
    let result = convert_to_claude(&msg);
    
    // 空内容应该被正确处理
    assert!(result.content.is_empty());
}
```

#### TC-CONV-031: 特殊字符处理

```rust
#[test]
fn test_special_characters() {
    let msg = OpenAIMessage {
        role: "user".into(),
        content: "Hello\n\t\"world\"\\test".into(),
    };
    
    let result = convert_to_claude(&msg);
    
    // 特殊字符应该被保留
    assert!(result.content.contains('\n'));
    assert!(result.content.contains('\t'));
    assert!(result.content.contains('"'));
}
```

#### TC-CONV-032: Unicode 处理

```rust
#[test]
fn test_unicode_content() {
    let msg = OpenAIMessage {
        role: "user".into(),
        content: "你好世界 🌍 مرحبا".into(),
    };
    
    let result = convert_to_claude(&msg);
    
    assert_eq!(result.content, "你好世界 🌍 مرحبا");
}
```

#### TC-CONV-033: 大消息处理

```rust
#[test]
fn test_large_message() {
    let large_content = "x".repeat(100_000);
    let msg = OpenAIMessage {
        role: "user".into(),
        content: large_content.clone(),
    };
    
    let result = convert_to_claude(&msg);
    
    assert_eq!(result.content.len(), 100_000);
}
```

## 测试矩阵

| 测试 ID | 场景 | 输入 | 期望输出 | 优先级 |
|---------|------|------|----------|--------|
| TC-CONV-001 | 基础消息 | user 消息 | 正确转换 | P0 |
| TC-CONV-002 | System 消息 | system + user | 正确提取 | P0 |
| TC-CONV-010 | SSE 格式 | 文本增量 | 正确格式 | P0 |
| TC-CONV-020 | 工具定义 | OpenAI 工具 | Claude 工具 | P1 |
| TC-CONV-030 | 空消息 | 空内容 | 不崩溃 | P1 |
| TC-CONV-032 | Unicode | 多语言 | 正确保留 | P1 |

## 运行测试

```bash
cd src-tauri && cargo test converter::
```
