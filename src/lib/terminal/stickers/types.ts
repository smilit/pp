/**
 * @file types.ts
 * @description 终端贴纸系统类型定义
 * @module lib/terminal/stickers/types
 *
 * 定义终端贴纸系统所需的类型。
 *
 * _Requirements: 15.1, 15.2, 15.3, 15.4_
 */

// ============================================================================
// 贴纸位置
// ============================================================================

/**
 * 字符网格位置
 *
 * 基于终端字符网格的定位系统。
 *
 * _Requirements: 15.2_
 */
export interface CharGridPosition {
  /** 行号（从 0 开始） */
  row: number;
  /** 列号（从 0 开始） */
  col: number;
}

/**
 * 像素位置
 *
 * 用于实际渲染时的像素定位。
 */
export interface PixelPosition {
  /** 顶部偏移（像素） */
  top: number;
  /** 左侧偏移（像素） */
  left: number;
}

// ============================================================================
// 贴纸样式
// ============================================================================

/**
 * 贴纸样式配置
 *
 * _Requirements: 15.3_
 */
export interface StickerStyle {
  /** 背景颜色 */
  backgroundColor?: string;
  /** 文字颜色 */
  color?: string;
  /** 边框颜色 */
  borderColor?: string;
  /** 边框宽度 */
  borderWidth?: number;
  /** 边框圆角 */
  borderRadius?: number;
  /** 内边距 */
  padding?: number;
  /** 字体大小 */
  fontSize?: number;
  /** 字体粗细 */
  fontWeight?: string | number;
  /** 透明度 (0-1) */
  opacity?: number;
  /** 最大宽度（字符数） */
  maxWidthChars?: number;
  /** 最大高度（行数） */
  maxHeightRows?: number;
  /** 自定义 CSS 类名 */
  className?: string;
}

/**
 * 默认贴纸样式
 */
export const DEFAULT_STICKER_STYLE: Required<
  Pick<
    StickerStyle,
    "backgroundColor" | "color" | "borderRadius" | "padding" | "opacity"
  >
> = {
  backgroundColor: "rgba(122, 162, 247, 0.9)",
  color: "#1a1b26",
  borderRadius: 6,
  padding: 8,
  opacity: 1,
};

// ============================================================================
// 贴纸类型
// ============================================================================

/**
 * 贴纸内容类型
 */
export type StickerContentType = "text" | "icon" | "badge" | "custom";

/**
 * 贴纸图标配置
 */
export interface StickerIcon {
  /** 图标名称（使用 Lucide 图标） */
  name: string;
  /** 图标大小 */
  size?: number;
  /** 图标颜色 */
  color?: string;
}

/**
 * 贴纸徽章配置
 */
export interface StickerBadge {
  /** 徽章文本 */
  text: string;
  /** 徽章变体 */
  variant?: "default" | "success" | "warning" | "error" | "info";
}

// ============================================================================
// 贴纸数据
// ============================================================================

/**
 * 贴纸数据
 *
 * _Requirements: 15.1, 15.2, 15.3_
 */
export interface Sticker {
  /** 贴纸唯一 ID */
  id: string;
  /** 所属块 ID */
  blockId: string;
  /** 字符网格位置 */
  position: CharGridPosition;
  /** 内容类型 */
  contentType: StickerContentType;
  /** 文本内容（当 contentType 为 "text" 时） */
  text?: string;
  /** 图标配置（当 contentType 为 "icon" 时） */
  icon?: StickerIcon;
  /** 徽章配置（当 contentType 为 "badge" 时） */
  badge?: StickerBadge;
  /** 自定义渲染组件 ID（当 contentType 为 "custom" 时） */
  customComponentId?: string;
  /** 样式配置 */
  style?: StickerStyle;
  /** 是否可见 */
  visible: boolean;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 工具提示 */
  tooltip?: string;
  /** 点击回调 ID */
  onClickId?: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

/**
 * 创建贴纸的参数
 */
export interface CreateStickerParams {
  /** 所属块 ID */
  blockId: string;
  /** 字符网格位置 */
  position: CharGridPosition;
  /** 内容类型 */
  contentType: StickerContentType;
  /** 文本内容 */
  text?: string;
  /** 图标配置 */
  icon?: StickerIcon;
  /** 徽章配置 */
  badge?: StickerBadge;
  /** 自定义组件 ID */
  customComponentId?: string;
  /** 样式配置 */
  style?: StickerStyle;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 工具提示 */
  tooltip?: string;
}

/**
 * 更新贴纸的参数
 */
export interface UpdateStickerParams {
  /** 贴纸 ID */
  id: string;
  /** 新位置 */
  position?: CharGridPosition;
  /** 新文本 */
  text?: string;
  /** 新图标 */
  icon?: StickerIcon;
  /** 新徽章 */
  badge?: StickerBadge;
  /** 新样式 */
  style?: StickerStyle;
  /** 是否可见 */
  visible?: boolean;
  /** 工具提示 */
  tooltip?: string;
}

// ============================================================================
// 终端尺寸信息
// ============================================================================

/**
 * 终端字符尺寸信息
 *
 * 用于计算贴纸的像素位置。
 *
 * _Requirements: 15.4_
 */
export interface TerminalDimensions {
  /** 字符宽度（像素） */
  charWidth: number;
  /** 字符高度（像素） */
  charHeight: number;
  /** 终端行数 */
  rows: number;
  /** 终端列数 */
  cols: number;
  /** 终端容器左边距 */
  paddingLeft: number;
  /** 终端容器上边距 */
  paddingTop: number;
}

/**
 * 默认终端尺寸
 */
export const DEFAULT_TERMINAL_DIMENSIONS: TerminalDimensions = {
  charWidth: 8,
  charHeight: 17,
  rows: 24,
  cols: 80,
  paddingLeft: 4,
  paddingTop: 5,
};

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 将字符网格位置转换为像素位置
 *
 * _Requirements: 15.2, 15.4_
 */
export function charGridToPixel(
  gridPos: CharGridPosition,
  dimensions: TerminalDimensions,
): PixelPosition {
  return {
    top: dimensions.paddingTop + gridPos.row * dimensions.charHeight,
    left: dimensions.paddingLeft + gridPos.col * dimensions.charWidth,
  };
}

/**
 * 将像素位置转换为字符网格位置
 *
 * _Requirements: 15.2, 15.4_
 */
export function pixelToCharGrid(
  pixelPos: PixelPosition,
  dimensions: TerminalDimensions,
): CharGridPosition {
  return {
    row: Math.floor(
      (pixelPos.top - dimensions.paddingTop) / dimensions.charHeight,
    ),
    col: Math.floor(
      (pixelPos.left - dimensions.paddingLeft) / dimensions.charWidth,
    ),
  };
}

/**
 * 生成唯一贴纸 ID
 */
export function generateStickerId(): string {
  return `sticker-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 创建新贴纸
 */
export function createSticker(params: CreateStickerParams): Sticker {
  const now = Date.now();
  return {
    id: generateStickerId(),
    blockId: params.blockId,
    position: params.position,
    contentType: params.contentType,
    text: params.text,
    icon: params.icon,
    badge: params.badge,
    customComponentId: params.customComponentId,
    style: params.style,
    visible: true,
    draggable: params.draggable ?? false,
    closable: params.closable ?? true,
    tooltip: params.tooltip,
    createdAt: now,
    updatedAt: now,
  };
}
