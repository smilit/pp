/**
 * @file VDomModeSwitch.tsx
 * @description VDOM 模式切换组件
 * @module components/terminal/VDomModeSwitch
 *
 * 提供终端模式（term/vdom）切换的 UI 组件。
 *
 * _Requirements: 14.1, 14.2_
 */

import React, { useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  termModeAtomFamily,
  setTermModeAtom,
  type TermMode,
} from "@/lib/terminal/store";

// ============================================================================
// 类型定义
// ============================================================================

export interface VDomModeSwitchProps {
  /** 块 ID */
  blockId: string;
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 模式变更回调 */
  onModeChange?: (mode: TermMode) => void;
  /** 自定义类名 */
  className?: string;
}

// ============================================================================
// 图标组件
// ============================================================================

const TerminalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const VDomIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

// ============================================================================
// VDomModeSwitch 组件
// ============================================================================

/**
 * VDOM 模式切换组件
 *
 * 提供终端模式和 VDOM 模式之间的切换。
 *
 * _Requirements: 14.1, 14.2_
 */
export const VDomModeSwitch: React.FC<VDomModeSwitchProps> = ({
  blockId,
  showLabel = true,
  disabled = false,
  onModeChange,
  className = "",
}) => {
  // 读取当前模式
  const termMode = useAtomValue(termModeAtomFamily(blockId));
  const setTermMode = useSetAtom(setTermModeAtom);

  // 切换模式
  const handleModeChange = useCallback(
    (newMode: TermMode) => {
      if (disabled || newMode === termMode) return;

      setTermMode({ blockId, mode: newMode });
      onModeChange?.(newMode);
    },
    [blockId, termMode, disabled, setTermMode, onModeChange],
  );

  return (
    <div className={`vdom-mode-switch ${className}`}>
      {/* 终端模式按钮 */}
      <button
        className={`vdom-mode-btn ${termMode === "term" ? "active" : ""}`}
        onClick={() => handleModeChange("term")}
        disabled={disabled}
        title="终端模式"
      >
        <TerminalIcon className="vdom-mode-icon" />
        {showLabel && <span className="vdom-mode-label">终端</span>}
      </button>

      {/* VDOM 模式按钮 */}
      <button
        className={`vdom-mode-btn ${termMode === "vdom" ? "active" : ""}`}
        onClick={() => handleModeChange("vdom")}
        disabled={disabled}
        title="VDOM 模式"
      >
        <VDomIcon className="vdom-mode-icon" />
        {showLabel && <span className="vdom-mode-label">VDOM</span>}
      </button>
    </div>
  );
};

// ============================================================================
// 紧凑版模式切换
// ============================================================================

export interface VDomModeToggleProps {
  /** 块 ID */
  blockId: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 模式变更回调 */
  onModeChange?: (mode: TermMode) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 紧凑版 VDOM 模式切换
 *
 * 单按钮切换，适合工具栏使用。
 */
export const VDomModeToggle: React.FC<VDomModeToggleProps> = ({
  blockId,
  disabled = false,
  onModeChange,
  className = "",
}) => {
  const termMode = useAtomValue(termModeAtomFamily(blockId));
  const setTermMode = useSetAtom(setTermModeAtom);

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const newMode: TermMode = termMode === "term" ? "vdom" : "term";
    setTermMode({ blockId, mode: newMode });
    onModeChange?.(newMode);
  }, [blockId, termMode, disabled, setTermMode, onModeChange]);

  return (
    <button
      className={`vdom-mode-toggle ${termMode === "vdom" ? "active" : ""} ${className}`}
      onClick={handleToggle}
      disabled={disabled}
      title={termMode === "term" ? "切换到 VDOM 模式" : "切换到终端模式"}
    >
      {termMode === "term" ? (
        <VDomIcon className="vdom-mode-icon" />
      ) : (
        <TerminalIcon className="vdom-mode-icon" />
      )}
    </button>
  );
};

export default VDomModeSwitch;
