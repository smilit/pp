/**
 * @file 海报画布顶部工具栏
 * @description 提供缩放控制、网格开关、图层面板开关、尺寸选择、导出和关闭功能
 * @module components/content-creator/canvas/poster/PosterToolbar
 */

import React, { memo, useState, useCallback } from "react";
import styled from "styled-components";
import {
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Layers,
  Download,
  X,
  RotateCcw,
  Undo2,
  Redo2,
  Ruler,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog } from "@/components/ui/dialog";
import type { PosterToolbarProps } from "./types";
import { ZOOM_PRESETS, ZOOM_MIN, ZOOM_MAX } from "./types";
import { SizeSelector } from "./SizeSelector";

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border));
  gap: 8px;
`;

const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ZoomDisplay = styled.span`
  min-width: 48px;
  text-align: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  font-variant-numeric: tabular-nums;
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: hsl(var(--border));
  margin: 0 4px;
`;

const SizeDisplay = styled.span`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;

  &:hover {
    background: hsl(var(--muted));
  }
`;

/**
 * 海报画布顶部工具栏
 *
 * 提供以下功能：
 * - 缩放控制（下拉选择 + 放大/缩小按钮）
 * - 网格开关
 * - 图层面板开关
 * - 导出按钮
 * - 关闭按钮
 *
 * @param props - 工具栏属性
 * @returns 工具栏组件
 */
export const PosterToolbar: React.FC<PosterToolbarProps> = memo(
  ({
    zoom,
    showGrid,
    canUndo,
    canRedo,
    canvasWidth,
    canvasHeight,
    onZoomChange,
    onToggleGrid,
    onToggleLayerPanel,
    onUndo,
    onRedo,
    onExport,
    onSizeChange,
    onClose,
  }) => {
    const [showSizeSelector, setShowSizeSelector] = useState(false);

    /**
     * 处理缩放选择变更
     */
    const handleZoomSelect = (value: string) => {
      const newZoom = parseInt(value, 10);
      if (!isNaN(newZoom)) {
        onZoomChange(newZoom);
      }
    };

    /**
     * 放大
     */
    const handleZoomIn = () => {
      const newZoom = Math.min(zoom + 10, ZOOM_MAX);
      onZoomChange(newZoom);
    };

    /**
     * 缩小
     */
    const handleZoomOut = () => {
      const newZoom = Math.max(zoom - 10, ZOOM_MIN);
      onZoomChange(newZoom);
    };

    /**
     * 重置缩放
     */
    const handleResetZoom = () => {
      onZoomChange(100);
    };

    /**
     * 打开尺寸选择器
     */
    const handleOpenSizeSelector = useCallback(() => {
      setShowSizeSelector(true);
    }, []);

    /**
     * 关闭尺寸选择器
     */
    const handleCloseSizeSelector = useCallback(() => {
      setShowSizeSelector(false);
    }, []);

    /**
     * 处理尺寸变更
     */
    const handleSizeChange = useCallback(
      (width: number, height: number) => {
        onSizeChange(width, height);
        setShowSizeSelector(false);
      },
      [onSizeChange],
    );

    return (
      <TooltipProvider>
        <ToolbarContainer>
          {/* 左侧：缩放控制 */}
          <ToolbarGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomOut}
                  disabled={zoom <= ZOOM_MIN}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>缩小</TooltipContent>
            </Tooltip>

            <Select
              value={zoom.toString()}
              onValueChange={handleZoomSelect}
              closeOnMouseLeave
            >
              <SelectTrigger className="h-8 w-20 text-xs">
                <SelectValue placeholder={`${zoom}%`} />
              </SelectTrigger>
              <SelectContent>
                {ZOOM_PRESETS.map((preset) => (
                  <SelectItem key={preset} value={preset.toString()}>
                    {preset}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomIn}
                  disabled={zoom >= ZOOM_MAX}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>放大</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleResetZoom}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>重置缩放 (100%)</TooltipContent>
            </Tooltip>

            <ZoomDisplay>{zoom}%</ZoomDisplay>
          </ToolbarGroup>

          {/* 撤销/重做 */}
          <ToolbarGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>撤销 (⌘Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>重做 (⌘⇧Z)</TooltipContent>
            </Tooltip>
          </ToolbarGroup>

          {/* 中间：视图控制 */}
          <ToolbarGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleOpenSizeSelector}
                >
                  <Ruler className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>修改尺寸</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <SizeDisplay onClick={handleOpenSizeSelector}>
                  {canvasWidth} × {canvasHeight}
                </SizeDisplay>
              </TooltipTrigger>
              <TooltipContent>点击修改尺寸</TooltipContent>
            </Tooltip>

            <Divider />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={onToggleGrid}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showGrid ? "隐藏网格" : "显示网格"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onToggleLayerPanel}
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>图层面板</TooltipContent>
            </Tooltip>
          </ToolbarGroup>

          {/* 右侧：导出和关闭 */}
          <ToolbarGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={onExport}
                >
                  <Download className="h-4 w-4" />
                  <span className="text-xs">导出</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>导出图片</TooltipContent>
            </Tooltip>

            <Divider />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>关闭画布</TooltipContent>
            </Tooltip>
          </ToolbarGroup>
        </ToolbarContainer>

        {/* 尺寸选择器对话框 */}
        <Dialog open={showSizeSelector} onOpenChange={setShowSizeSelector}>
          <SizeSelector
            width={canvasWidth}
            height={canvasHeight}
            onSizeChange={handleSizeChange}
            onClose={handleCloseSizeSelector}
          />
        </Dialog>
      </TooltipProvider>
    );
  },
);

PosterToolbar.displayName = "PosterToolbar";
