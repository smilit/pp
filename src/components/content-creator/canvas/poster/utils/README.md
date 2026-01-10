# 海报画布工具函数

本目录包含海报画布相关的纯函数工具，用于业务逻辑计算和测试。

## 文件索引

| 文件 | 说明 |
|------|------|
| `index.ts` | 模块导出入口 |
| `layerUtils.ts` | 图层操作工具函数 |
| `alignmentGuides.ts` | 对齐辅助线和吸附工具 |
| `alignmentGuides.test.ts` | 对齐辅助属性测试 (Property 11) |
| `styleUtils.ts` | 样式更新工具函数 |
| `styleUtils.test.ts` | 样式更新属性测试 (Property 7) |

## 核心功能

### layerUtils
- 图层创建和同步
- 可见性/锁定状态管理
- 图层排序

### alignmentUtils
- 网格吸附计算
- 元素对齐（左/右/上/下/居中）
- 画布中心对齐
- 对齐辅助线生成

### styleUtils
- 文字样式合并和验证
- 形状样式合并和验证
- 图片样式合并和验证
- 颜色格式验证

## 设计原则

所有工具函数都是纯函数，便于单元测试和属性测试。
