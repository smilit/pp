# connections

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

连接模块，提供不同类型的终端连接实现。

**核心原则：**
- 封装 PTY 进程管理
- 支持本地、SSH、WSL 多种连接类型
- 异步输入输出处理

## 核心功能

- **ShellProc**: 本地 PTY 进程封装，支持 shell 和 cmd 模式
- **SSHConn**: SSH 远程连接管理器，支持多种认证方式
- **SSHShellProc**: SSH 远程 Shell 进程封装，支持远程 PTY 创建和数据转发
- **WSLConn**: WSL 连接管理器（仅 Windows），支持发行版列表和 PTY 创建
- **输出读取**: 异步读取 PTY 输出并通过 Tauri 事件推送
- **输入处理**: 处理键盘输入、信号和终端大小调整
- **块文件集成**: 自动保存输出到块文件

## 文件索引

- `mod.rs` - 模块入口和类型导出
- `local_pty.rs` - 本地 PTY 连接实现（ShellProc）
- `ssh_connection.rs` - SSH 远程连接实现
- `ssh_shell_proc.rs` - SSH 远程 Shell 进程实现
- `wsl_connection.rs` - WSL 连接实现（仅 Windows）
- `connection_router.rs` - 连接类型路由和工厂模式

## ShellProc 功能

### 创建进程

```rust
let shell_proc = ShellProc::new(
    block_id,
    controller_type,  // "shell" | "cmd"
    rows,
    cols,
    app_handle,
    block_meta,
    input_rx,
    block_file,
).await?;
```

### 支持的命令模式

- **shell 模式**: 启动用户默认 Shell（$SHELL 或 /bin/bash）
- **cmd 模式**: 执行指定命令，支持参数和环境变量

### 环境变量

自动设置以下环境变量：
- `TERM=xterm-256color`
- `COLORTERM=truecolor`
- 自定义环境变量（通过 `cmd_env`）

### 进程控制

- `terminate()`: 优雅终止（SIGTERM）
- `kill()`: 强制终止（SIGKILL）
- `resize()`: 调整终端大小
- `write()`: 写入数据到 PTY

## SSH 连接功能

### 连接字符串解析

```rust
// 支持多种格式
let opts = SSHOpts::parse("user@host:port")?;
let opts = SSHOpts::parse("ssh://user@host")?;
let opts = SSHOpts::parse("[::1]:22")?;  // IPv6
```

### 连接状态管理

```rust
let conn = SSHConn::new(opts);
conn.connect(&conn_flags).await?;
conn.authenticate(&auth_methods).await?;
let status = conn.derive_conn_status();
```

### 支持的认证方式

- 公钥认证（密钥文件）
- SSH Agent 认证
- 密码认证
- 键盘交互认证（待完善）

### SSH 配置文件解析

支持从 `~/.ssh/config` 读取连接配置：

```rust
// 获取主机配置（自动合并通配符配置）
let config = SSHConfigParser::get_host_config("myserver")?;

// 从指定文件获取配置
let config = SSHConfigParser::get_host_config_from_file(&path, "myserver")?;

// 解析配置内容
let hosts = SSHConfigParser::parse_config_content(content)?;
```

#### 支持的配置选项

- **基础选项**: HostName, User, Port, IdentityFile
- **认证选项**: PubkeyAuthentication, PasswordAuthentication, KbdInteractiveAuthentication, PreferredAuthentications
- **连接选项**: ConnectTimeout, ServerAliveInterval, ServerAliveCountMax, Compression
- **代理选项**: ProxyJump, ProxyCommand
- **转发选项**: LocalForward, RemoteForward, DynamicForward, ForwardAgent
- **其他选项**: BatchMode, StrictHostKeyChecking, RequestTTY, RemoteCommand, SendEnv, SetEnv

#### 配置合并语义

遵循 SSH 配置文件的 "first match wins" 语义：
- 按顺序遍历所有 Host 块
- 如果模式匹配，合并配置（第一个匹配的值优先）
- 通配符 `*` 匹配所有主机
- IdentityFile 是累加的（不覆盖）

#### 通配符模式匹配

支持以下模式：
- `*` - 匹配所有
- `*.example.com` - 后缀匹配
- `server*` - 前缀匹配
- `?` - 匹配单个字符
- `!pattern` - 否定匹配（排除）

### ProxyJump 支持

支持跳板机配置，最大深度为 10：

```rust
// 解析 ProxyJump 链
let chain = SSHConfigParser::parse_proxy_jump_chain("jump1.com, user@jump2.com:2222");

// 解析单个跳板机
let opts = SSHConfigParser::parse_proxy_jump_host("user@jump.example.com:2222")?;

// 解析完整的 ProxyJump 链（递归解析每个跳板机的配置）
let chain = SSHConfigParser::resolve_proxy_jump_chain("bastion@jump.example.com", 0)?;
```

## SSH 远程 Shell 进程功能

### 创建远程 Shell 进程

```rust
// 从 SSH 会话创建
let ssh_proc = SSHShellProc::new(
    block_id,
    controller_type,  // "shell" | "cmd"
    &session,
    rows,
    cols,
    app_handle,
    block_meta,
    input_rx,
    block_file,
).await?;

// 从 SSHConn 创建（便捷方法）
let ssh_proc = SSHShellProc::from_ssh_conn(
    block_id,
    controller_type,
    &ssh_conn,
    rows,
    cols,
    app_handle,
    block_meta,
    input_rx,
    block_file,
).await?;
```

### 远程 PTY 功能

- **PTY 请求**: 使用 xterm-256color 终端类型
- **Shell 模式**: 启动远程交互式 Shell
- **Cmd 模式**: 执行远程命令，支持工作目录和环境变量
- **数据转发**: 异步读取远程输出并推送到前端
- **终端大小同步**: 自动同步终端大小到远程 PTY

### 进程控制

- `terminate()`: 优雅终止（发送 Ctrl+C 并关闭 Channel）
- `kill()`: 强制终止（直接关闭 Channel）
- `resize()`: 调整远程 PTY 大小
- `write()`: 写入数据到远程 PTY
- `send_eof()`: 发送 EOF 到远程

### 信号处理

由于 ssh2 crate 限制，信号通过控制字符发送：
- `SIGINT`: 发送 Ctrl+C (0x03)
- `SIGQUIT`: 发送 Ctrl+\ (0x1C)

## WSL 连接功能（仅 Windows）

### 连接字符串解析

```rust
// 支持多种格式
let opts = WSLOpts::parse("wsl://")?;           // 默认发行版
let opts = WSLOpts::parse("wsl://Ubuntu")?;     // 指定发行版
let opts = WSLOpts::parse("wsl://Ubuntu/home/user")?;  // 指定路径
```

### 发行版管理

```rust
// 列出所有可用的 WSL 发行版
let distros = WSLConn::list_distros()?;

// 获取默认发行版
let default = WSLConn::get_default_distro()?;

// 检查 WSL 是否可用
let available = WSLConn::is_wsl_available();
```

### 连接状态管理

```rust
let conn = WSLConn::new(opts);
conn.connect().await?;
let status = conn.derive_conn_status();
```

### WSL Shell 进程

```rust
let wsl_proc = WSLShellProc::new(
    block_id,
    opts,
    rows,
    cols,
    app_handle,
    block_meta,
    input_rx,
    block_file,
).await?;
```

### 连接类型检测

```rust
// 检测连接类型
is_local_conn_name("local");      // true
is_ssh_conn_name("user@host");    // true
is_wsl_conn_name("wsl://Ubuntu"); // true
```

## 连接类型路由

### 自动路由

根据连接名称自动选择连接类型：

```rust
use crate::terminal::connections::{ConnectionRouter, ConnectionType};

// 自动路由
let conn_type = ConnectionRouter::route("");           // Local
let conn_type = ConnectionRouter::route("local");      // Local
let conn_type = ConnectionRouter::route("user@host");  // SSH
let conn_type = ConnectionRouter::route("wsl://Ubuntu"); // WSL
```

### 路由规则

1. 空字符串或 "local" → `ConnectionType::Local`
2. 以 "wsl://" 开头或等于 "wsl" → `ConnectionType::WSL`
3. 以 "ssh://" 开头、包含 "@" 或其他非本地/WSL 格式 → `ConnectionType::SSH`

### 连接验证

```rust
// 验证连接名称格式
let conn_type = ConnectionRouter::validate("user@host:22")?;

// 检查连接类型是否在当前平台可用
let available = ConnectionRouter::is_available(ConnectionType::WSL);
```

### 连接信息

```rust
// 获取完整的连接信息
let info = ConnectionInfo::from_conn_name("user@host");
println!("类型: {}", info.conn_type);       // ssh
println!("可用: {}", info.available);       // true
println!("描述: {}", info.description);     // SSH 远程连接
```

## 事件

通过 Tauri 事件系统发送：
- `terminal:output` - 终端输出数据（Base64 编码）
- `terminal:status` - 终端状态变化
- `terminal:conn-change` - 连接状态变化

## 依赖

- `portable-pty` - 跨平台 PTY 支持
- `ssh2` - SSH 协议支持
- `tokio` - 异步运行时
- `base64` - 数据编码
- `parking_lot` - 高性能锁

## Requirements 覆盖

### 连接类型路由 (connection_router.rs)
- 1.4: 创建 SSH 终端时使用 SSH_Connection 建立远程连接
- 1.5: 创建 WSL 终端时使用 WSL_Connection 建立连接

### 本地 PTY (local_pty.rs)
- 16.1: cmd 命令字符串配置
- 16.2: cmd_args 参数配置
- 16.3: cmd_cwd 工作目录配置
- 17.1: Shell 进程生命周期管理
- 17.2: 环境变量设置
- 17.3: 优雅终止和强制终止
- 17.4: 退出码记录

### SSH 连接 (ssh_connection.rs)
- 4.1: SSH 连接字符串解析
- 4.3-4.6: 多种认证方式
- 4.7: ProxyJump 跳板机配置支持
- 4.10: 连接断开处理
- 4.12: SSH 配置文件解析（~/.ssh/config）
- 7.1-7.7: 连接状态管理

### SSH 远程 Shell 进程 (ssh_shell_proc.rs)
- 4.2: SSH 连接建立成功时创建远程 PTY 会话
- 4.7: 支持 ProxyJump 配置（通过 SSHConn）
- 4.11: 用户调整终端大小时同步调整远程 PTY 大小

### WSL 连接 (wsl_connection.rs)
- 5.1: 连接到指定的 WSL 发行版
- 5.2: 创建 PTY 会话
- 5.3: 列出所有可用的 WSL 发行版
- 5.4: 连接断开处理和重连
- 5.6: 终端大小同步

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
