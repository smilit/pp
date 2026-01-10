/**
 * @file 导出功能 Hook
 * @description 提供海报画布的图片导出功能，支持 PNG/JPG 格式、多倍率和批量导出
 * @module components/content-creator/canvas/poster/hooks/useExport
 */

import { useCallback, useState } from "react";
import type { fabric } from "fabric";
import type { ExportConfig, ExportFormat, PosterPage } from "../types";

/**
 * 导出结果
 */
export interface ExportResult {
  /** 页面索引 */
  pageIndex: number;
  /** 页面名称 */
  pageName: string;
  /** 导出的 Data URL */
  dataUrl: string;
  /** 文件名 */
  fileName: string;
  /** 导出格式 */
  format: ExportFormat;
  /** 图片宽度 */
  width: number;
  /** 图片高度 */
  height: number;
}

/**
 * useExport Hook 返回值类型
 */
export interface UseExportReturn {
  /** 是否正在导出 */
  isExporting: boolean;
  /** 导出进度（0-100） */
  progress: number;
  /** 导出错误信息 */
  error: string | null;
  /** 导出单页 */
  exportPage: (
    canvas: fabric.Canvas,
    page: PosterPage,
    config: Omit<ExportConfig, "pageIndices">,
  ) => ExportResult | null;
  /** 导出多页 */
  exportPages: (
    canvas: fabric.Canvas,
    pages: PosterPage[],
    config: ExportConfig,
    loadPageToCanvas: (pageIndex: number) => Promise<void>,
  ) => Promise<ExportResult[]>;
  /** 下载导出结果 */
  downloadResult: (result: ExportResult) => void;
  /** 批量下载导出结果 */
  downloadResults: (results: ExportResult[]) => void;
  /** 清除错误 */
  clearError: () => void;
}

/**
 * useExport Hook 配置
 */
export interface UseExportOptions {
  /** 默认导出格式 */
  defaultFormat?: ExportFormat;
  /** 默认导出质量 */
  defaultQuality?: number;
  /** 默认导出倍率 */
  defaultScale?: 1 | 2 | 3;
}

/**
 * 导出功能 Hook
 *
 * 提供海报画布的图片导出功能。
 *
 * @param options - 配置选项
 * @returns 导出操作方法和状态
 *
 * @example
 * ```tsx
 * const { exportPage, downloadResult, isExporting } = useExport();
 *
 * const handleExport = () => {
 *   const result = exportPage(canvas, currentPage, { format: 'png', quality: 100, scale: 2 });
 *   if (result) {
 *     downloadResult(result);
 *   }
 * };
 * ```
 */
export function useExport(options: UseExportOptions = {}): UseExportReturn {
  const {
    defaultFormat: _defaultFormat = "png",
    defaultQuality: _defaultQuality = 100,
    defaultScale: _defaultScale = 1,
  } = options;

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 导出单页
   */
  const exportPage = useCallback(
    (
      canvas: fabric.Canvas,
      page: PosterPage,
      config: Omit<ExportConfig, "pageIndices">,
    ): ExportResult | null => {
      if (!canvas) {
        setError("画布未初始化");
        return null;
      }

      try {
        const { format, quality, scale } = config;

        // 计算导出尺寸
        const exportWidth = page.width * scale;
        const exportHeight = page.height * scale;

        // 生成 Data URL
        const dataUrl = canvas.toDataURL({
          format: format === "jpg" ? "jpeg" : "png",
          quality: format === "jpg" ? quality / 100 : 1,
          multiplier: scale,
        });

        // 生成文件名
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, 19);
        const fileName = `${page.name}_${timestamp}.${format}`;

        return {
          pageIndex: 0,
          pageName: page.name,
          dataUrl,
          fileName,
          format,
          width: exportWidth,
          height: exportHeight,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "导出失败";
        setError(message);
        return null;
      }
    },
    [],
  );

  /**
   * 导出多页
   */
  const exportPages = useCallback(
    async (
      canvas: fabric.Canvas,
      pages: PosterPage[],
      config: ExportConfig,
      loadPageToCanvas: (pageIndex: number) => Promise<void>,
    ): Promise<ExportResult[]> => {
      if (!canvas) {
        setError("画布未初始化");
        return [];
      }

      const { pageIndices, format, quality, scale } = config;
      const results: ExportResult[] = [];

      setIsExporting(true);
      setProgress(0);
      setError(null);

      try {
        for (let i = 0; i < pageIndices.length; i++) {
          const pageIndex = pageIndices[i];

          // 验证页面索引
          if (pageIndex < 0 || pageIndex >= pages.length) {
            continue;
          }

          const page = pages[pageIndex];

          // 加载页面到画布
          await loadPageToCanvas(pageIndex);

          // 等待画布渲染完成
          await new Promise((resolve) => setTimeout(resolve, 100));

          // 导出当前页面
          const result = exportPage(canvas, page, { format, quality, scale });

          if (result) {
            results.push({
              ...result,
              pageIndex,
            });
          }

          // 更新进度
          setProgress(Math.round(((i + 1) / pageIndices.length) * 100));
        }

        return results;
      } catch (err) {
        const message = err instanceof Error ? err.message : "批量导出失败";
        setError(message);
        return results;
      } finally {
        setIsExporting(false);
      }
    },
    [exportPage],
  );

  /**
   * 下载导出结果
   */
  const downloadResult = useCallback((result: ExportResult) => {
    try {
      const link = document.createElement("a");
      link.href = result.dataUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      const message = err instanceof Error ? err.message : "下载失败";
      setError(message);
    }
  }, []);

  /**
   * 批量下载导出结果
   */
  const downloadResults = useCallback(
    (results: ExportResult[]) => {
      // 逐个下载，间隔 100ms 避免浏览器阻止
      results.forEach((result, index) => {
        setTimeout(() => {
          downloadResult(result);
        }, index * 100);
      });
    },
    [downloadResult],
  );

  return {
    isExporting,
    progress,
    error,
    exportPage,
    exportPages,
    downloadResult,
    downloadResults,
    clearError,
  };
}

/**
 * 导出工具函数（纯函数，用于测试）
 */
export const exportUtils = {
  /**
   * 计算导出尺寸
   */
  calculateExportSize: (
    width: number,
    height: number,
    scale: 1 | 2 | 3,
  ): { width: number; height: number } => {
    return {
      width: width * scale,
      height: height * scale,
    };
  },

  /**
   * 生成文件名
   */
  generateFileName: (
    pageName: string,
    format: ExportFormat,
    timestamp?: Date,
  ): string => {
    const ts = timestamp || new Date();
    const timeStr = ts.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return `${pageName}_${timeStr}.${format}`;
  },

  /**
   * 验证导出配置
   */
  validateConfig: (
    config: ExportConfig,
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // 验证格式
    if (!["png", "jpg"].includes(config.format)) {
      errors.push("无效的导出格式");
    }

    // 验证质量
    if (config.quality < 60 || config.quality > 100) {
      errors.push("质量必须在 60-100 之间");
    }

    // 验证倍率
    if (![1, 2, 3].includes(config.scale)) {
      errors.push("倍率必须是 1、2 或 3");
    }

    // 验证页面索引
    if (config.pageIndices.length === 0) {
      errors.push("至少选择一个页面");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * 验证页面索引
   */
  validatePageIndices: (
    pageIndices: number[],
    totalPages: number,
  ): { valid: boolean; invalidIndices: number[] } => {
    const invalidIndices = pageIndices.filter(
      (index) => index < 0 || index >= totalPages,
    );
    return {
      valid: invalidIndices.length === 0,
      invalidIndices,
    };
  },

  /**
   * 获取 MIME 类型
   */
  getMimeType: (format: ExportFormat): string => {
    return format === "jpg" ? "image/jpeg" : "image/png";
  },

  /**
   * 默认配置
   */
  DEFAULT_CONFIG: {
    format: "png" as ExportFormat,
    quality: 100,
    scale: 1 as 1 | 2 | 3,
    pageIndices: [0],
  },
};
