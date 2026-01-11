/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import { fileURLToPath } from "url";

// ES 模块中获取 __dirname 的方式
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 获取 Tauri mock 目录路径
const tauriMockDir = path.resolve(__dirname, "./src/lib/tauri-mock");

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // 开发模式下启用 jsxDev 以获取组件源码位置
      jsxRuntime: mode === "development" ? "automatic" : "automatic",
      jsxImportSource: "react",
    }),
    svgr(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // 拦截所有 @tauri-apps/* 导入，重定向到 mock 模块
      // 这样在浏览器开发模式下可以使用 mock 实现
      "@tauri-apps/api/core": path.resolve(tauriMockDir, "core.ts"),
      "@tauri-apps/api/event": path.resolve(tauriMockDir, "event.ts"),
      "@tauri-apps/api/window": path.resolve(tauriMockDir, "window.ts"),
      "@tauri-apps/api/app": path.resolve(tauriMockDir, "window.ts"),
      "@tauri-apps/api/path": path.resolve(tauriMockDir, "window.ts"),
      // 拦截 Tauri 插件
      "@tauri-apps/plugin-dialog": path.resolve(tauriMockDir, "plugin-dialog.ts"),
      "@tauri-apps/plugin-shell": path.resolve(tauriMockDir, "plugin-shell.ts"),
      "@tauri-apps/plugin-deep-link": path.resolve(tauriMockDir, "plugin-deep-link.ts"),
      "@tauri-apps/plugin-global-shortcut": path.resolve(tauriMockDir, "plugin-global-shortcut.ts"),
    },
  },
  optimizeDeps: {
    // 排除 Tauri 包的预构建，确保 alias 生效
    exclude: [
      "@tauri-apps/api",
      "@tauri-apps/plugin-dialog",
      "@tauri-apps/plugin-shell",
      "@tauri-apps/plugin-deep-link",
      "@tauri-apps/plugin-global-shortcut",
    ],
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: false,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/scripts/playwright-login/**",
      "**/src-tauri/**",
    ],
  },
}));
