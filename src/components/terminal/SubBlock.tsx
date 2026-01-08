/**
 * @file SubBlock.tsx
 * @description VDOM 子块组件
 * @module components/terminal/SubBlock
 *
 * 渲染终端内嵌的 VDOM 块。
 *
 * _Requirements: 14.3, 14.4, 14.5_
 */

import React, { useCallback, useRef, useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import {
  type VDomBlock,
  type VDomContext,
  removeVDomBlockAtom,
  setVDomBlockFocusAtom,
  updateVDomBlockAtom,
} from "@/lib/terminal/vdom";

// ============================================================================
// 类型定义
// ============================================================================

export interface SubBlockProps {
  /** VDOM 块实例 */
  block: VDomBlock;
  /** 终端块 ID */
  terminalBlockId: string;
  /** 标签页 ID */
  tabId: string;
  /** VDOM 上下文 */
  context: VDomContext;
  /** 块索引（用于键盘导航） */
  index?: number;
  /** 总块数（用于键盘导航） */
  totalBlocks?: number;
  /** 导航到上一个块 */
  onNavigatePrev?: () => void;
  /** 导航到下一个块 */
  onNavigateNext?: () => void;
  /** 自定义类名 */
  className?: string;
}

// ============================================================================
// 图标组件
// ============================================================================

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ============================================================================
// 内置 VDOM 组件注册表
// ============================================================================

/**
 * 内置 VDOM 组件
 *
 * 可以通过 component 名称引用这些组件。
 */
const builtinComponents: Record<
  string,
  React.FC<{ block: VDomBlock; context: VDomContext }>
> = {
  // 占位符组件
  placeholder: ({ block }) => (
    <div className="subblock-placeholder">
      <p>VDOM 块: {block.config.id}</p>
      <p>组件: {block.config.component}</p>
    </div>
  ),

  // 加载中组件
  loading: () => (
    <div className="subblock-loading">
      <div className="subblock-spinner" />
      <span>加载中...</span>
    </div>
  ),

  // 错误组件
  error: ({ block }) => (
    <div className="subblock-error">
      <span className="subblock-error-icon">⚠️</span>
      <span>{block.error ?? "发生错误"}</span>
    </div>
  ),

  // 示例：信息卡片组件
  infoCard: ({ block }) => (
    <div className="subblock-info-card">
      <h4>{(block.config.props?.title as string) ?? "信息"}</h4>
      <p>{(block.config.props?.content as string) ?? "无内容"}</p>
    </div>
  ),

  // 示例：按钮组组件
  buttonGroup: ({ block, context }) => {
    const buttons =
      (block.config.props?.buttons as Array<{
        label: string;
        action: string;
      }>) ?? [];
    return (
      <div className="subblock-button-group">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            className="subblock-action-btn"
            onClick={() => {
              context.sendEvent({
                type: "block:update",
                blockId: block.config.id,
                data: { action: btn.action },
                timestamp: Date.now(),
              });
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    );
  },
};

/**
 * 自定义组件注册表
 *
 * 允许外部注册自定义 VDOM 组件。
 */
const customComponents: Map<
  string,
  React.FC<{ block: VDomBlock; context: VDomContext }>
> = new Map();

/**
 * 注册自定义 VDOM 组件
 */
// eslint-disable-next-line react-refresh/only-export-components
export function registerVDomComponent(
  name: string,
  component: React.FC<{ block: VDomBlock; context: VDomContext }>,
): void {
  customComponents.set(name, component);
}

/**
 * 注销自定义 VDOM 组件
 */
// eslint-disable-next-line react-refresh/only-export-components
export function unregisterVDomComponent(name: string): void {
  customComponents.delete(name);
}

/**
 * 获取 VDOM 组件
 */
function getVDomComponent(
  componentName: string,
): React.FC<{ block: VDomBlock; context: VDomContext }> | null {
  // 优先查找自定义组件
  const custom = customComponents.get(componentName);
  if (custom) return custom;

  // 然后查找内置组件
  return builtinComponents[componentName] ?? null;
}

// ============================================================================
// 焦点管理工具函数
// _Requirements: 14.4_
// ============================================================================

/**
 * 获取元素内所有可聚焦元素
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors),
  );
}

/**
 * 焦点陷阱 Hook
 *
 * 将焦点限制在容器内，支持 Tab 键循环导航。
 */
function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab：向后导航
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab：向前导航
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, enabled]);
}

// ============================================================================
// SubBlock 组件
// ============================================================================

/**
 * VDOM 子块组件
 *
 * 渲染单个 VDOM 块，支持焦点管理和关闭操作。
 *
 * _Requirements: 14.3, 14.4, 14.5_
 */
export const SubBlock: React.FC<SubBlockProps> = ({
  block,
  terminalBlockId,
  tabId: _tabId,
  context,
  index = 0,
  totalBlocks = 1,
  onNavigatePrev,
  onNavigateNext,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocusTrapEnabled, setIsFocusTrapEnabled] = useState(false);

  // 操作原子
  const removeBlock = useSetAtom(removeVDomBlockAtom);
  const setBlockFocus = useSetAtom(setVDomBlockFocusAtom);
  const updateBlock = useSetAtom(updateVDomBlockAtom);

  // 启用焦点陷阱
  useFocusTrap(containerRef, isFocusTrapEnabled && block.focused);

  // 处理关闭
  // _Requirements: 14.5_
  const handleClose = useCallback(() => {
    if (!block.config.closable) return;

    removeBlock({ terminalBlockId, blockId: block.config.id });
    context.closeBlock(block.config.id);
  }, [
    block.config.id,
    block.config.closable,
    terminalBlockId,
    removeBlock,
    context,
  ]);

  // 处理聚焦
  // _Requirements: 14.4_
  const handleFocus = useCallback(() => {
    setBlockFocus({ terminalBlockId, blockId: block.config.id });
  }, [block.config.id, terminalBlockId, setBlockFocus]);

  // 处理失焦
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // 检查焦点是否移出了块
      if (!containerRef.current?.contains(e.relatedTarget as Node)) {
        setBlockFocus({ terminalBlockId, blockId: null });
      }
    },
    [terminalBlockId, setBlockFocus],
  );

  // 键盘事件处理
  // _Requirements: 14.4_
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          // Escape 键关闭块
          if (block.config.closable) {
            e.preventDefault();
            handleClose();
          }
          break;

        case "ArrowUp":
        case "ArrowLeft":
          // 向上/左导航到上一个块
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onNavigatePrev?.();
          }
          break;

        case "ArrowDown":
        case "ArrowRight":
          // 向下/右导航到下一个块
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onNavigateNext?.();
          }
          break;

        case "f":
          // Ctrl/Cmd + F 启用焦点陷阱
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setIsFocusTrapEnabled((prev) => !prev);
          }
          break;
      }
    },
    [block.config.closable, handleClose, onNavigatePrev, onNavigateNext],
  );

  // 块加载完成后更新状态
  useEffect(() => {
    if (block.status === "loading") {
      // 模拟加载完成
      const timer = setTimeout(() => {
        updateBlock({
          terminalBlockId,
          blockId: block.config.id,
          updates: { status: "ready" },
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [block.config.id, block.status, terminalBlockId, updateBlock]);

  // 聚焦时自动滚动到视图
  useEffect(() => {
    if (block.focused && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [block.focused]);

  // 获取要渲染的组件
  const Component = getVDomComponent(block.config.component);

  // 计算样式
  const style: React.CSSProperties = {};
  if (block.config.position) {
    const { top, left, bottom, right } = block.config.position;
    if (top !== undefined) style.top = top;
    if (left !== undefined) style.left = left;
    if (bottom !== undefined) style.bottom = bottom;
    if (right !== undefined) style.right = right;
  }
  if (block.config.size) {
    const { width, height, minWidth, minHeight, maxWidth, maxHeight } =
      block.config.size;
    if (width !== undefined) style.width = width;
    if (height !== undefined) style.height = height;
    if (minWidth !== undefined) style.minWidth = minWidth;
    if (minHeight !== undefined) style.minHeight = minHeight;
    if (maxWidth !== undefined) style.maxWidth = maxWidth;
    if (maxHeight !== undefined) style.maxHeight = maxHeight;
  }

  return (
    <div
      ref={containerRef}
      className={`subblock ${block.focused ? "focused" : ""} ${isFocusTrapEnabled ? "focus-trapped" : ""} ${className}`}
      style={style}
      tabIndex={0}
      role="region"
      aria-label={block.config.title ?? `VDOM 块 ${index + 1}`}
      aria-describedby={block.config.id}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-block-id={block.config.id}
      data-block-type={block.config.type}
      data-block-index={index}
    >
      {/* 块头部 */}
      {(block.config.title || block.config.closable) && (
        <div className="subblock-header">
          {block.config.title && (
            <span className="subblock-title">{block.config.title}</span>
          )}
          <div className="subblock-header-actions">
            {/* 焦点陷阱指示器 */}
            {isFocusTrapEnabled && (
              <span
                className="subblock-focus-indicator"
                title="焦点已锁定 (Ctrl+F 解锁)"
              >
                🔒
              </span>
            )}
            {/* 块索引指示器 */}
            {totalBlocks > 1 && (
              <span className="subblock-index">
                {index + 1}/{totalBlocks}
              </span>
            )}
            {block.config.closable && (
              <button
                className="subblock-close-btn"
                onClick={handleClose}
                title="关闭 (Esc)"
                aria-label="关闭块"
              >
                <CloseIcon className="subblock-close-icon" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 块内容 */}
      <div className="subblock-content" id={block.config.id}>
        {block.status === "loading" && (
          <div className="subblock-loading">
            <div className="subblock-spinner" />
          </div>
        )}
        {block.status === "error" && (
          <div className="subblock-error">
            <span className="subblock-error-icon">⚠️</span>
            <span>{block.error ?? "发生错误"}</span>
          </div>
        )}
        {block.status === "ready" && Component && (
          <Component block={block} context={context} />
        )}
        {block.status === "ready" && !Component && (
          <div className="subblock-placeholder">
            <p>未找到组件: {block.config.component}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// SubBlockContainer 组件
// ============================================================================

export interface SubBlockContainerProps {
  /** VDOM 块列表 */
  blocks: VDomBlock[];
  /** 终端块 ID */
  terminalBlockId: string;
  /** 标签页 ID */
  tabId: string;
  /** VDOM 上下文 */
  context: VDomContext;
  /** 自定义类名 */
  className?: string;
}

/**
 * VDOM 子块容器
 *
 * 渲染多个 VDOM 块，支持键盘导航。
 *
 * _Requirements: 14.3, 14.4_
 */
export const SubBlockContainer: React.FC<SubBlockContainerProps> = ({
  blocks,
  terminalBlockId,
  tabId,
  context,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const setBlockFocus = useSetAtom(setVDomBlockFocusAtom);

  // 导航到指定索引的块
  const navigateToBlock = useCallback(
    (index: number) => {
      if (index < 0 || index >= blocks.length) return;

      const targetBlock = blocks[index];
      setBlockFocus({ terminalBlockId, blockId: targetBlock.config.id });

      // 聚焦对应的 DOM 元素
      const blockElement = containerRef.current?.querySelector(
        `[data-block-index="${index}"]`,
      ) as HTMLElement | null;
      blockElement?.focus();
    },
    [blocks, terminalBlockId, setBlockFocus],
  );

  // 获取当前聚焦块的索引
  const _getFocusedIndex = useCallback(() => {
    return blocks.findIndex((b) => b.focused);
  }, [blocks]);

  // 导航到上一个块
  const handleNavigatePrev = useCallback(
    (currentIndex: number) => {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : blocks.length - 1;
      navigateToBlock(prevIndex);
    },
    [blocks.length, navigateToBlock],
  );

  // 导航到下一个块
  const handleNavigateNext = useCallback(
    (currentIndex: number) => {
      const nextIndex = currentIndex < blocks.length - 1 ? currentIndex + 1 : 0;
      navigateToBlock(nextIndex);
    },
    [blocks.length, navigateToBlock],
  );

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`subblock-container ${className}`}
      role="list"
      aria-label="VDOM 块列表"
    >
      {blocks.map((block, index) => (
        <SubBlock
          key={block.config.id}
          block={block}
          terminalBlockId={terminalBlockId}
          tabId={tabId}
          context={context}
          index={index}
          totalBlocks={blocks.length}
          onNavigatePrev={() => handleNavigatePrev(index)}
          onNavigateNext={() => handleNavigateNext(index)}
        />
      ))}
    </div>
  );
};

export default SubBlock;
