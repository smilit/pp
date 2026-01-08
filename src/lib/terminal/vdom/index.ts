/**
 * @file index.ts
 * @description VDOM 模块导出
 * @module lib/terminal/vdom
 *
 * 导出 VDOM 相关的类型、状态和工具函数。
 *
 * _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
 */

// 类型导出
export type {
  VDomBlockType,
  VDomBlockStatus,
  VDomBlockConfig,
  VDomBlockPosition,
  VDomBlockSize,
  VDomBlock,
  VDomToolbarConfig,
  VDomToolbarItem,
  VDomEventType,
  VDomEvent,
  VDomContext,
} from "./types";

// 工厂函数导出
export {
  createDefaultVDomBlockConfig,
  createVDomBlock,
  createDefaultToolbarConfig,
} from "./types";

// 状态原子导出
export {
  // 原子族
  vdomBlocksAtomFamily,
  focusedVDomBlockAtomFamily,
  vdomToolbarAtomFamily,
  vdomEventsAtomFamily,
  // 操作原子
  addVDomBlockAtom,
  removeVDomBlockAtom,
  updateVDomBlockAtom,
  setVDomBlockFocusAtom,
  setVDomToolbarAtom,
  cleanupVDomStateAtom,
  // 派生原子
  hasVDomBlocksAtomFamily,
  vdomBlockCountAtomFamily,
  getVDomBlockAtomFamily,
} from "./store";
