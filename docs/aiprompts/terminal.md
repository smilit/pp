# 内置终端

## 概述

内置终端模块提供 PTY 管理和会话管理功能。

## 目录结构

```
src-tauri/src/terminal/
├── mod.rs          # 模块入口
├── pty.rs          # PTY 管理
├── session.rs      # 会话管理
└── commands.rs     # 终端命令

src/components/terminal/
├── Terminal.tsx    # 终端组件
└── TerminalTabs.tsx # 多标签管理
```

## PTY 管理

```rust
pub struct PtyManager {
    sessions: HashMap<String, PtySession>,
}

pub struct PtySession {
    id: String,
    master: PtyMaster,
    child: Child,
}

impl PtyManager {
    /// 创建新会话
    pub fn create_session(&mut self, shell: &str) -> Result<String>;
    
    /// 写入数据
    pub fn write(&self, session_id: &str, data: &[u8]) -> Result<()>;
    
    /// 读取输出
    pub fn read(&self, session_id: &str) -> Result<Vec<u8>>;
    
    /// 调整大小
    pub fn resize(&self, session_id: &str, cols: u16, rows: u16) -> Result<()>;
    
    /// 关闭会话
    pub fn close_session(&mut self, session_id: &str) -> Result<()>;
}
```

## 前端组件

```tsx
// src/components/terminal/Terminal.tsx
export function Terminal({ sessionId }: { sessionId: string }) {
    const termRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm>();
    
    useEffect(() => {
        const xterm = new XTerm();
        xterm.open(termRef.current!);
        xtermRef.current = xterm;
        
        // 监听输出
        listen(`terminal-output-${sessionId}`, (event) => {
            xterm.write(event.payload);
        });
        
        // 发送输入
        xterm.onData((data) => {
            invoke('terminal_write', { sessionId, data });
        });
        
        return () => xterm.dispose();
    }, [sessionId]);
    
    return <div ref={termRef} className="h-full" />;
}
```

## Tauri 命令

```rust
#[tauri::command]
async fn terminal_create(shell: Option<String>) -> Result<String, String>;

#[tauri::command]
async fn terminal_write(session_id: String, data: String) -> Result<(), String>;

#[tauri::command]
async fn terminal_resize(session_id: String, cols: u16, rows: u16) -> Result<(), String>;

#[tauri::command]
async fn terminal_close(session_id: String) -> Result<(), String>;
```

## 相关文档

- [commands.md](commands.md) - Tauri 命令
- [components.md](components.md) - 组件系统
