# terminal

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 概述

终端核心库模块，提供终端主题配置和状态管理功能。

## 文件索引

- `themes.ts` - 终端主题配置（Tokyo Night, Dracula, One Dark 等）
- `store/` - 终端状态管理（Jotai 原子）

## 子目录

### store/

终端状态管理模块，使用 Jotai 进行原子化状态管理。

详见 [store/README.md](./store/README.md)

## 功能

### 主题系统

提供多种预定义终端主题：
- Tokyo Night（默认）
- Dracula
- One Dark
- GitHub Dark
- Monokai
- Nord
- Solarized Dark
- Gruvbox Dark

### 状态管理

使用 Jotai 管理终端状态：
- 终端模式（term/vdom）
- 连接状态
- 字体大小
- 主题配置
- Shell 进程状态

## 使用示例

```typescript
// 主题
import { getTheme, loadThemePreference } from "@/lib/terminal/themes";
const theme = getTheme("tokyo-night");

// 状态管理
import { termModeAtomFamily, connStatusAtomFamily } from "@/lib/terminal/store";
```
