# 元素模块

海报画布的元素组件和 Hooks，提供文字、图片、形状、背景等元素的添加和编辑功能。

## 文件索引

| 文件 | 描述 |
|------|------|
| `index.ts` | 模块导出入口 |
| `TextElement.tsx` | 文字元素 Hook，支持添加、编辑文字和样式设置 |
| `ImageElement.tsx` | 图片元素 Hook，支持图片上传、滤镜和透明度调整 |
| `ShapeElement.tsx` | 形状元素 Hook，支持矩形、圆形、三角形、线条 |
| `BackgroundElement.tsx` | 背景元素 Hook，支持纯色、渐变和图片背景 |

## 使用示例

```tsx
import { useTextElement, useImageElement, useShapeElement, useBackgroundElement } from "./elements";

// 在组件中使用
const { addText, updateTextStyle } = useTextElement({ canvas });
const { addImageFromFile, applyFilter } = useImageElement({ canvas });
const { addShape, updateShapeStyle } = useShapeElement({ canvas });
const { setSolidBackground, setGradientBackground } = useBackgroundElement({ canvas });

// 添加文字
addText("Hello World", { fontSize: 48, fill: "#ff0000" });

// 添加图片
await addImageFromFile(file);

// 添加形状
addShape("rect", { fill: "#4A90D9", rx: 10, ry: 10 });

// 设置背景
setSolidBackground("#f5f5f5");
```

## 支持的功能

### 文字元素
- 添加可编辑文字（双击编辑）
- 字体、大小、颜色设置
- 对齐、行高、字间距
- 描边和阴影效果

### 图片元素
- 支持 JPG、PNG、WebP 格式
- 缩放、旋转、移动
- 透明度调整
- 滤镜：灰度、模糊、亮度、对比度

### 形状元素
- 矩形（支持圆角）
- 圆形
- 三角形
- 线条
- 填充颜色和边框设置

### 背景设置
- 纯色背景
- 线性/径向渐变
- 图片背景（填充、适应、平铺）
