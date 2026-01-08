/**
 * @file Sticker.tsx
 * @description 终端贴纸组件
 * @module components/terminal/Sticker
 *
 * 单个贴纸的渲染组件，支持文本、图标、徽章等内容类型。
 *
 * _Requirements: 15.1, 15.2, 15.3, 15.4_
 */

import React, { useCallback, useMemo, useState, useRef } from "react";
import { useSetAtom } from "jotai";
import {
  type Sticker as StickerType,
  type TerminalDimensions,
  charGridToPixel,
  removeStickerAtom,
  moveStickerAtom,
  DEFAULT_STICKER_STYLE,
} from "@/lib/terminal/stickers";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

// ============================================================================
// 类型定义
// ============================================================================

export interface StickerProps {
  /** 贴纸数据 */
  sticker: StickerType;
  /** 终端尺寸信息 */
  dimensions: TerminalDimensions;
  /** 点击回调 */
  onClick?: (sticker: StickerType) => void;
}

// ============================================================================
// 徽章变体样式
// ============================================================================

const BADGE_VARIANTS = {
  default: {
    backgroundColor: "rgba(122, 162, 247, 0.9)",
    color: "#1a1b26",
  },
  success: {
    backgroundColor: "rgba(158, 206, 106, 0.9)",
    color: "#1a1b26",
  },
  warning: {
    backgroundColor: "rgba(224, 175, 104, 0.9)",
    color: "#1a1b26",
  },
  error: {
    backgroundColor: "rgba(247, 118, 142, 0.9)",
    color: "#1a1b26",
  },
  info: {
    backgroundColor: "rgba(125, 207, 255, 0.9)",
    color: "#1a1b26",
  },
};

// ============================================================================
// 贴纸组件
// ============================================================================

/**
 * 终端贴纸组件
 *
 * _Requirements: 15.1, 15.2, 15.3, 15.4_
 */
export const Sticker: React.FC<StickerProps> = ({
  sticker,
  dimensions,
  onClick,
}) => {
  const removeSticker = useSetAtom(removeStickerAtom);
  const moveSticker = useSetAtom(moveStickerAtom);

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    row: number;
    col: number;
  } | null>(null);

  // 计算像素位置
  // _Requirements: 15.2, 15.4_
  const pixelPosition = useMemo(
    () => charGridToPixel(sticker.position, dimensions),
    [sticker.position, dimensions],
  );

  // 合并样式
  const mergedStyle = useMemo(
    () => ({
      ...DEFAULT_STICKER_STYLE,
      ...sticker.style,
    }),
    [sticker.style],
  );

  // 处理关闭
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeSticker({ blockId: sticker.blockId, stickerId: sticker.id });
    },
    [removeSticker, sticker.blockId, sticker.id],
  );

  // 处理点击
  const handleClick = useCallback(() => {
    onClick?.(sticker);
  }, [onClick, sticker]);

  // 处理拖拽开始
  // _Requirements: 15.2_
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (!sticker.draggable) return;

      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        row: sticker.position.row,
        col: sticker.position.col,
      };

      // 添加全局事件监听
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragStartRef.current) return;

        const deltaX = moveEvent.clientX - dragStartRef.current.x;
        const deltaY = moveEvent.clientY - dragStartRef.current.y;

        const newCol =
          dragStartRef.current.col + Math.round(deltaX / dimensions.charWidth);
        const newRow =
          dragStartRef.current.row + Math.round(deltaY / dimensions.charHeight);

        moveSticker({
          blockId: sticker.blockId,
          stickerId: sticker.id,
          newPosition: { row: newRow, col: newCol },
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [sticker, dimensions, moveSticker],
  );

  // 渲染内容
  const renderContent = () => {
    switch (sticker.contentType) {
      case "text":
        return <span className="sticker-text">{sticker.text}</span>;

      case "icon":
        return renderIcon();

      case "badge":
        return renderBadge();

      case "custom":
        return (
          <span className="sticker-custom">{sticker.customComponentId}</span>
        );

      default:
        return null;
    }
  };

  // 渲染图标
  const renderIcon = () => {
    if (!sticker.icon) return null;

    const iconProps = {
      size: sticker.icon.size ?? 16,
      color: sticker.icon.color ?? mergedStyle.color,
    };

    // 简单的图标映射
    switch (sticker.icon.name) {
      case "alert-circle":
        return <AlertCircle {...iconProps} />;
      case "check-circle":
        return <CheckCircle {...iconProps} />;
      case "info":
        return <Info {...iconProps} />;
      case "alert-triangle":
        return <AlertTriangle {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  // 渲染徽章
  const renderBadge = () => {
    if (!sticker.badge) return null;

    const variant = sticker.badge.variant ?? "default";
    const variantStyle = BADGE_VARIANTS[variant];

    return (
      <span
        className="sticker-badge"
        style={{
          backgroundColor: variantStyle.backgroundColor,
          color: variantStyle.color,
        }}
      >
        {sticker.badge.text}
      </span>
    );
  };

  return (
    <div
      className={`terminal-sticker ${isDragging ? "dragging" : ""} ${sticker.draggable ? "draggable" : ""}`}
      style={{
        position: "absolute",
        top: pixelPosition.top,
        left: pixelPosition.left,
        backgroundColor: mergedStyle.backgroundColor,
        color: mergedStyle.color,
        borderColor: mergedStyle.borderColor,
        borderWidth: mergedStyle.borderWidth,
        borderRadius: mergedStyle.borderRadius,
        padding: mergedStyle.padding,
        fontSize: mergedStyle.fontSize,
        fontWeight: mergedStyle.fontWeight,
        opacity: mergedStyle.opacity,
        maxWidth: mergedStyle.maxWidthChars
          ? mergedStyle.maxWidthChars * dimensions.charWidth
          : undefined,
        maxHeight: mergedStyle.maxHeightRows
          ? mergedStyle.maxHeightRows * dimensions.charHeight
          : undefined,
        zIndex: 20,
        cursor: sticker.draggable
          ? isDragging
            ? "grabbing"
            : "grab"
          : "default",
        userSelect: "none",
        transition: isDragging ? "none" : "top 0.1s, left 0.1s",
      }}
      onClick={handleClick}
      onMouseDown={handleDragStart}
      title={sticker.tooltip}
    >
      {/* 内容 */}
      <div className="sticker-content">{renderContent()}</div>

      {/* 关闭按钮 */}
      {sticker.closable && (
        <button
          className="sticker-close-btn"
          onClick={handleClose}
          aria-label="关闭贴纸"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

export default Sticker;
