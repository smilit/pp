# docs

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

项目文档目录，包含技术规格、操作指南、AI Agent 文档和文档站点配置。
使用 Nuxt Content 构建文档站点。

## 文件索引

- `aiprompts/` - AI Agent 模块文档（参考 aster-rust 模式）
- `content/` - 文档内容（Markdown）
- `develop/` - 开发文档
- `images/` - 文档图片资源
- `plugins/` - 插件文档
- `prd/` - 产品需求文档
- `tests/` - 测试文档
- `TECH_SPEC.md` - 技术规格文档
- `LLM_FLOW_MONITOR_SPEC.md` - LLM 流量监控规格
- `ops.md` - 运维操作指南
- `plugin-ui-design.md` - 插件 UI 设计文档
- `three-stage-workflow-guide.md` - 三阶段工作流指南
- `app.config.ts` - Nuxt 应用配置
- `nuxt.config.ts` - Nuxt 框架配置
- `package.json` - 文档站点依赖

## aiprompts 文档索引

AI Agent 专用文档，提供模块级别的详细说明：

- `overview.md` - 项目架构概览
- `providers.md` - Provider 系统
- `credential-pool.md` - 凭证池管理
- `converter.md` - 协议转换
- `server.md` - HTTP 服务器
- `flow-monitor.md` - 流量监控
- `components.md` - 组件系统
- `hooks.md` - React Hooks
- `services.md` - 业务服务
- `commands.md` - Tauri 命令
- `mcp.md` - MCP 服务器
- `lib.md` - 工具库
- `plugins.md` - 插件系统
- `database.md` - 数据库层
- `terminal.md` - 内置终端

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
