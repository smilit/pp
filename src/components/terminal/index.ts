/**
 * @file index.ts
 * @description 终端组件导出
 * @module components/terminal
 *
 * _Requirements: 8.1, 9.7, 14.1, 14.2, 14.3, 14.4, 14.5, 15.1, 15.2, 15.3, 15.4_
 */

export { TerminalPage } from "./TerminalPage";
export { TerminalView } from "./TerminalView";
export { TerminalSearch } from "./TerminalSearch";
export { TerminalContextMenu } from "./TerminalContextMenu";
export { ConnectionStatusIndicator } from "./ConnectionStatusIndicator";
export { MultiInputIndicator } from "./MultiInputIndicator";
export { TermWrap } from "./termwrap";

// VDOM 组件
// _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
export { VDomModeSwitch, VDomModeToggle } from "./VDomModeSwitch";
export { VDomView } from "./VDomView";
export {
  SubBlock,
  SubBlockContainer,
  registerVDomComponent,
  unregisterVDomComponent,
} from "./SubBlock";

// 贴纸组件
// _Requirements: 15.1, 15.2, 15.3, 15.4_
export { Sticker } from "./Sticker";
export { StickerLayer } from "./StickerLayer";
