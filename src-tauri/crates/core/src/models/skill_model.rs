//! Skill 数据模型

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Skill {
    pub key: String,
    pub name: String,
    pub description: String,
    pub directory: String,
    #[serde(rename = "readmeUrl", skip_serializing_if = "Option::is_none")]
    pub readme_url: Option<String>,
    pub installed: bool,
    #[serde(rename = "repoOwner", skip_serializing_if = "Option::is_none")]
    pub repo_owner: Option<String>,
    #[serde(rename = "repoName", skip_serializing_if = "Option::is_none")]
    pub repo_name: Option<String>,
    #[serde(rename = "repoBranch", skip_serializing_if = "Option::is_none")]
    pub repo_branch: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillRepo {
    pub owner: String,
    pub name: String,
    pub branch: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillState {
    pub installed: bool,
    pub installed_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillMetadata {
    pub name: Option<String>,
    pub description: Option<String>,
}

impl Default for SkillRepo {
    fn default() -> Self {
        Self {
            owner: String::new(),
            name: String::new(),
            branch: "main".to_string(),
            enabled: true,
        }
    }
}

#[allow(dead_code)]
impl SkillRepo {
    pub fn new(owner: String, name: String, branch: String) -> Self {
        Self {
            owner,
            name,
            branch,
            enabled: true,
        }
    }

    pub fn github_url(&self) -> String {
        format!("https://github.com/{}/{}", self.owner, self.name)
    }

    pub fn zip_url(&self) -> String {
        format!(
            "https://github.com/{}/{}/archive/refs/heads/{}.zip",
            self.owner, self.name, self.branch
        )
    }
}

pub fn get_default_skill_repos() -> Vec<SkillRepo> {
    vec![
        SkillRepo {
            owner: "proxycast".to_string(),
            name: "skills".to_string(),
            branch: "main".to_string(),
            enabled: true,
        },
        SkillRepo {
            owner: "ComposioHQ".to_string(),
            name: "awesome-claude-skills".to_string(),
            branch: "main".to_string(),
            enabled: true,
        },
        SkillRepo {
            owner: "anthropics".to_string(),
            name: "skills".to_string(),
            branch: "main".to_string(),
            enabled: true,
        },
        SkillRepo {
            owner: "cexll".to_string(),
            name: "myclaude".to_string(),
            branch: "master".to_string(),
            enabled: true,
        },
    ]
}

pub type SkillStates = HashMap<String, SkillState>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_repos_include_proxycast_official() {
        let repos = get_default_skill_repos();

        assert!(!repos.is_empty(), "默认仓库列表不应为空");

        let first_repo = &repos[0];
        assert_eq!(
            first_repo.owner, "proxycast",
            "第一个仓库的 owner 应为 proxycast"
        );
        assert_eq!(first_repo.name, "skills", "第一个仓库的 name 应为 skills");
        assert_eq!(first_repo.branch, "main", "第一个仓库的 branch 应为 main");
        assert!(first_repo.enabled, "ProxyCast 官方仓库应默认启用");
    }

    #[test]
    fn test_proxycast_repo_exists_in_list() {
        let repos = get_default_skill_repos();

        let proxycast_repo = repos
            .iter()
            .find(|r| r.owner == "proxycast" && r.name == "skills");
        assert!(
            proxycast_repo.is_some(),
            "ProxyCast 官方仓库应存在于默认列表中"
        );

        let repo = proxycast_repo.unwrap();
        assert_eq!(repo.branch, "main");
        assert!(repo.enabled);
    }
}
