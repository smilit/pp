/**
 * @file StickerLayer.tsx
 * @description 终端贴纸层组件
 * @module components/terminal/StickerLayer
 *
 * 管理和渲染终端上的所有贴纸。
 * 作为覆盖层放置在终端容器上方。
 *
 * _Requirements: 15.1, 15.2, 15.3, 15.4_
 */

import React, { useEffect, useCallback, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Sticker } from "./Sticker";
import {
  type Sticker as StickerType,
  type TerminalDimensions,
  getStickersForBlockAtom,
  getTerminalDimensionsAtom,
  updateTerminalDimensionsAtom,
  DEFAULT_TERMINAL_DIMENSIONS,
} from "@/lib/terminal/stickers";

// ============================================================================
// 类型定义
// ============================================================================

export interface StickerLayerProps {
  /** 块 ID */
  blockId: string;
  /** 终端容器引用（用于计算尺寸） */
  terminalRef?: React.RefObject<HTMLDivElement>;
  /** 字符宽度（像素） */
  charWidth?: number;
  /** 字符高度（像素） */
  charHeight?: number;
  /** 终端行数 */
  rows?: number;
  /** 终端列数 */
  cols?: number;
  /** 贴纸点击回调 */
  onStickerClick?: (sticker: StickerType) => void;
}

// ============================================================================
// StickerLayer 组件
// ============================================================================

/**
 * 终端贴纸层组件
 *
 * 渲染指定终端块的所有贴纸。
 *
 * _Requirements: 15.1, 15.2, 15.3, 15.4_
 */
export const StickerLayer: React.FC<StickerLayerProps> = ({
  blockId,
  terminalRef,
  charWidth,
  charHeight,
  rows,
  cols,
  onStickerClick,
}) => {
  // 获取贴纸列表
  const getStickersForBlock = useAtomValue(getStickersForBlockAtom);
  const stickers = useMemo(
    () => getStickersForBlock(blockId),
    [getStickersForBlock, blockId],
  );

  // 获取终端尺寸
  const getTerminalDimensions = useAtomValue(getTerminalDimensionsAtom);
  const storedDimensions = useMemo(
    () => getTerminalDimensions(blockId),
    [getTerminalDimensions, blockId],
  );

  // 更新终端尺寸
  const updateDimensions = useSetAtom(updateTerminalDimensionsAtom);

  // 计算实际使用的尺寸
  // _Requirements: 15.4_
  const dimensions: TerminalDimensions = useMemo(() => {
    // 优先使用 props 传入的值
    if (charWidth && charHeight && rows && cols) {
      return {
        charWidth,
        charHeight,
        rows,
        cols,
        paddingLeft: DEFAULT_TERMINAL_DIMENSIONS.paddingLeft,
        paddingTop: DEFAULT_TERMINAL_DIMENSIONS.paddingTop,
      };
    }
    // 否则使用存储的值
    return storedDimensions;
  }, [charWidth, charHeight, rows, cols, storedDimensions]);

  // 从终端容器计算尺寸
  // _Requirements: 15.4_
  useEffect(() => {
    if (!terminalRef?.current) return;

    const calculateDimensions = () => {
      const container = terminalRef.current;
      if (!container) return;

      // 尝试从 xterm 获取尺寸信息
      const xtermScreen = container.querySelector(".xterm-screen");
      const xtermRows = container.querySelector(".xterm-rows");

      if (xtermScreen && xtermRows) {
        // 获取第一个字符单元格来计算字符尺寸
        const firstRow = xtermRows.querySelector(".xterm-row");
        if (firstRow) {
          const firstChar = firstRow.querySelector("span");
          if (firstChar) {
            const charRect = firstChar.getBoundingClientRect();
            const newDimensions: TerminalDimensions = {
              charWidth:
                charRect.width || DEFAULT_TERMINAL_DIMENSIONS.charWidth,
              charHeight:
                charRect.height || DEFAULT_TERMINAL_DIMENSIONS.charHeight,
              rows:
                rows ??
                Math.floor(xtermScreen.clientHeight / (charRect.height || 17)),
              cols:
                cols ??
                Math.floor(xtermScreen.clientWidth / (charRect.width || 8)),
              paddingLeft: DEFAULT_TERMINAL_DIMENSIONS.paddingLeft,
              paddingTop: DEFAULT_TERMINAL_DIMENSIONS.paddingTop,
            };

            updateDimensions({ blockId, dimensions: newDimensions });
          }
        }
      }
    };

    // 初始计算
    calculateDimensions();

    // 监听大小变化
    const resizeObserver = new ResizeObserver(() => {
      calculateDimensions();
    });

    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [terminalRef, blockId, rows, cols, updateDimensions]);

  // 处理贴纸点击
  const handleStickerClick = useCallback(
    (sticker: StickerType) => {
      onStickerClick?.(sticker);
    },
    [onStickerClick],
  );

  // 如果没有贴纸，不渲染任何内容
  if (stickers.length === 0) {
    return null;
  }

  return (
    <div
      className="terminal-sticker-layer"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {stickers.map((sticker) => (
        <div key={sticker.id} style={{ pointerEvents: "auto" }}>
          <Sticker
            sticker={sticker}
            dimensions={dimensions}
            onClick={handleStickerClick}
          />
        </div>
      ))}
    </div>
  );
};

export default StickerLayer;
