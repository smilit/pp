# terminal/store

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 概述

终端状态管理模块，使用 Jotai 进行原子化状态管理。为每个终端维护独立的原子状态，支持后端事件订阅和自动状态同步。

## 架构说明

采用 Jotai 的 atomFamily 模式，按 blockId 索引每个终端的状态：

```
┌─────────────────────────────────────────────────────────┐
│                    Jotai Store                          │
├─────────────────────────────────────────────────────────┤
│  termModeAtomFamily(blockId)      → TermMode            │
│  connStatusAtomFamily(blockId)    → ConnStatus          │
│  fontSizeAtomFamily(blockId)      → number              │
│  termThemeNameAtomFamily(blockId) → string              │
│  shellProcStatusAtomFamily(blockId) → ShellProcStatus   │
│  shellProcFullStatusAtomFamily(blockId) → RuntimeStatus │
├─────────────────────────────────────────────────────────┤
│  connStatusMapAtom                → Map<string, Status> │
│  defaultFontSizeAtom              → number (持久化)      │
│  defaultThemeNameAtom             → string (持久化)      │
└─────────────────────────────────────────────────────────┘
                          ↑
                          │ 事件订阅
                          │
┌─────────────────────────────────────────────────────────┐
│              TerminalEventManager                       │
├─────────────────────────────────────────────────────────┤
│  controller:status  → 控制器状态更新                     │
│  terminal:conn-change → 连接状态变更                     │
└─────────────────────────────────────────────────────────┘
```

## 文件索引

- `index.ts` - 模块入口，导出所有公共 API
- `types.ts` - 类型定义（TermMode, ConnStatus, ShellProcStatus 等）
- `atoms.ts` - Jotai 原子定义（状态原子和操作原子）
- `events.ts` - 后端事件订阅和状态同步
- `hooks.ts` - React Hooks（useTermMode, useConnStatus, useMultiInput 等）
- `viewmodel.ts` - TermViewModel 视图模型，封装终端视图的状态和操作
- `multiInput.ts` - 多输入模式状态管理和输入广播逻辑

## 核心功能

### 状态原子

| 原子 | 类型 | 说明 |
|------|------|------|
| `termModeAtomFamily` | `TermMode` | 终端模式（term/vdom） |
| `connStatusAtomFamily` | `ConnStatus` | 连接状态详情 |
| `fontSizeAtomFamily` | `number` | 字体大小 |
| `termThemeNameAtomFamily` | `string` | 主题名称 |
| `shellProcStatusAtomFamily` | `ShellProcStatus` | Shell 进程状态 |
| `shellProcFullStatusAtomFamily` | `BlockControllerRuntimeStatus` | 完整运行时状态 |

### 事件订阅

- `subscribeControllerStatus` - 订阅控制器状态事件
- `subscribeConnChange` - 订阅连接状态变更事件
- `TerminalEventManager` - 统一的事件管理器

### React Hooks

- `useTermMode` - 使用终端模式状态
- `useConnStatus` - 使用连接状态
- `useFontSize` - 使用字体大小状态
- `useThemeName` - 使用主题名称状态
- `useShellProcStatus` - 使用 Shell 进程状态
- `useTerminalState` - 综合使用终端状态和事件订阅
- `useTerminalEventManager` - 初始化事件管理器
- `useMultiInput` - 使用多输入模式状态
- `useBroadcastableTerminals` - 获取可广播的终端列表
- `useRegisterTerminal` - 注册终端到多输入系统
- `useMultiInputBroadcast` - 使用多输入广播功能

### TermViewModel

- `createTermViewModel` - 创建终端视图模型
- `getOrCreateTermViewModel` - 获取或创建终端视图模型
- `cleanupTermViewModel` - 清理终端视图模型
- `termViewModelAtomFamily` - TermViewModel 原子族

## 使用示例

```typescript
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  termModeAtomFamily,
  connStatusAtomFamily,
  setTermModeAtom,
  terminalEventManager,
} from "@/lib/terminal/store";

// 在组件中使用
function TerminalView({ blockId }: { blockId: string }) {
  // 读取状态
  const termMode = useAtomValue(termModeAtomFamily(blockId));
  const connStatus = useAtomValue(connStatusAtomFamily(blockId));

  // 更新状态
  const setTermMode = useSetAtom(setTermModeAtom);
  const handleModeChange = () => {
    setTermMode({ blockId, mode: "vdom" });
  };

  return <div>...</div>;
}

// 初始化事件订阅（在应用启动时）
await terminalEventManager.initialize();
```

## 需求追溯

- _Requirements: 9.1_ - 使用 Jotai 进行原子化状态管理
- _Requirements: 9.2_ - termModeAtom
- _Requirements: 9.3_ - connStatusAtom
- _Requirements: 9.4_ - fontSizeAtom, termThemeNameAtom
- _Requirements: 9.5_ - shellProcStatusAtom
- _Requirements: 9.6_ - 事件订阅和状态同步
- _Requirements: 9.7_ - TermViewModel 视图模型
- _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_ - 多输入模式
