/**
 * @file 对齐辅助工具属性测试
 * @description 测试对齐吸附功能的正确性属性
 * @module components/content-creator/canvas/poster/utils/alignmentGuides.test
 */

import { describe, it, expect } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import {
  alignmentUtils,
  type ElementBounds,
  type AlignDirection,
} from "./alignmentGuides";

/**
 * 生成有效的元素边界
 */
const elementBoundsArb = fc
  .record({
    id: fc.uuid(),
    left: fc.integer({ min: 0, max: 1000 }),
    top: fc.integer({ min: 0, max: 1000 }),
    width: fc.integer({ min: 10, max: 500 }),
    height: fc.integer({ min: 10, max: 500 }),
  })
  .map(({ id, left, top, width, height }) => ({
    id,
    left,
    top,
    right: left + width,
    bottom: top + height,
    centerX: left + width / 2,
    centerY: top + height / 2,
  }));

/**
 * 生成有效的网格大小
 */
const gridSizeArb = fc.integer({ min: 5, max: 100 });

/**
 * 生成有效的画布尺寸
 */
const canvasSizeArb = fc.record({
  width: fc.integer({ min: 100, max: 2000 }),
  height: fc.integer({ min: 100, max: 2000 }),
});

/**
 * 生成有效的对齐方向
 */
const alignDirectionArb = fc.constantFrom<AlignDirection>(
  "left",
  "center-horizontal",
  "right",
  "top",
  "center-vertical",
  "bottom",
  "canvas-center-horizontal",
  "canvas-center-vertical",
);

/**
 * Feature: ai-content-creator-phase2, Property 11: 对齐吸附正确性
 * Validates: Requirements 11.5, 11.6
 *
 * *For any* 元素移动操作，当网格吸附开启时，元素最终位置应该吸附到最近的网格点。
 * 当执行对齐操作时，选中元素应该按指定方向正确对齐。
 */
describe("Property 11: 对齐吸附正确性", () => {
  /**
   * Property: 网格吸附后位置应该在网格点上
   * Validates: Requirements 11.5
   */
  test.prop([fc.double({ min: 0, max: 1000, noNaN: true }), gridSizeArb])(
    "网格吸附后位置应该在网格点上",
    (position, gridSize) => {
      const snappedPosition = alignmentUtils.snapToGrid(position, gridSize);

      // 吸附后的位置应该是网格大小的整数倍
      expect(snappedPosition % gridSize).toBe(0);

      // 吸附后的位置应该是最近的网格点
      const lowerGrid = Math.floor(position / gridSize) * gridSize;
      const upperGrid = Math.ceil(position / gridSize) * gridSize;
      const distToLower = Math.abs(position - lowerGrid);
      const distToUpper = Math.abs(position - upperGrid);

      if (distToLower <= distToUpper) {
        expect(snappedPosition).toBe(lowerGrid);
      } else {
        expect(snappedPosition).toBe(upperGrid);
      }
    },
  );

  /**
   * Property: 禁用网格吸附时位置不变
   * Validates: Requirements 11.5
   */
  test.prop([fc.double({ min: 0, max: 1000, noNaN: true })])(
    "禁用网格吸附时位置不变",
    (position) => {
      // 网格大小为 0 表示禁用
      const snappedPosition = alignmentUtils.snapToGrid(position, 0);

      expect(snappedPosition).toBe(position);
    },
  );

  /**
   * Property: 已在网格点上的位置吸附后不变
   * Validates: Requirements 11.5
   */
  test.prop([fc.integer({ min: 0, max: 100 }), gridSizeArb])(
    "已在网格点上的位置吸附后不变",
    (multiplier, gridSize) => {
      const positionOnGrid = multiplier * gridSize;
      const snappedPosition = alignmentUtils.snapToGrid(
        positionOnGrid,
        gridSize,
      );

      expect(snappedPosition).toBe(positionOnGrid);
    },
  );

  /**
   * Property: isOnGrid 验证网格吸附结果
   * Validates: Requirements 11.5
   */
  test.prop([fc.double({ min: 0, max: 1000, noNaN: true }), gridSizeArb])(
    "isOnGrid 验证网格吸附结果",
    (position, gridSize) => {
      const snappedPosition = alignmentUtils.snapToGrid(position, gridSize);

      // 吸附后的位置应该通过 isOnGrid 验证
      expect(alignmentUtils.isOnGrid(snappedPosition, gridSize)).toBe(true);
    },
  );

  /**
   * Property: 左对齐后所有元素左边缘相同
   * Validates: Requirements 11.6
   */
  test.prop([
    fc.array(elementBoundsArb, { minLength: 2, maxLength: 10 }),
    canvasSizeArb,
  ])("左对齐后所有元素左边缘相同", (elements, canvasSize) => {
    const result = alignmentUtils.alignElements(
      elements,
      "left",
      canvasSize.width,
      canvasSize.height,
    );

    // 计算预期的左边缘（最小的左边缘）
    const expectedLeft = Math.min(...elements.map((e) => e.left));

    // 所有元素的新位置应该使左边缘对齐
    for (const el of elements) {
      const newPos = result.get(el.id);
      expect(newPos).toBeDefined();
      if (newPos) {
        // 新的左边缘 = 新中心 - (原中心 - 原左边缘)
        const newLeft = newPos.x - (el.centerX - el.left);
        expect(newLeft).toBeCloseTo(expectedLeft, 5);
      }
    }
  });

  /**
   * Property: 右对齐后所有元素右边缘相同
   * Validates: Requirements 11.6
   */
  test.prop([
    fc.array(elementBoundsArb, { minLength: 2, maxLength: 10 }),
    canvasSizeArb,
  ])("右对齐后所有元素右边缘相同", (elements, canvasSize) => {
    const result = alignmentUtils.alignElements(
      elements,
      "right",
      canvasSize.width,
      canvasSize.height,
    );

    // 计算预期的右边缘（最大的右边缘）
    const expectedRight = Math.max(...elements.map((e) => e.right));

    // 所有元素的新位置应该使右边缘对齐
    for (const el of elements) {
      const newPos = result.get(el.id);
      expect(newPos).toBeDefined();
      if (newPos) {
        // 新的右边缘 = 新中心 + (原右边缘 - 原中心)
        const newRight = newPos.x + (el.right - el.centerX);
        expect(newRight).toBeCloseTo(expectedRight, 5);
      }
    }
  });

  /**
   * Property: 顶部对齐后所有元素顶边缘相同
   * Validates: Requirements 11.6
   */
  test.prop([
    fc.array(elementBoundsArb, { minLength: 2, maxLength: 10 }),
    canvasSizeArb,
  ])("顶部对齐后所有元素顶边缘相同", (elements, canvasSize) => {
    const result = alignmentUtils.alignElements(
      elements,
      "top",
      canvasSize.width,
      canvasSize.height,
    );

    // 计算预期的顶边缘（最小的顶边缘）
    const expectedTop = Math.min(...elements.map((e) => e.top));

    // 所有元素的新位置应该使顶边缘对齐
    for (const el of elements) {
      const newPos = result.get(el.id);
      expect(newPos).toBeDefined();
      if (newPos) {
        // 新的顶边缘 = 新中心 - (原中心 - 原顶边缘)
        const newTop = newPos.y - (el.centerY - el.top);
        expect(newTop).toBeCloseTo(expectedTop, 5);
      }
    }
  });

  /**
   * Property: 底部对齐后所有元素底边缘相同
   * Validates: Requirements 11.6
   */
  test.prop([
    fc.array(elementBoundsArb, { minLength: 2, maxLength: 10 }),
    canvasSizeArb,
  ])("底部对齐后所有元素底边缘相同", (elements, canvasSize) => {
    const result = alignmentUtils.alignElements(
      elements,
      "bottom",
      canvasSize.width,
      canvasSize.height,
    );

    // 计算预期的底边缘（最大的底边缘）
    const expectedBottom = Math.max(...elements.map((e) => e.bottom));

    // 所有元素的新位置应该使底边缘对齐
    for (const el of elements) {
      const newPos = result.get(el.id);
      expect(newPos).toBeDefined();
      if (newPos) {
        // 新的底边缘 = 新中心 + (原底边缘 - 原中心)
        const newBottom = newPos.y + (el.bottom - el.centerY);
        expect(newBottom).toBeCloseTo(expectedBottom, 5);
      }
    }
  });

  /**
   * Property: 水平居中对齐后所有元素中心 X 相同
   * Validates: Requirements 11.6
   */
  test.prop([
    fc.array(elementBoundsArb, { minLength: 2, maxLength: 10 }),
    canvasSizeArb,
  ])("水平居中对齐后所有元素中心 X 相同", (elements, canvasSize) => {
    const result = alignmentUtils.alignElements(
      elements,
      "center-horizontal",
      canvasSize.width,
      canvasSize.height,
    );

    // 计算预期的中心 X（所有元素中心 X 的平均值）
    const expectedCenterX =
      elements.reduce((sum, e) => sum + e.centerX, 0) / elements.length;

    // 所有元素的新位置应该使中心 X 对齐
    for (const el of elements) {
      const newPos = result.get(el.id);
      expect(newPos).toBeDefined();
      if (newPos) {
        expect(newPos.x).toBeCloseTo(expectedCenterX, 5);
      }
    }
  });

  /**
   * Property: 垂直居中对齐后所有元素中心 Y 相同
   * Validates: Requirements 11.6
   */
  test.prop([
    fc.array(elementBoundsArb, { minLength: 2, maxLength: 10 }),
    canvasSizeArb,
  ])("垂直居中对齐后所有元素中心 Y 相同", (elements, canvasSize) => {
    const result = alignmentUtils.alignElements(
      elements,
      "center-vertical",
      canvasSize.width,
      canvasSize.height,
    );

    // 计算预期的中心 Y（所有元素中心 Y 的平均值）
    const expectedCenterY =
      elements.reduce((sum, e) => sum + e.centerY, 0) / elements.length;

    // 所有元素的新位置应该使中心 Y 对齐
    for (const el of elements) {
      const newPos = result.get(el.id);
      expect(newPos).toBeDefined();
      if (newPos) {
        expect(newPos.y).toBeCloseTo(expectedCenterY, 5);
      }
    }
  });

  /**
   * Property: 画布水平居中后所有元素中心 X 等于画布中心
   * Validates: Requirements 11.6
   */
  test.prop([
    fc.array(elementBoundsArb, { minLength: 1, maxLength: 10 }),
    canvasSizeArb,
  ])("画布水平居中后所有元素中心 X 等于画布中心", (elements, canvasSize) => {
    const result = alignmentUtils.alignElements(
      elements,
      "canvas-center-horizontal",
      canvasSize.width,
      canvasSize.height,
    );

    const canvasCenterX = canvasSize.width / 2;

    // 所有元素的新位置应该使中心 X 等于画布中心
    for (const el of elements) {
      const newPos = result.get(el.id);
      expect(newPos).toBeDefined();
      if (newPos) {
        expect(newPos.x).toBeCloseTo(canvasCenterX, 5);
      }
    }
  });

  /**
   * Property: 画布垂直居中后所有元素中心 Y 等于画布中心
   * Validates: Requirements 11.6
   */
  test.prop([
    fc.array(elementBoundsArb, { minLength: 1, maxLength: 10 }),
    canvasSizeArb,
  ])("画布垂直居中后所有元素中心 Y 等于画布中心", (elements, canvasSize) => {
    const result = alignmentUtils.alignElements(
      elements,
      "canvas-center-vertical",
      canvasSize.width,
      canvasSize.height,
    );

    const canvasCenterY = canvasSize.height / 2;

    // 所有元素的新位置应该使中心 Y 等于画布中心
    for (const el of elements) {
      const newPos = result.get(el.id);
      expect(newPos).toBeDefined();
      if (newPos) {
        expect(newPos.y).toBeCloseTo(canvasCenterY, 5);
      }
    }
  });

  /**
   * Property: 对齐操作不改变元素数量
   * Validates: Requirements 11.6
   */
  test.prop([
    fc.array(elementBoundsArb, { minLength: 1, maxLength: 10 }),
    canvasSizeArb,
    alignDirectionArb,
  ])("对齐操作不改变元素数量", (elements, canvasSize, direction) => {
    const result = alignmentUtils.alignElements(
      elements,
      direction,
      canvasSize.width,
      canvasSize.height,
    );

    // 结果中的元素数量应该与输入相同
    expect(result.size).toBe(elements.length);

    // 所有原始元素都应该有对应的新位置
    for (const el of elements) {
      expect(result.has(el.id)).toBe(true);
    }
  });

  /**
   * Property: 空元素列表对齐返回空结果
   * Validates: Requirements 11.6
   */
  test.prop([canvasSizeArb, alignDirectionArb])(
    "空元素列表对齐返回空结果",
    (canvasSize, direction) => {
      const result = alignmentUtils.alignElements(
        [],
        direction,
        canvasSize.width,
        canvasSize.height,
      );

      expect(result.size).toBe(0);
    },
  );

  /**
   * Property: 吸附阈值内的位置应该被吸附
   * Validates: Requirements 11.5
   */
  test.prop([
    fc.integer({ min: 0, max: 1000 }),
    fc.integer({ min: 1, max: 10 }),
    fc.integer({ min: 1, max: 20 }),
  ])("吸附阈值内的位置应该被吸附", (targetPosition, offset, threshold) => {
    fc.pre(offset <= threshold);

    const currentPosition = targetPosition + offset;
    const isWithin = alignmentUtils.isWithinThreshold(
      currentPosition,
      targetPosition,
      threshold,
    );

    expect(isWithin).toBe(true);
  });

  /**
   * Property: 吸附阈值外的位置不应该被吸附
   * Validates: Requirements 11.5
   */
  test.prop([
    fc.integer({ min: 0, max: 1000 }),
    fc.integer({ min: 11, max: 100 }),
    fc.integer({ min: 1, max: 10 }),
  ])("吸附阈值外的位置不应该被吸附", (targetPosition, offset, threshold) => {
    fc.pre(offset > threshold);

    const currentPosition = targetPosition + offset;
    const isWithin = alignmentUtils.isWithinThreshold(
      currentPosition,
      targetPosition,
      threshold,
    );

    expect(isWithin).toBe(false);
  });

  /**
   * Property: 画布中心对齐线位置正确
   * Validates: Requirements 11.2
   */
  test.prop([canvasSizeArb])("画布中心对齐线位置正确", (canvasSize) => {
    const lines = alignmentUtils.getCanvasCenterLines(
      canvasSize.width,
      canvasSize.height,
    );

    // 应该有两条线（水平和垂直）
    expect(lines.length).toBe(2);

    // 垂直线应该在画布水平中心
    const verticalLine = lines.find((l) => l.type === "vertical");
    expect(verticalLine).toBeDefined();
    expect(verticalLine?.position).toBe(canvasSize.width / 2);
    expect(verticalLine?.source).toBe("canvas-center");

    // 水平线应该在画布垂直中心
    const horizontalLine = lines.find((l) => l.type === "horizontal");
    expect(horizontalLine).toBeDefined();
    expect(horizontalLine?.position).toBe(canvasSize.height / 2);
    expect(horizontalLine?.source).toBe("canvas-center");
  });

  /**
   * Property: 元素对齐线包含所有边缘和中心
   * Validates: Requirements 11.3, 11.4
   */
  test.prop([elementBoundsArb])("元素对齐线包含所有边缘和中心", (bounds) => {
    const lines = alignmentUtils.getElementAlignmentLines(bounds, true);

    // 应该有 6 条线（4 条边缘 + 2 条中心）
    expect(lines.length).toBe(6);

    // 检查垂直线
    const verticalLines = lines.filter((l) => l.type === "vertical");
    expect(verticalLines.length).toBe(3);
    const verticalPositions = verticalLines.map((l) => l.position);
    expect(verticalPositions).toContain(bounds.left);
    expect(verticalPositions).toContain(bounds.right);
    expect(verticalPositions).toContain(bounds.centerX);

    // 检查水平线
    const horizontalLines = lines.filter((l) => l.type === "horizontal");
    expect(horizontalLines.length).toBe(3);
    const horizontalPositions = horizontalLines.map((l) => l.position);
    expect(horizontalPositions).toContain(bounds.top);
    expect(horizontalPositions).toContain(bounds.bottom);
    expect(horizontalPositions).toContain(bounds.centerY);
  });

  /**
   * Property: 不包含中心时元素对齐线只有边缘
   * Validates: Requirements 11.3
   */
  test.prop([elementBoundsArb])("不包含中心时元素对齐线只有边缘", (bounds) => {
    const lines = alignmentUtils.getElementAlignmentLines(bounds, false);

    // 应该有 4 条线（只有边缘）
    expect(lines.length).toBe(4);

    // 所有线都应该是边缘来源
    for (const line of lines) {
      expect(line.source).toBe("element-edge");
    }
  });
});

/**
 * 单元测试 - 边界情况
 */
describe("对齐辅助边界情况", () => {
  it("单个元素对齐应该返回原位置", () => {
    const element: ElementBounds = {
      id: "test-1",
      left: 100,
      top: 100,
      right: 200,
      bottom: 200,
      centerX: 150,
      centerY: 150,
    };

    const result = alignmentUtils.alignElements([element], "left", 1000, 1000);

    expect(result.size).toBe(1);
    const newPos = result.get("test-1");
    expect(newPos?.x).toBe(element.centerX);
    expect(newPos?.y).toBe(element.centerY);
  });

  it("isAligned 验证对齐结果", () => {
    expect(alignmentUtils.isAligned(100, 100, 1)).toBe(true);
    expect(alignmentUtils.isAligned(100, 100.5, 1)).toBe(true);
    expect(alignmentUtils.isAligned(100, 102, 1)).toBe(false);
  });

  it("负数网格大小应该禁用吸附", () => {
    const position = 123.456;
    const snapped = alignmentUtils.snapToGrid(position, -10);
    expect(snapped).toBe(position);
  });
});
