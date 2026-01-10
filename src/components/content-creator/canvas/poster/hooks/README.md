# 海报画布 Hooks

本目录包含海报画布相关的 React Hooks。

## 文件索引

| 文件 | 说明 |
|------|------|
| `index.ts` | 模块导出入口 |
| `useFabricCanvas.ts` | Fabric.js 画布初始化和缩放 |
| `useFabricCanvas.test.ts` | 画布属性测试 (Property 1) |
| `useElementOperations.ts` | 元素选择、变换、多选、组合、删除 |
| `useElementOperations.test.ts` | 元素操作属性测试 (Property 2, 4, 5, 6) |
| `useHistory.ts` | 撤销/重做历史记录 |
| `useHistory.test.ts` | 历史记录属性测试 (Property 3) |
| `useLayerManager.ts` | 图层管理 |
| `useLayerManager.test.ts` | 图层同步属性测试 (Property 8) |
| `usePageOperations.ts` | 多页操作 |
| `usePageOperations.test.ts` | 页面操作属性测试 (Property 9) |
| `useAlignment.ts` | 对齐和吸附功能 |
| `useExport.ts` | 图片导出功能 |
| `useExport.test.ts` | 导出尺寸属性测试 (Property 10) |

## 核心 Hooks

### useFabricCanvas
- 画布初始化
- 缩放控制（10%-200%）
- 平移功能

### useElementOperations
- 元素选择（单选/多选）
- 元素变换（移动/缩放/旋转）
- 组合/取消组合
- 删除操作

### useHistory
- 历史记录栈管理
- 撤销 (Cmd+Z)
- 重做 (Cmd+Shift+Z)

### useLayerManager
- 图层列表同步
- 可见性/锁定状态
- 图层排序

### usePageOperations
- 多页管理
- 页面切换
- 添加/删除/复制页面

### useAlignment
- 对齐辅助线
- 网格吸附
- 元素对齐

### useExport
- PNG/JPG 导出
- 多倍率支持
- 批量导出
