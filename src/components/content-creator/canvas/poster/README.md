# 海报画布模块

基于 Fabric.js 实现的海报画布组件，支持图文海报设计、多页编辑和图片导出。

## 目录结构

```
poster/
├── index.tsx                    # 模块导出入口
├── PosterCanvas.tsx             # 画布主组件 ✅
├── PosterToolbar.tsx            # 顶部工具栏 ✅
├── ElementToolbar.tsx           # 底部元素工具栏 ✅
├── PageList.tsx                 # 多页列表 ✅
├── LayerPanel.tsx               # 图层面板 ✅
├── AlignmentToolbar.tsx         # 对齐工具栏 ✅
├── ExportDialog.tsx             # 导出对话框 ✅
├── SizeSelector.tsx             # 尺寸选择器 ✅
├── registerPosterCanvas.ts      # 画布注册 ✅
├── types.ts                     # 类型定义 ✅
├── README.md                    # 模块文档
├── elements/                    # 元素组件 ✅
│   ├── index.ts                 # 元素导出
│   ├── TextElement.tsx          # 文字元素 ✅
│   ├── ImageElement.tsx         # 图片元素 ✅
│   ├── ShapeElement.tsx         # 形状元素 ✅
│   └── BackgroundElement.tsx    # 背景元素 ✅
├── hooks/                       # 自定义 Hooks
│   ├── index.ts                 # Hooks 导出 ✅
│   ├── useFabricCanvas.ts       # Fabric.js 封装 ✅
│   ├── useFabricCanvas.test.ts  # 属性测试 (Property 1) ✅
│   ├── useElementOperations.ts  # 元素操作 ✅
│   ├── useElementOperations.test.ts # 属性测试 (Property 2,4,5,6) ✅
│   ├── useHistory.ts            # 撤销/重做 ✅
│   ├── useHistory.test.ts       # 属性测试 (Property 3) ✅
│   ├── usePageOperations.ts     # 页面操作 ✅
│   ├── usePageOperations.test.ts # 属性测试 (Property 9) ✅
│   ├── useLayerManager.ts       # 图层管理 ✅
│   ├── useLayerManager.test.ts  # 属性测试 (Property 8) ✅
│   ├── useAlignment.ts          # 对齐功能 ✅
│   ├── useExport.ts             # 导出功能 ✅
│   └── useExport.test.ts        # 属性测试 (Property 10) ✅
└── utils/                       # 工具函数
    ├── index.ts                 # 工具导出 ✅
    ├── layerUtils.ts            # 图层工具函数 ✅
    ├── alignmentGuides.ts       # 对齐辅助工具 ✅
    ├── alignmentGuides.test.ts  # 属性测试 (Property 11) ✅
    ├── styleUtils.ts            # 样式工具函数 ✅
    └── styleUtils.test.ts       # 属性测试 (Property 7) ✅
```

## 实现状态

✅ Phase 2 全部完成 - 所有 11 个属性测试通过

## 核心类型

### PosterSizePreset

海报尺寸预设类型：
- `xiaohongshu-square`: 小红书封面 (1080×1080)
- `xiaohongshu-portrait`: 小红书长图 (1080×1440)
- `wechat-cover`: 公众号头图 (900×383)
- `custom`: 自定义尺寸

### PosterCanvasState

海报画布状态：
- `type`: 画布类型标识 ("poster")
- `pages`: 页面列表
- `currentPageIndex`: 当前页面索引
- `selectedLayerIds`: 选中的图层 ID 列表
- `zoom`: 缩放比例 (10-200%)
- `showGrid`: 是否显示网格
- `showGuides`: 是否显示对齐辅助线

### Layer

图层信息：
- `id`: 图层 ID
- `name`: 图层名称
- `type`: 元素类型 (text/image/shape/group)
- `visible`: 是否可见
- `locked`: 是否锁定

## 使用方式

```typescript
import { 
  PosterCanvas, 
  registerPosterCanvas,
  createInitialPosterState 
} from './canvas/poster';

// 注册画布插件
registerPosterCanvas();

// 创建初始状态
const state = createInitialPosterState(1080, 1080);

// 使用组件
<PosterCanvas 
  state={state}
  onStateChange={setState}
  onClose={handleClose}
/>
```

## 依赖

- fabric.js ^5.3.0 - 画布引擎
- styled-components - 样式管理

## Hooks

### useFabricCanvas

Fabric.js 画布核心 Hook，提供画布初始化、缩放、平移等功能。

```typescript
import { useFabricCanvas } from './hooks';

const {
  canvas,           // Fabric.js Canvas 实例
  zoom,             // 当前缩放值（百分比）
  initCanvas,       // 初始化画布
  destroyCanvas,    // 销毁画布
  setZoom,          // 设置缩放值
  zoomIn,           // 放大
  zoomOut,          // 缩小
  resetZoom,        // 重置缩放到 100%
  fitToView,        // 适应视图
  setPanMode,       // 设置平移模式
  isPanMode,        // 是否处于平移模式
} = useFabricCanvas({
  initialZoom: 100,
  onZoomChange: (zoom) => console.log('Zoom:', zoom),
});
```

#### 缩放功能
- 滚轮缩放：以鼠标位置为中心缩放
- 按钮缩放：以画布中心为中心缩放
- 缩放范围：10% - 200%
- 缩放步长：10%

#### 平移功能
- 拖拽空白区域进行平移
- 支持平移模式开关

### zoomUtils

缩放工具函数（纯函数，用于测试）：

```typescript
import { zoomUtils } from './hooks';

zoomUtils.clampZoom(250);        // 返回 200
zoomUtils.calculateZoomIn(100);  // 返回 110
zoomUtils.calculateZoomOut(100); // 返回 90
zoomUtils.isValidZoom(150);      // 返回 true
```

### usePageOperations

页面操作 Hook，提供多页海报的页面管理功能。

```typescript
import { usePageOperations } from './hooks';

const {
  currentPage,      // 当前页面
  addPage,          // 添加新页面
  deletePage,       // 删除页面
  duplicatePage,    // 复制页面
  selectPage,       // 切换页面
  reorderPages,     // 重排序页面
} = usePageOperations({
  pages: state.pages,
  currentPageIndex: state.currentPageIndex,
  onPagesChange: (pages, currentIndex) => {
    setState({ ...state, pages, currentPageIndex: currentIndex });
  },
});
```

### pageUtils

页面操作工具函数（纯函数，用于测试）：

```typescript
import { pageUtils } from './hooks';

// 添加页面
pageUtils.addPage(pages, currentIndex);

// 删除页面
pageUtils.deletePage(pages, currentIndex, deleteIndex);

// 复制页面
pageUtils.duplicatePage(pages, currentIndex, copyIndex);

// 切换页面
pageUtils.selectPage(pages, targetIndex);

// 重排序页面
pageUtils.reorderPages(pages, currentIndex, fromIndex, toIndex);
```

### useLayerManager

图层管理 Hook，提供图层操作功能。

```typescript
import { useLayerManager } from './hooks';

const {
  reorderLayer,           // 重排序图层
  toggleLayerVisibility,  // 切换图层可见性
  toggleLayerLock,        // 切换图层锁定状态
  renameLayer,            // 重命名图层
  selectLayerElement,     // 选中图层对应的元素
  getLayerById,           // 根据 ID 获取图层
} = useLayerManager({
  canvas,
  layers,
  onSyncLayers: syncLayers,
  onSelectionChange: (ids) => {
    setState({ ...state, selectedLayerIds: ids });
  },
});
```

### layerUtils

图层操作工具函数（纯函数，用于测试）：

```typescript
import { layerUtils } from './utils/layerUtils';

// 重排序图层
layerUtils.reorderLayers(layers, fromIndex, toIndex);

// 切换可见性
layerUtils.toggleVisibility(layer);

// 切换锁定状态
layerUtils.toggleLock(layer);

// 重命名图层
layerUtils.renameLayer(layer, newName);

// 查找图层
layerUtils.findLayerById(layers, id);
layerUtils.findLayerIndex(layers, id);

// 更新图层
layerUtils.updateLayer(layers, id, updates);

// 验证同步状态
layerUtils.isLayerCountSynced(layerCount, elementCount);
layerUtils.isLockStateSynced(layer, elementSelectable);
layerUtils.isVisibilityStateSynced(layer, elementVisible);
```

## 组件

### LayerPanel

图层面板组件，显示图层列表并提供图层管理功能。

```typescript
import { LayerPanel } from './LayerPanel';

<LayerPanel
  layers={layers}
  selectedIds={selectedIds}
  onSelect={(ids) => handleSelect(ids)}
  onReorder={(fromIndex, toIndex) => handleReorder(fromIndex, toIndex)}
  onToggleVisibility={(id) => handleToggleVisibility(id)}
  onToggleLock={(id) => handleToggleLock(id)}
  onRename={(id, name) => handleRename(id, name)}
  onClose={() => handleClose()}
/>
```

#### 功能
- 图层列表显示（按 z-index 顺序，最上层在列表顶部）
- 拖拽排序
- 锁定/解锁图层
- 显示/隐藏图层
- 双击重命名
- 点击选中对应元素
- Shift/Cmd+点击多选

## 相关需求

- Requirements 1.x: 海报画布基础
- Requirements 2.x: 元素操作
- Requirements 3.x-6.x: 元素类型（文字、图片、形状、背景）
- Requirements 7.x: 图层管理
- Requirements 8.x: 多页支持
- Requirements 9.x: 尺寸模板
- Requirements 10.x: 导出功能
- Requirements 11.x: 对齐辅助
