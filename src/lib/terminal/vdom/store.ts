/**
 * @file store.ts
 * @description VDOM 状态管理
 * @module lib/terminal/vdom/store
 *
 * 使用 Jotai 管理 VDOM 块的状态。
 *
 * _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
 */

import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type {
  VDomBlock,
  VDomBlockConfig,
  VDomToolbarConfig,
  VDomEvent,
} from "./types";
import { createVDomBlock } from "./types";

// ============================================================================
// VDOM 块状态原子族
// ============================================================================

/**
 * VDOM 块列表原子族（按终端 blockId 索引）
 *
 * 存储每个终端的 VDOM 块列表。
 *
 * _Requirements: 14.3_
 */
export const vdomBlocksAtomFamily = atomFamily((_terminalBlockId: string) =>
  atom<VDomBlock[]>([]),
);

/**
 * 当前聚焦的 VDOM 块 ID 原子族
 *
 * _Requirements: 14.4_
 */
export const focusedVDomBlockAtomFamily = atomFamily(
  (_terminalBlockId: string) => atom<string | null>(null),
);

/**
 * VDOM 工具栏配置原子族
 *
 * _Requirements: 14.4_
 */
export const vdomToolbarAtomFamily = atomFamily((_terminalBlockId: string) =>
  atom<VDomToolbarConfig | null>(null),
);

/**
 * VDOM 事件历史原子族（用于调试）
 */
export const vdomEventsAtomFamily = atomFamily((_terminalBlockId: string) =>
  atom<VDomEvent[]>([]),
);

// ============================================================================
// VDOM 块操作原子
// ============================================================================

/**
 * 添加 VDOM 块
 *
 * _Requirements: 14.3_
 */
export const addVDomBlockAtom = atom(
  null,
  (
    get,
    set,
    {
      terminalBlockId,
      config,
    }: { terminalBlockId: string; config: VDomBlockConfig },
  ) => {
    const blocksAtom = vdomBlocksAtomFamily(terminalBlockId);
    const blocks = get(blocksAtom);

    // 检查是否已存在
    if (blocks.some((b) => b.config.id === config.id)) {
      console.warn(`[VDOM] 块 ${config.id} 已存在`);
      return;
    }

    // 创建新块
    const newBlock = createVDomBlock(config);
    set(blocksAtom, [...blocks, newBlock]);

    // 记录事件
    const eventsAtom = vdomEventsAtomFamily(terminalBlockId);
    const events = get(eventsAtom);
    set(eventsAtom, [
      ...events,
      {
        type: "block:create",
        blockId: config.id,
        timestamp: Date.now(),
      },
    ]);
  },
);

/**
 * 移除 VDOM 块
 *
 * _Requirements: 14.5_
 */
export const removeVDomBlockAtom = atom(
  null,
  (
    get,
    set,
    { terminalBlockId, blockId }: { terminalBlockId: string; blockId: string },
  ) => {
    const blocksAtom = vdomBlocksAtomFamily(terminalBlockId);
    const blocks = get(blocksAtom);

    set(
      blocksAtom,
      blocks.filter((b) => b.config.id !== blockId),
    );

    // 如果移除的是聚焦块，清除聚焦状态
    const focusedAtom = focusedVDomBlockAtomFamily(terminalBlockId);
    if (get(focusedAtom) === blockId) {
      set(focusedAtom, null);
    }

    // 记录事件
    const eventsAtom = vdomEventsAtomFamily(terminalBlockId);
    const events = get(eventsAtom);
    set(eventsAtom, [
      ...events,
      {
        type: "block:close",
        blockId,
        timestamp: Date.now(),
      },
    ]);
  },
);

/**
 * 更新 VDOM 块
 */
export const updateVDomBlockAtom = atom(
  null,
  (
    get,
    set,
    {
      terminalBlockId,
      blockId,
      updates,
    }: {
      terminalBlockId: string;
      blockId: string;
      updates: Partial<VDomBlock>;
    },
  ) => {
    const blocksAtom = vdomBlocksAtomFamily(terminalBlockId);
    const blocks = get(blocksAtom);

    set(
      blocksAtom,
      blocks.map((b) =>
        b.config.id === blockId
          ? { ...b, ...updates, updatedAt: Date.now() }
          : b,
      ),
    );
  },
);

/**
 * 设置 VDOM 块聚焦
 *
 * _Requirements: 14.4_
 */
export const setVDomBlockFocusAtom = atom(
  null,
  (
    get,
    set,
    {
      terminalBlockId,
      blockId,
    }: { terminalBlockId: string; blockId: string | null },
  ) => {
    const focusedAtom = focusedVDomBlockAtomFamily(terminalBlockId);
    const previousFocused = get(focusedAtom);

    // 更新聚焦状态
    set(focusedAtom, blockId);

    // 更新块的 focused 属性
    const blocksAtom = vdomBlocksAtomFamily(terminalBlockId);
    const blocks = get(blocksAtom);

    set(
      blocksAtom,
      blocks.map((b) => ({
        ...b,
        focused: b.config.id === blockId,
        updatedAt:
          b.config.id === blockId || b.config.id === previousFocused
            ? Date.now()
            : b.updatedAt,
      })),
    );

    // 记录事件
    const eventsAtom = vdomEventsAtomFamily(terminalBlockId);
    const events = get(eventsAtom);

    if (previousFocused && previousFocused !== blockId) {
      set(eventsAtom, [
        ...events,
        {
          type: "block:blur",
          blockId: previousFocused,
          timestamp: Date.now(),
        },
      ]);
    }

    if (blockId) {
      set(eventsAtom, [
        ...get(eventsAtom),
        {
          type: "block:focus",
          blockId,
          timestamp: Date.now(),
        },
      ]);
    }
  },
);

/**
 * 设置 VDOM 工具栏
 *
 * _Requirements: 14.4_
 */
export const setVDomToolbarAtom = atom(
  null,
  (
    get,
    set,
    {
      terminalBlockId,
      toolbar,
    }: { terminalBlockId: string; toolbar: VDomToolbarConfig | null },
  ) => {
    const toolbarAtom = vdomToolbarAtomFamily(terminalBlockId);
    set(toolbarAtom, toolbar);
  },
);

/**
 * 清理终端的所有 VDOM 状态
 */
export const cleanupVDomStateAtom = atom(
  null,
  (get, set, terminalBlockId: string) => {
    set(vdomBlocksAtomFamily(terminalBlockId), []);
    set(focusedVDomBlockAtomFamily(terminalBlockId), null);
    set(vdomToolbarAtomFamily(terminalBlockId), null);
    set(vdomEventsAtomFamily(terminalBlockId), []);
  },
);

// ============================================================================
// 派生原子
// ============================================================================

/**
 * 获取终端是否有 VDOM 块
 */
export const hasVDomBlocksAtomFamily = atomFamily((terminalBlockId: string) =>
  atom((get) => {
    const blocks = get(vdomBlocksAtomFamily(terminalBlockId));
    return blocks.length > 0;
  }),
);

/**
 * 获取终端的 VDOM 块数量
 */
export const vdomBlockCountAtomFamily = atomFamily((terminalBlockId: string) =>
  atom((get) => {
    const blocks = get(vdomBlocksAtomFamily(terminalBlockId));
    return blocks.length;
  }),
);

/**
 * 获取指定 VDOM 块
 */
export const getVDomBlockAtomFamily = atomFamily(
  ({
    terminalBlockId,
    blockId,
  }: {
    terminalBlockId: string;
    blockId: string;
  }) =>
    atom((get) => {
      const blocks = get(vdomBlocksAtomFamily(terminalBlockId));
      return blocks.find((b) => b.config.id === blockId) ?? null;
    }),
);
