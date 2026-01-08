/**
 * @file VDomView.tsx
 * @description VDOM 视图组件
 * @module components/terminal/VDomView
 *
 * 在 VDOM 模式下渲染终端内嵌的 UI 块。
 *
 * _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
 */

import React, { useCallback, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { SubBlockContainer } from "./SubBlock";
import { VDomModeToggle } from "./VDomModeSwitch";
import {
  type VDomContext,
  type VDomEvent,
  vdomBlocksAtomFamily,
  vdomToolbarAtomFamily,
  removeVDomBlockAtom,
  cleanupVDomStateAtom,
} from "@/lib/terminal/vdom";
import { setTermModeAtom } from "@/lib/terminal/store";

// ============================================================================
// 类型定义
// ============================================================================

export interface VDomViewProps {
  /** 终端块 ID */
  blockId: string;
  /** 标签页 ID */
  tabId: string;
  /** 切换回终端模式的回调 */
  onSwitchToTerminal?: () => void;
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

// ============================================================================
// VDomView 组件
// ============================================================================

/**
 * VDOM 视图组件
 *
 * 在 VDOM 模式下渲染终端内嵌的 UI 块。
 *
 * _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
 */
export const VDomView: React.FC<VDomViewProps> = ({
  blockId,
  tabId,
  onSwitchToTerminal,
  className = "",
}) => {
  // 读取 VDOM 状态
  const blocks = useAtomValue(vdomBlocksAtomFamily(blockId));
  const toolbar = useAtomValue(vdomToolbarAtomFamily(blockId));

  // 操作原子
  const setTermMode = useSetAtom(setTermModeAtom);
  const removeBlock = useSetAtom(removeVDomBlockAtom);
  const _cleanupVDom = useSetAtom(cleanupVDomStateAtom);

  // 切换回终端模式
  // _Requirements: 14.5_
  const handleSwitchToTerminal = useCallback(() => {
    setTermMode({ blockId, mode: "term" });
    onSwitchToTerminal?.();
  }, [blockId, setTermMode, onSwitchToTerminal]);

  // 关闭 VDOM 块
  const handleCloseBlock = useCallback(
    (vdomBlockId: string) => {
      removeBlock({ terminalBlockId: blockId, blockId: vdomBlockId });

      // 如果没有更多块，自动切换回终端模式
      // _Requirements: 14.5_
      if (blocks.length <= 1) {
        handleSwitchToTerminal();
      }
    },
    [blockId, blocks.length, removeBlock, handleSwitchToTerminal],
  );

  // 发送 VDOM 事件
  const handleSendEvent = useCallback((event: VDomEvent) => {
    console.log("[VDomView] 事件:", event);
    // TODO: 发送事件到后端或处理本地事件
  }, []);

  // 创建 VDOM 上下文
  const context: VDomContext = useMemo(
    () => ({
      terminalBlockId: blockId,
      tabId,
      termMode: "vdom",
      sendEvent: handleSendEvent,
      switchToTerminal: handleSwitchToTerminal,
      closeBlock: handleCloseBlock,
    }),
    [blockId, tabId, handleSendEvent, handleSwitchToTerminal, handleCloseBlock],
  );

  return (
    <div className={`vdom-view ${className}`}>
      {/* VDOM 工具栏 */}
      {toolbar && toolbar.visible && toolbar.position === "top" && (
        <div className="vdom-toolbar vdom-toolbar-top">
          {toolbar.items.map((item) => (
            <div key={item.id} className="vdom-toolbar-item">
              {item.type === "separator" ? (
                <div className="vdom-toolbar-separator" />
              ) : (
                <button
                  className="vdom-toolbar-btn"
                  disabled={item.disabled}
                  title={item.tooltip}
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VDOM 内容区域 */}
      <div className="vdom-content">
        {blocks.length > 0 ? (
          <SubBlockContainer
            blocks={blocks}
            terminalBlockId={blockId}
            tabId={tabId}
            context={context}
          />
        ) : (
          <div className="vdom-empty">
            <p className="vdom-empty-text">没有 VDOM 块</p>
            <button className="vdom-empty-btn" onClick={handleSwitchToTerminal}>
              <TerminalIcon className="vdom-empty-icon" />
              <span>返回终端</span>
            </button>
          </div>
        )}
      </div>

      {/* 底部工具栏 */}
      {toolbar && toolbar.visible && toolbar.position === "bottom" && (
        <div className="vdom-toolbar vdom-toolbar-bottom">
          {toolbar.items.map((item) => (
            <div key={item.id} className="vdom-toolbar-item">
              {item.type === "separator" ? (
                <div className="vdom-toolbar-separator" />
              ) : (
                <button
                  className="vdom-toolbar-btn"
                  disabled={item.disabled}
                  title={item.tooltip}
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 模式切换按钮（固定在右上角） */}
      <div className="vdom-mode-switch-container">
        <VDomModeToggle
          blockId={blockId}
          onModeChange={(mode) => {
            if (mode === "term") {
              onSwitchToTerminal?.();
            }
          }}
        />
      </div>
    </div>
  );
};

export default VDomView;
