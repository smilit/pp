# VDOM 模块

终端内嵌虚拟 DOM 支持模块。

## 概述

本模块实现终端的 VDOM 模式，允许在终端内嵌入 React 组件，实现丰富的交互式 UI。

## 文件索引

| 文件 | 描述 |
|------|------|
| `types.ts` | VDOM 类型定义 |
| `store.ts` | VDOM 状态管理（Jotai 原子） |
| `index.ts` | 模块导出 |

## 功能特性

### 终端模式切换
- 支持 `term`（终端）和 `vdom`（虚拟 DOM）两种模式
- 通过 `term:mode` 配置或 UI 按钮切换

### VDOM 块
- 支持在终端内嵌入多个 VDOM 块
- 每个块可配置标题、位置、大小
- 支持关闭、拖拽、调整大小（可配置）

### 焦点管理
- 独立的焦点管理系统
- 支持键盘导航
- Escape 键关闭当前块

### 工具栏
- 支持顶部/底部工具栏
- 可配置工具栏项目

## 使用示例

```tsx
import { TerminalView } from "@/components/terminal";

// 启用 VDOM 模式切换
<TerminalView
  blockId="session-1"
  tabId="tab-1"
  showModeSwitch={true}
  initialTermMode="term"
  onModeChange={(mode) => console.log("模式切换:", mode)}
/>
```

## 需求追溯

- Requirements 14.1: 终端模式配置
- Requirements 14.2: 模式切换 UI
- Requirements 14.3: VDOM 块渲染
- Requirements 14.4: 焦点管理
- Requirements 14.5: 块关闭自动切换
