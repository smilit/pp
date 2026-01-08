/**
 * @file ConnectionStatusIndicator.tsx
 * @description 连接状态指示器组件
 * @module components/terminal/ConnectionStatusIndicator
 *
 * 显示终端连接状态，包括连接中、已连接、断开、错误等状态。
 * 提供重连按钮。
 *
 * _Requirements: 7.3, 7.4, 7.5_
 */

import React from "react";
import type { ConnStatus, ShellProcStatus } from "@/lib/terminal/store";

// ============================================================================
// 类型定义
// ============================================================================

/** 组件属性 */
export interface ConnectionStatusIndicatorProps {
  /** 连接状态 */
  connStatus: ConnStatus;
  /** Shell 进程状态 */
  shellProcStatus: ShellProcStatus;
  /** 退出码 */
  exitCode?: number;
  /** 重连回调
   * _Requirements: 7.5_
   */
  onReconnect?: () => void;
}

// ============================================================================
// 图标组件
// ============================================================================

/** 连接中图标 */
const ConnectingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={`${className || "w-4 h-4"} animate-spin`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

/** 已连接图标 */
const ConnectedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/** 断开连接图标 */
const DisconnectedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

/** 错误图标 */
const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/** 重连图标 */
const ReconnectIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// ============================================================================
// 主组件
// ============================================================================

/**
 * 连接状态指示器组件
 *
 * _Requirements: 7.3, 7.4, 7.5_
 */
export const ConnectionStatusIndicator: React.FC<
  ConnectionStatusIndicatorProps
> = ({ connStatus, shellProcStatus, exitCode, onReconnect }) => {
  // 判断是否需要显示指示器
  const shouldShow =
    connStatus.status !== "connected" ||
    shellProcStatus === "done" ||
    connStatus.error;

  if (!shouldShow) {
    return null;
  }

  // 获取状态信息
  const getStatusInfo = () => {
    // Shell 进程已完成
    if (shellProcStatus === "done") {
      const exitCodeText =
        exitCode !== undefined && exitCode !== 0
          ? ` (退出码: ${exitCode})`
          : "";
      return {
        icon: <ConnectedIcon className="w-4 h-4 text-gray-400" />,
        text: `进程已结束${exitCodeText}`,
        color: "text-gray-400",
        bgColor: "bg-gray-800/80",
        showReconnect: true,
      };
    }

    // 连接错误
    // _Requirements: 7.3_
    if (connStatus.status === "error" || connStatus.error) {
      return {
        icon: <ErrorIcon className="w-4 h-4 text-red-400" />,
        text: connStatus.error || "连接错误",
        color: "text-red-400",
        bgColor: "bg-red-900/80",
        showReconnect: true,
      };
    }

    // 断开连接
    // _Requirements: 7.4_
    if (connStatus.status === "disconnected") {
      return {
        icon: <DisconnectedIcon className="w-4 h-4 text-yellow-400" />,
        text: "连接已断开",
        color: "text-yellow-400",
        bgColor: "bg-yellow-900/80",
        showReconnect: true,
      };
    }

    // 连接中
    if (connStatus.status === "connecting") {
      return {
        icon: <ConnectingIcon className="w-4 h-4 text-blue-400" />,
        text: "连接中...",
        color: "text-blue-400",
        bgColor: "bg-blue-900/80",
        showReconnect: false,
      };
    }

    // 初始化
    if (connStatus.status === "init") {
      return {
        icon: <ConnectingIcon className="w-4 h-4 text-gray-400" />,
        text: "初始化中...",
        color: "text-gray-400",
        bgColor: "bg-gray-800/80",
        showReconnect: false,
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) {
    return null;
  }

  return (
    <div
      className={`terminal-connection-status ${statusInfo.bgColor} ${statusInfo.color}`}
    >
      <div className="flex items-center gap-2">
        {statusInfo.icon}
        <span className="text-sm">{statusInfo.text}</span>
      </div>

      {/* 重连按钮
       * _Requirements: 7.5_
       */}
      {statusInfo.showReconnect && onReconnect && (
        <button
          className="terminal-reconnect-btn"
          onClick={onReconnect}
          title="重新连接"
        >
          <ReconnectIcon className="w-4 h-4" />
          <span>重连</span>
        </button>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;
