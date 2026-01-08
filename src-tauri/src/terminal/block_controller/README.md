# block_controller

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

块控制器模块，提供统一的控制器抽象层，支持不同类型的终端连接。

**核心原则：**
- 所有控制器类型实现统一的 BlockController trait
- 通过注册表管理控制器生命周期
- 支持 Shell、Cmd、SSH、WSL 等多种控制器类型

## 核心功能

- **BlockController trait**: 统一的控制器接口（start、stop、send_input、get_runtime_status）
- **ShellController**: Shell/Cmd 控制器实现，管理本地和远程 Shell 进程
- **控制器注册表**: 按 block_id 管理控制器实例
- **运行时状态**: 提供控制器状态查询
- **状态事件广播**: 通过 Tauri 事件系统广播状态更新

## 文件索引

- `mod.rs` - 模块入口和类型导出
- `traits.rs` - BlockController trait 定义、BlockControllerRuntimeStatus、BlockInputUnion、BlockMeta
- `registry.rs` - 控制器注册表（HashMap + RwLock）
- `shell_controller.rs` - ShellController 实现，支持 shell 和 cmd 两种模式

## 数据结构

### BlockControllerRuntimeStatus

```rust
pub struct BlockControllerRuntimeStatus {
    pub block_id: String,
    pub version: i32,
    pub shell_proc_status: String,  // "init" | "running" | "done"
    pub shell_proc_conn_name: Option<String>,
    pub shell_proc_exit_code: i32,
}
```

### BlockInputUnion

```rust
pub struct BlockInputUnion {
    pub input_data: Option<Vec<u8>>,
    pub sig_name: Option<String>,
    pub term_size: Option<TermSize>,
}
```

### BlockMeta

```rust
pub struct BlockMeta {
    pub controller: Option<String>,      // "shell" | "cmd"
    pub connection: Option<String>,      // SSH/WSL 连接名称
    pub cmd: Option<String>,             // 命令字符串
    pub cmd_args: Option<Vec<String>>,   // 命令参数
    pub cmd_cwd: Option<String>,         // 工作目录
    pub cmd_env: Option<HashMap<String, String>>,  // 环境变量
    pub cmd_run_on_start: Option<bool>,  // 启动时自动运行
    pub cmd_run_once: Option<bool>,      // 仅运行一次
    pub cmd_clear_on_start: Option<bool>, // 启动前清空输出
    pub cmd_close_on_exit: Option<bool>, // 退出后自动关闭
    // ... 其他终端配置
}
```

## ShellController 功能

### 支持的控制器类型

- **shell**: 交互式 Shell 模式，启动用户默认 Shell
- **cmd**: 命令执行模式，执行指定命令

### Cmd 模式配置选项

- `cmd_run_on_start`: 启动时自动运行命令（默认 true）
- `cmd_run_once`: 仅运行一次，不自动重启
- `cmd_clear_on_start`: 启动前清空输出历史
- `cmd_close_on_exit`: 命令退出后自动关闭

### 状态事件

通过 `controller:status` 事件广播状态更新：

```rust
pub struct ControllerStatusEvent {
    pub block_id: String,
    pub version: i32,
    pub shell_proc_status: String,
    pub shell_proc_conn_name: Option<String>,
    pub shell_proc_exit_code: i32,
}
```

## 依赖

- `async-trait` - 异步 trait 支持
- `tokio` - 异步运行时（RwLock、mpsc）
- `serde` - 序列化支持
- `scopeguard` - 作用域守卫
- `tauri` - 事件系统

## Requirements 覆盖

- 1.1: BlockController trait 定义
- 1.2: Shell 控制器创建
- 1.3: Cmd 控制器创建
- 1.6: 控制器注册表
- 1.8: get_runtime_status 方法
- 2.7: 状态事件广播
- 16.5: cmd:runonstart 配置
- 16.6: cmd:runonce 配置
- 16.7: cmd:clearonstart 配置
- 16.8: cmd:closeonexit 配置
- 16.9: 重启按钮支持

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
