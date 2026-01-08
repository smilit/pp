# 终端持久化模块

提供终端会话数据的持久化存储能力。

## 模块结构

| 文件 | 说明 |
|------|------|
| `mod.rs` | 模块入口，导出公共类型 |
| `block_file.rs` | 块文件循环缓冲存储 |
| `session_store.rs` | 会话元数据 SQLite 存储 |

## 功能

### BlockFile - 块文件存储

- 终端输出历史的文件存储
- 循环缓冲策略（超过最大大小时覆盖旧数据）
- 默认最大大小 256KB
- 支持读取、追加、截断操作

### SessionMetadataStore - 会话元数据存储

- 会话元数据的 SQLite 存储
- 支持 CRUD 操作
- 支持按状态、标签页查询
- 支持会话恢复

## 使用示例

```rust
use proxycast_lib::terminal::persistence::{BlockFile, SessionMetadataStore, SessionRecord};

// 创建块文件
let base_dir = BlockFile::default_base_dir()?;
let block_file = BlockFile::with_default_size("session-123", &base_dir)?;

// 追加数据
block_file.append_data(b"Hello, World!")?;

// 读取数据
let data = block_file.read_all()?;

// 创建会话存储
let store = SessionMetadataStore::new(db_connection);
store.init_tables()?;

// 保存会话记录
let record = SessionRecord::new(
    "session-123".to_string(),
    "block-123".to_string(),
    "tab-1".to_string(),
    "shell".to_string(),
    None,
);
store.save(&record)?;
```

## 相关需求

- Requirements 3.1, 3.2, 3.3, 3.4, 3.7 - 块文件存储
- Requirements 3.5, 3.9 - 会话元数据存储
