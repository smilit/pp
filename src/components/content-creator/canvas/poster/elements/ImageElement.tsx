/**
 * @file 图片元素组件
 * @description 提供图片元素的添加、编辑和滤镜功能
 * @module components/content-creator/canvas/poster/elements/ImageElement
 */

import { useCallback } from "react";
import { fabric } from "fabric";

/**
 * 图片滤镜类型
 */
export type ImageFilterType = "grayscale" | "blur" | "brightness" | "contrast";

/**
 * 图片样式配置
 */
export interface ImageStyle {
  opacity: number;
  filters: ImageFilterType[];
  blurValue?: number;
  brightnessValue?: number;
  contrastValue?: number;
}

/**
 * 默认图片样式
 */
export const DEFAULT_IMAGE_STYLE: ImageStyle = {
  opacity: 1,
  filters: [],
};

/**
 * 支持的图片格式
 */
export const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/**
 * useImageElement Hook 配置
 */
export interface UseImageElementOptions {
  canvas: fabric.Canvas | null;
  onElementAdded?: (id: string) => void;
}

/**
 * useImageElement Hook 返回值
 */
export interface UseImageElementReturn {
  addImage: (url: string) => Promise<string | null>;
  addImageFromFile: (file: File) => Promise<string | null>;
  updateImageStyle: (id: string, style: Partial<ImageStyle>) => void;
  applyFilter: (
    id: string,
    filterType: ImageFilterType,
    value?: number,
  ) => void;
  removeFilter: (id: string, filterType: ImageFilterType) => void;
  getImageStyle: (id: string) => ImageStyle | null;
}

/**
 * 图片元素 Hook
 */
export function useImageElement(
  options: UseImageElementOptions,
): UseImageElementReturn {
  const { canvas, onElementAdded } = options;

  const addImage = useCallback(
    async (url: string): Promise<string | null> => {
      if (!canvas) return null;

      return new Promise((resolve) => {
        const id = crypto.randomUUID();

        fabric.Image.fromURL(
          url,
          (img) => {
            if (!img) {
              resolve(null);
              return;
            }

            const scale = Math.min(
              (canvas.width! * 0.8) / img.width!,
              (canvas.height! * 0.8) / img.height!,
              1,
            );

            img.set({
              left: canvas.width! / 2,
              top: canvas.height! / 2,
              originX: "center",
              originY: "center",
              scaleX: scale,
              scaleY: scale,
              data: { id, name: `图片 ${Date.now()}`, type: "image" },
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.requestRenderAll();

            onElementAdded?.(id);
            resolve(id);
          },
          { crossOrigin: "anonymous" },
        );
      });
    },
    [canvas, onElementAdded],
  );

  const addImageFromFile = useCallback(
    async (file: File): Promise<string | null> => {
      if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
        console.warn("不支持的图片格式:", file.type);
        return null;
      }

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const url = e.target?.result as string;
          const id = await addImage(url);
          resolve(id);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    },
    [addImage],
  );

  const updateImageStyle = useCallback(
    (id: string, style: Partial<ImageStyle>) => {
      if (!canvas) return;

      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (!obj || !(obj instanceof fabric.Image)) return;

      if (style.opacity !== undefined) {
        obj.set("opacity", style.opacity);
      }

      canvas.requestRenderAll();
    },
    [canvas],
  );

  const applyFilter = useCallback(
    (id: string, filterType: ImageFilterType, value?: number) => {
      if (!canvas) return;

      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (!obj || !(obj instanceof fabric.Image)) return;

      const filters = obj.filters || [];
      let filter: fabric.IBaseFilter | null = null;

      switch (filterType) {
        case "grayscale":
          filter = new fabric.Image.filters.Grayscale();
          break;
        case "blur":
          filter = new fabric.Image.filters.Blur({ blur: value || 0.5 });
          break;
        case "brightness":
          filter = new fabric.Image.filters.Brightness({
            brightness: value || 0,
          });
          break;
        case "contrast":
          filter = new fabric.Image.filters.Contrast({ contrast: value || 0 });
          break;
      }

      if (filter) {
        const existingIndex = filters.findIndex(
          (f) => (f as { type?: string }).type?.toLowerCase() === filterType,
        );
        if (existingIndex >= 0) {
          filters[existingIndex] = filter;
        } else {
          filters.push(filter);
        }
        obj.filters = filters;
        obj.applyFilters();
        canvas.requestRenderAll();
      }
    },
    [canvas],
  );

  const removeFilter = useCallback(
    (id: string, filterType: ImageFilterType) => {
      if (!canvas) return;

      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (!obj || !(obj instanceof fabric.Image)) return;

      const filters = obj.filters || [];
      obj.filters = filters.filter(
        (f) => (f as { type?: string }).type?.toLowerCase() !== filterType,
      );
      obj.applyFilters();
      canvas.requestRenderAll();
    },
    [canvas],
  );

  const getImageStyle = useCallback(
    (id: string): ImageStyle | null => {
      if (!canvas) return null;

      const obj = canvas.getObjects().find((o) => o.data?.id === id);
      if (!obj || !(obj instanceof fabric.Image)) return null;

      const filters = (obj.filters || [])
        .map(
          (f) =>
            (f as { type?: string }).type?.toLowerCase() as ImageFilterType,
        )
        .filter(Boolean);

      return {
        opacity: obj.opacity || 1,
        filters,
      };
    },
    [canvas],
  );

  return {
    addImage,
    addImageFromFile,
    updateImageStyle,
    applyFilter,
    removeFilter,
    getImageStyle,
  };
}
