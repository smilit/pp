/**
 * @file index.ts
 * @description 终端贴纸系统模块入口
 * @module lib/terminal/stickers
 *
 * 导出贴纸系统的所有类型和状态管理。
 *
 * _Requirements: 15.1, 15.2, 15.3, 15.4_
 */

// 类型导出
export type {
  CharGridPosition,
  PixelPosition,
  StickerStyle,
  StickerContentType,
  StickerIcon,
  StickerBadge,
  Sticker,
  CreateStickerParams,
  UpdateStickerParams,
  TerminalDimensions,
} from "./types";

// 常量和工具函数导出
export {
  DEFAULT_STICKER_STYLE,
  DEFAULT_TERMINAL_DIMENSIONS,
  charGridToPixel,
  pixelToCharGrid,
  generateStickerId,
  createSticker,
} from "./types";

// 状态管理导出
export {
  stickersMapAtom,
  terminalDimensionsMapAtom,
  getStickersForBlockAtom,
  getTerminalDimensionsAtom,
  getStickerAtom,
  addStickerAtom,
  updateStickerAtom,
  removeStickerAtom,
  clearStickersForBlockAtom,
  updateTerminalDimensionsAtom,
  moveStickerAtom,
  cleanupStickerStateAtom,
} from "./store";
