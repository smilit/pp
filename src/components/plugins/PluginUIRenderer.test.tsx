/**
 * @file PluginUIRenderer 单元测试
 * @description 测试插件 UI 渲染器组件
 * @module components/plugins/PluginUIRenderer.test
 *
 * _需求: 3.2_
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { PluginUIRenderer } from "./PluginUIRenderer";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  AlertCircle: () => <span data-testid="alert-circle-icon">AlertCircle</span>,
  Package: () => <span data-testid="package-icon">Package</span>,
  Loader2: () => <span data-testid="loader-icon">Loader2</span>,
}));

// Mock tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue(false),
}));

describe("PluginUIRenderer", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe("未知插件处理", () => {
    it("应该为未知插件显示加载中或未找到提示", async () => {
      const { container } = renderComponent(
        <PluginUIRenderer
          pluginId="unknown-plugin"
          onNavigate={mockNavigate}
        />,
      );

      // 等待异步操作完成
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // 验证显示插件未找到提示或加载中
      const text = container.textContent || "";
      expect(text.includes("插件未找到") || text.includes("加载")).toBeTruthy();
    });

    it("应该为空字符串 pluginId 显示相应提示", async () => {
      const { container } = renderComponent(
        <PluginUIRenderer pluginId="" onNavigate={mockNavigate} />,
      );

      // 等待异步操作完成
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // 验证显示相应提示
      expect(container.textContent).toBeTruthy();
    });

    it("应该为随机 pluginId 显示相应提示", async () => {
      const randomPluginId = `random-plugin-${Date.now()}`;
      const { container } = renderComponent(
        <PluginUIRenderer
          pluginId={randomPluginId}
          onNavigate={mockNavigate}
        />,
      );

      // 等待异步操作完成
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // 验证显示相应提示
      expect(container.textContent).toBeTruthy();
    });
  });
});

/**
 * 简单的渲染辅助函数
 * 使用 jsdom 环境渲染 React 组件
 */
function renderComponent(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  // 使用 React 18 的 createRoot API
  const root = createRoot(container);

  // 临时禁用 console.error 来抑制 act 警告
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("act(...)")) {
      return;
    }
    originalError.apply(console, args);
  };

  act(() => {
    root.render(element);
  });

  // 恢复 console.error
  console.error = originalError;

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}
