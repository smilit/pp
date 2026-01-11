/**
 * Mock for @tauri-apps/plugin-global-shortcut
 */

type ShortcutHandler = () => void;

// 存储快捷键监听器
const shortcuts = new Map<string, ShortcutHandler>();

/**
 * Mock register function
 */
export async function register(
  shortcut: string,
  handler: ShortcutHandler,
): Promise<void> {
  console.log(`[Mock] Global shortcut registered: ${shortcut}`);
  shortcuts.set(shortcut, handler);
}

/**
 * Mock unregister function
 */
export async function unregister(shortcut: string): Promise<void> {
  console.log(`[Mock] Global shortcut unregistered: ${shortcut}`);
  shortcuts.delete(shortcut);
}

/**
 * Mock unregisterAll function
 */
export async function unregisterAll(): Promise<void> {
  console.log("[Mock] All global shortcuts unregistered");
  shortcuts.clear();
}

/**
 * Mock isRegistered function
 */
export async function isRegistered(shortcut: string): Promise<boolean> {
  return shortcuts.has(shortcut);
}

/**
 * 手动触发快捷键（用于测试）
 */
export function triggerShortcut(shortcut: string) {
  const handler = shortcuts.get(shortcut);
  if (handler) {
    console.log(`[Mock] Triggering shortcut: ${shortcut}`);
    handler();
  } else {
    console.warn(`[Mock] Shortcut not found: ${shortcut}`);
  }
}
