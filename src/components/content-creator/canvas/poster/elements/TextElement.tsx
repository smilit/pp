/**
 * @file 文字元素组件
 * @description 提供文字元素的添加、编辑和样式设置功能
 * @module components/content-creator/canvas/poster/elements/TextElement
 */

import { useCallback } from "react";
import { fabric } from "fabric";

/**
 * 文字样式配置
 */
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fill: string;
  fontWeight: string | number;
  fontStyle: "" | "normal" | "italic" | "oblique";
  textAlign: string;
  lineHeight: number;
  charSpacing: number;
  stroke?: string;
  strokeWidth?: number;
  shadow?: fabric.Shadow;
}

/**
 * 默认文字样式
 */
export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: "Source Han Sans CN, PingFang SC, Microsoft YaHei, sans-serif",
  fontSize: 32,
  fill: "#333333",
  fontWeight: "normal",
  fontStyle: "normal" as const,
  textAlign: "left",
  lineHeight: 1.2,
  charSpacing: 0,
};

/**
 * 常用中文字体列表
 */
export const CHINESE_FONTS = [
  { name: "思源黑体", value: "Source Han Sans CN, sans-serif" },
  { name: "思源宋体", value: "Source Han Serif CN, serif" },
  { name: "苹方", value: "PingFang SC, sans-serif" },
  { name: "微软雅黑", value: "Microsoft YaHei, sans-serif" },
  { name: "黑体", value: "SimHei, sans-serif" },
  { name: "宋体", value: "SimSun, serif" },
  { name: "楷体", value: "KaiTi, serif" },
];

/**
 * useTextElement Hook 配置
 */
export interface UseTextElementOptions {
  canvas: fabric.Canvas | null;
  onElementAdded?: (id: string) => void;
}

/**
 * useTextElement Hook 返回值
 */
export interface UseTextElementReturn {
  addText: (text?: string, style?: Partial<TextStyle>) => string | null;
  updateTextStyle: (id: string, style: Partial<TextStyle>) => void;
  getTextStyle: (id: string) => TextStyle | null;
}

/**
 * 文字元素 Hook
 */
export function useTextElement(
  options: UseTextElementOptions,
): UseTextElementReturn {
  const { canvas, onElementAdded } = options;

  const addText = useCallback(
    (
      text: string = "双击编辑文字",
      style?: Partial<TextStyle>,
    ): string | null => {
      if (!canvas) return null;

      const id = crypto.randomUUID();
      const mergedStyle = { ...DEFAULT_TEXT_STYLE, ...style };

      const textObj = new fabric.IText(text, {
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        originX: "center",
        originY: "center",
        ...mergedStyle,
        data: { id, name: `文字 ${Date.now()}`, type: "text" },
      });

      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.requestRenderAll();

      onElementAdded?.(id);
      return id;
    },
    [canvas, onElementAdded],
  );

  const updateTextStyle = useCallback(
    (id: string, style: Partial<TextStyle>) => {
      if (!canvas) return;

      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (!obj || !(obj instanceof fabric.IText)) return;

      obj.set(style as Partial<fabric.IText>);
      canvas.requestRenderAll();
    },
    [canvas],
  );

  const getTextStyle = useCallback(
    (id: string): TextStyle | null => {
      if (!canvas) return null;

      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (!obj || !(obj instanceof fabric.IText)) return null;

      return {
        fontFamily: obj.fontFamily || DEFAULT_TEXT_STYLE.fontFamily,
        fontSize: obj.fontSize || DEFAULT_TEXT_STYLE.fontSize,
        fill: (obj.fill as string) || DEFAULT_TEXT_STYLE.fill,
        fontWeight: obj.fontWeight || DEFAULT_TEXT_STYLE.fontWeight,
        fontStyle: (obj.fontStyle || DEFAULT_TEXT_STYLE.fontStyle) as
          | ""
          | "normal"
          | "italic"
          | "oblique",
        textAlign: obj.textAlign || DEFAULT_TEXT_STYLE.textAlign,
        lineHeight: obj.lineHeight || DEFAULT_TEXT_STYLE.lineHeight,
        charSpacing: obj.charSpacing || DEFAULT_TEXT_STYLE.charSpacing,
        stroke: obj.stroke as string | undefined,
        strokeWidth: obj.strokeWidth,
        shadow: obj.shadow as fabric.Shadow | undefined,
      };
    },
    [canvas],
  );

  return { addText, updateTextStyle, getTextStyle };
}
