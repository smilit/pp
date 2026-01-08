/**
 * @file index.ts
 * @description 终端状态管理模块入口
 * @module lib/terminal/store
 *
 * 使用 Jotai 进行原子化状态管理，为每个终端维护独立的原子状态。
 *
 * ## 功能
 * - 终端模式状态（term/vdom）
 * - 连接状态管理
 * - 字体大小配置
 * - 主题配置
 * - Shell 进程状态
 * - 后端事件订阅和状态同步
 *
 * _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
 */

// 导出原子状态
export * from "./atoms";

// 导出类型
export * from "./types";

// 导出事件订阅
export * from "./events";

// 导出 React Hooks
export * from "./hooks";

// 导出视图模型
export * from "./viewmodel";

// 导出多输入模式
export * from "./multiInput";
