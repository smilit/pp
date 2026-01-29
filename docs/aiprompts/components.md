# 组件系统

## 概述

React 组件层，使用 TailwindCSS 和 shadcn/ui。

## 目录结构

```
src/components/
├── ui/                 # 基础 UI 组件 (shadcn/ui)
├── provider-pool/      # 凭证池管理
├── flow-monitor/       # 流量监控
├── general-chat/       # 通用对话
├── terminal/           # 内置终端
├── mcp/                # MCP 服务器
├── settings/           # 设置页面
└── AppSidebar.tsx      # 全局侧边栏
```

## 核心组件

### AppSidebar

全局图标侧边栏，类似 cherry-studio 风格。

```tsx
// src/components/AppSidebar.tsx
export function AppSidebar() {
    return (
        <aside className="w-14 bg-sidebar">
            <nav className="flex flex-col items-center gap-2">
                <SidebarItem icon={Home} to="/" />
                <SidebarItem icon={MessageSquare} to="/chat" />
                <SidebarItem icon={Settings} to="/settings" />
            </nav>
        </aside>
    );
}
```

### ProviderPool

凭证池管理组件。

```tsx
// src/components/provider-pool/ProviderPoolPanel.tsx
export function ProviderPoolPanel() {
    const { credentials, addCredential, removeCredential } = useProviderPool();
    
    return (
        <div className="space-y-4">
            <CredentialList credentials={credentials} onRemove={removeCredential} />
            <AddCredentialDialog onAdd={addCredential} />
        </div>
    );
}
```

### FlowMonitor

流量监控组件。

```tsx
// src/components/flow-monitor/FlowMonitorPanel.tsx
export function FlowMonitorPanel() {
    const { records, stats, query } = useFlowMonitor();
    
    return (
        <div className="flex flex-col h-full">
            <FlowStats stats={stats} />
            <FlowTable records={records} />
            <FlowPagination query={query} />
        </div>
    );
}
```

## 组件规范

### 文件命名

- 组件文件: `PascalCase.tsx`
- Hook 文件: `useCamelCase.ts`
- 工具文件: `camelCase.ts`

### 组件结构

```tsx
// 标准组件结构
interface Props {
    // props 定义
}

export function ComponentName({ prop1, prop2 }: Props) {
    // hooks
    const [state, setState] = useState();
    
    // handlers
    const handleClick = () => {};
    
    // render
    return (
        <div>
            {/* JSX */}
        </div>
    );
}
```

## 相关文档

- [hooks.md](hooks.md) - React Hooks
- [lib.md](lib.md) - 工具库
