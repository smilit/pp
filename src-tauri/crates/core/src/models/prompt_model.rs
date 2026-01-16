//! Prompt 数据模型

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Prompt {
    pub id: String,
    pub app_type: String,
    pub name: String,
    pub content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(default)]
    pub enabled: bool,
    #[serde(rename = "createdAt", skip_serializing_if = "Option::is_none")]
    pub created_at: Option<i64>,
    #[serde(rename = "updatedAt", skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<i64>,
}

impl Prompt {
    #[allow(dead_code)]
    pub fn new(id: String, app_type: String, name: String, content: String) -> Self {
        let now = chrono::Utc::now().timestamp();
        Self {
            id,
            app_type,
            name,
            content,
            description: None,
            enabled: false,
            created_at: Some(now),
            updated_at: Some(now),
        }
    }
}
