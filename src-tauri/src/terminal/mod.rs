//! 终端核心模块
//!
//! 提供 PTY 管理和会话管理能力，通过 Tauri Commands 和 Events 暴露给前端。
//!
//! ## 模块结构
//! - `error` - 错误类型定义
//! - `events` - Tauri 事件定义
//! - `pty_session` - PTY 会话封装
//! - `session_manager` - 会话管理器
//! - `persistence` - 持久化存储（块文件、会话元数据）
//! - `block_controller` - 块控制器抽象层
//! - `connections` - 连接模块（本地 PTY、SSH、WSL）
//! - `integration` - 集成模块（Shell 集成、OSC 解析、状态重同步）
//!
//! ## 使用示例
//! ```ignore
//! use proxycast_lib::terminal::{TerminalSessionManager, SessionStatus};
//!
//! let manager = TerminalSessionManager::new(app_handle);
//! let session_id = manager.create_session(24, 80).await?;
//! manager.write_to_session(&session_id, b"ls -la\n").await?;
//! ```

pub mod block_controller;
pub mod connections;
pub mod error;
pub mod events;
pub mod integration;
pub mod persistence;
pub mod pty_session;
pub mod session_manager;

#[cfg(test)]
mod tests;

// 重新导出常用类型
pub use block_controller::{
    BlockController, BlockControllerRuntimeStatus, BlockInputUnion, BlockMeta, ControllerRegistry,
    ControllerStatusEvent, RuntimeOpts, ShellController, TermSize, CONTROLLER_STATUS_EVENT,
};
pub use connections::ShellProc;
pub use error::TerminalError;
pub use events::{SessionStatus, TerminalOutputEvent, TerminalStatusEvent};
pub use integration::{
    resync_controller, ResyncController, ResyncOptions, ResyncResult, TERMINAL_RESET_SEQUENCE,
    TERMINAL_SOFT_RESET_SEQUENCE,
};
pub use persistence::{BlockFile, SessionMetadataStore, SessionRecord};
pub use pty_session::{PtySession, DEFAULT_COLS, DEFAULT_ROWS};
pub use session_manager::{SessionMetadata, TerminalSessionManager};
