/**
 * @file TerminalContextMenu.tsx
 * @description 终端上下文菜单组件
 * @module components/terminal/TerminalContextMenu
 *
 * 提供终端右键菜单功能，包括复制、粘贴、URL 打开等。
 *
 * _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
 */

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { open } from "@tauri-apps/plugin-shell";

// ============================================================================
// 类型定义
// ============================================================================

/** 菜单位置 */
export interface ContextMenuPosition {
  x: number;
  y: number;
}

/** 组件属性 */
export interface TerminalContextMenuProps {
  /** 菜单位置 */
  position: ContextMenuPosition;
  /** 关闭回调 */
  onClose: () => void;
  /** 复制回调
   * _Requirements: 13.2_
   */
  onCopy: () => void;
  /** 粘贴回调
   * _Requirements: 13.2_
   */
  onPaste: () => void;
  /** 选中的文本 */
  selectedText: string;
  /** 块 ID */
  blockId: string;
}

/** 菜单项 */
interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick: () => void;
  divider?: boolean;
}

// ============================================================================
// 图标组件
// ============================================================================

/** 复制图标 */
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

/** 粘贴图标 */
const PasteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

/** 链接图标 */
const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

/** 清空图标 */
const ClearIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

/** 全选图标 */
const SelectAllIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </svg>
);

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 检测文本是否为 URL
 *
 * _Requirements: 13.4_
 */
function detectUrl(text: string): string | null {
  const trimmed = text.trim();

  // URL 正则表达式
  const urlPattern =
    /^(https?:\/\/|ftp:\/\/|file:\/\/)?[\w-]+(\.[\w-]+)+([\w-.,@?^=%&:/~+#]*[\w-@?^=%&/~+#])?$/i;

  if (urlPattern.test(trimmed)) {
    // 如果没有协议，添加 https://
    if (!/^(https?|ftp|file):\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  return null;
}

// ============================================================================
// 主组件
// ============================================================================

/**
 * 终端上下文菜单组件
 *
 * _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
 */
export const TerminalContextMenu: React.FC<TerminalContextMenuProps> = ({
  position,
  onClose,
  onCopy,
  onPaste,
  selectedText,
  blockId: _blockId,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // 检测选中文本是否为 URL
  // _Requirements: 13.4_
  const detectedUrl = useMemo(
    () => (selectedText ? detectUrl(selectedText) : null),
    [selectedText],
  );

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // 调整菜单位置，确保不超出视口
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      // 右边界检查
      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 8;
      }

      // 下边界检查
      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 8;
      }

      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  }, [position]);

  // 打开 URL
  // _Requirements: 13.4_
  const handleOpenUrl = useCallback(async () => {
    if (detectedUrl) {
      try {
        await open(detectedUrl);
      } catch (err) {
        console.error("[TerminalContextMenu] 打开 URL 失败:", err);
      }
    }
    onClose();
  }, [detectedUrl, onClose]);

  // 构建菜单项
  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [];

    // 复制
    // _Requirements: 13.2_
    items.push({
      id: "copy",
      label: "复制",
      icon: <CopyIcon />,
      shortcut: "⌘C",
      disabled: !selectedText,
      onClick: onCopy,
    });

    // 粘贴
    // _Requirements: 13.2_
    items.push({
      id: "paste",
      label: "粘贴",
      icon: <PasteIcon />,
      shortcut: "⌘V",
      onClick: onPaste,
    });

    // 分隔线
    items.push({
      id: "divider-1",
      label: "",
      onClick: () => {},
      divider: true,
    });

    // 打开 URL（如果选中的是 URL）
    // _Requirements: 13.4_
    if (detectedUrl) {
      items.push({
        id: "open-url",
        label: "打开链接",
        icon: <LinkIcon />,
        onClick: handleOpenUrl,
      });

      items.push({
        id: "divider-2",
        label: "",
        onClick: () => {},
        divider: true,
      });
    }

    // 全选
    items.push({
      id: "select-all",
      label: "全选",
      icon: <SelectAllIcon />,
      shortcut: "⌘A",
      onClick: () => {
        // TODO: 实现全选功能
        onClose();
      },
    });

    // 清空终端
    items.push({
      id: "clear",
      label: "清空终端",
      icon: <ClearIcon />,
      shortcut: "⌘K",
      onClick: () => {
        // TODO: 实现清空终端功能
        onClose();
      },
    });

    return items;
  }, [selectedText, detectedUrl, onCopy, onPaste, handleOpenUrl, onClose]);

  return (
    <div
      ref={menuRef}
      className="terminal-context-menu"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
      }}
    >
      {menuItems.map((item) =>
        item.divider ? (
          <div key={item.id} className="terminal-context-menu-divider" />
        ) : (
          <button
            key={item.id}
            className={`terminal-context-menu-item ${item.disabled ? "disabled" : ""}`}
            onClick={item.onClick}
            disabled={item.disabled}
          >
            {item.icon && (
              <span className="terminal-context-menu-icon">{item.icon}</span>
            )}
            <span className="terminal-context-menu-label">{item.label}</span>
            {item.shortcut && (
              <span className="terminal-context-menu-shortcut">
                {item.shortcut}
              </span>
            )}
          </button>
        ),
      )}
    </div>
  );
};

export default TerminalContextMenu;
