/**
 * @file hooks.ts
 * @description 终端状态管理 React Hooks
 * @module lib/terminal/store/hooks
 *
 * 提供 React Hooks 用于在组件中使用终端状态和事件订阅。
 *
 * _Requirements: 9.6_
 */

import { useEffect, useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  termModeAtomFamily,
  connStatusAtomFamily,
  fontSizeAtomFamily,
  termThemeNameAtomFamily,
  shellProcStatusAtomFamily,
  shellProcFullStatusAtomFamily,
  setTermModeAtom,
  setConnStatusAtom,
  setFontSizeAtom,
  setThemeNameAtom,
  setShellProcFullStatusAtom,
  cleanupTerminalStateAtom,
  connStatusMapAtom,
  updateConnStatusMapAtom,
} from "./atoms";
import type { TermMode, ConnStatus } from "./types";
import {
  terminalEventManager,
  type ControllerStatusHandler,
  type ConnChangeHandler,
} from "./events";

// ============================================================================
// 终端状态 Hooks
// ============================================================================

/**
 * 使用终端模式状态
 *
 * @param blockId - 块 ID
 * @returns [termMode, setTermMode]
 */
export function useTermMode(blockId: string) {
  const termMode = useAtomValue(termModeAtomFamily(blockId));
  const setTermModeAction = useSetAtom(setTermModeAtom);

  const setTermMode = useCallback(
    (mode: TermMode) => {
      setTermModeAction({ blockId, mode });
    },
    [blockId, setTermModeAction],
  );

  return [termMode, setTermMode] as const;
}

/**
 * 使用连接状态
 *
 * @param blockId - 块 ID
 * @returns [connStatus, setConnStatus]
 */
export function useConnStatus(blockId: string) {
  const connStatus = useAtomValue(connStatusAtomFamily(blockId));
  const setConnStatusAction = useSetAtom(setConnStatusAtom);

  const setConnStatus = useCallback(
    (status: ConnStatus) => {
      setConnStatusAction({ blockId, status });
    },
    [blockId, setConnStatusAction],
  );

  return [connStatus, setConnStatus] as const;
}

/**
 * 使用字体大小状态
 *
 * @param blockId - 块 ID
 * @returns [fontSize, setFontSize]
 */
export function useFontSize(blockId: string) {
  const fontSize = useAtomValue(fontSizeAtomFamily(blockId));
  const setFontSizeAction = useSetAtom(setFontSizeAtom);

  const setFontSize = useCallback(
    (size: number) => {
      setFontSizeAction({ blockId, fontSize: size });
    },
    [blockId, setFontSizeAction],
  );

  return [fontSize, setFontSize] as const;
}

/**
 * 使用主题名称状态
 *
 * @param blockId - 块 ID
 * @returns [themeName, setThemeName]
 */
export function useThemeName(blockId: string) {
  const themeName = useAtomValue(termThemeNameAtomFamily(blockId));
  const setThemeNameAction = useSetAtom(setThemeNameAtom);

  const setThemeName = useCallback(
    (name: string) => {
      setThemeNameAction({ blockId, themeName: name });
    },
    [blockId, setThemeNameAction],
  );

  return [themeName, setThemeName] as const;
}

/**
 * 使用 Shell 进程状态
 *
 * @param blockId - 块 ID
 * @returns shellProcStatus
 */
export function useShellProcStatus(blockId: string) {
  return useAtomValue(shellProcStatusAtomFamily(blockId));
}

/**
 * 使用完整的控制器运行时状态
 *
 * @param blockId - 块 ID
 * @returns runtimeStatus
 */
export function useShellProcFullStatus(blockId: string) {
  return useAtomValue(shellProcFullStatusAtomFamily(blockId));
}

// ============================================================================
// 事件订阅 Hooks
// ============================================================================

/**
 * 订阅控制器状态事件并自动更新原子状态
 *
 * 在组件挂载时订阅事件，卸载时自动取消订阅。
 *
 * @param blockId - 块 ID
 *
 * _Requirements: 9.6_
 */
export function useControllerStatusSync(blockId: string) {
  const setShellProcFullStatus = useSetAtom(setShellProcFullStatusAtom);

  useEffect(() => {
    const handler: ControllerStatusHandler = (event) => {
      if (event.blockId === blockId) {
        setShellProcFullStatus({
          blockId,
          status: {
            blockId: event.blockId,
            version: event.version,
            shellProcStatus: event.shellProcStatus,
            shellProcConnName: event.shellProcConnName,
            shellProcExitCode: event.shellProcExitCode,
          },
        });
      }
    };

    const unsubscribe = terminalEventManager.onBlockControllerStatus(
      blockId,
      handler,
    );

    return () => {
      unsubscribe();
    };
  }, [blockId, setShellProcFullStatus]);
}

/**
 * 订阅连接状态变更事件并自动更新原子状态
 *
 * @param blockId - 块 ID
 * @param connection - 连接名称（可选，如果提供则只监听该连接）
 *
 * _Requirements: 9.6_
 */
export function useConnStatusSync(blockId: string, connection?: string) {
  const setConnStatus = useSetAtom(setConnStatusAtom);
  const updateConnStatusMap = useSetAtom(updateConnStatusMapAtom);

  useEffect(() => {
    const handler: ConnChangeHandler = (event) => {
      // 更新全局连接状态映射
      updateConnStatusMap({
        connection: event.connection,
        status: event.status,
      });

      // 如果指定了连接名称，只更新匹配的块
      if (!connection || event.connection === connection) {
        setConnStatus({ blockId, status: event.status });
      }
    };

    let unsubscribe: () => void;
    if (connection) {
      unsubscribe = terminalEventManager.onConnectionStatus(
        connection,
        handler,
      );
    } else {
      unsubscribe = terminalEventManager.onConnChange(handler);
    }

    return () => {
      unsubscribe();
    };
  }, [blockId, connection, setConnStatus, updateConnStatusMap]);
}

/**
 * 综合使用终端状态和事件订阅
 *
 * 自动订阅控制器状态和连接状态事件，并在组件卸载时清理。
 *
 * @param blockId - 块 ID
 * @param connection - 连接名称（可选）
 *
 * _Requirements: 9.6_
 */
export function useTerminalState(blockId: string, connection?: string) {
  // 订阅事件
  useControllerStatusSync(blockId);
  useConnStatusSync(blockId, connection);

  // 返回状态
  const termMode = useAtomValue(termModeAtomFamily(blockId));
  const connStatus = useAtomValue(connStatusAtomFamily(blockId));
  const fontSize = useAtomValue(fontSizeAtomFamily(blockId));
  const themeName = useAtomValue(termThemeNameAtomFamily(blockId));
  const shellProcStatus = useAtomValue(shellProcStatusAtomFamily(blockId));
  const runtimeStatus = useAtomValue(shellProcFullStatusAtomFamily(blockId));

  return {
    termMode,
    connStatus,
    fontSize,
    themeName,
    shellProcStatus,
    runtimeStatus,
  };
}

/**
 * 清理终端状态
 *
 * 在终端关闭时调用，清理相关的原子状态。
 *
 * @returns cleanup 函数
 */
export function useTerminalCleanup() {
  const cleanup = useSetAtom(cleanupTerminalStateAtom);
  return cleanup;
}

// ============================================================================
// 全局事件管理 Hook
// ============================================================================

/**
 * 初始化终端事件管理器
 *
 * 应在应用根组件中调用一次。
 *
 * _Requirements: 9.6_
 */
export function useTerminalEventManager() {
  useEffect(() => {
    // 初始化事件管理器
    terminalEventManager.initialize().catch((error) => {
      console.error("[useTerminalEventManager] 初始化失败:", error);
    });

    return () => {
      // 组件卸载时不销毁事件管理器，因为它是全局的
      // 只有在应用退出时才需要销毁
    };
  }, []);
}

/**
 * 获取所有连接状态映射
 *
 * @returns 连接状态映射
 */
export function useConnStatusMap() {
  return useAtomValue(connStatusMapAtom);
}

// ============================================================================
// 多输入模式 Hooks
// _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
// ============================================================================

import {
  multiInputEnabledAtomFamily,
  broadcastableTerminalsAtomFamily,
  toggleMultiInputAtom,
  registerTerminalAtom,
  unregisterTerminalAtom,
  broadcastInput,
  type TerminalInfo,
} from "./multiInput";

/**
 * 使用多输入模式状态
 *
 * @param tabId - 标签页 ID
 * @returns [enabled, toggle]
 *
 * _Requirements: 10.3, 10.4, 10.5_
 */
export function useMultiInput(tabId: string) {
  const enabled = useAtomValue(multiInputEnabledAtomFamily(tabId));
  const toggle = useSetAtom(toggleMultiInputAtom);

  const toggleMultiInput = useCallback(() => {
    toggle(tabId);
  }, [tabId, toggle]);

  return [enabled, toggleMultiInput] as const;
}

/**
 * 使用可广播的终端列表
 *
 * @param tabId - 标签页 ID
 * @returns 可广播的终端列表
 *
 * _Requirements: 10.2_
 */
export function useBroadcastableTerminals(tabId: string) {
  return useAtomValue(broadcastableTerminalsAtomFamily(tabId));
}

/**
 * 注册终端到多输入系统
 *
 * 在终端组件挂载时调用，卸载时自动取消注册。
 *
 * @param terminal - 终端信息
 *
 * _Requirements: 10.1_
 */
export function useRegisterTerminal(terminal: TerminalInfo) {
  const register = useSetAtom(registerTerminalAtom);
  const unregister = useSetAtom(unregisterTerminalAtom);

  useEffect(() => {
    register(terminal);

    return () => {
      unregister({ tabId: terminal.tabId, blockId: terminal.blockId });
    };
  }, [
    terminal.blockId,
    terminal.tabId,
    terminal.isBasicTerminal,
    terminal.isActive,
    register,
    unregister,
    terminal,
  ]);
}

/**
 * 使用多输入广播功能
 *
 * @param tabId - 标签页 ID
 * @param currentBlockId - 当前终端的块 ID
 * @returns 广播输入函数
 *
 * _Requirements: 10.1_
 */
export function useMultiInputBroadcast(tabId: string, _currentBlockId: string) {
  const multiInputEnabled = useAtomValue(multiInputEnabledAtomFamily(tabId));
  const broadcastableTerminals = useAtomValue(
    broadcastableTerminalsAtomFamily(tabId),
  );

  const broadcast = useCallback(
    async (data: string) => {
      if (multiInputEnabled && broadcastableTerminals.length > 0) {
        // 多输入模式：广播到所有基础终端
        return broadcastInput(tabId, data, broadcastableTerminals);
      }
      return 0;
    },
    [tabId, multiInputEnabled, broadcastableTerminals],
  );

  return {
    multiInputEnabled,
    broadcastableTerminals,
    broadcast,
  };
}
