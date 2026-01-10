/**
 * @file 形状元素组件
 * @description 提供形状元素的添加和样式设置功能
 * @module components/content-creator/canvas/poster/elements/ShapeElement
 */

import { useCallback } from "react";
import { fabric } from "fabric";
import type { ShapeType } from "../types";

/**
 * 形状样式配置
 */
export interface ShapeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  rx?: number;
  ry?: number;
}

/**
 * 默认形状样式
 */
export const DEFAULT_SHAPE_STYLE: ShapeStyle = {
  fill: "#4A90D9",
  stroke: "#2E5A8C",
  strokeWidth: 2,
  opacity: 1,
};

/**
 * 形状类型配置
 */
export const SHAPE_CONFIGS: Record<ShapeType, { name: string; icon: string }> =
  {
    rect: { name: "矩形", icon: "□" },
    circle: { name: "圆形", icon: "○" },
    triangle: { name: "三角形", icon: "△" },
    line: { name: "线条", icon: "—" },
  };

/**
 * useShapeElement Hook 配置
 */
export interface UseShapeElementOptions {
  canvas: fabric.Canvas | null;
  onElementAdded?: (id: string) => void;
}

/**
 * useShapeElement Hook 返回值
 */
export interface UseShapeElementReturn {
  addShape: (type: ShapeType, style?: Partial<ShapeStyle>) => string | null;
  updateShapeStyle: (id: string, style: Partial<ShapeStyle>) => void;
  getShapeStyle: (id: string) => ShapeStyle | null;
}

/**
 * 形状元素 Hook
 */
export function useShapeElement(
  options: UseShapeElementOptions,
): UseShapeElementReturn {
  const { canvas, onElementAdded } = options;

  const addShape = useCallback(
    (type: ShapeType, style?: Partial<ShapeStyle>): string | null => {
      if (!canvas) return null;

      const id = crypto.randomUUID();
      const mergedStyle = { ...DEFAULT_SHAPE_STYLE, ...style };
      let shape: fabric.Object;

      const baseProps = {
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        originX: "center" as const,
        originY: "center" as const,
        fill: mergedStyle.fill,
        stroke: mergedStyle.stroke,
        strokeWidth: mergedStyle.strokeWidth,
        opacity: mergedStyle.opacity,
        data: {
          id,
          name: `${SHAPE_CONFIGS[type].name} ${Date.now()}`,
          type: "shape",
          shapeType: type,
        },
      };

      switch (type) {
        case "rect":
          shape = new fabric.Rect({
            ...baseProps,
            width: 100,
            height: 100,
            rx: mergedStyle.rx || 0,
            ry: mergedStyle.ry || 0,
          });
          break;
        case "circle":
          shape = new fabric.Circle({
            ...baseProps,
            radius: 50,
          });
          break;
        case "triangle":
          shape = new fabric.Triangle({
            ...baseProps,
            width: 100,
            height: 100,
          });
          break;
        case "line":
          shape = new fabric.Line([0, 0, 100, 0], {
            ...baseProps,
            fill: undefined,
          });
          break;
        default:
          return null;
      }

      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.requestRenderAll();

      onElementAdded?.(id);
      return id;
    },
    [canvas, onElementAdded],
  );

  const updateShapeStyle = useCallback(
    (id: string, style: Partial<ShapeStyle>) => {
      if (!canvas) return;

      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (!obj) return;

      const updateProps: Partial<fabric.Object> = {};

      if (style.fill !== undefined) updateProps.fill = style.fill;
      if (style.stroke !== undefined) updateProps.stroke = style.stroke;
      if (style.strokeWidth !== undefined)
        updateProps.strokeWidth = style.strokeWidth;
      if (style.opacity !== undefined) updateProps.opacity = style.opacity;

      if (
        obj instanceof fabric.Rect &&
        (style.rx !== undefined || style.ry !== undefined)
      ) {
        if (style.rx !== undefined) (obj as fabric.Rect).set("rx", style.rx);
        if (style.ry !== undefined) (obj as fabric.Rect).set("ry", style.ry);
      }

      obj.set(updateProps);
      canvas.requestRenderAll();
    },
    [canvas],
  );

  const getShapeStyle = useCallback(
    (id: string): ShapeStyle | null => {
      if (!canvas) return null;

      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (!obj) return null;

      const style: ShapeStyle = {
        fill: (obj.fill as string) || DEFAULT_SHAPE_STYLE.fill,
        stroke: (obj.stroke as string) || DEFAULT_SHAPE_STYLE.stroke,
        strokeWidth: obj.strokeWidth ?? DEFAULT_SHAPE_STYLE.strokeWidth,
        opacity: obj.opacity ?? DEFAULT_SHAPE_STYLE.opacity,
      };

      if (obj instanceof fabric.Rect) {
        style.rx = (obj as fabric.Rect).rx;
        style.ry = (obj as fabric.Rect).ry;
      }

      return style;
    },
    [canvas],
  );

  return { addShape, updateShapeStyle, getShapeStyle };
}
