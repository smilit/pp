/**
 * @file 图层操作工具函数
 * @description 提供图层操作的纯函数，用于测试和逻辑复用
 * @module components/content-creator/canvas/poster/utils/layerUtils
 */

import type { Layer } from "../types";

/**
 * 图层操作工具函数（纯函数，用于测试）
 */
export const layerUtils = {
  /**
   * 计算重排序后的图层列表
   * @param layers 原始图层列表
   * @param fromIndex 源索引
   * @param toIndex 目标索引
   * @returns 重排序后的图层列表
   */
  reorderLayers: <T>(layers: T[], fromIndex: number, toIndex: number): T[] => {
    if (fromIndex === toIndex) return layers;
    if (fromIndex < 0 || fromIndex >= layers.length) return layers;
    if (toIndex < 0 || toIndex >= layers.length) return layers;

    const result = [...layers];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  },

  /**
   * 切换图层可见性
   * @param layer 图层对象
   * @returns 更新后的图层对象
   */
  toggleVisibility: (layer: Layer): Layer => {
    return { ...layer, visible: !layer.visible };
  },

  /**
   * 切换图层锁定状态
   * @param layer 图层对象
   * @returns 更新后的图层对象
   */
  toggleLock: (layer: Layer): Layer => {
    return { ...layer, locked: !layer.locked };
  },

  /**
   * 重命名图层
   * @param layer 图层对象
   * @param newName 新名称
   * @returns 更新后的图层对象
   */
  renameLayer: (layer: Layer, newName: string): Layer => {
    return { ...layer, name: newName };
  },

  /**
   * 验证图层是否可选中
   * @param layer 图层对象
   * @returns 是否可选中
   */
  isSelectable: (layer: Layer): boolean => {
    return !layer.locked;
  },

  /**
   * 验证图层是否可见
   * @param layer 图层对象
   * @returns 是否可见
   */
  isVisible: (layer: Layer): boolean => {
    return layer.visible;
  },

  /**
   * 查找图层索引
   * @param layers 图层列表
   * @param id 图层 ID
   * @returns 图层索引，未找到返回 -1
   */
  findLayerIndex: (layers: Layer[], id: string): number => {
    return layers.findIndex((layer) => layer.id === id);
  },

  /**
   * 根据 ID 查找图层
   * @param layers 图层列表
   * @param id 图层 ID
   * @returns 图层对象或 undefined
   */
  findLayerById: (layers: Layer[], id: string): Layer | undefined => {
    return layers.find((layer) => layer.id === id);
  },

  /**
   * 更新图层列表中的指定图层
   * @param layers 图层列表
   * @param id 图层 ID
   * @param updates 更新内容
   * @returns 更新后的图层列表
   */
  updateLayer: (
    layers: Layer[],
    id: string,
    updates: Partial<Layer>,
  ): Layer[] => {
    return layers.map((layer) =>
      layer.id === id ? { ...layer, ...updates } : layer,
    );
  },

  /**
   * 验证图层列表与画布元素数量是否一致
   * @param layerCount 图层数量
   * @param elementCount 画布元素数量
   * @returns 是否一致
   */
  isLayerCountSynced: (layerCount: number, elementCount: number): boolean => {
    return layerCount === elementCount;
  },

  /**
   * 验证锁定图层对应的元素是否不可选中
   * @param layer 图层对象
   * @param elementSelectable 元素是否可选中
   * @returns 状态是否同步
   */
  isLockStateSynced: (layer: Layer, elementSelectable: boolean): boolean => {
    // 锁定的图层对应的元素应该不可选中
    return layer.locked === !elementSelectable;
  },

  /**
   * 验证隐藏图层对应的元素是否不可见
   * @param layer 图层对象
   * @param elementVisible 元素是否可见
   * @returns 状态是否同步
   */
  isVisibilityStateSynced: (layer: Layer, elementVisible: boolean): boolean => {
    return layer.visible === elementVisible;
  },
};
