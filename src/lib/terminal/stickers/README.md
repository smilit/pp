# 终端贴纸系统

终端贴纸系统允许在终端上显示可定位的贴纸标注。

## 功能特性

- 基于字符网格的精确定位
- 支持多种内容类型（文本、图标、徽章、自定义组件）
- 可自定义样式（颜色、边框、透明度等）
- 支持拖拽移动
- 终端大小变化时自动调整位置

## 文件索引

| 文件 | 描述 |
|------|------|
| `types.ts` | 贴纸类型定义和工具函数 |
| `store.ts` | Jotai 状态管理 |
| `index.ts` | 模块导出入口 |

## 使用示例

```typescript
import { useSetAtom } from "jotai";
import { addStickerAtom } from "@/lib/terminal/stickers";

// 添加文本贴纸
const addSticker = useSetAtom(addStickerAtom);
addSticker({
  blockId: "terminal-1",
  position: { row: 5, col: 10 },
  contentType: "text",
  text: "重要标记",
  style: {
    backgroundColor: "rgba(158, 206, 106, 0.9)",
    color: "#1a1b26",
  },
  draggable: true,
  closable: true,
});

// 添加徽章贴纸
addSticker({
  blockId: "terminal-1",
  position: { row: 10, col: 0 },
  contentType: "badge",
  badge: {
    text: "SUCCESS",
    variant: "success",
  },
});
```

## 需求追溯

- _Requirements: 15.1_ - 终端支持在指定位置显示贴纸
- _Requirements: 15.2_ - 贴纸支持基于字符网格的定位
- _Requirements: 15.3_ - 贴纸支持自定义内容和样式
- _Requirements: 15.4_ - 终端大小变化时贴纸位置相应调整
