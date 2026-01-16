//! 机器码相关数据模型

use serde::{Deserialize, Serialize};

/// 机器码信息结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MachineIdInfo {
    pub current_id: String,
    pub original_id: Option<String>,
    pub platform: String,
    pub can_modify: bool,
    pub requires_admin: bool,
    pub backup_exists: bool,
    pub format_type: MachineIdFormat,
}

/// 机器码操作结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MachineIdResult {
    pub success: bool,
    pub message: String,
    pub requires_restart: bool,
    pub requires_admin: bool,
    pub new_machine_id: Option<String>,
}

/// 管理员权限状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdminStatus {
    pub is_admin: bool,
    pub platform: String,
    pub elevation_method: Option<String>,
    pub check_success: bool,
}

/// 机器码格式类型
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MachineIdFormat {
    Uuid,
    #[serde(rename = "hex32")]
    Hex32,
    #[serde(rename = "unknown")]
    Unknown,
}

/// 机器码备份信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MachineIdBackup {
    pub machine_id: String,
    pub timestamp: i64,
    pub platform: String,
    pub format: MachineIdFormat,
    pub description: Option<String>,
}

/// 机器码历史记录
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MachineIdHistory {
    pub id: String,
    pub machine_id: String,
    pub timestamp: String,
    pub platform: String,
    pub backup_path: Option<String>,
}

/// 机器码操作类型
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub enum MachineIdOperation {
    Get,
    Set,
    Generate,
    Backup,
    Restore,
    Reset,
}

/// 机器码验证结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MachineIdValidation {
    pub is_valid: bool,
    pub detected_format: MachineIdFormat,
    pub error_message: Option<String>,
    pub formatted_id: Option<String>,
}

impl MachineIdFormat {
    /// 从字符串检测机器码格式
    pub fn detect(machine_id: &str) -> Self {
        let cleaned = machine_id.replace("-", "").replace(" ", "").to_lowercase();

        if machine_id.contains("-") && machine_id.len() == 36 {
            let parts: Vec<&str> = machine_id.split('-').collect();
            if parts.len() == 5
                && parts[0].len() == 8
                && parts[1].len() == 4
                && parts[2].len() == 4
                && parts[3].len() == 4
                && parts[4].len() == 12
                && cleaned.chars().all(|c| c.is_ascii_hexdigit())
            {
                return MachineIdFormat::Uuid;
            }
        }

        if cleaned.len() == 32 && cleaned.chars().all(|c| c.is_ascii_hexdigit()) {
            return MachineIdFormat::Hex32;
        }

        MachineIdFormat::Unknown
    }

    /// 格式化机器码为标准格式
    pub fn format_machine_id(&self, machine_id: &str) -> Result<String, String> {
        let cleaned = machine_id.replace("-", "").replace(" ", "").to_lowercase();

        match self {
            MachineIdFormat::Uuid => {
                if cleaned.len() != 32 {
                    return Err("UUID format requires 32 hex characters".to_string());
                }
                if !cleaned.chars().all(|c| c.is_ascii_hexdigit()) {
                    return Err("UUID format requires hex characters only".to_string());
                }
                Ok(format!(
                    "{}-{}-{}-{}-{}",
                    &cleaned[0..8],
                    &cleaned[8..12],
                    &cleaned[12..16],
                    &cleaned[16..20],
                    &cleaned[20..32]
                ))
            }
            MachineIdFormat::Hex32 => {
                if cleaned.len() != 32 {
                    return Err("Hex32 format requires 32 hex characters".to_string());
                }
                if !cleaned.chars().all(|c| c.is_ascii_hexdigit()) {
                    return Err("Hex32 format requires hex characters only".to_string());
                }
                Ok(cleaned)
            }
            MachineIdFormat::Unknown => Err("Cannot format unknown machine ID format".to_string()),
        }
    }
}

impl std::fmt::Display for MachineIdFormat {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MachineIdFormat::Uuid => write!(f, "uuid"),
            MachineIdFormat::Hex32 => write!(f, "hex32"),
            MachineIdFormat::Unknown => write!(f, "unknown"),
        }
    }
}

impl std::fmt::Display for MachineIdOperation {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MachineIdOperation::Get => write!(f, "Get"),
            MachineIdOperation::Set => write!(f, "Set"),
            MachineIdOperation::Generate => write!(f, "Generate"),
            MachineIdOperation::Backup => write!(f, "Backup"),
            MachineIdOperation::Restore => write!(f, "Restore"),
            MachineIdOperation::Reset => write!(f, "Reset"),
        }
    }
}
