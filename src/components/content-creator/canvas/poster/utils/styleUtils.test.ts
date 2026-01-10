/**
 * @file 样式工具属性测试
 * @description 测试样式更新功能的正确性，包括 Property 7: 样式更新正确性
 * @module components/content-creator/canvas/poster/utils/styleUtils.test
 */

import { describe, it, expect } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import {
  styleUtils,
  type TextStyle,
  type ShapeStyle,
  type ImageStyle,
} from "./styleUtils";

/**
 * 生成有效的 hex 颜色
 */
const hexColorArb = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
  )
  .map(
    ([r, g, b]) =>
      `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
  );

/**
 * 生成有效的字号
 */
const fontSizeArb = fc.integer({ min: 1, max: 1000 });

/**
 * 生成有效的透明度
 */
const opacityArb = fc.double({ min: 0, max: 1, noNaN: true });

/**
 * 生成有效的边框宽度
 */
const strokeWidthArb = fc.double({ min: 0, max: 100, noNaN: true });

/**
 * 生成有效的圆角值
 */
const radiusArb = fc.double({ min: 0, max: 500, noNaN: true });

/**
 * 生成有效的行高
 */
const lineHeightArb = fc.double({ min: 0.5, max: 5, noNaN: true });

/**
 * 生成有效的文字样式
 */
const textStyleArb: fc.Arbitrary<TextStyle> = fc.record({
  fontFamily: fc.constantFrom(
    "sans-serif",
    "serif",
    "monospace",
    "Arial",
    "Helvetica",
  ),
  fontSize: fontSizeArb,
  fill: hexColorArb,
  fontWeight: fc.constantFrom("normal", "bold"),
  fontStyle: fc.constantFrom("normal", "italic"),
  underline: fc.boolean(),
  textAlign: fc.constantFrom("left", "center", "right"),
  lineHeight: lineHeightArb,
});

/**
 * 生成有效的形状样式
 */
const shapeStyleArb: fc.Arbitrary<ShapeStyle> = fc.record({
  fill: hexColorArb,
  stroke: hexColorArb,
  strokeWidth: strokeWidthArb,
  opacity: opacityArb,
  rx: radiusArb,
  ry: radiusArb,
});

/**
 * 生成有效的图片样式
 */
const imageStyleArb: fc.Arbitrary<ImageStyle> = fc.record({
  opacity: opacityArb,
  filters: fc.array(
    fc.oneof(
      fc.constant({ type: "grayscale" as const }),
      fc.record({
        type: fc.constant("blur" as const),
        value: fc.double({ min: 0, max: 100, noNaN: true }),
      }),
    ),
    { maxLength: 3 },
  ),
});

/**
 * Feature: ai-content-creator-phase2, Property 7: 样式更新正确性
 * Validates: Requirements 3.5, 3.6, 4.5, 4.6, 5.3, 5.4, 5.5
 *
 * *For any* 元素和任意样式更新操作，更新后的样式应该正确反映更新值，
 * 且未更新的属性应该保持不变。
 */
describe("Property 7: 样式更新正确性", () => {
  /**
   * Property: 文字样式更新应该只影响指定属性
   * Validates: Requirements 3.5, 3.6
   */
  test.prop([textStyleArb, hexColorArb])(
    "文字颜色更新应该只影响 fill 属性",
    (currentStyle, newColor) => {
      const updatedStyle = styleUtils.applyTextStyleUpdate(
        currentStyle,
        "fill",
        newColor,
      );

      // 更新的属性应该改变
      expect(updatedStyle.fill).toBe(newColor);

      // 其他属性应该保持不变
      expect(updatedStyle.fontFamily).toBe(currentStyle.fontFamily);
      expect(updatedStyle.fontSize).toBe(currentStyle.fontSize);
      expect(updatedStyle.fontWeight).toBe(currentStyle.fontWeight);
      expect(updatedStyle.fontStyle).toBe(currentStyle.fontStyle);
      expect(updatedStyle.underline).toBe(currentStyle.underline);
      expect(updatedStyle.textAlign).toBe(currentStyle.textAlign);
      expect(updatedStyle.lineHeight).toBe(currentStyle.lineHeight);
    },
  );

  /**
   * Property: 文字字号更新应该只影响 fontSize 属性
   * Validates: Requirements 3.5
   */
  test.prop([textStyleArb, fontSizeArb])(
    "文字字号更新应该只影响 fontSize 属性",
    (currentStyle, newSize) => {
      const updatedStyle = styleUtils.applyTextStyleUpdate(
        currentStyle,
        "fontSize",
        newSize,
      );

      // 更新的属性应该改变
      expect(updatedStyle.fontSize).toBe(newSize);

      // 其他属性应该保持不变
      expect(updatedStyle.fontFamily).toBe(currentStyle.fontFamily);
      expect(updatedStyle.fill).toBe(currentStyle.fill);
      expect(updatedStyle.fontWeight).toBe(currentStyle.fontWeight);
    },
  );

  /**
   * Property: 形状填充颜色更新应该只影响 fill 属性
   * Validates: Requirements 5.3
   */
  test.prop([shapeStyleArb, hexColorArb])(
    "形状填充颜色更新应该只影响 fill 属性",
    (currentStyle, newColor) => {
      const updatedStyle = styleUtils.applyShapeStyleUpdate(
        currentStyle,
        "fill",
        newColor,
      );

      // 更新的属性应该改变
      expect(updatedStyle.fill).toBe(newColor);

      // 其他属性应该保持不变
      expect(updatedStyle.stroke).toBe(currentStyle.stroke);
      expect(updatedStyle.strokeWidth).toBe(currentStyle.strokeWidth);
      expect(updatedStyle.opacity).toBe(currentStyle.opacity);
      expect(updatedStyle.rx).toBe(currentStyle.rx);
      expect(updatedStyle.ry).toBe(currentStyle.ry);
    },
  );

  /**
   * Property: 形状边框更新应该只影响边框属性
   * Validates: Requirements 5.4
   */
  test.prop([shapeStyleArb, hexColorArb, strokeWidthArb])(
    "形状边框更新应该只影响边框属性",
    (currentStyle, newStrokeColor, newStrokeWidth) => {
      let updatedStyle = styleUtils.applyShapeStyleUpdate(
        currentStyle,
        "stroke",
        newStrokeColor,
      );
      updatedStyle = styleUtils.applyShapeStyleUpdate(
        updatedStyle,
        "strokeWidth",
        newStrokeWidth,
      );

      // 更新的属性应该改变
      expect(updatedStyle.stroke).toBe(newStrokeColor);
      expect(updatedStyle.strokeWidth).toBe(newStrokeWidth);

      // 其他属性应该保持不变
      expect(updatedStyle.fill).toBe(currentStyle.fill);
      expect(updatedStyle.opacity).toBe(currentStyle.opacity);
    },
  );

  /**
   * Property: 形状圆角更新应该只影响圆角属性
   * Validates: Requirements 5.5
   */
  test.prop([shapeStyleArb, radiusArb])(
    "形状圆角更新应该只影响圆角属性",
    (currentStyle, newRadius) => {
      let updatedStyle = styleUtils.applyShapeStyleUpdate(
        currentStyle,
        "rx",
        newRadius,
      );
      updatedStyle = styleUtils.applyShapeStyleUpdate(
        updatedStyle,
        "ry",
        newRadius,
      );

      // 更新的属性应该改变
      expect(updatedStyle.rx).toBe(newRadius);
      expect(updatedStyle.ry).toBe(newRadius);

      // 其他属性应该保持不变
      expect(updatedStyle.fill).toBe(currentStyle.fill);
      expect(updatedStyle.stroke).toBe(currentStyle.stroke);
      expect(updatedStyle.strokeWidth).toBe(currentStyle.strokeWidth);
    },
  );

  /**
   * Property: 图片透明度更新应该只影响 opacity 属性
   * Validates: Requirements 4.5
   */
  test.prop([imageStyleArb, opacityArb])(
    "图片透明度更新应该只影响 opacity 属性",
    (currentStyle, newOpacity) => {
      const updatedStyle = styleUtils.applyImageStyleUpdate(
        currentStyle,
        "opacity",
        newOpacity,
      );

      // 更新的属性应该改变
      expect(updatedStyle.opacity).toBe(newOpacity);

      // 其他属性应该保持不变
      expect(updatedStyle.filters).toEqual(currentStyle.filters);
    },
  );

  /**
   * Property: 样式合并应该正确覆盖指定属性
   */
  test.prop([
    textStyleArb,
    fc.record({ fontSize: fontSizeArb, fill: hexColorArb }),
  ])("样式合并应该正确覆盖指定属性", (currentStyle, updates) => {
    const mergedStyle = styleUtils.mergeTextStyle(currentStyle, updates);

    // 更新的属性应该被覆盖
    expect(mergedStyle.fontSize).toBe(updates.fontSize);
    expect(mergedStyle.fill).toBe(updates.fill);

    // 未更新的属性应该保持不变
    expect(mergedStyle.fontFamily).toBe(currentStyle.fontFamily);
    expect(mergedStyle.fontWeight).toBe(currentStyle.fontWeight);
  });

  /**
   * Property: 空更新应该保持样式不变
   */
  test.prop([textStyleArb])("空更新应该保持样式不变", (currentStyle) => {
    const mergedStyle = styleUtils.mergeTextStyle(currentStyle, {});

    expect(mergedStyle).toEqual(currentStyle);
  });

  /**
   * Property: 连续更新应该累积
   */
  test.prop([textStyleArb, fontSizeArb, hexColorArb])(
    "连续更新应该累积",
    (currentStyle, newSize, newColor) => {
      const afterSizeUpdate = styleUtils.applyTextStyleUpdate(
        currentStyle,
        "fontSize",
        newSize,
      );
      const afterColorUpdate = styleUtils.applyTextStyleUpdate(
        afterSizeUpdate,
        "fill",
        newColor,
      );

      // 两次更新都应该生效
      expect(afterColorUpdate.fontSize).toBe(newSize);
      expect(afterColorUpdate.fill).toBe(newColor);

      // 其他属性应该保持不变
      expect(afterColorUpdate.fontFamily).toBe(currentStyle.fontFamily);
    },
  );
});

/**
 * 样式验证测试
 */
describe("样式验证", () => {
  /**
   * Property: 有效的文字样式应该通过验证
   */
  test.prop([textStyleArb])("有效的文字样式应该通过验证", (style) => {
    const result = styleUtils.validateTextStyle(style);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  /**
   * Property: 有效的形状样式应该通过验证
   */
  test.prop([shapeStyleArb])("有效的形状样式应该通过验证", (style) => {
    const result = styleUtils.validateShapeStyle(style);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  /**
   * Property: 有效的图片样式应该通过验证
   */
  test.prop([imageStyleArb])("有效的图片样式应该通过验证", (style) => {
    const result = styleUtils.validateImageStyle(style);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  /**
   * Property: 无效字号应该验证失败
   */
  test.prop([
    fc.oneof(
      fc.integer({ min: -1000, max: 0 }),
      fc.integer({ min: 1001, max: 10000 }),
    ),
  ])("无效字号应该验证失败", (invalidSize) => {
    const style: TextStyle = { fontSize: invalidSize };
    const result = styleUtils.validateTextStyle(style);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("字号必须在 1-1000 之间");
  });

  /**
   * Property: 无效透明度应该验证失败
   */
  test.prop([
    fc.oneof(
      fc.double({ min: -10, max: -0.01, noNaN: true }),
      fc.double({ min: 1.01, max: 10, noNaN: true }),
    ),
  ])("无效透明度应该验证失败", (invalidOpacity) => {
    const style: ShapeStyle = { opacity: invalidOpacity };
    const result = styleUtils.validateShapeStyle(style);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("透明度必须在 0-1 之间");
  });

  /**
   * Property: 无效边框宽度应该验证失败
   */
  test.prop([
    fc.oneof(
      fc.double({ min: -100, max: -0.01, noNaN: true }),
      fc.double({ min: 100.01, max: 1000, noNaN: true }),
    ),
  ])("无效边框宽度应该验证失败", (invalidWidth) => {
    const style: ShapeStyle = { strokeWidth: invalidWidth };
    const result = styleUtils.validateShapeStyle(style);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("边框宽度必须在 0-100 之间");
  });
});

/**
 * 颜色验证测试
 */
describe("颜色验证", () => {
  it("应该接受有效的 hex 颜色", () => {
    expect(styleUtils.isValidColor("#000000")).toBe(true);
    expect(styleUtils.isValidColor("#fff")).toBe(true);
    expect(styleUtils.isValidColor("#FF5733")).toBe(true);
    expect(styleUtils.isValidColor("#ff573380")).toBe(true);
  });

  it("应该接受有效的 rgb 颜色", () => {
    expect(styleUtils.isValidColor("rgb(255, 0, 0)")).toBe(true);
    expect(styleUtils.isValidColor("rgb(0, 128, 255)")).toBe(true);
  });

  it("应该接受有效的 rgba 颜色", () => {
    expect(styleUtils.isValidColor("rgba(255, 0, 0, 0.5)")).toBe(true);
    expect(styleUtils.isValidColor("rgba(0, 128, 255, 1)")).toBe(true);
  });

  it("应该接受命名颜色", () => {
    expect(styleUtils.isValidColor("red")).toBe(true);
    expect(styleUtils.isValidColor("blue")).toBe(true);
    expect(styleUtils.isValidColor("transparent")).toBe(true);
  });

  it("应该拒绝无效的颜色格式", () => {
    expect(styleUtils.isValidColor("invalid")).toBe(false);
    expect(styleUtils.isValidColor("#gg0000")).toBe(false);
    expect(styleUtils.isValidColor("rgb(300, 0, 0)")).toBe(false);
  });
});

/**
 * 默认样式测试
 */
describe("默认样式", () => {
  it("默认文字样式应该有效", () => {
    const result = styleUtils.validateTextStyle(styleUtils.DEFAULT_TEXT_STYLE);
    expect(result.valid).toBe(true);
  });

  it("默认形状样式应该有效", () => {
    const result = styleUtils.validateShapeStyle(
      styleUtils.DEFAULT_SHAPE_STYLE,
    );
    expect(result.valid).toBe(true);
  });

  it("默认图片样式应该有效", () => {
    const result = styleUtils.validateImageStyle(
      styleUtils.DEFAULT_IMAGE_STYLE,
    );
    expect(result.valid).toBe(true);
  });
});
