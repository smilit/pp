/**
 * @file 对齐工具栏组件
 * @description 提供元素对齐按钮
 * @module components/content-creator/canvas/poster/AlignmentToolbar
 */

import React, { memo } from "react";
import styled from "styled-components";
import {
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AlignDirection } from "./utils/alignmentGuides";

const ToolbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
`;

const ToolbarRow = styled.div`
  display: flex;
  gap: 4px;
`;

const ToolbarLabel = styled.span`
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-bottom: 4px;
`;

const Divider = styled.div`
  height: 1px;
  background: hsl(var(--border));
  margin: 8px 0;
`;

/**
 * 对齐工具栏 Props
 */
export interface AlignmentToolbarProps {
  /** 是否有选中元素 */
  hasSelection: boolean;
  /** 是否启用网格吸附 */
  gridSnapEnabled: boolean;
  /** 对齐回调 */
  onAlign: (direction: AlignDirection) => void;
  /** 切换网格吸附回调 */
  onToggleGridSnap: () => void;
}

/**
 * 对齐按钮配置
 */
const ALIGN_BUTTONS: Array<{
  direction: AlignDirection;
  icon: React.ReactNode;
  tooltip: string;
}> = [
  {
    direction: "left",
    icon: <AlignLeft className="h-4 w-4" />,
    tooltip: "左对齐",
  },
  {
    direction: "center-horizontal",
    icon: <AlignCenterHorizontal className="h-4 w-4" />,
    tooltip: "水平居中",
  },
  {
    direction: "right",
    icon: <AlignRight className="h-4 w-4" />,
    tooltip: "右对齐",
  },
  {
    direction: "top",
    icon: <AlignStartVertical className="h-4 w-4" />,
    tooltip: "顶部对齐",
  },
  {
    direction: "center-vertical",
    icon: <AlignCenterVertical className="h-4 w-4" />,
    tooltip: "垂直居中",
  },
  {
    direction: "bottom",
    icon: <AlignEndVertical className="h-4 w-4" />,
    tooltip: "底部对齐",
  },
];

const CANVAS_ALIGN_BUTTONS: Array<{
  direction: AlignDirection;
  icon: React.ReactNode;
  tooltip: string;
}> = [
  {
    direction: "canvas-center-horizontal",
    icon: <AlignHorizontalJustifyCenter className="h-4 w-4" />,
    tooltip: "画布水平居中",
  },
  {
    direction: "canvas-center-vertical",
    icon: <AlignVerticalJustifyCenter className="h-4 w-4" />,
    tooltip: "画布垂直居中",
  },
];

/**
 * 对齐工具栏组件
 *
 * 提供以下功能：
 * - 元素对齐按钮（左、中、右、上、中、下）
 * - 画布居中按钮
 * - 网格吸附开关
 *
 * @param props - 组件属性
 * @returns 对齐工具栏组件
 */
export const AlignmentToolbar: React.FC<AlignmentToolbarProps> = memo(
  ({ hasSelection, gridSnapEnabled, onAlign, onToggleGridSnap }) => {
    return (
      <TooltipProvider>
        <ToolbarContainer>
          <ToolbarLabel>元素对齐</ToolbarLabel>
          <ToolbarRow>
            {ALIGN_BUTTONS.slice(0, 3).map((btn) => (
              <Tooltip key={btn.direction}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!hasSelection}
                    onClick={() => onAlign(btn.direction)}
                  >
                    {btn.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{btn.tooltip}</TooltipContent>
              </Tooltip>
            ))}
          </ToolbarRow>
          <ToolbarRow>
            {ALIGN_BUTTONS.slice(3).map((btn) => (
              <Tooltip key={btn.direction}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!hasSelection}
                    onClick={() => onAlign(btn.direction)}
                  >
                    {btn.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{btn.tooltip}</TooltipContent>
              </Tooltip>
            ))}
          </ToolbarRow>

          <Divider />

          <ToolbarLabel>画布对齐</ToolbarLabel>
          <ToolbarRow>
            {CANVAS_ALIGN_BUTTONS.map((btn) => (
              <Tooltip key={btn.direction}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!hasSelection}
                    onClick={() => onAlign(btn.direction)}
                  >
                    {btn.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{btn.tooltip}</TooltipContent>
              </Tooltip>
            ))}
          </ToolbarRow>

          <Divider />

          <ToolbarLabel>吸附</ToolbarLabel>
          <ToolbarRow>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={gridSnapEnabled ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={onToggleGridSnap}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {gridSnapEnabled ? "关闭网格吸附" : "开启网格吸附"}
              </TooltipContent>
            </Tooltip>
          </ToolbarRow>
        </ToolbarContainer>
      </TooltipProvider>
    );
  },
);

AlignmentToolbar.displayName = "AlignmentToolbar";

/**
 * 对齐按钮（带弹出菜单）
 */
export type AlignmentButtonProps = AlignmentToolbarProps;

export const AlignmentButton: React.FC<AlignmentButtonProps> = memo((props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <AlignCenterHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <AlignmentToolbar {...props} />
      </PopoverContent>
    </Popover>
  );
});

AlignmentButton.displayName = "AlignmentButton";
