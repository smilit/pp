/**
 * Mock for @tauri-apps/plugin-dialog
 */

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  multiple?: boolean;
  directory?: boolean;
  recursive?: boolean;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

/**
 * Mock open function (file picker)
 */
export async function open(
  options?: OpenDialogOptions,
): Promise<string | string[] | null> {
  console.log("[Mock] Dialog open:", options);

  // 在浏览器中返回 null（用户取消）
  // 可以通过 prompt 来模拟用户输入
  if (options?.directory) {
    return "/mock/path/to/directory";
  }

  if (options?.multiple) {
    return ["/mock/path/to/file1.txt", "/mock/path/to/file2.txt"];
  }

  return "/mock/path/to/file.txt";
}

/**
 * Mock save function
 */
export async function save(
  options?: SaveDialogOptions,
): Promise<string | null> {
  console.log("[Mock] Dialog save:", options);
  return "/mock/path/to/saved/file.txt";
}
