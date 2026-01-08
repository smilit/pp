/**
 * @file viewmodel.ts
 * @description 终端视图模型
 * @module lib/terminal/store/viewmodel
 *
 * 实现 TermViewModel，封装终端视图的状态和操作。
 * 对齐 waveterm 的 TermViewModel 架构。
 *
 * _Requirements: 9.7_
 */

import { atom, type Atom, type PrimitiveAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import type {
  TermMode,
  ConnStatus,
  ShellProcStatus,
  BlockControllerRuntimeStatus,
} from "./types";
import {
  termModeAtomFamily,
  connStatusAtomFamily,
  fontSizeAtomFamily,
  termThemeNameAtomFamily,
  shellProcStatusAtomFamily,
  shellProcFullStatusAtomFamily,
} from "./atoms";

// ============================================================================
// TermViewModel 类型定义
// ============================================================================

/**
 * 终端视图模型接口
 *
 * 对齐 waveterm 的 TermViewModel 设计。
 *
 * _Requirements: 9.7_
 */
export interface TermViewModel {
  /** 块 ID */
  blockId: string;
  /** 标签页 ID */
  tabId: string;

  // Jotai 原子
  /** 终端模式原子 */
  termModeAtom: PrimitiveAtom<TermMode>;
  /** 连接状态原子 */
  connStatusAtom: PrimitiveAtom<ConnStatus>;
  /** 字体大小原子 */
  fontSizeAtom: PrimitiveAtom<number>;
  /** 主题名称原子 */
  termThemeNameAtom: PrimitiveAtom<string>;
  /** Shell 进程状态原子 */
  shellProcStatusAtom: PrimitiveAtom<ShellProcStatus>;
  /** 完整控制器运行时状态原子 */
  shellProcFullStatusAtom: PrimitiveAtom<BlockControllerRuntimeStatus>;

  // 派生原子
  /** 是否已连接 */
  isConnectedAtom: Atom<boolean>;
  /** 是否正在运行 */
  isRunningAtom: Atom<boolean>;
  /** 是否已完成 */
  isDoneAtom: Atom<boolean>;
  /** 是否有错误 */
  hasErrorAtom: Atom<boolean>;
  /** 退出码 */
  exitCodeAtom: Atom<number>;
  /** 连接名称 */
  connectionNameAtom: Atom<string | undefined>;
}

// ============================================================================
// TermViewModel 工厂函数
// ============================================================================

/**
 * 创建终端视图模型
 *
 * @param blockId - 块 ID
 * @param tabId - 标签页 ID
 * @returns 终端视图模型
 *
 * _Requirements: 9.7_
 */
export function createTermViewModel(
  blockId: string,
  tabId: string,
): TermViewModel {
  // 获取基础原子
  const termModeAtom = termModeAtomFamily(blockId);
  const connStatusAtom = connStatusAtomFamily(blockId);
  const fontSizeAtom = fontSizeAtomFamily(blockId);
  const termThemeNameAtom = termThemeNameAtomFamily(blockId);
  const shellProcStatusAtom = shellProcStatusAtomFamily(blockId);
  const shellProcFullStatusAtom = shellProcFullStatusAtomFamily(blockId);

  // 创建派生原子
  const isConnectedAtom = atom((get) => {
    const connStatus = get(connStatusAtom);
    return connStatus.connected;
  });

  const isRunningAtom = atom((get) => {
    const status = get(shellProcStatusAtom);
    return status === "running";
  });

  const isDoneAtom = atom((get) => {
    const status = get(shellProcStatusAtom);
    return status === "done";
  });

  const hasErrorAtom = atom((get) => {
    const connStatus = get(connStatusAtom);
    return connStatus.status === "error" || !!connStatus.error;
  });

  const exitCodeAtom = atom((get) => {
    const fullStatus = get(shellProcFullStatusAtom);
    return fullStatus.shellProcExitCode;
  });

  const connectionNameAtom = atom((get) => {
    const fullStatus = get(shellProcFullStatusAtom);
    return fullStatus.shellProcConnName;
  });

  return {
    blockId,
    tabId,
    termModeAtom,
    connStatusAtom,
    fontSizeAtom,
    termThemeNameAtom,
    shellProcStatusAtom,
    shellProcFullStatusAtom,
    isConnectedAtom,
    isRunningAtom,
    isDoneAtom,
    hasErrorAtom,
    exitCodeAtom,
    connectionNameAtom,
  };
}

// ============================================================================
// TermViewModel 原子族
// ============================================================================

/**
 * TermViewModel 缓存
 *
 * 使用 Map 缓存已创建的 TermViewModel 实例。
 */
const viewModelCache = new Map<string, TermViewModel>();

/**
 * 获取或创建 TermViewModel
 *
 * @param blockId - 块 ID
 * @param tabId - 标签页 ID
 * @returns 终端视图模型
 */
export function getOrCreateTermViewModel(
  blockId: string,
  tabId: string,
): TermViewModel {
  const key = `${tabId}:${blockId}`;
  let viewModel = viewModelCache.get(key);

  if (!viewModel) {
    viewModel = createTermViewModel(blockId, tabId);
    viewModelCache.set(key, viewModel);
  }

  return viewModel;
}

/**
 * 清理 TermViewModel
 *
 * @param blockId - 块 ID
 * @param tabId - 标签页 ID
 */
export function cleanupTermViewModel(blockId: string, tabId: string): void {
  const key = `${tabId}:${blockId}`;
  viewModelCache.delete(key);
}

/**
 * 清理所有 TermViewModel
 */
export function cleanupAllTermViewModels(): void {
  viewModelCache.clear();
}

// ============================================================================
// TermViewModel 原子族（按 blockId + tabId 索引）
// ============================================================================

/**
 * TermViewModel 原子族
 *
 * 用于在组件中获取 TermViewModel。
 *
 * _Requirements: 9.7_
 */
export const termViewModelAtomFamily = atomFamily(
  ({ blockId, tabId }: { blockId: string; tabId: string }) =>
    atom(() => getOrCreateTermViewModel(blockId, tabId)),
);
