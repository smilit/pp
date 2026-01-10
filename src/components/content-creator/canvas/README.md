# 画布模块 (canvas)

> 版本: 1.2.0
> 更新: 2026-01-11

## 模块说明

画布模块提供内容创作的可视化编辑和预览功能，支持多种画布类型。采用工厂模式，根据主题自动选择对应的画布组件。

## 目录结构

```
canvas/
├── CanvasFactory.tsx        # 画布工厂组件（根据主题动态渲染）
├── document/                # 文档画布
│   ├── hooks/               # 状态管理 Hooks
│   ├── platforms/           # 平台样式渲染器
│   ├── DocumentCanvas.tsx   # 画布主组件
│   ├── DocumentToolbar.tsx  # 工具栏组件
│   ├── DocumentRenderer.tsx # 渲染器组件
│   ├── DocumentEditor.tsx   # 编辑器组件
│   ├── PlatformTabs.tsx     # 平台切换标签
│   ├── VersionSelector.tsx  # 版本选择器
│   ├── types.ts             # 类型定义
│   └── index.tsx            # 导出入口
└── poster/                  # 海报画布（基于 Fabric.js）
    ├── hooks/               # 状态管理 Hooks
    ├── elements/            # 元素组件（文字、图片、形状、背景）
    ├── utils/               # 工具函数（对齐、图层、样式）
    ├── PosterCanvas.tsx     # 画布主组件
    ├── PosterToolbar.tsx    # 顶部工具栏
    ├── ElementToolbar.tsx   # 元素工具栏
    ├── LayerPanel.tsx       # 图层面板
    ├── PageList.tsx         # 页面列表
    ├── SizeSelector.tsx     # 尺寸选择器
    ├── registerPosterCanvas.ts # 画布注册
    ├── types.ts             # 类型定义
    └── index.tsx            # 导出入口
```

## 画布类型

| 类型 | 说明 | 支持主题 |
|------|------|---------|
| `document` | 文档画布 | 社媒内容、办公文档 |
| `poster` | 海报画布 | 图文海报 |

## 使用示例

### 使用画布工厂（推荐）

```tsx
import {
  CanvasFactory,
  createInitialCanvasState,
  isCanvasSupported,
  type CanvasStateUnion,
} from './canvas/CanvasFactory'

function MyPage() {
  const theme = 'poster' // 或 'social-media', 'document'
  const [state, setState] = useState<CanvasStateUnion | null>(() =>
    createInitialCanvasState(theme)
  )

  if (!state || !isCanvasSupported(theme)) return null

  return (
    <CanvasFactory
      theme={theme}
      state={state}
      onStateChange={setState}
      onClose={() => console.log('关闭画布')}
    />
  )
}
```

### 直接使用文档画布

```tsx
import { DocumentCanvas, createInitialDocumentState } from './canvas/document'

function MyPage() {
  const [state, setState] = useState(() => createInitialDocumentState('# Hello'))

  return (
    <DocumentCanvas
      state={state}
      onStateChange={setState}
      onClose={() => console.log('关闭画布')}
    />
  )
}
```

### 直接使用海报画布

```tsx
import { PosterCanvas, createInitialPosterState } from './canvas/poster'

function MyPage() {
  const [state, setState] = useState(() => createInitialPosterState(1080, 1080))

  return (
    <PosterCanvas
      state={state}
      onStateChange={setState}
      onClose={() => console.log('关闭画布')}
    />
  )
}
```

## 扩展画布

添加新画布类型时：

1. 在 `canvas/` 下创建新目录
2. 实现画布组件和类型定义
3. 在 `CanvasFactory.tsx` 中添加主题映射和渲染逻辑
