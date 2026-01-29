//! Aster Agent 包装器
//!
//! 提供简化的接口来使用 Aster Agent
//! 处理消息发送、事件流转换和会话管理

use crate::agent::aster_state::{AsterAgentState, SessionConfigBuilder};
use aster::conversation::message::Message;
use aster::session::SessionManager;
use futures::StreamExt;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};

/// Aster Agent 包装器
///
/// 提供与 Tauri 集成的简化接口
pub struct AsterAgentWrapper;

impl AsterAgentWrapper {
    /// 发送消息并获取流式响应
    ///
    /// # Arguments
    /// * `state` - Aster Agent 状态
    /// * `app` - Tauri AppHandle，用于发送事件
    /// * `message` - 用户消息文本
    /// * `session_id` - 会话 ID
    /// * `event_name` - 前端监听的事件名称
    ///
    /// # Returns
    /// 成功时返回 Ok(())，失败时返回错误信息
    pub async fn send_message(
        state: &AsterAgentState,
        app: &AppHandle,
        message: String,
        session_id: String,
        event_name: String,
    ) -> Result<(), String> {
        // 1. 初始化检查
        if !state.is_initialized().await {
            state.init_agent().await?;
        }

        // 2. 创建取消令牌
        let cancel_token = state.create_cancel_token(&session_id).await;

        // 3. 构建消息和配置
        let user_message = Message::user().with_text(&message);
        let session_config = SessionConfigBuilder::new(&session_id).build();

        // 4. 获取 Agent 引用（关键步骤）
        let agent_arc = state.get_agent_arc();
        let guard = agent_arc.read().await;
        let agent = guard.as_ref().ok_or("Agent not initialized")?;

        // 5. 调用 Agent::reply
        let stream_result = agent
            .reply(user_message, session_config, Some(cancel_token.clone()))
            .await;

        // 6. 处理流式响应
        match stream_result {
            Ok(mut stream) => {
                while let Some(event_result) = stream.next().await {
                    match event_result {
                        Ok(agent_event) => {
                            // 转换并发送事件到前端
                            let tauri_events =
                                crate::agent::event_converter::convert_agent_event(agent_event);
                            for tauri_event in tauri_events {
                                if let Err(e) = app.emit(&event_name, &tauri_event) {
                                    tracing::error!("[AsterAgentWrapper] 发送事件失败: {}", e);
                                }
                            }
                        }
                        Err(e) => {
                            // 发送错误事件
                            let error_event =
                                crate::agent::event_converter::TauriAgentEvent::Error {
                                    message: format!("Stream error: {}", e),
                                };
                            let _ = app.emit(&event_name, &error_event);
                        }
                    }
                }

                // 发送完成事件
                let done_event =
                    crate::agent::event_converter::TauriAgentEvent::FinalDone { usage: None };
                let _ = app.emit(&event_name, &done_event);
            }
            Err(e) => {
                // 发送错误事件并返回错误
                let error_event = crate::agent::event_converter::TauriAgentEvent::Error {
                    message: format!("Agent error: {}", e),
                };
                let _ = app.emit(&event_name, &error_event);
                return Err(format!("Agent error: {}", e));
            }
        }

        // guard 在作用域结束时自动释放

        // 7. 清理取消令牌
        state.remove_cancel_token(&session_id).await;

        Ok(())
    }

    /// 停止当前会话
    pub async fn stop_session(state: &AsterAgentState, session_id: &str) -> bool {
        state.cancel_session(session_id).await
    }

    /// 创建新会话
    pub async fn create_session(
        working_dir: Option<PathBuf>,
        name: Option<String>,
    ) -> Result<String, String> {
        let dir = working_dir
            .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));
        let session_name = name.unwrap_or_else(|| "New Session".to_string());

        let session =
            SessionManager::create_session(dir, session_name, aster::session::SessionType::User)
                .await
                .map_err(|e| format!("Failed to create session: {}", e))?;

        Ok(session.id)
    }

    /// 列出所有会话
    pub async fn list_sessions() -> Result<Vec<SessionInfo>, String> {
        let sessions = SessionManager::list_sessions()
            .await
            .map_err(|e| format!("Failed to list sessions: {}", e))?;

        Ok(sessions
            .into_iter()
            .map(|s| SessionInfo {
                id: s.id,
                name: s.name,
                created_at: s.created_at.timestamp(),
                updated_at: s.updated_at.timestamp(),
            })
            .collect())
    }

    /// 获取会话详情
    pub async fn get_session(session_id: &str) -> Result<SessionDetail, String> {
        let session = SessionManager::get_session(session_id, true)
            .await
            .map_err(|e| format!("Failed to get session: {}", e))?;

        Ok(SessionDetail {
            id: session.id,
            name: session.name,
            created_at: session.created_at.timestamp(),
            updated_at: session.updated_at.timestamp(),
            messages: session
                .conversation
                .map(|c| {
                    c.messages()
                        .iter()
                        .map(|m| crate::agent::event_converter::convert_to_tauri_message(m))
                        .collect()
                })
                .unwrap_or_default(),
        })
    }
}

/// 会话信息（简化版）
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SessionInfo {
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub updated_at: i64,
}

/// 会话详情（包含消息）
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SessionDetail {
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub messages: Vec<crate::agent::event_converter::TauriMessage>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_session_config_builder() {
        let config = SessionConfigBuilder::new("test-session").build();
        assert_eq!(config.id, "test-session");
    }
}
