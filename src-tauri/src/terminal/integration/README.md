# integration

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

集成模块，提供 Shell 集成、OSC 序列解析、状态重同步、Shell 集成脚本管理等功能。

**核心原则：**
- OSC 序列解析和处理
- Shell 集成状态管理
- Shell 集成脚本安装和管理
- 终端状态重同步机制

## 核心功能

- **OSC 解析器**: 解析 OSC 7/52/133/16162 序列
- **Shell 集成**: 目录同步、命令时间记录、状态管理
- **Shell 脚本**: 各种 Shell 的集成脚本安装和启动配置
- **状态重同步**: 连接恢复时重建终端状态

## 文件索引

- `mod.rs` - 模块入口，导出公共类型
- `resync.rs` - 状态重同步控制器，实现终端状态重建
- `osc_parser.rs` - OSC 序列解析器，支持 OSC 7/52/133/16162
- `shell_integration.rs` - Shell 集成处理器，管理 Shell 状态和命令跟踪
- `shell_scripts.rs` - Shell 集成脚本管理，支持 Bash/Zsh/Fish/PowerShell

## 已实现功能

### 任务 6: 状态重同步控制器 ✅
- `ResyncController` - 状态重同步控制器
- `resync_controller` - 便捷重同步函数
- `ResyncOptions` - 重同步选项配置
- `ResyncResult` - 重同步结果
- 终端重置序列发送（完全重置和软重置）
- 历史数据恢复（从 BlockFile 读取）

### 任务 7.1: OSC 序列解析器 ✅
- `OSCParser` - OSC 序列解析器
- `OSCSequence` - OSC 序列类型枚举
- `PromptMarkType` - 命令提示符标记类型
- `ParsedOSC` - 解析结果结构
- `strip_osc_sequences` - 过滤 OSC 序列工具函数
- 支持 OSC 7（当前目录）、OSC 52（剪贴板）、OSC 133（命令标记）、OSC 16162（Wave 命令）

### 任务 7.3: ShellIntegration 处理器 ✅
- `ShellIntegration` - Shell 集成处理器
- `ShellIntegrationStatus` - 集成状态枚举（Ready、RunningCommand、Unknown）
- `ShellType` - Shell 类型枚举（Bash、Zsh、Fish、Pwsh）
- `CommandInfo` - 命令执行信息（开始时间、结束时间、持续时间）
- `ShellIntegrationEvent` - 状态变更事件
- 当前目录跟踪（OSC 7）
- 命令时间记录（OSC 133）
- Wave 命令处理（OSC 16162）

### 任务 21.1: Shell 集成脚本安装 ✅
- `ShellScripts` - Shell 集成脚本管理器
- `ShellLaunchConfig` - Shell 启动配置
- `ShellLaunchBuilder` - Shell 启动配置构建器
- Bash 集成（--rcfile 参数）
- Zsh 集成（ZDOTDIR 环境变量）
- Fish 集成（-C source 参数）
- PowerShell 集成（-NoExit -Command）
- 自动安装集成脚本到应用数据目录

### 任务 21.2: 环境变量配置 ✅
- `TerminalEnvConfig` - 终端环境变量配置管理器
- 标准环境变量设置（TERM、COLORTERM）
- 块标识环境变量（PROXYCAST_BLOCKID、WAVETERM_BLOCKID）
- 版本信息环境变量（PROXYCAST_VERSION）
- 语言设置环境变量（LANG、LC_ALL）
- 自定义环境变量合并支持

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
