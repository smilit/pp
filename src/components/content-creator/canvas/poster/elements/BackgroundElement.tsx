/**
 * @file 背景元素组件
 * @description 提供背景设置功能，支持纯色、渐变和图片背景
 * @module components/content-creator/canvas/poster/elements/BackgroundElement
 */

import { useCallback } from "react";
import { fabric } from "fabric";
import type { BackgroundConfig, GradientType } from "../types";

/**
 * 默认背景配置
 */
export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: "solid",
  color: "#ffffff",
};

/**
 * 预设背景颜色
 */
export const PRESET_COLORS = [
  "#ffffff",
  "#f5f5f5",
  "#e0e0e0",
  "#333333",
  "#000000",
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#96ceb4",
  "#ffeaa7",
  "#dfe6e9",
  "#a29bfe",
];

/**
 * 预设渐变
 */
export const PRESET_GRADIENTS: Array<{ colors: string[]; angle: number }> = [
  { colors: ["#667eea", "#764ba2"], angle: 135 },
  { colors: ["#f093fb", "#f5576c"], angle: 135 },
  { colors: ["#4facfe", "#00f2fe"], angle: 135 },
  { colors: ["#43e97b", "#38f9d7"], angle: 135 },
  { colors: ["#fa709a", "#fee140"], angle: 135 },
  { colors: ["#a8edea", "#fed6e3"], angle: 135 },
];

/**
 * useBackgroundElement Hook 配置
 */
export interface UseBackgroundElementOptions {
  canvas: fabric.Canvas | null;
  onBackgroundChange?: (config: BackgroundConfig) => void;
}

/**
 * useBackgroundElement Hook 返回值
 */
export interface UseBackgroundElementReturn {
  setSolidBackground: (color: string) => void;
  setGradientBackground: (
    type: GradientType,
    colors: string[],
    angle?: number,
  ) => void;
  setImageBackground: (
    url: string,
    fit?: "fill" | "fit" | "tile",
  ) => Promise<void>;
  clearBackground: () => void;
  getBackgroundConfig: () => BackgroundConfig;
}

/**
 * 背景元素 Hook
 */
export function useBackgroundElement(
  options: UseBackgroundElementOptions,
): UseBackgroundElementReturn {
  const { canvas, onBackgroundChange } = options;

  const setSolidBackground = useCallback(
    (color: string) => {
      if (!canvas) return;

      canvas.setBackgroundColor(color, () => {
        canvas.requestRenderAll();
      });

      onBackgroundChange?.({ type: "solid", color });
    },
    [canvas, onBackgroundChange],
  );

  const setGradientBackground = useCallback(
    (type: GradientType, colors: string[], angle: number = 0) => {
      if (!canvas || colors.length < 2) return;

      let gradient: fabric.Gradient;

      if (type === "linear") {
        const angleRad = (angle * Math.PI) / 180;
        const x1 = 0.5 - Math.cos(angleRad) * 0.5;
        const y1 = 0.5 - Math.sin(angleRad) * 0.5;
        const x2 = 0.5 + Math.cos(angleRad) * 0.5;
        const y2 = 0.5 + Math.sin(angleRad) * 0.5;

        gradient = new fabric.Gradient({
          type: "linear",
          coords: {
            x1: x1 * canvas.width!,
            y1: y1 * canvas.height!,
            x2: x2 * canvas.width!,
            y2: y2 * canvas.height!,
          },
          colorStops: colors.map((color, index) => ({
            offset: index / (colors.length - 1),
            color,
          })),
        });
      } else {
        gradient = new fabric.Gradient({
          type: "radial",
          coords: {
            x1: canvas.width! / 2,
            y1: canvas.height! / 2,
            r1: 0,
            x2: canvas.width! / 2,
            y2: canvas.height! / 2,
            r2: Math.max(canvas.width!, canvas.height!) / 2,
          },
          colorStops: colors.map((color, index) => ({
            offset: index / (colors.length - 1),
            color,
          })),
        });
      }

      canvas.setBackgroundColor(gradient, () => {
        canvas.requestRenderAll();
      });

      onBackgroundChange?.({
        type: "gradient",
        gradient: { type, colors, angle },
      });
    },
    [canvas, onBackgroundChange],
  );

  const setImageBackground = useCallback(
    async (
      url: string,
      fit: "fill" | "fit" | "tile" = "fill",
    ): Promise<void> => {
      if (!canvas) return;

      return new Promise((resolve) => {
        fabric.Image.fromURL(
          url,
          (img) => {
            if (!img) {
              resolve();
              return;
            }

            let scaleX = 1;
            let scaleY = 1;

            if (fit === "fill") {
              scaleX = canvas.width! / img.width!;
              scaleY = canvas.height! / img.height!;
            } else if (fit === "fit") {
              const scale = Math.min(
                canvas.width! / img.width!,
                canvas.height! / img.height!,
              );
              scaleX = scale;
              scaleY = scale;
            }

            img.set({
              scaleX,
              scaleY,
              originX: "left",
              originY: "top",
            });

            canvas.setBackgroundImage(img, () => {
              canvas.requestRenderAll();
              resolve();
            });

            onBackgroundChange?.({
              type: "image",
              imageUrl: url,
              imageFit: fit,
            });
          },
          { crossOrigin: "anonymous" },
        );
      });
    },
    [canvas, onBackgroundChange],
  );

  const clearBackground = useCallback(() => {
    if (!canvas) return;

    canvas.setBackgroundColor("#ffffff", () => {
      canvas.setBackgroundImage(null as unknown as fabric.Image, () => {
        canvas.requestRenderAll();
      });
    });

    onBackgroundChange?.({ type: "solid", color: "#ffffff" });
  }, [canvas, onBackgroundChange]);

  const getBackgroundConfig = useCallback((): BackgroundConfig => {
    if (!canvas) return DEFAULT_BACKGROUND;

    const bgColor = canvas.backgroundColor;
    const bgImage = canvas.backgroundImage;

    if (bgImage) {
      return {
        type: "image",
        imageUrl: (bgImage as fabric.Image).getSrc?.() || "",
        imageFit: "fill",
      };
    }

    if (bgColor instanceof fabric.Gradient) {
      const gradient = bgColor as fabric.Gradient;
      const colors = gradient.colorStops?.map((stop) => stop.color) || [];
      return {
        type: "gradient",
        gradient: {
          type: gradient.type === "radial" ? "radial" : "linear",
          colors,
        },
      };
    }

    return {
      type: "solid",
      color: (bgColor as string) || "#ffffff",
    };
  }, [canvas]);

  return {
    setSolidBackground,
    setGradientBackground,
    setImageBackground,
    clearBackground,
    getBackgroundConfig,
  };
}
