/**
 * @file Fabric.js 画布 Hook
 * @description 封装 Fabric.js 画布的初始化、缩放、平移等核心功能
 * @module components/content-creator/canvas/poster/hooks/useFabricCanvas
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { fabric } from "fabric";
import { clampZoom, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from "../types";

/**
 * useFabricCanvas Hook 返回值类型
 */
export interface UseFabricCanvasReturn {
  /** Fabric.js Canvas 实例 */
  canvas: fabric.Canvas | null;
  /** 当前缩放值（百分比） */
  zoom: number;
  /** 初始化画布 */
  initCanvas: (
    el: HTMLCanvasElement,
    width: number,
    height: number,
  ) => fabric.Canvas;
  /** 销毁画布 */
  destroyCanvas: () => void;
  /** 设置缩放值 */
  setZoom: (zoom: number) => void;
  /** 放大 */
  zoomIn: () => void;
  /** 缩小 */
  zoomOut: () => void;
  /** 重置缩放 */
  resetZoom: () => void;
  /** 适应画布 */
  fitToView: (containerWidth: number, containerHeight: number) => void;
  /** 启用/禁用平移模式 */
  setPanMode: (enabled: boolean) => void;
  /** 是否处于平移模式 */
  isPanMode: boolean;
}

/**
 * useFabricCanvas Hook 配置
 */
export interface UseFabricCanvasOptions {
  /** 初始缩放值 */
  initialZoom?: number;
  /** 缩放变更回调 */
  onZoomChange?: (zoom: number) => void;
}

/**
 * Fabric.js 画布 Hook
 *
 * 提供画布初始化、缩放、平移等核心功能。
 *
 * @param options - 配置选项
 * @returns 画布操作方法和状态
 *
 * @example
 * ```tsx
 * const { canvas, initCanvas, zoom, setZoom } = useFabricCanvas({
 *   initialZoom: 100,
 *   onZoomChange: (zoom) => console.log('Zoom:', zoom),
 * });
 * ```
 */
export function useFabricCanvas(
  options: UseFabricCanvasOptions = {},
): UseFabricCanvasReturn {
  const { initialZoom = 100, onZoomChange } = options;

  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [zoom, setZoomState] = useState(clampZoom(initialZoom));
  const [isPanMode, setIsPanMode] = useState(false);

  // 用于平移的状态
  const panStateRef = useRef({
    isPanning: false,
    lastPosX: 0,
    lastPosY: 0,
  });

  // 画布尺寸引用
  const canvasSizeRef = useRef({ width: 0, height: 0 });

  /**
   * 设置缩放值（带范围限制）
   */
  const setZoom = useCallback(
    (newZoom: number) => {
      const clampedZoom = clampZoom(newZoom);
      setZoomState(clampedZoom);
      onZoomChange?.(clampedZoom);

      if (canvas) {
        const zoomFactor = clampedZoom / 100;
        // 以画布中心为缩放原点
        const center = canvas.getCenter();
        canvas.zoomToPoint(
          new fabric.Point(center.left, center.top),
          zoomFactor,
        );
        canvas.requestRenderAll();
      }
    },
    [canvas, onZoomChange],
  );

  /**
   * 放大（增加 ZOOM_STEP）
   */
  const zoomIn = useCallback(() => {
    setZoom(zoom + ZOOM_STEP);
  }, [zoom, setZoom]);

  /**
   * 缩小（减少 ZOOM_STEP）
   */
  const zoomOut = useCallback(() => {
    setZoom(zoom - ZOOM_STEP);
  }, [zoom, setZoom]);

  /**
   * 重置缩放到 100%
   */
  const resetZoom = useCallback(() => {
    setZoom(100);
    if (canvas) {
      // 重置视口变换
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.requestRenderAll();
    }
  }, [canvas, setZoom]);

  /**
   * 适应视图（根据容器大小自动计算缩放）
   */
  const fitToView = useCallback(
    (containerWidth: number, containerHeight: number) => {
      if (!canvas) return;

      const { width, height } = canvasSizeRef.current;
      if (width === 0 || height === 0) return;

      // 计算适应容器的缩放比例（留出边距）
      const padding = 48;
      const availableWidth = containerWidth - padding * 2;
      const availableHeight = containerHeight - padding * 2;

      const scaleX = availableWidth / width;
      const scaleY = availableHeight / height;
      const scale = Math.min(scaleX, scaleY, 2); // 最大不超过 200%

      const newZoom = Math.round(scale * 100);
      setZoom(clampZoom(newZoom));
    },
    [canvas, setZoom],
  );

  /**
   * 设置平移模式
   */
  const setPanMode = useCallback((enabled: boolean) => {
    setIsPanMode(enabled);
  }, []);

  /**
   * 处理滚轮缩放
   */
  const handleWheel = useCallback(
    (opt: fabric.IEvent<Event>) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      // 滚轮向上放大，向下缩小
      const zoomChange = delta > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = clampZoom(zoom + zoomChange);

      if (newZoom !== zoom) {
        setZoomState(newZoom);
        onZoomChange?.(newZoom);

        if (canvas) {
          const zoomFactor = newZoom / 100;
          // 以鼠标位置为缩放原点
          const pointer = canvas.getPointer(e, true);
          canvas.zoomToPoint(
            new fabric.Point(pointer.x, pointer.y),
            zoomFactor,
          );
          canvas.requestRenderAll();
        }
      }
    },
    [canvas, zoom, onZoomChange],
  );

  /**
   * 处理鼠标按下（开始平移）
   */
  const handleMouseDown = useCallback(
    (opt: fabric.IEvent<Event>) => {
      if (!canvas) return;

      const e = opt.e as MouseEvent;
      // 只有在平移模式下或按住空格键时才启用平移
      // 或者点击的是空白区域（没有选中对象）
      const target = canvas.findTarget(e, false);
      const shouldPan = isPanMode || (!target && e.button === 0);

      if (shouldPan) {
        panStateRef.current.isPanning = true;
        panStateRef.current.lastPosX = e.clientX;
        panStateRef.current.lastPosY = e.clientY;
        canvas.selection = false;
        canvas.defaultCursor = "grabbing";
        canvas.setCursor("grabbing");
      }
    },
    [canvas, isPanMode],
  );

  /**
   * 处理鼠标移动（平移中）
   */
  const handleMouseMove = useCallback(
    (opt: fabric.IEvent<Event>) => {
      if (!canvas || !panStateRef.current.isPanning) return;

      const e = opt.e as MouseEvent;
      const vpt = canvas.viewportTransform;
      if (!vpt) return;

      const deltaX = e.clientX - panStateRef.current.lastPosX;
      const deltaY = e.clientY - panStateRef.current.lastPosY;

      vpt[4] += deltaX;
      vpt[5] += deltaY;

      panStateRef.current.lastPosX = e.clientX;
      panStateRef.current.lastPosY = e.clientY;

      canvas.requestRenderAll();
    },
    [canvas],
  );

  /**
   * 处理鼠标释放（结束平移）
   */
  const handleMouseUp = useCallback(() => {
    if (!canvas) return;

    panStateRef.current.isPanning = false;
    canvas.selection = true;
    canvas.defaultCursor = "default";
    canvas.setCursor("default");
  }, [canvas]);

  /**
   * 初始化画布
   */
  const initCanvas = useCallback(
    (el: HTMLCanvasElement, width: number, height: number): fabric.Canvas => {
      // 如果已有画布，先销毁
      if (canvas) {
        canvas.dispose();
      }

      // 保存画布尺寸
      canvasSizeRef.current = { width, height };

      // 创建 Fabric.js Canvas
      const fabricCanvas = new fabric.Canvas(el, {
        width,
        height,
        backgroundColor: "#ffffff",
        selection: true,
        preserveObjectStacking: true,
        stopContextMenu: true,
        fireRightClick: true,
      });

      // 设置初始缩放
      const zoomFactor = zoom / 100;
      fabricCanvas.setZoom(zoomFactor);

      setCanvas(fabricCanvas);
      return fabricCanvas;
    },
    [canvas, zoom],
  );

  /**
   * 销毁画布
   */
  const destroyCanvas = useCallback(() => {
    if (canvas) {
      canvas.dispose();
      setCanvas(null);
    }
  }, [canvas]);

  // 绑定事件监听
  useEffect(() => {
    if (!canvas) return;

    canvas.on("mouse:wheel", handleWheel);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      // 使用类型断言解决 fabric.js 事件类型兼容性问题
      canvas.off(
        "mouse:wheel",
        handleWheel as (e: fabric.IEvent<Event>) => void,
      );
      canvas.off(
        "mouse:down",
        handleMouseDown as (e: fabric.IEvent<Event>) => void,
      );
      canvas.off(
        "mouse:move",
        handleMouseMove as (e: fabric.IEvent<Event>) => void,
      );
      canvas.off(
        "mouse:up",
        handleMouseUp as (e: fabric.IEvent<Event>) => void,
      );
    };
  }, [canvas, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  // 组件卸载时销毁画布
  useEffect(() => {
    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    canvas,
    zoom,
    initCanvas,
    destroyCanvas,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToView,
    setPanMode,
    isPanMode,
  };
}

/**
 * 缩放工具函数（纯函数，用于测试）
 */
export const zoomUtils = {
  /**
   * 限制缩放值在有效范围内
   */
  clampZoom,

  /**
   * 计算缩放后的值
   */
  calculateZoomIn: (currentZoom: number): number => {
    return clampZoom(currentZoom + ZOOM_STEP);
  },

  /**
   * 计算缩小后的值
   */
  calculateZoomOut: (currentZoom: number): number => {
    return clampZoom(currentZoom - ZOOM_STEP);
  },

  /**
   * 验证缩放值是否在有效范围内
   */
  isValidZoom: (zoom: number): boolean => {
    return zoom >= ZOOM_MIN && zoom <= ZOOM_MAX;
  },

  /**
   * 缩放范围常量
   */
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
};
