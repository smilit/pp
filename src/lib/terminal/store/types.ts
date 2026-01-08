/**
 * @file types.ts
 * @description 终端状态类型定义
 * @module lib/terminal/store/types
 *
 * 定义终端状态管理所需的类型。
 *
 * _Requirements: 9.2, 9.3, 9.4, 9.5_
 */

// ============================================================================
// 终端模式
// ============================================================================

/**
 * 终端模式类型
 *
 * - term: 标准终端模式
 * - vdom: 虚拟 DOM 模式（终端内嵌 UI）
 *
 * _Requirements: 14.1_
 */
export type TermMode = "term" | "vdom";

// ============================================================================
// 连接状态
// ============================================================================

/**
 * 连接状态字符串
 *
 * _Requirements: 7.2_
 */
export type ConnectionStatusType =
  | "init"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/**
 * 连接状态详情
 *
 * 对应后端的 ConnStatus 结构体。
 *
 * _Requirements: 7.1_
 */
export interface ConnStatus {
  /** 状态字符串 */
  status: ConnectionStatusType;
  /** 是否已连接 */
  connected: boolean;
  /** 连接名称 */
  connection: string;
  /** 是否曾经连接成功 */
  hasConnected: boolean;
  /** 活跃连接数 */
  activeConnNum: number;
  /** 错误信息 */
  error?: string;
  /** wsh 是否启用 */
  wshEnabled: boolean;
  /** wsh 错误信息 */
  wshError?: string;
  /** 不使用 wsh 的原因 */
  noWshReason?: string;
  /** wsh 版本 */
  wshVersion?: string;
}

/**
 * 创建默认连接状态
 */
export function createDefaultConnStatus(connection: string = ""): ConnStatus {
  return {
    status: "init",
    connected: false,
    connection,
    hasConnected: false,
    activeConnNum: 0,
    wshEnabled: false,
  };
}

// ============================================================================
// Shell 进程状态
// ============================================================================

/**
 * Shell 进程状态类型
 *
 * _Requirements: 1.2, 1.3_
 */
export type ShellProcStatus = "init" | "running" | "done";

/**
 * 块控制器运行时状态
 *
 * 对应后端的 BlockControllerRuntimeStatus 结构体。
 *
 * _Requirements: 1.8_
 */
export interface BlockControllerRuntimeStatus {
  /** 块 ID */
  blockId: string;
  /** 状态版本号 */
  version: number;
  /** Shell 进程状态 */
  shellProcStatus: ShellProcStatus;
  /** Shell 进程连接名称 */
  shellProcConnName?: string;
  /** Shell 进程退出码 */
  shellProcExitCode: number;
}

/**
 * 创建默认控制器运行时状态
 */
export function createDefaultRuntimeStatus(
  blockId: string,
): BlockControllerRuntimeStatus {
  return {
    blockId,
    version: 0,
    shellProcStatus: "init",
    shellProcExitCode: 0,
  };
}

// ============================================================================
// 终端视图模型
// ============================================================================

/**
 * 终端视图模型状态
 *
 * 包含单个终端的所有状态。
 *
 * _Requirements: 9.7_
 */
export interface TerminalViewState {
  /** 块 ID */
  blockId: string;
  /** 标签页 ID */
  tabId: string;
  /** 终端模式 */
  termMode: TermMode;
  /** 连接状态 */
  connStatus: ConnStatus;
  /** 字体大小 */
  fontSize: number;
  /** 主题名称 */
  themeName: string;
  /** Shell 进程状态 */
  shellProcStatus: ShellProcStatus;
  /** 完整的控制器运行时状态 */
  runtimeStatus: BlockControllerRuntimeStatus;
}

/**
 * 创建默认终端视图状态
 */
export function createDefaultTerminalViewState(
  blockId: string,
  tabId: string,
): TerminalViewState {
  return {
    blockId,
    tabId,
    termMode: "term",
    connStatus: createDefaultConnStatus(),
    fontSize: 14,
    themeName: "tokyo-night",
    shellProcStatus: "init",
    runtimeStatus: createDefaultRuntimeStatus(blockId),
  };
}

// ============================================================================
// 后端事件类型
// ============================================================================

/**
 * 控制器状态事件
 *
 * 对应后端的 ControllerStatusEvent。
 */
export interface ControllerStatusEvent {
  /** 块 ID */
  blockId: string;
  /** 状态版本号 */
  version: number;
  /** Shell 进程状态 */
  shellProcStatus: ShellProcStatus;
  /** Shell 进程连接名称 */
  shellProcConnName?: string;
  /** Shell 进程退出码 */
  shellProcExitCode: number;
}

/**
 * 连接变更事件
 *
 * 对应后端的 ConnChangeEvent。
 */
export interface ConnChangeEvent {
  /** 连接名称 */
  connection: string;
  /** 连接状态详情 */
  status: ConnStatus;
}
