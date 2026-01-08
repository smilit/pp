/**
 * @file types.ts
 * @description VDOM 类型定义
 * @module lib/terminal/vdom/types
 *
 * 定义终端内嵌 VDOM 块的类型。
 *
 * _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
 */

// ============================================================================
// VDOM 块类型
// ============================================================================

/**
 * VDOM 块类型
 *
 * 支持的 VDOM 块类型。
 */
export type VDomBlockType = "widget" | "toolbar" | "custom";

/**
 * VDOM 块状态
 */
export type VDomBlockStatus = "loading" | "ready" | "error" | "closed";

/**
 * VDOM 块配置
 *
 * _Requirements: 14.3_
 */
export interface VDomBlockConfig {
  /** 块 ID */
  id: string;
  /** 块类型 */
  type: VDomBlockType;
  /** 块标题（可选） */
  title?: string;
  /** 块内容组件名称 */
  component: string;
  /** 块属性 */
  props?: Record<string, unknown>;
  /** 块位置（相对于终端） */
  position?: VDomBlockPosition;
  /** 块大小 */
  size?: VDomBlockSize;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否可调整大小 */
  resizable?: boolean;
}

/**
 * VDOM 块位置
 */
export interface VDomBlockPosition {
  /** 顶部偏移（像素或百分比） */
  top?: number | string;
  /** 左侧偏移（像素或百分比） */
  left?: number | string;
  /** 底部偏移（像素或百分比） */
  bottom?: number | string;
  /** 右侧偏移（像素或百分比） */
  right?: number | string;
}

/**
 * VDOM 块大小
 */
export interface VDomBlockSize {
  /** 宽度（像素或百分比） */
  width?: number | string;
  /** 高度（像素或百分比） */
  height?: number | string;
  /** 最小宽度 */
  minWidth?: number;
  /** 最小高度 */
  minHeight?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 最大高度 */
  maxHeight?: number;
}

/**
 * VDOM 块实例
 *
 * 运行时的 VDOM 块实例。
 *
 * _Requirements: 14.3, 14.4_
 */
export interface VDomBlock {
  /** 块配置 */
  config: VDomBlockConfig;
  /** 块状态 */
  status: VDomBlockStatus;
  /** 是否聚焦 */
  focused: boolean;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
  /** 错误信息（如果有） */
  error?: string;
}

// ============================================================================
// VDOM 工具栏类型
// ============================================================================

/**
 * VDOM 工具栏配置
 *
 * _Requirements: 14.4_
 */
export interface VDomToolbarConfig {
  /** 工具栏 ID */
  id: string;
  /** 工具栏项目 */
  items: VDomToolbarItem[];
  /** 工具栏位置 */
  position: "top" | "bottom";
  /** 是否可见 */
  visible: boolean;
}

/**
 * VDOM 工具栏项目
 */
export interface VDomToolbarItem {
  /** 项目 ID */
  id: string;
  /** 项目类型 */
  type: "button" | "separator" | "custom";
  /** 项目标签 */
  label?: string;
  /** 项目图标 */
  icon?: string;
  /** 项目提示 */
  tooltip?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击处理函数名称 */
  onClick?: string;
  /** 自定义组件名称（type 为 custom 时） */
  component?: string;
  /** 自定义属性 */
  props?: Record<string, unknown>;
}

// ============================================================================
// VDOM 事件类型
// ============================================================================

/**
 * VDOM 事件类型
 */
export type VDomEventType =
  | "block:create"
  | "block:close"
  | "block:focus"
  | "block:blur"
  | "block:update"
  | "toolbar:action";

/**
 * VDOM 事件
 */
export interface VDomEvent {
  /** 事件类型 */
  type: VDomEventType;
  /** 块 ID */
  blockId?: string;
  /** 事件数据 */
  data?: Record<string, unknown>;
  /** 时间戳 */
  timestamp: number;
}

// ============================================================================
// VDOM 上下文类型
// ============================================================================

/**
 * VDOM 上下文
 *
 * 提供给 VDOM 块的上下文信息。
 */
export interface VDomContext {
  /** 终端块 ID */
  terminalBlockId: string;
  /** 标签页 ID */
  tabId: string;
  /** 当前终端模式 */
  termMode: "term" | "vdom";
  /** 发送事件到终端 */
  sendEvent: (event: VDomEvent) => void;
  /** 切换回终端模式 */
  switchToTerminal: () => void;
  /** 关闭 VDOM 块 */
  closeBlock: (blockId: string) => void;
}

// ============================================================================
// 工厂函数
// ============================================================================

/**
 * 创建默认 VDOM 块配置
 */
export function createDefaultVDomBlockConfig(
  id: string,
  component: string,
): VDomBlockConfig {
  return {
    id,
    type: "widget",
    component,
    closable: true,
    draggable: false,
    resizable: false,
  };
}

/**
 * 创建 VDOM 块实例
 */
export function createVDomBlock(config: VDomBlockConfig): VDomBlock {
  const now = Date.now();
  return {
    config,
    status: "loading",
    focused: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 创建默认工具栏配置
 */
export function createDefaultToolbarConfig(id: string): VDomToolbarConfig {
  return {
    id,
    items: [],
    position: "top",
    visible: true,
  };
}
