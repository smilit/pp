/**
 * Mock for @tauri-apps/api/window
 */

import { emit } from "./event";

export interface WindowOptions {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  title?: string;
  visible?: boolean;
  resizable?: boolean;
  decorations?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  fullscreen?: boolean;
  maximized?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  center?: boolean;
}

class MockWindow {
  label: string;
  options: WindowOptions;

  constructor(label: string, options: WindowOptions = {}) {
    this.label = label;
    this.options = options;
  }

  async emit(event: string, payload?: any): Promise<void> {
    console.log(`[Mock] Window ${this.label} emit: ${event}`, payload);
    return emit(event, payload);
  }

  async listen(event: string, handler: any): Promise<() => void> {
    console.log(`[Mock] Window ${this.label} listen: ${event}`);
    const { listen } = await import("./event");
    return listen(event, handler);
  }

  // 窗口控制方法
  async show(): Promise<void> {
    console.log(`[Mock] Window ${this.label} show`);
    this.options.visible = true;
  }

  async hide(): Promise<void> {
    console.log(`[Mock] Window ${this.label} hide`);
    this.options.visible = false;
  }

  async close(): Promise<void> {
    console.log(`[Mock] Window ${this.label} close`);
  }

  async minimize(): Promise<void> {
    console.log(`[Mock] Window ${this.label} minimize`);
  }

  async maximize(): Promise<void> {
    console.log(`[Mock] Window ${this.label} maximize`);
    this.options.maximized = true;
  }

  async unmaximize(): Promise<void> {
    console.log(`[Mock] Window ${this.label} unmaximize`);
    this.options.maximized = false;
  }

  async center(): Promise<void> {
    console.log(`[Mock] Window ${this.label} center`);
  }

  async setTitle(title: string): Promise<void> {
    console.log(`[Mock] Window ${this.label} setTitle: ${title}`);
    this.options.title = title;
  }

  async resize(width: number, height: number): Promise<void> {
    console.log(`[Mock] Window ${this.label} resize: ${width}x${height}`);
    this.options.width = width;
    this.options.height = height;
  }

  async setPosition(x: number, y: number): Promise<void> {
    console.log(`[Mock] Window ${this.label} setPosition: ${x},${y}`);
    this.options.x = x;
    this.options.y = y;
  }

  async isVisible(): Promise<boolean> {
    return this.options.visible ?? true;
  }

  async isMaximized(): Promise<boolean> {
    return this.options.maximized ?? false;
  }

  async isFullscreen(): Promise<boolean> {
    return this.options.fullscreen ?? false;
  }

  async isDecorated(): Promise<boolean> {
    return this.options.decorations ?? true;
  }

  async isResizable(): Promise<boolean> {
    return this.options.resizable ?? true;
  }

  async onFocusChanged(
    _handler: (focused: boolean) => void,
  ): Promise<() => void> {
    console.log(`[Mock] Window ${this.label} onFocusChanged`);
    // 返回 unlisten 函数
    return () => {};
  }

  async onScaleChanged(_handler: (scale: number) => void): Promise<() => void> {
    console.log(`[Mock] Window ${this.label} onScaleChanged`);
    return () => {};
  }

  async onThemeChanged(_handler: (theme: string) => void): Promise<() => void> {
    console.log(`[Mock] Window ${this.label} onThemeChanged`);
    return () => {};
  }
}

// 当前窗口实例
let currentWindow: MockWindow | null = null;

export function getCurrentWindow(): MockWindow {
  if (!currentWindow) {
    currentWindow = new MockWindow("main", { visible: true });
  }
  return currentWindow;
}

export function getAllWindows(): MockWindow[] {
  return [getCurrentWindow()];
}

export async function getCurrentWindowLabel(): Promise<string> {
  return getCurrentWindow().label;
}

// 导出常用函数
export const appWindow = getCurrentWindow();
