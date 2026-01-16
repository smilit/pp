//! 核心类型模块
//!
//! 包含纯数据类型（models）、静态数据（data）、日志配置（logger）
//!
//! 本 crate 不包含任何业务逻辑，只提供基础类型定义。

pub mod data;
pub mod logger;
pub mod models;

// 重新导出常用类型
pub use logger::{LogEntry, LogStore, LogStoreConfig, SharedLogStore};
pub use models::provider_type::ProviderType;
pub use models::*;

pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}
