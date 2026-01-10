/**
 * @file 页面操作 Hook
 * @description 提供多页海报的页面管理功能，包括添加、删除、复制、排序页面
 * @module components/content-creator/canvas/poster/hooks/usePageOperations
 */

import { useCallback } from "react";
import type { PosterPage } from "../types";
import { createInitialPage } from "../types";

/**
 * 页面操作 Hook 选项
 */
export interface UsePageOperationsOptions {
  /** 页面列表 */
  pages: PosterPage[];
  /** 当前页面索引 */
  currentPageIndex: number;
  /** 页面变更回调 */
  onPagesChange: (pages: PosterPage[], currentIndex: number) => void;
}

/**
 * 页面操作 Hook 返回值
 */
export interface UsePageOperationsReturn {
  /** 当前页面 */
  currentPage: PosterPage | undefined;
  /** 添加新页面 */
  addPage: () => void;
  /** 删除页面 */
  deletePage: (index: number) => void;
  /** 复制页面 */
  duplicatePage: (index: number) => void;
  /** 切换页面 */
  selectPage: (index: number) => void;
  /** 重排序页面 */
  reorderPages: (fromIndex: number, toIndex: number) => void;
}

/**
 * 页面操作工具函数（纯函数，用于测试）
 */
export const pageUtils = {
  /**
   * 添加新页面
   * @param pages - 当前页面列表
   * @param currentIndex - 当前页面索引
   * @returns 新的页面列表和当前索引
   */
  addPage(
    pages: PosterPage[],
    currentIndex: number,
  ): { pages: PosterPage[]; currentIndex: number } {
    // 获取当前页面的尺寸作为新页面的默认尺寸
    const currentPage = pages[currentIndex];
    const width = currentPage?.width || 1080;
    const height = currentPage?.height || 1080;

    // 创建新页面，名称为 "第 N 页"
    const newPage = createInitialPage(
      width,
      height,
      `第 ${pages.length + 1} 页`,
    );

    // 在当前页面后面插入新页面
    const newPages = [
      ...pages.slice(0, currentIndex + 1),
      newPage,
      ...pages.slice(currentIndex + 1),
    ];

    // 切换到新页面
    return {
      pages: newPages,
      currentIndex: currentIndex + 1,
    };
  },

  /**
   * 删除页面
   * @param pages - 当前页面列表
   * @param currentIndex - 当前页面索引
   * @param deleteIndex - 要删除的页面索引
   * @returns 新的页面列表和当前索引，如果只有一页则返回 null
   */
  deletePage(
    pages: PosterPage[],
    currentIndex: number,
    deleteIndex: number,
  ): { pages: PosterPage[]; currentIndex: number } | null {
    // 至少保留一页
    if (pages.length <= 1) {
      return null;
    }

    // 索引越界检查
    if (deleteIndex < 0 || deleteIndex >= pages.length) {
      return null;
    }

    // 删除页面
    const newPages = pages.filter((_, i) => i !== deleteIndex);

    // 计算新的当前索引
    let newCurrentIndex = currentIndex;
    if (deleteIndex < currentIndex) {
      // 删除的页面在当前页面之前，索引减 1
      newCurrentIndex = currentIndex - 1;
    } else if (deleteIndex === currentIndex) {
      // 删除的是当前页面，切换到相邻页面
      newCurrentIndex = Math.min(currentIndex, newPages.length - 1);
    }
    // 如果删除的页面在当前页面之后，索引不变

    return {
      pages: newPages,
      currentIndex: newCurrentIndex,
    };
  },

  /**
   * 复制页面
   * @param pages - 当前页面列表
   * @param currentIndex - 当前页面索引
   * @param copyIndex - 要复制的页面索引
   * @returns 新的页面列表和当前索引
   */
  duplicatePage(
    pages: PosterPage[],
    currentIndex: number,
    copyIndex: number,
  ): { pages: PosterPage[]; currentIndex: number } | null {
    // 索引越界检查
    if (copyIndex < 0 || copyIndex >= pages.length) {
      return null;
    }

    const sourcePage = pages[copyIndex];

    // 创建副本，生成新的 ID 和名称
    const duplicatedPage: PosterPage = {
      ...sourcePage,
      id: crypto.randomUUID(),
      name: `${sourcePage.name} 副本`,
      // 深拷贝 layers
      layers: sourcePage.layers.map((layer) => ({
        ...layer,
        id: crypto.randomUUID(),
      })),
    };

    // 在源页面后面插入副本
    const newPages = [
      ...pages.slice(0, copyIndex + 1),
      duplicatedPage,
      ...pages.slice(copyIndex + 1),
    ];

    // 计算新的当前索引
    let newCurrentIndex = currentIndex;
    if (copyIndex < currentIndex) {
      // 复制的页面在当前页面之前，索引加 1
      newCurrentIndex = currentIndex + 1;
    } else if (copyIndex === currentIndex) {
      // 复制的是当前页面，切换到副本
      newCurrentIndex = copyIndex + 1;
    }
    // 如果复制的页面在当前页面之后，索引不变

    return {
      pages: newPages,
      currentIndex: newCurrentIndex,
    };
  },

  /**
   * 切换页面
   * @param pages - 当前页面列表
   * @param targetIndex - 目标页面索引
   * @returns 新的当前索引，如果索引无效则返回 null
   */
  selectPage(pages: PosterPage[], targetIndex: number): number | null {
    if (targetIndex < 0 || targetIndex >= pages.length) {
      return null;
    }
    return targetIndex;
  },

  /**
   * 重排序页面
   * @param pages - 当前页面列表
   * @param currentIndex - 当前页面索引
   * @param fromIndex - 源索引
   * @param toIndex - 目标索引
   * @returns 新的页面列表和当前索引
   */
  reorderPages(
    pages: PosterPage[],
    currentIndex: number,
    fromIndex: number,
    toIndex: number,
  ): { pages: PosterPage[]; currentIndex: number } | null {
    // 索引越界检查
    if (
      fromIndex < 0 ||
      fromIndex >= pages.length ||
      toIndex < 0 ||
      toIndex >= pages.length
    ) {
      return null;
    }

    // 相同位置不需要移动
    if (fromIndex === toIndex) {
      return { pages, currentIndex };
    }

    // 创建新数组并移动元素
    const newPages = [...pages];
    const [movedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedPage);

    // 计算新的当前索引
    let newCurrentIndex = currentIndex;
    if (currentIndex === fromIndex) {
      // 移动的是当前页面，跟随移动
      newCurrentIndex = toIndex;
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      // 从当前页面之前移动到当前页面之后，索引减 1
      newCurrentIndex = currentIndex - 1;
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      // 从当前页面之后移动到当前页面之前，索引加 1
      newCurrentIndex = currentIndex + 1;
    }

    return {
      pages: newPages,
      currentIndex: newCurrentIndex,
    };
  },
};

/**
 * 页面操作 Hook
 *
 * 提供多页海报的页面管理功能。
 *
 * @param options - Hook 选项
 * @returns 页面操作方法
 */
export function usePageOperations(
  options: UsePageOperationsOptions,
): UsePageOperationsReturn {
  const { pages, currentPageIndex, onPagesChange } = options;

  const currentPage = pages[currentPageIndex];

  /**
   * 添加新页面
   */
  const addPage = useCallback(() => {
    const result = pageUtils.addPage(pages, currentPageIndex);
    onPagesChange(result.pages, result.currentIndex);
  }, [pages, currentPageIndex, onPagesChange]);

  /**
   * 删除页面
   */
  const deletePage = useCallback(
    (index: number) => {
      const result = pageUtils.deletePage(pages, currentPageIndex, index);
      if (result) {
        onPagesChange(result.pages, result.currentIndex);
      }
    },
    [pages, currentPageIndex, onPagesChange],
  );

  /**
   * 复制页面
   */
  const duplicatePage = useCallback(
    (index: number) => {
      const result = pageUtils.duplicatePage(pages, currentPageIndex, index);
      if (result) {
        onPagesChange(result.pages, result.currentIndex);
      }
    },
    [pages, currentPageIndex, onPagesChange],
  );

  /**
   * 切换页面
   */
  const selectPage = useCallback(
    (index: number) => {
      const newIndex = pageUtils.selectPage(pages, index);
      if (newIndex !== null) {
        onPagesChange(pages, newIndex);
      }
    },
    [pages, onPagesChange],
  );

  /**
   * 重排序页面
   */
  const reorderPages = useCallback(
    (fromIndex: number, toIndex: number) => {
      const result = pageUtils.reorderPages(
        pages,
        currentPageIndex,
        fromIndex,
        toIndex,
      );
      if (result) {
        onPagesChange(result.pages, result.currentIndex);
      }
    },
    [pages, currentPageIndex, onPagesChange],
  );

  return {
    currentPage,
    addPage,
    deletePage,
    duplicatePage,
    selectPage,
    reorderPages,
  };
}
