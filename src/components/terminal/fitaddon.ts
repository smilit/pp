/**
 * @file fitaddon.ts
 * @description 自定义 FitAddon - 复制自 waveterm
 * @module components/terminal/fitaddon
 *
 * 修改自 xterm.js 官方 FitAddon，主要改动：
 * - 在 resize 前清除渲染服务
 * - 支持禁用滚动条宽度计算（macOS）
 */

import type { ITerminalAddon, Terminal } from "@xterm/xterm";

interface ITerminalDimensions {
  rows: number;
  cols: number;
}

interface IRenderDimensions {
  css: {
    cell: {
      width: number;
      height: number;
    };
  };
}

const MINIMUM_COLS = 2;
const MINIMUM_ROWS = 1;

export class FitAddon implements ITerminalAddon {
  private _terminal: Terminal | undefined;
  /** 是否禁用滚动条宽度计算（macOS 上设为 true） */
  public noScrollbar: boolean = false;

  public activate(terminal: Terminal): void {
    this._terminal = terminal;
  }

  public dispose(): void {}

  public fit(): void {
    const dims = this.proposeDimensions();
    if (!dims || !this._terminal || isNaN(dims.cols) || isNaN(dims.rows)) {
      return;
    }

    // 访问 xterm 内部 API
    const core = (this._terminal as any)._core;

    // 强制完整重新渲染
    if (
      this._terminal.rows !== dims.rows ||
      this._terminal.cols !== dims.cols
    ) {
      core._renderService.clear();
      this._terminal.resize(dims.cols, dims.rows);
    }
  }

  public proposeDimensions(): ITerminalDimensions | undefined {
    if (!this._terminal) {
      return undefined;
    }

    if (!this._terminal.element || !this._terminal.element.parentElement) {
      return undefined;
    }

    const core = (this._terminal as any)._core;

    if (!core._renderService) {
      return undefined;
    }

    const dims: IRenderDimensions = core._renderService.dimensions;

    // 检查字体是否已加载
    if (dims.css.cell.width === 0 || dims.css.cell.height === 0) {
      return undefined;
    }

    // 计算滚动条宽度
    let scrollbarWidth = 0;
    if (
      core.viewport &&
      core.viewport._viewportElement &&
      core.viewport._scrollArea
    ) {
      const measuredScrollBarWidth =
        core.viewport._viewportElement.offsetWidth -
        core.viewport._scrollArea.offsetWidth;
      scrollbarWidth =
        this._terminal.options.scrollback === 0 ? 0 : measuredScrollBarWidth;
    }
    if (this.noScrollbar) {
      scrollbarWidth = 0;
    }

    const parentElementStyle = window.getComputedStyle(
      this._terminal.element.parentElement,
    );
    const parentElementHeight = parseInt(
      parentElementStyle.getPropertyValue("height"),
    );
    const parentElementWidth = Math.max(
      0,
      parseInt(parentElementStyle.getPropertyValue("width")),
    );

    // 安全检查：如果父元素高度为 0 或 NaN，说明布局还没完成
    if (
      !parentElementHeight ||
      parentElementHeight <= 0 ||
      isNaN(parentElementHeight)
    ) {
      return undefined;
    }

    const elementStyle = window.getComputedStyle(this._terminal.element);
    const elementPadding = {
      top: parseInt(elementStyle.getPropertyValue("padding-top")),
      bottom: parseInt(elementStyle.getPropertyValue("padding-bottom")),
      right: parseInt(elementStyle.getPropertyValue("padding-right")),
      left: parseInt(elementStyle.getPropertyValue("padding-left")),
    };
    const elementPaddingVer = elementPadding.top + elementPadding.bottom;
    const elementPaddingHor = elementPadding.right + elementPadding.left;
    const availableHeight = parentElementHeight - elementPaddingVer;
    const availableWidth =
      parentElementWidth - elementPaddingHor - scrollbarWidth;
    const geometry = {
      cols: Math.max(
        MINIMUM_COLS,
        Math.floor(availableWidth / dims.css.cell.width),
      ),
      rows: Math.max(
        MINIMUM_ROWS,
        Math.floor(availableHeight / dims.css.cell.height),
      ),
    };
    return geometry;
  }
}
