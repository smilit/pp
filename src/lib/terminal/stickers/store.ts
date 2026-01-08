/**
 * @file store.ts
 * @description 终端贴纸状态管理
 * @module lib/terminal/stickers/store
 *
 * 使用 Jotai 管理终端贴纸状态。
 *
 * _Requirements: 15.1, 15.2, 15.3, 15.4_
 */

import { atom } from "jotai";
import type {
  Sticker,
  CreateStickerParams,
  UpdateStickerParams,
  TerminalDimensions,
} from "./types";
import { createSticker, DEFAULT_TERMINAL_DIMENSIONS } from "./types";

// ============================================================================
// 基础原子
// ============================================================================

/**
 * 所有贴纸的存储（按 blockId 分组）
 *
 * Map<blockId, Map<stickerId, Sticker>>
 */
export const stickersMapAtom = atom<Map<string, Map<string, Sticker>>>(
  new Map(),
);

/**
 * 终端尺寸信息（按 blockId 存储）
 *
 * Map<blockId, TerminalDimensions>
 */
export const terminalDimensionsMapAtom = atom<Map<string, TerminalDimensions>>(
  new Map(),
);

// ============================================================================
// 派生原子
// ============================================================================

/**
 * 获取指定块的所有贴纸
 */
export const getStickersForBlockAtom = atom((get) => {
  const stickersMap = get(stickersMapAtom);
  return (blockId: string): Sticker[] => {
    const blockStickers = stickersMap.get(blockId);
    if (!blockStickers) return [];
    return Array.from(blockStickers.values()).filter((s) => s.visible);
  };
});

/**
 * 获取指定块的终端尺寸
 */
export const getTerminalDimensionsAtom = atom((get) => {
  const dimensionsMap = get(terminalDimensionsMapAtom);
  return (blockId: string): TerminalDimensions => {
    return dimensionsMap.get(blockId) ?? DEFAULT_TERMINAL_DIMENSIONS;
  };
});

/**
 * 获取指定贴纸
 */
export const getStickerAtom = atom((get) => {
  const stickersMap = get(stickersMapAtom);
  return (blockId: string, stickerId: string): Sticker | undefined => {
    const blockStickers = stickersMap.get(blockId);
    return blockStickers?.get(stickerId);
  };
});

// ============================================================================
// 写入原子
// ============================================================================

/**
 * 添加贴纸
 *
 * _Requirements: 15.1_
 */
export const addStickerAtom = atom(
  null,
  (get, set, params: CreateStickerParams) => {
    const stickersMap = new Map(get(stickersMapAtom));
    const blockStickers = new Map(stickersMap.get(params.blockId) ?? new Map());

    const sticker = createSticker(params);
    blockStickers.set(sticker.id, sticker);
    stickersMap.set(params.blockId, blockStickers);

    set(stickersMapAtom, stickersMap);
    return sticker;
  },
);

/**
 * 更新贴纸
 *
 * _Requirements: 15.3_
 */
export const updateStickerAtom = atom(
  null,
  (get, set, params: UpdateStickerParams & { blockId: string }) => {
    const stickersMap = new Map(get(stickersMapAtom));
    const blockStickers = stickersMap.get(params.blockId);

    if (!blockStickers) return false;

    const sticker = blockStickers.get(params.id);
    if (!sticker) return false;

    const updatedSticker: Sticker = {
      ...sticker,
      ...(params.position !== undefined && { position: params.position }),
      ...(params.text !== undefined && { text: params.text }),
      ...(params.icon !== undefined && { icon: params.icon }),
      ...(params.badge !== undefined && { badge: params.badge }),
      ...(params.style !== undefined && {
        style: { ...sticker.style, ...params.style },
      }),
      ...(params.visible !== undefined && { visible: params.visible }),
      ...(params.tooltip !== undefined && { tooltip: params.tooltip }),
      updatedAt: Date.now(),
    };

    const newBlockStickers = new Map(blockStickers);
    newBlockStickers.set(params.id, updatedSticker);
    stickersMap.set(params.blockId, newBlockStickers);

    set(stickersMapAtom, stickersMap);
    return true;
  },
);

/**
 * 删除贴纸
 */
export const removeStickerAtom = atom(
  null,
  (
    get,
    set,
    { blockId, stickerId }: { blockId: string; stickerId: string },
  ) => {
    const stickersMap = new Map(get(stickersMapAtom));
    const blockStickers = stickersMap.get(blockId);

    if (!blockStickers) return false;

    const newBlockStickers = new Map(blockStickers);
    const deleted = newBlockStickers.delete(stickerId);

    if (deleted) {
      stickersMap.set(blockId, newBlockStickers);
      set(stickersMapAtom, stickersMap);
    }

    return deleted;
  },
);

/**
 * 清除指定块的所有贴纸
 */
export const clearStickersForBlockAtom = atom(
  null,
  (get, set, blockId: string) => {
    const stickersMap = new Map(get(stickersMapAtom));
    stickersMap.delete(blockId);
    set(stickersMapAtom, stickersMap);
  },
);

/**
 * 更新终端尺寸
 *
 * _Requirements: 15.4_
 */
export const updateTerminalDimensionsAtom = atom(
  null,
  (
    get,
    set,
    {
      blockId,
      dimensions,
    }: { blockId: string; dimensions: TerminalDimensions },
  ) => {
    const dimensionsMap = new Map(get(terminalDimensionsMapAtom));
    dimensionsMap.set(blockId, dimensions);
    set(terminalDimensionsMapAtom, dimensionsMap);
  },
);

/**
 * 移动贴纸位置
 *
 * _Requirements: 15.2, 15.4_
 */
export const moveStickerAtom = atom(
  null,
  (
    get,
    set,
    {
      blockId,
      stickerId,
      newPosition,
    }: {
      blockId: string;
      stickerId: string;
      newPosition: { row: number; col: number };
    },
  ) => {
    const stickersMap = new Map(get(stickersMapAtom));
    const blockStickers = stickersMap.get(blockId);

    if (!blockStickers) return false;

    const sticker = blockStickers.get(stickerId);
    if (!sticker || !sticker.draggable) return false;

    // 获取终端尺寸以验证位置
    const dimensionsMap = get(terminalDimensionsMapAtom);
    const dimensions =
      dimensionsMap.get(blockId) ?? DEFAULT_TERMINAL_DIMENSIONS;

    // 确保位置在有效范围内
    const clampedPosition = {
      row: Math.max(0, Math.min(newPosition.row, dimensions.rows - 1)),
      col: Math.max(0, Math.min(newPosition.col, dimensions.cols - 1)),
    };

    const updatedSticker: Sticker = {
      ...sticker,
      position: clampedPosition,
      updatedAt: Date.now(),
    };

    const newBlockStickers = new Map(blockStickers);
    newBlockStickers.set(stickerId, updatedSticker);
    stickersMap.set(blockId, newBlockStickers);

    set(stickersMapAtom, stickersMap);
    return true;
  },
);

// ============================================================================
// 清理原子
// ============================================================================

/**
 * 清理指定块的所有贴纸状态
 */
export const cleanupStickerStateAtom = atom(
  null,
  (get, set, blockId: string) => {
    // 清理贴纸
    const stickersMap = new Map(get(stickersMapAtom));
    stickersMap.delete(blockId);
    set(stickersMapAtom, stickersMap);

    // 清理尺寸信息
    const dimensionsMap = new Map(get(terminalDimensionsMapAtom));
    dimensionsMap.delete(blockId);
    set(terminalDimensionsMapAtom, dimensionsMap);
  },
);
