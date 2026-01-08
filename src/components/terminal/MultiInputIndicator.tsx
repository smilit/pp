/**
 * @file MultiInputIndicator.tsx
 * @description 多输入模式指示器组件
 * @module components/terminal/MultiInputIndicator
 *
 * 显示多输入模式状态，允许用户切换多输入模式。
 *
 * _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
 */

import React from "react";

// ============================================================================
// 类型定义
// ============================================================================

/** 组件属性 */
export interface MultiInputIndicatorProps {
  /** 切换多输入模式回调
   * _Requirements: 10.4_
   */
  onToggle?: () => void;
}

// ============================================================================
// 图标组件
// ============================================================================

/** 多输入图标 */
const MultiInputIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="M6 8h.01" />
    <path d="M10 8h.01" />
    <path d="M14 8h.01" />
    <path d="M18 8h.01" />
    <path d="M8 12h8" />
  </svg>
);

// ============================================================================
// 主组件
// ============================================================================

/**
 * 多输入模式指示器组件
 *
 * 当多输入模式启用时显示，点击可禁用多输入模式。
 *
 * _Requirements: 10.3, 10.4_
 */
export const MultiInputIndicator: React.FC<MultiInputIndicatorProps> = ({
  onToggle,
}) => {
  return (
    <div className="terminal-multi-input-indicator">
      <button
        className="terminal-multi-input-btn"
        onClick={onToggle}
        title="点击禁用多输入模式"
      >
        <MultiInputIcon className="w-4 h-4" />
        <span>Multi Input ON</span>
      </button>
    </div>
  );
};

export default MultiInputIndicator;
