import { useState, useEffect, useCallback, useRef } from "react";
import {
  configEventManager,
  ConfigChangeEvent,
  RoutingChangeEvent,
  InjectionChangeEvent,
  EndpointProvidersChangeEvent,
  ServerChangeEvent,
  LoggingChangeEvent,
  RetryChangeEvent,
  FullReloadEvent,
  CredentialPoolChangeEvent,
} from "@/lib/configEventManager";

interface UseConfigEventsOptions {
  /** 是否自动连接 */
  autoConnect?: boolean;
  /** 事件回调 */
  onFullReload?: (event: FullReloadEvent) => void;
  onRoutingChanged?: (event: RoutingChangeEvent) => void;
  onInjectionChanged?: (event: InjectionChangeEvent) => void;
  onEndpointProvidersChanged?: (event: EndpointProvidersChangeEvent) => void;
  onServerChanged?: (event: ServerChangeEvent) => void;
  onLoggingChanged?: (event: LoggingChangeEvent) => void;
  onRetryChanged?: (event: RetryChangeEvent) => void;
  onCredentialPoolChanged?: (event: CredentialPoolChangeEvent) => void;
  /** 通用事件回调（用于处理所有事件） */
  onAnyChange?: (event: ConfigChangeEvent) => void;
}

interface UseConfigEventsReturn {
  /** 连接状态 */
  connected: boolean;
  /** 是否正在连接 */
  connecting: boolean;
  /** 错误信息 */
  error: string | null;
  /** 手动连接 */
  connect: () => void;
  /** 手动断开 */
  disconnect: () => void;
  /** 最近的事件 */
  lastEvent: ConfigChangeEvent | null;
}

/**
 * 配置变更事件订阅 Hook
 *
 * 使用全局 ConfigEventManager 订阅配置变更事件，
 * 页面切换时不会丢失状态。
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { connected, lastEvent } = useConfigEvents({
 *     onRoutingChanged: (event) => {
 *       console.log('路由配置变更:', event);
 *       // 刷新相关数据
 *       refetchData();
 *     },
 *     onFullReload: () => {
 *       // 完整重载，刷新所有数据
 *       refetchAllData();
 *     },
 *   });
 *
 *   return <div>连接状态: {connected ? '已连接' : '未连接'}</div>;
 * }
 * ```
 */
export function useConfigEvents(
  options: UseConfigEventsOptions = {},
): UseConfigEventsReturn {
  const {
    autoConnect = true,
    onFullReload,
    onRoutingChanged,
    onInjectionChanged,
    onEndpointProvidersChanged,
    onServerChanged,
    onLoggingChanged,
    onRetryChanged,
    onCredentialPoolChanged,
    onAnyChange,
  } = options;

  // 从全局管理器获取初始状态
  const initialState = configEventManager.getState();

  const [connected, setConnected] = useState(initialState.subscribed);
  const [connecting, setConnecting] = useState(initialState.subscribing);
  const [error, setError] = useState<string | null>(initialState.error);
  const [lastEvent, setLastEvent] = useState<ConfigChangeEvent | null>(
    initialState.lastEvent,
  );

  const callbacksRef = useRef({
    onFullReload,
    onRoutingChanged,
    onInjectionChanged,
    onEndpointProvidersChanged,
    onServerChanged,
    onLoggingChanged,
    onRetryChanged,
    onCredentialPoolChanged,
    onAnyChange,
  });

  // 更新回调引用
  useEffect(() => {
    callbacksRef.current = {
      onFullReload,
      onRoutingChanged,
      onInjectionChanged,
      onEndpointProvidersChanged,
      onServerChanged,
      onLoggingChanged,
      onRetryChanged,
      onCredentialPoolChanged,
      onAnyChange,
    };
  }, [
    onFullReload,
    onRoutingChanged,
    onInjectionChanged,
    onEndpointProvidersChanged,
    onServerChanged,
    onLoggingChanged,
    onRetryChanged,
    onCredentialPoolChanged,
    onAnyChange,
  ]);

  // 处理事件
  const handleEvent = useCallback((event: ConfigChangeEvent) => {
    setLastEvent(event);

    // 调用通用回调
    callbacksRef.current.onAnyChange?.(event);

    // 根据事件类型调用对应回调
    switch (event.type) {
      case "FullReload":
        callbacksRef.current.onFullReload?.(event.data);
        break;
      case "RoutingChanged":
        callbacksRef.current.onRoutingChanged?.(event.data);
        break;
      case "InjectionChanged":
        callbacksRef.current.onInjectionChanged?.(event.data);
        break;
      case "EndpointProvidersChanged":
        callbacksRef.current.onEndpointProvidersChanged?.(event.data);
        break;
      case "ServerChanged":
        callbacksRef.current.onServerChanged?.(event.data);
        break;
      case "LoggingChanged":
        callbacksRef.current.onLoggingChanged?.(event.data);
        break;
      case "RetryChanged":
        callbacksRef.current.onRetryChanged?.(event.data);
        break;
      case "CredentialPoolChanged":
        callbacksRef.current.onCredentialPoolChanged?.(event.data);
        break;
    }
  }, []);

  // 连接
  const connect = useCallback(async () => {
    if (configEventManager.isSubscribed()) {
      setConnected(true);
      setConnecting(false);
      return;
    }

    setConnecting(true);
    setError(null);

    await configEventManager.subscribe();

    const state = configEventManager.getState();
    setConnected(state.subscribed);
    setConnecting(state.subscribing);
    setError(state.error);
    setLastEvent(state.lastEvent);
  }, []);

  // 断开（通常不需要调用，因为是全局订阅）
  const disconnect = useCallback(() => {
    // 注意：这会影响所有使用 useConfigEvents 的组件
    // 通常不应该调用这个方法
    configEventManager.unsubscribe();
    setConnected(false);
    setConnecting(false);
  }, []);

  // 注册回调并自动连接
  useEffect(() => {
    // 注册事件回调
    const removeCallback = configEventManager.addCallback(handleEvent);

    // 自动连接
    if (autoConnect) {
      connect();
    }

    // 同步状态
    const state = configEventManager.getState();
    setConnected(state.subscribed);
    setConnecting(state.subscribing);
    setError(state.error);
    setLastEvent(state.lastEvent);

    return () => {
      // 只移除回调，不取消订阅（保持全局订阅）
      removeCallback();
    };
  }, [autoConnect, connect, handleEvent]);

  return {
    connected,
    connecting,
    error,
    connect,
    disconnect,
    lastEvent,
  };
}

export default useConfigEvents;

// 重新导出类型
export type {
  ConfigChangeEvent,
  RoutingChangeEvent,
  InjectionChangeEvent,
  EndpointProvidersChangeEvent,
  ServerChangeEvent,
  LoggingChangeEvent,
  RetryChangeEvent,
  FullReloadEvent,
  CredentialPoolChangeEvent,
};
