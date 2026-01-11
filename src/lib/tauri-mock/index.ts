/**
 * Tauri Mock System - 统一入口
 *
 * 在浏览器开发模式下拦截所有 @tauri-apps/* 包的导入
 * 并提供 mock 实现
 */

// 检查是否在 Tauri 环境中
export function isTauriAvailable(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

// 初始化 mock 系统
export function initMockSystem() {
  if (isTauriAvailable()) {
    console.log("[Mock] Running in Tauri environment, skipping mock");
    return;
  }

  console.log("[Mock] Initializing Tauri Mock System for web mode");
  console.log("[Mock] Running in WEB MODE - some features may not work");
  console.log("[Mock] For full functionality, run: pnpm run tauri:dev");
}

// 自动初始化
if (import.meta.env.DEV && !isTauriAvailable()) {
  initMockSystem();
}

// 导出所有 mock 模块
export * from "./core";
export * from "./event";
export * from "./window";

// 导出插件模块，使用别名避免命名冲突
export { open as openFileDialog, save as saveDialog } from "./plugin-dialog";
export { open as openShell } from "./plugin-shell";
export * from "./plugin-deep-link";
export * from "./plugin-global-shortcut";
