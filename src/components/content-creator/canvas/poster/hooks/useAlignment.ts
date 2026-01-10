/**
 * @file 对齐辅助 Hook
 * @description 提供对齐辅助线和网格吸附功能
 * @module components/content-creator/canvas/poster/hooks/useAlignment
 */

import { useCallback, useRef, useState } from "react";
import type { fabric } from "fabric";
import {
  alignmentUtils,
  DEFAULT_ALIGNMENT_CONFIG,
  type AlignmentConfig,
  type AlignmentLine,
  type AlignDirection,
  type ElementBounds,
} from "../utils/alignmentGuides";

/**
 * useAlignment Hook 选项
 */
export interface UseAlignmentOptions {
  /** Fabric.js 画布实例 */
  canvas: fabric.Canvas | null;
  /** 画布宽度 */
  canvasWidth: number;
  /** 画布高度 */
  canvasHeight: number;
  /** 对齐配置 */
  config?: Partial<AlignmentConfig>;
}

/**
 * useAlignment Hook 返回值
 */
export interface UseAlignmentReturn {
  /** 当前显示的对齐线 */
  activeLines: AlignmentLine[];
  /** 是否启用网格吸附 */
  gridSnapEnabled: boolean;
  /** 网格大小 */
  gridSize: number;
  /** 设置网格大小 */
  setGridSize: (size: number) => void;
  /** 切换网格吸附 */
  toggleGridSnap: () => void;
  /** 对齐选中元素 */
  alignSelectedElements: (direction: AlignDirection) => void;
  /** 启用对齐辅助（在元素移动时调用） */
  enableAlignmentGuides: () => void;
  /** 禁用对齐辅助 */
  disableAlignmentGuides: () => void;
  /** 清除对齐线 */
  clearAlignmentLines: () => void;
}

/**
 * 对齐辅助 Hook
 *
 * 提供以下功能：
 * - 对齐辅助线显示
 * - 画布中心对齐
 * - 元素边缘对齐
 * - 网格吸附
 * - 对齐按钮操作
 *
 * @param options - Hook 选项
 * @returns 对齐辅助功能
 */
export function useAlignment(options: UseAlignmentOptions): UseAlignmentReturn {
  const { canvas, canvasWidth, canvasHeight, config: userConfig } = options;

  const [activeLines, setActiveLines] = useState<AlignmentLine[]>([]);
  const [gridSize, setGridSize] = useState(userConfig?.gridSize ?? 0);
  const [gridSnapEnabled, setGridSnapEnabled] = useState(gridSize > 0);

  const configRef = useRef<AlignmentConfig>({
    ...DEFAULT_ALIGNMENT_CONFIG,
    ...userConfig,
    gridSize,
  });

  // 存储对齐线的 Fabric 对象引用
  const alignmentLinesRef = useRef<fabric.Line[]>([]);

  /**
   * 更新配置
   */
  const updateConfig = useCallback((updates: Partial<AlignmentConfig>) => {
    configRef.current = { ...configRef.current, ...updates };
  }, []);

  /**
   * 设置网格大小
   */
  const handleSetGridSize = useCallback(
    (size: number) => {
      setGridSize(size);
      setGridSnapEnabled(size > 0);
      updateConfig({ gridSize: size });
    },
    [updateConfig],
  );

  /**
   * 切换网格吸附
   */
  const toggleGridSnap = useCallback(() => {
    if (gridSnapEnabled) {
      handleSetGridSize(0);
    } else {
      handleSetGridSize(20); // 默认网格大小
    }
  }, [gridSnapEnabled, handleSetGridSize]);

  /**
   * 清除画布上的对齐线
   */
  const clearAlignmentLines = useCallback(() => {
    if (!canvas) return;

    for (const line of alignmentLinesRef.current) {
      canvas.remove(line);
    }
    alignmentLinesRef.current = [];
    setActiveLines([]);
  }, [canvas]);

  /**
   * 绘制对齐线
   */
  const drawAlignmentLines = useCallback(
    (lines: AlignmentLine[]) => {
      if (!canvas) return;

      // 先清除旧的对齐线
      clearAlignmentLines();

      // 绘制新的对齐线
      for (const line of lines) {
        const fabricLine = new (window as any).fabric.Line(
          line.type === "vertical"
            ? [line.position, 0, line.position, canvasHeight]
            : [0, line.position, canvasWidth, line.position],
          {
            stroke: line.source === "canvas-center" ? "#ff6b6b" : "#4dabf7",
            strokeWidth: 1,
            strokeDashArray:
              line.source === "canvas-center" ? [5, 5] : undefined,
            selectable: false,
            evented: false,
            excludeFromExport: true,
          },
        );
        canvas.add(fabricLine);
        alignmentLinesRef.current.push(fabricLine);
      }

      setActiveLines(lines);
      canvas.requestRenderAll();
    },
    [canvas, canvasWidth, canvasHeight, clearAlignmentLines],
  );

  /**
   * 获取所有非移动元素的边界
   */
  const getOtherElementsBounds = useCallback(
    (movingObject: fabric.Object): ElementBounds[] => {
      if (!canvas) return [];

      const bounds: ElementBounds[] = [];
      const objects = canvas.getObjects();

      for (const obj of objects) {
        // 跳过移动中的对象和对齐线
        if (obj === movingObject || (obj as any).excludeFromExport) continue;

        bounds.push(alignmentUtils.getElementBounds(obj));
      }

      return bounds;
    },
    [canvas],
  );

  /**
   * 处理元素移动
   */
  const handleObjectMoving = useCallback(
    (e: fabric.IEvent) => {
      if (!canvas || !e.target) return;

      const movingObject = e.target;
      const movingBounds = alignmentUtils.getElementBounds(movingObject);
      const config = configRef.current;

      // 收集所有对齐线
      const allLines: AlignmentLine[] = [];

      // 画布中心对齐线
      if (config.enableCanvasCenter) {
        allLines.push(
          ...alignmentUtils.getCanvasCenterLines(canvasWidth, canvasHeight),
        );
      }

      // 其他元素的对齐线
      if (config.enableElementEdge || config.enableElementCenter) {
        const otherBounds = getOtherElementsBounds(movingObject);
        for (const bounds of otherBounds) {
          allLines.push(
            ...alignmentUtils.getElementAlignmentLines(
              bounds,
              config.enableElementCenter,
            ),
          );
        }
      }

      // 计算吸附
      const result = alignmentUtils.calculateSnap(
        movingBounds,
        allLines,
        config,
      );

      // 应用吸附
      if (result.snapped) {
        movingObject.set({
          left: result.x - (movingBounds.centerX - movingBounds.left),
          top: result.y - (movingBounds.centerY - movingBounds.top),
        });
      }

      // 绘制对齐线
      drawAlignmentLines(result.lines);
    },
    [
      canvas,
      canvasWidth,
      canvasHeight,
      getOtherElementsBounds,
      drawAlignmentLines,
    ],
  );

  /**
   * 处理元素移动结束
   */
  const handleObjectModified = useCallback(() => {
    clearAlignmentLines();
  }, [clearAlignmentLines]);

  /**
   * 启用对齐辅助
   */
  const enableAlignmentGuides = useCallback(() => {
    if (!canvas) return;

    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:modified", handleObjectModified);
  }, [canvas, handleObjectMoving, handleObjectModified]);

  /**
   * 禁用对齐辅助
   */
  const disableAlignmentGuides = useCallback(() => {
    if (!canvas) return;

    canvas.off("object:moving", handleObjectMoving);
    canvas.off("object:modified", handleObjectModified);
    clearAlignmentLines();
  }, [canvas, handleObjectMoving, handleObjectModified, clearAlignmentLines]);

  /**
   * 对齐选中元素
   */
  const alignSelectedElements = useCallback(
    (direction: AlignDirection) => {
      if (!canvas) return;

      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 0) return;

      // 获取所有选中元素的边界
      const elementBounds: ElementBounds[] = activeObjects.map((obj) =>
        alignmentUtils.getElementBounds(obj),
      );

      // 计算新位置
      const newPositions = alignmentUtils.alignElements(
        elementBounds,
        direction,
        canvasWidth,
        canvasHeight,
      );

      // 应用新位置
      for (const obj of activeObjects) {
        const bounds = alignmentUtils.getElementBounds(obj);
        const newPos = newPositions.get(bounds.id);
        if (newPos) {
          obj.set({
            left: newPos.x - (bounds.centerX - bounds.left),
            top: newPos.y - (bounds.centerY - bounds.top),
          });
          obj.setCoords();
        }
      }

      canvas.requestRenderAll();
    },
    [canvas, canvasWidth, canvasHeight],
  );

  return {
    activeLines,
    gridSnapEnabled,
    gridSize,
    setGridSize: handleSetGridSize,
    toggleGridSnap,
    alignSelectedElements,
    enableAlignmentGuides,
    disableAlignmentGuides,
    clearAlignmentLines,
  };
}
