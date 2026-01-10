/**
 * @file 样式工具函数
 * @description 提供元素样式更新的纯函数工具，用于测试和验证
 * @module components/content-creator/canvas/poster/utils/styleUtils
 */

/**
 * 文字样式配置
 */
export interface TextStyle {
  /** 字体 */
  fontFamily?: string;
  /** 字号 */
  fontSize?: number;
  /** 颜色 */
  fill?: string;
  /** 粗体 */
  fontWeight?: "normal" | "bold";
  /** 斜体 */
  fontStyle?: "normal" | "italic";
  /** 下划线 */
  underline?: boolean;
  /** 对齐方式 */
  textAlign?: "left" | "center" | "right";
  /** 行高 */
  lineHeight?: number;
}

/**
 * 形状样式配置
 */
export interface ShapeStyle {
  /** 填充颜色 */
  fill?: string;
  /** 边框颜色 */
  stroke?: string;
  /** 边框宽度 */
  strokeWidth?: number;
  /** 透明度 */
  opacity?: number;
  /** 圆角（仅矩形） */
  rx?: number;
  ry?: number;
}

/**
 * 图片样式配置
 */
export interface ImageStyle {
  /** 透明度 */
  opacity?: number;
  /** 滤镜 */
  filters?: ImageFilter[];
}

/**
 * 图片滤镜类型
 */
export type ImageFilter =
  | { type: "grayscale" }
  | { type: "blur"; value: number }
  | { type: "brightness"; value: number }
  | { type: "contrast"; value: number };

/**
 * 样式工具函数
 */
export const styleUtils = {
  /**
   * 合并文字样式
   */
  mergeTextStyle: (
    current: TextStyle,
    updates: Partial<TextStyle>,
  ): TextStyle => {
    return { ...current, ...updates };
  },

  /**
   * 合并形状样式
   */
  mergeShapeStyle: (
    current: ShapeStyle,
    updates: Partial<ShapeStyle>,
  ): ShapeStyle => {
    return { ...current, ...updates };
  },

  /**
   * 合并图片样式
   */
  mergeImageStyle: (
    current: ImageStyle,
    updates: Partial<ImageStyle>,
  ): ImageStyle => {
    return { ...current, ...updates };
  },

  /**
   * 验证颜色格式
   */
  isValidColor: (color: string): boolean => {
    // 支持 hex、rgb、rgba、hsl、hsla 和命名颜色
    const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
    const namedColors = [
      "black",
      "white",
      "red",
      "green",
      "blue",
      "yellow",
      "cyan",
      "magenta",
      "gray",
      "grey",
      "orange",
      "pink",
      "purple",
      "brown",
      "transparent",
    ];

    // 检查 hex 格式
    if (hexPattern.test(color)) return true;

    // 检查命名颜色
    if (namedColors.includes(color.toLowerCase())) return true;

    // 检查 rgb 格式（验证值范围 0-255）
    const rgbMatch = color.match(
      /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/,
    );
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      return r <= 255 && g <= 255 && b <= 255;
    }

    // 检查 rgba 格式
    const rgbaMatch = color.match(
      /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/,
    );
    if (rgbaMatch) {
      const [, r, g, b, a] = rgbaMatch;
      return (
        Number(r) <= 255 &&
        Number(g) <= 255 &&
        Number(b) <= 255 &&
        Number(a) >= 0 &&
        Number(a) <= 1
      );
    }

    // 检查 hsl 格式
    const hslMatch = color.match(
      /^hsl\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/,
    );
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      return Number(h) <= 360 && Number(s) <= 100 && Number(l) <= 100;
    }

    // 检查 hsla 格式
    const hslaMatch = color.match(
      /^hsla\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*,\s*([\d.]+)\s*\)$/,
    );
    if (hslaMatch) {
      const [, h, s, l, a] = hslaMatch;
      return (
        Number(h) <= 360 &&
        Number(s) <= 100 &&
        Number(l) <= 100 &&
        Number(a) >= 0 &&
        Number(a) <= 1
      );
    }

    return false;
  },

  /**
   * 验证字号范围
   */
  isValidFontSize: (size: number): boolean => {
    return size >= 1 && size <= 1000;
  },

  /**
   * 验证透明度范围
   */
  isValidOpacity: (opacity: number): boolean => {
    return opacity >= 0 && opacity <= 1;
  },

  /**
   * 验证边框宽度
   */
  isValidStrokeWidth: (width: number): boolean => {
    return width >= 0 && width <= 100;
  },

  /**
   * 验证圆角值
   */
  isValidRadius: (radius: number): boolean => {
    return radius >= 0;
  },

  /**
   * 验证行高
   */
  isValidLineHeight: (lineHeight: number): boolean => {
    return lineHeight >= 0.5 && lineHeight <= 5;
  },

  /**
   * 验证模糊值
   */
  isValidBlurValue: (value: number): boolean => {
    return value >= 0 && value <= 100;
  },

  /**
   * 验证亮度/对比度值
   */
  isValidBrightnessContrast: (value: number): boolean => {
    return value >= -1 && value <= 1;
  },

  /**
   * 验证文字样式
   */
  validateTextStyle: (
    style: TextStyle,
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (
      style.fontSize !== undefined &&
      !styleUtils.isValidFontSize(style.fontSize)
    ) {
      errors.push("字号必须在 1-1000 之间");
    }

    if (style.fill !== undefined && !styleUtils.isValidColor(style.fill)) {
      errors.push("无效的颜色格式");
    }

    if (
      style.lineHeight !== undefined &&
      !styleUtils.isValidLineHeight(style.lineHeight)
    ) {
      errors.push("行高必须在 0.5-5 之间");
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * 验证形状样式
   */
  validateShapeStyle: (
    style: ShapeStyle,
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (style.fill !== undefined && !styleUtils.isValidColor(style.fill)) {
      errors.push("无效的填充颜色");
    }

    if (style.stroke !== undefined && !styleUtils.isValidColor(style.stroke)) {
      errors.push("无效的边框颜色");
    }

    if (
      style.strokeWidth !== undefined &&
      !styleUtils.isValidStrokeWidth(style.strokeWidth)
    ) {
      errors.push("边框宽度必须在 0-100 之间");
    }

    if (
      style.opacity !== undefined &&
      !styleUtils.isValidOpacity(style.opacity)
    ) {
      errors.push("透明度必须在 0-1 之间");
    }

    if (style.rx !== undefined && !styleUtils.isValidRadius(style.rx)) {
      errors.push("圆角值必须非负");
    }

    if (style.ry !== undefined && !styleUtils.isValidRadius(style.ry)) {
      errors.push("圆角值必须非负");
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * 验证图片样式
   */
  validateImageStyle: (
    style: ImageStyle,
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (
      style.opacity !== undefined &&
      !styleUtils.isValidOpacity(style.opacity)
    ) {
      errors.push("透明度必须在 0-1 之间");
    }

    if (style.filters) {
      for (const filter of style.filters) {
        if (
          filter.type === "blur" &&
          !styleUtils.isValidBlurValue(filter.value)
        ) {
          errors.push("模糊值必须在 0-100 之间");
        }
        if (
          (filter.type === "brightness" || filter.type === "contrast") &&
          !styleUtils.isValidBrightnessContrast(filter.value)
        ) {
          errors.push(
            `${filter.type === "brightness" ? "亮度" : "对比度"}值必须在 -1 到 1 之间`,
          );
        }
      }
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * 应用样式更新并返回新样式
   */
  applyTextStyleUpdate: <K extends keyof TextStyle>(
    current: TextStyle,
    key: K,
    value: TextStyle[K],
  ): TextStyle => {
    return { ...current, [key]: value };
  },

  /**
   * 应用形状样式更新并返回新样式
   */
  applyShapeStyleUpdate: <K extends keyof ShapeStyle>(
    current: ShapeStyle,
    key: K,
    value: ShapeStyle[K],
  ): ShapeStyle => {
    return { ...current, [key]: value };
  },

  /**
   * 应用图片样式更新并返回新样式
   */
  applyImageStyleUpdate: <K extends keyof ImageStyle>(
    current: ImageStyle,
    key: K,
    value: ImageStyle[K],
  ): ImageStyle => {
    return { ...current, [key]: value };
  },

  /**
   * 默认文字样式
   */
  DEFAULT_TEXT_STYLE: {
    fontFamily: "sans-serif",
    fontSize: 24,
    fill: "#000000",
    fontWeight: "normal" as const,
    fontStyle: "normal" as const,
    underline: false,
    textAlign: "left" as const,
    lineHeight: 1.2,
  },

  /**
   * 默认形状样式
   */
  DEFAULT_SHAPE_STYLE: {
    fill: "#cccccc",
    stroke: "#000000",
    strokeWidth: 1,
    opacity: 1,
    rx: 0,
    ry: 0,
  },

  /**
   * 默认图片样式
   */
  DEFAULT_IMAGE_STYLE: {
    opacity: 1,
    filters: [],
  },
};
