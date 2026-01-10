/**
 * @file 图层管理 Hook
 * @description 封装图层管理功能，包括重排序、锁定/解锁、显示/隐藏、重命名等
 * @module components/content-creator/canvas/poster/hooks/useLayerManager
 */

import { useCallback } from "react";
import { fabric } from "fabric";
import type { Layer } from "../types";

/**
 * useLayerManager Hook 返回值类型
 */
export interface UseLayerManagerReturn {
  /** 重排序图层 */
  reorderLayer: (fromIndex: number, toIndex: number) => void;
  /** 切换图层可见性 */
  toggleLayerVisibility: (id: string) => void;
  /** 切换图层锁定状态 */
  toggleLayerLock: (id: string) => void;
  /** 重命名图层 */
  renameLayer: (id: string, name: string) => void;
  /** 选中图层对应的元素 */
  selectLayerElement: (id: string) => void;
  /** 根据 ID 获取图层 */
  getLayerById: (id: string) => Layer | undefined;
}

/**
 * useLayerManager Hook 配置
 */
export interface UseLayerManagerOptions {
  /** Fabric.js Canvas 实例 */
  canvas: fabric.Canvas | null;
  /** 图层列表 */
  layers: Layer[];
  /** 同步图层回调 */
  onSyncLayers: () => void;
  /** 选择变更回调 */
  onSelectionChange?: (ids: string[]) => void;
}

/**
 * 图层管理 Hook
 *
 * 提供图层管理功能，包括：
 * - 图层重排序（调整 z-index）
 * - 图层锁定/解锁
 * - 图层显示/隐藏
 * - 图层重命名
 * - 点击图层选中元素
 *
 * @param options - 配置选项
 * @returns 图层管理方法
 */
export function useLayerManager(
  options: UseLayerManagerOptions,
): UseLayerManagerReturn {
  const { canvas, layers, onSyncLayers, onSelectionChange } = options;

  /**
   * 根据 ID 查找 Fabric 对象
   */
  const findObjectById = useCallback(
    (id: string): fabric.Object | undefined => {
      if (!canvas) return undefined;
      return canvas.getObjects().find((obj) => obj.data?.id === id);
    },
    [canvas],
  );

  /**
   * 根据 ID 获取图层
   */
  const getLayerById = useCallback(
    (id: string): Layer | undefined => {
      return layers.find((layer) => layer.id === id);
    },
    [layers],
  );

  /**
   * 重排序图层
   *
   * 图层列表是反向的（最上层在列表顶部），所以需要转换索引
   */
  const reorderLayer = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!canvas) return;
      if (fromIndex === toIndex) return;

      const objects = canvas.getObjects();
      const totalObjects = objects.length;

      // 图层列表是反向的，需要转换为 canvas 对象索引
      // 图层列表索引 0 对应 canvas 对象索引 totalObjects - 1
      const canvasFromIndex = totalObjects - 1 - fromIndex;
      const canvasToIndex = totalObjects - 1 - toIndex;

      if (canvasFromIndex < 0 || canvasFromIndex >= totalObjects) return;
      if (canvasToIndex < 0 || canvasToIndex >= totalObjects) return;

      const obj = objects[canvasFromIndex];
      if (!obj) return;

      // 移动对象到新位置
      if (canvasToIndex > canvasFromIndex) {
        // 向上移动（在 canvas 中是向后移动）
        obj.moveTo(canvasToIndex);
      } else {
        // 向下移动（在 canvas 中是向前移动）
        obj.moveTo(canvasToIndex);
      }

      canvas.requestRenderAll();
      onSyncLayers();
    },
    [canvas, onSyncLayers],
  );

  /**
   * 切换图层可见性
   */
  const toggleLayerVisibility = useCallback(
    (id: string) => {
      if (!canvas) return;

      const obj = findObjectById(id);
      if (!obj) return;

      const newVisible = !obj.visible;
      obj.set("visible", newVisible);

      // 如果隐藏了选中的元素，取消选择
      if (!newVisible && canvas.getActiveObjects().includes(obj)) {
        canvas.discardActiveObject();
      }

      canvas.requestRenderAll();
      onSyncLayers();
    },
    [canvas, findObjectById, onSyncLayers],
  );

  /**
   * 切换图层锁定状态
   */
  const toggleLayerLock = useCallback(
    (id: string) => {
      if (!canvas) return;

      const obj = findObjectById(id);
      if (!obj) return;

      const isCurrentlyLocked =
        obj.selectable === false && obj.evented === false;
      const newLocked = !isCurrentlyLocked;

      obj.set({
        selectable: !newLocked,
        evented: !newLocked,
        hasControls: !newLocked,
        hasBorders: !newLocked,
      });

      // 如果锁定了选中的元素，取消选择
      if (newLocked && canvas.getActiveObjects().includes(obj)) {
        canvas.discardActiveObject();
      }

      canvas.requestRenderAll();
      onSyncLayers();
    },
    [canvas, findObjectById, onSyncLayers],
  );

  /**
   * 重命名图层
   */
  const renameLayer = useCallback(
    (id: string, name: string) => {
      if (!canvas) return;

      const obj = findObjectById(id);
      if (!obj) return;

      obj.set("data", { ...obj.data, name });
      onSyncLayers();
    },
    [canvas, findObjectById, onSyncLayers],
  );

  /**
   * 选中图层对应的元素
   */
  const selectLayerElement = useCallback(
    (id: string) => {
      if (!canvas) return;

      const obj = findObjectById(id);
      if (!obj) return;

      // 检查元素是否可选中
      if (obj.selectable === false) return;

      canvas.setActiveObject(obj);
      canvas.requestRenderAll();

      onSelectionChange?.([id]);
    },
    [canvas, findObjectById, onSelectionChange],
  );

  return {
    reorderLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    renameLayer,
    selectLayerElement,
    getLayerById,
  };
}

/**
 * 图层管理工具函数（纯函数，用于测试）
 */
export const layerManagerUtils = {
  /**
   * 将图层列表索引转换为 canvas 对象索引
   * @param layerIndex 图层列表索引
   * @param totalCount 总元素数量
   * @returns canvas 对象索引
   */
  layerIndexToCanvasIndex: (layerIndex: number, totalCount: number): number => {
    return totalCount - 1 - layerIndex;
  },

  /**
   * 将 canvas 对象索引转换为图层列表索引
   * @param canvasIndex canvas 对象索引
   * @param totalCount 总元素数量
   * @returns 图层列表索引
   */
  canvasIndexToLayerIndex: (
    canvasIndex: number,
    totalCount: number,
  ): number => {
    return totalCount - 1 - canvasIndex;
  },

  /**
   * 验证索引是否有效
   * @param index 索引
   * @param totalCount 总数量
   * @returns 是否有效
   */
  isValidIndex: (index: number, totalCount: number): boolean => {
    return index >= 0 && index < totalCount;
  },

  /**
   * 计算重排序后的 z-index 顺序
   * @param currentOrder 当前顺序
   * @param fromIndex 源索引
   * @param toIndex 目标索引
   * @returns 新顺序
   */
  calculateNewOrder: <T>(
    currentOrder: T[],
    fromIndex: number,
    toIndex: number,
  ): T[] => {
    if (fromIndex === toIndex) return currentOrder;
    if (fromIndex < 0 || fromIndex >= currentOrder.length) return currentOrder;
    if (toIndex < 0 || toIndex >= currentOrder.length) return currentOrder;

    const result = [...currentOrder];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  },
};
