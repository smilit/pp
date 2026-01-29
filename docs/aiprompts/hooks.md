# React Hooks

## 概述

自定义 Hooks 封装业务逻辑，通过 Tauri invoke 与后端通信。

## 目录结构

```
src/hooks/
├── index.ts                # 导出入口
├── useProviderPool.ts      # 凭证池管理
├── useOAuthCredentials.ts  # OAuth 凭证
├── useFlowEvents.ts        # 流量事件
├── useMcpServers.ts        # MCP 服务器
├── useDeepLink.ts          # Deep Link 处理
├── useSound.ts             # 音效管理
└── useTauri.ts             # Tauri 通用
```

## 核心 Hooks

### useProviderPool

```typescript
export function useProviderPool() {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(false);
    
    const refresh = async () => {
        setLoading(true);
        const list = await invoke<Credential[]>('list_credentials');
        setCredentials(list);
        setLoading(false);
    };
    
    const addCredential = async (provider: string, path: string) => {
        await invoke('add_credential', { provider, filePath: path });
        await refresh();
    };
    
    const removeCredential = async (id: string) => {
        await invoke('remove_credential', { id });
        await refresh();
    };
    
    useEffect(() => { refresh(); }, []);
    
    return { credentials, loading, addCredential, removeCredential, refresh };
}
```

### useFlowEvents

```typescript
export function useFlowEvents() {
    const [records, setRecords] = useState<FlowRecord[]>([]);
    
    useEffect(() => {
        const unlisten = listen<FlowEvent>('flow-event', (event) => {
            setRecords(prev => [event.payload.data, ...prev].slice(0, 100));
        });
        
        return () => { unlisten.then(fn => fn()); };
    }, []);
    
    return { records };
}
```

### useDeepLink

```typescript
export function useDeepLink() {
    useEffect(() => {
        const unlisten = listen<string>('deep-link', async (event) => {
            const url = new URL(event.payload);
            
            if (url.pathname === '/oauth/callback') {
                await handleOAuthCallback(url.searchParams);
            }
        });
        
        return () => { unlisten.then(fn => fn()); };
    }, []);
}
```

## Hook 规范

### 命名约定

- 以 `use` 开头
- 描述功能: `useProviderPool`, `useFlowEvents`

### 返回值

```typescript
// 返回对象，包含状态和操作
return {
    // 状态
    data,
    loading,
    error,
    
    // 操作
    refresh,
    add,
    remove,
};
```

## 相关文档

- [components.md](components.md) - 组件系统
- [commands.md](commands.md) - Tauri 命令
