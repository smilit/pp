/**
 * @file 海报画布注册
 * @description 将海报画布注册到全局画布注册中心
 * @module components/content-creator/canvas/poster/registerPosterCanvas
 */

import type { ComponentType } from "react";
import { canvasRegistry } from "../../core/CanvasContainer";
import { PosterCanvas } from "./PosterCanvas";
import type { CanvasPlugin, CanvasProps } from "../../types";

/**
 * 海报画布插件配置
 *
 * 支持 poster 主题，用于图文海报设计、多页编辑和图片导出。
 */
export const posterCanvasPlugin: CanvasPlugin = {
  type: "poster",
  name: "海报画布",
  icon: "🖼️",
  supportedThemes: ["poster"],
  supportedFileTypes: ["poster", "png", "jpg"],
  // PosterCanvas 接受 PosterCanvasProps，与 CanvasProps 兼容
  component: PosterCanvas as unknown as ComponentType<CanvasProps>,
};

/**
 * 注册海报画布到全局注册中心
 */
export function registerPosterCanvas(): void {
  canvasRegistry.register(posterCanvasPlugin);
}

/**
 * 注销海报画布
 */
export function unregisterPosterCanvas(): void {
  canvasRegistry.unregister("poster");
}
