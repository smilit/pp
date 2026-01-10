/**
 * @file 海报画布模块导出
 * @description 导出海报画布相关组件和类型
 * @module components/content-creator/canvas/poster
 */

/* eslint-disable react-refresh/only-export-components */

// 主组件
export { PosterCanvas } from "./PosterCanvas";
export { PosterToolbar } from "./PosterToolbar";
export { ElementToolbar } from "./ElementToolbar";
export { LayerPanel } from "./LayerPanel";
export { PageList } from "./PageList";
export {
  SizeSelector,
  SizeSelectorDialog,
  sizeSelectorUtils,
} from "./SizeSelector";
export { AlignmentToolbar, AlignmentButton } from "./AlignmentToolbar";

// 注册
export {
  registerPosterCanvas,
  unregisterPosterCanvas,
  posterCanvasPlugin,
} from "./registerPosterCanvas";

// Hooks
export { useFabricCanvas, zoomUtils } from "./hooks";
export { usePageOperations, pageUtils } from "./hooks";
export { useLayerManager, layerManagerUtils } from "./hooks";
export { useAlignment } from "./hooks";
export type { UseFabricCanvasReturn, UseFabricCanvasOptions } from "./hooks";
export type {
  UsePageOperationsReturn,
  UsePageOperationsOptions,
} from "./hooks";
export type { UseLayerManagerReturn, UseLayerManagerOptions } from "./hooks";
export type { UseAlignmentReturn, UseAlignmentOptions } from "./hooks";

// Layer utils from utils folder
export {
  layerUtils,
  alignmentUtils,
  DEFAULT_ALIGNMENT_CONFIG,
  ALIGN_BUTTONS,
} from "./utils";
export type {
  AlignmentLine,
  AlignmentLineType,
  AlignmentSource,
  AlignmentResult,
  ElementBounds,
  AlignmentConfig,
  AlignDirection,
  AlignButtonConfig,
} from "./utils";

// Elements
export * from "./elements";

// Types
export type {
  PosterSizePreset,
  SizeConfig,
  ElementType,
  ShapeType,
  Layer,
  BackgroundType,
  GradientType,
  BackgroundConfig,
  PosterPage,
  PosterCanvasState,
  PosterCanvasProps,
  ExportFormat,
  ExportConfig,
  PosterToolbarProps,
  ElementToolbarProps,
  LayerPanelProps,
  PageListProps,
  SizeSelectorProps,
  ExportDialogProps,
} from "./types";

export {
  SIZE_PRESETS,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
  ZOOM_PRESETS,
  createInitialPage,
  createInitialPosterState,
  clampZoom,
} from "./types";
