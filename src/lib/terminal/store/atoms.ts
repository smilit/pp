/**
 * @file atoms.ts
 * @description 终端状态原子定义
 * @module lib/terminal/store/atoms
 *
 * 使用 Jotai 定义终端相关的原子状态。
 * 每个终端（通过 blockId 标识）维护独立的状态。
 *
 * _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
 */

import { atom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
import type {
  TermMode,
  ConnStatus,
  ShellProcStatus,
  BlockControllerRuntimeStatus,
  TerminalViewState,
} from "./types";
import { createDefaultConnStatus, createDefaultRuntimeStatus } from "./types";

// ============================================================================
// 全局配置原子
// ============================================================================

/**
 * 默认字体大小原子（持久化存储）
 *
 * _Requirements: 9.4_
 */
export const defaultFontSizeAtom = atomWithStorage<number>(
  "terminal-default-font-size",
  14,
);

/**
 * 默认主题名称原子（持久化存储）
 *
 * _Requirements: 9.4_
 */
export const defaultThemeNameAtom = atomWithStorage<string>(
  "terminal-theme",
  "tokyo-night",
);

// ============================================================================
// 终端状态原子族（按 blockId 索引）
// ============================================================================

/**
 * 终端模式原子族
 *
 * 每个终端的显示模式（term/vdom）。
 *
 * _Requirements: 9.2, 14.1_
 */
export const termModeAtomFamily = atomFamily((_blockId: string) =>
  atom<TermMode>("term"),
);

/**
 * 连接状态原子族
 *
 * 每个终端的连接状态详情。
 *
 * _Requirements: 9.3, 7.1_
 */
export const connStatusAtomFamily = atomFamily((_blockId: string) =>
  atom<ConnStatus>(createDefaultConnStatus()),
);

/**
 * 字体大小原子族
 *
 * 每个终端的字体大小配置。
 *
 * _Requirements: 9.4_
 */
export const fontSizeAtomFamily = atomFamily((_blockId: string) =>
  atom<number>(14),
);

/**
 * 主题名称原子族
 *
 * 每个终端的主题配置。
 *
 * _Requirements: 9.4_
 */
export const termThemeNameAtomFamily = atomFamily((_blockId: string) =>
  atom<string>("tokyo-night"),
);

/**
 * Shell 进程状态原子族
 *
 * 每个终端的 Shell 进程状态。
 *
 * _Requirements: 9.5, 1.2, 1.3_
 */
export const shellProcStatusAtomFamily = atomFamily((_blockId: string) =>
  atom<ShellProcStatus>("init"),
);

/**
 * 完整控制器运行时状态原子族
 *
 * 每个终端的完整控制器状态。
 *
 * _Requirements: 9.5, 1.8_
 */
export const shellProcFullStatusAtomFamily = atomFamily((blockId: string) =>
  atom<BlockControllerRuntimeStatus>(createDefaultRuntimeStatus(blockId)),
);

// ============================================================================
// 连接状态映射（按连接名称索引）
// ============================================================================

/**
 * 所有连接状态的映射
 *
 * 用于按连接名称查询状态。
 *
 * _Requirements: 7.6_
 */
export const connStatusMapAtom = atom<Map<string, ConnStatus>>(new Map());

/**
 * 获取指定连接的状态
 */
export const getConnStatusAtom = atomFamily((connection: string) =>
  atom((get) => {
    const map = get(connStatusMapAtom);
    return map.get(connection) ?? createDefaultConnStatus(connection);
  }),
);

// ============================================================================
// 终端视图状态原子族
// ============================================================================

/**
 * 终端视图状态原子族
 *
 * 聚合单个终端的所有状态。
 *
 * _Requirements: 9.7_
 */
export const terminalViewStateAtomFamily = atomFamily(
  ({ blockId, tabId }: { blockId: string; tabId: string }) =>
    atom<TerminalViewState>((get) => {
      const termMode = get(termModeAtomFamily(blockId));
      const connStatus = get(connStatusAtomFamily(blockId));
      const fontSize = get(fontSizeAtomFamily(blockId));
      const themeName = get(termThemeNameAtomFamily(blockId));
      const shellProcStatus = get(shellProcStatusAtomFamily(blockId));
      const runtimeStatus = get(shellProcFullStatusAtomFamily(blockId));

      return {
        blockId,
        tabId,
        termMode,
        connStatus,
        fontSize,
        themeName,
        shellProcStatus,
        runtimeStatus,
      };
    }),
);

// ============================================================================
// 操作原子
// ============================================================================

/**
 * 更新终端模式
 */
export const setTermModeAtom = atom(
  null,
  (get, set, { blockId, mode }: { blockId: string; mode: TermMode }) => {
    set(termModeAtomFamily(blockId), mode);
  },
);

/**
 * 更新连接状态
 */
export const setConnStatusAtom = atom(
  null,
  (get, set, { blockId, status }: { blockId: string; status: ConnStatus }) => {
    set(connStatusAtomFamily(blockId), status);

    // 同时更新连接状态映射
    if (status.connection) {
      const map = new Map(get(connStatusMapAtom));
      map.set(status.connection, status);
      set(connStatusMapAtom, map);
    }
  },
);

/**
 * 更新字体大小
 */
export const setFontSizeAtom = atom(
  null,
  (get, set, { blockId, fontSize }: { blockId: string; fontSize: number }) => {
    set(fontSizeAtomFamily(blockId), fontSize);
  },
);

/**
 * 更新主题名称
 */
export const setThemeNameAtom = atom(
  null,
  (
    get,
    set,
    { blockId, themeName }: { blockId: string; themeName: string },
  ) => {
    set(termThemeNameAtomFamily(blockId), themeName);
  },
);

/**
 * 更新 Shell 进程状态
 */
export const setShellProcStatusAtom = atom(
  null,
  (
    get,
    set,
    { blockId, status }: { blockId: string; status: ShellProcStatus },
  ) => {
    set(shellProcStatusAtomFamily(blockId), status);
  },
);

/**
 * 更新完整控制器运行时状态
 */
export const setShellProcFullStatusAtom = atom(
  null,
  (
    get,
    set,
    {
      blockId,
      status,
    }: { blockId: string; status: BlockControllerRuntimeStatus },
  ) => {
    set(shellProcFullStatusAtomFamily(blockId), status);
    // 同步更新简化的状态
    set(shellProcStatusAtomFamily(blockId), status.shellProcStatus);
  },
);

/**
 * 批量更新连接状态映射
 */
export const updateConnStatusMapAtom = atom(
  null,
  (
    get,
    set,
    { connection, status }: { connection: string; status: ConnStatus },
  ) => {
    const map = new Map(get(connStatusMapAtom));
    map.set(connection, status);
    set(connStatusMapAtom, map);
  },
);

// ============================================================================
// 清理原子
// ============================================================================

/**
 * 清理终端状态
 *
 * 当终端关闭时调用，清理相关的原子状态。
 */
export const cleanupTerminalStateAtom = atom(
  null,
  (get, set, blockId: string) => {
    // 重置为默认值
    set(termModeAtomFamily(blockId), "term");
    set(connStatusAtomFamily(blockId), createDefaultConnStatus());
    set(fontSizeAtomFamily(blockId), get(defaultFontSizeAtom));
    set(termThemeNameAtomFamily(blockId), get(defaultThemeNameAtom));
    set(shellProcStatusAtomFamily(blockId), "init");
    set(
      shellProcFullStatusAtomFamily(blockId),
      createDefaultRuntimeStatus(blockId),
    );
  },
);
