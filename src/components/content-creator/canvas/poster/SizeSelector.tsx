/**
 * @file 尺寸选择器组件
 * @description 提供预设尺寸选择和自定义尺寸输入功能
 * @module components/content-creator/canvas/poster/SizeSelector
 */

/* eslint-disable react-refresh/only-export-components */
import React, { memo, useState, useCallback } from "react";
import styled from "styled-components";
import { Check, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SIZE_PRESETS, type SizeConfig, type SizeSelectorProps } from "./types";

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const PresetCard = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 2px solid
    ${(props) =>
      props.$selected ? "hsl(var(--primary))" : "hsl(var(--border))"};
  border-radius: 8px;
  background: ${(props) =>
    props.$selected ? "hsl(var(--primary) / 0.1)" : "hsl(var(--background))"};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: hsl(var(--primary));
    background: hsl(var(--primary) / 0.05);
  }
`;

const PresetPreview = styled.div<{ $aspectRatio: number }>`
  width: 60px;
  height: ${(props) => 60 / props.$aspectRatio}px;
  max-height: 80px;
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  margin-bottom: 8px;
`;

const PresetName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin-bottom: 4px;
`;

const PresetDescription = styled.span`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

const PresetSize = styled.span`
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-top: 2px;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  color: hsl(var(--muted-foreground));
  font-size: 12px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: hsl(var(--border));
  }
`;

const CustomSizeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SizeInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SizeInputWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SizeInput = styled(Input)`
  text-align: center;
`;

const SizeMultiply = styled.span`
  font-size: 16px;
  color: hsl(var(--muted-foreground));
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  color: hsl(var(--destructive));
  margin-top: 4px;
`;

/**
 * 尺寸限制常量
 */
const SIZE_MIN = 100;
const SIZE_MAX = 4096;

/**
 * 尺寸选择器工具函数（纯函数，用于测试）
 */
export const sizeSelectorUtils = {
  /**
   * 验证尺寸是否有效
   * @param width 宽度
   * @param height 高度
   * @returns 是否有效
   */
  isValidSize: (width: number, height: number): boolean => {
    return (
      Number.isInteger(width) &&
      Number.isInteger(height) &&
      width >= SIZE_MIN &&
      width <= SIZE_MAX &&
      height >= SIZE_MIN &&
      height <= SIZE_MAX
    );
  },

  /**
   * 限制尺寸在有效范围内
   * @param size 尺寸值
   * @returns 限制后的尺寸
   */
  clampSize: (size: number): number => {
    return Math.max(SIZE_MIN, Math.min(SIZE_MAX, Math.round(size)));
  },

  /**
   * 根据预设 ID 获取尺寸配置
   * @param presetId 预设 ID
   * @returns 尺寸配置或 undefined
   */
  getPresetById: (presetId: string): SizeConfig | undefined => {
    return SIZE_PRESETS.find((preset) => preset.id === presetId);
  },

  /**
   * 检查当前尺寸是否匹配某个预设
   * @param width 宽度
   * @param height 高度
   * @returns 匹配的预设 ID 或 null
   */
  findMatchingPreset: (width: number, height: number): string | null => {
    const preset = SIZE_PRESETS.find(
      (p) => p.width === width && p.height === height,
    );
    return preset?.id ?? null;
  },

  /**
   * 计算宽高比
   * @param width 宽度
   * @param height 高度
   * @returns 宽高比
   */
  getAspectRatio: (width: number, height: number): number => {
    return width / height;
  },

  /**
   * 解析尺寸输入字符串
   * @param input 输入字符串
   * @returns 解析后的数字或 null
   */
  parseSizeInput: (input: string): number | null => {
    const trimmed = input.trim();
    if (trimmed === "") return null;
    const num = parseInt(trimmed, 10);
    if (isNaN(num)) return null;
    return num;
  },

  /**
   * 获取尺寸验证错误信息
   * @param width 宽度
   * @param height 高度
   * @returns 错误信息或 null
   */
  getValidationError: (
    width: number | null,
    height: number | null,
  ): string | null => {
    if (width === null || height === null) {
      return "请输入有效的数字";
    }
    if (width < SIZE_MIN || height < SIZE_MIN) {
      return `尺寸不能小于 ${SIZE_MIN}px`;
    }
    if (width > SIZE_MAX || height > SIZE_MAX) {
      return `尺寸不能大于 ${SIZE_MAX}px`;
    }
    return null;
  },
};

/**
 * 尺寸选择器组件
 *
 * 提供以下功能：
 * - 预设尺寸选择（小红书封面、小红书长图、公众号头图）
 * - 自定义尺寸输入
 * - 尺寸验证
 *
 * @param props - 组件属性
 * @returns 尺寸选择器组件
 */
export const SizeSelector: React.FC<SizeSelectorProps> = memo(
  ({ width, height, onSizeChange, onClose }) => {
    // 自定义尺寸输入状态
    const [customWidth, setCustomWidth] = useState(width.toString());
    const [customHeight, setCustomHeight] = useState(height.toString());
    const [error, setError] = useState<string | null>(null);

    // 当前选中的预设
    const selectedPreset = sizeSelectorUtils.findMatchingPreset(width, height);

    /**
     * 处理预设选择
     */
    const handlePresetSelect = useCallback(
      (preset: SizeConfig) => {
        setCustomWidth(preset.width.toString());
        setCustomHeight(preset.height.toString());
        setError(null);
        onSizeChange(preset.width, preset.height);
      },
      [onSizeChange],
    );

    /**
     * 处理宽度输入变更
     */
    const handleWidthChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomWidth(value);

        const parsedWidth = sizeSelectorUtils.parseSizeInput(value);
        const parsedHeight = sizeSelectorUtils.parseSizeInput(customHeight);

        const validationError = sizeSelectorUtils.getValidationError(
          parsedWidth,
          parsedHeight,
        );
        setError(validationError);
      },
      [customHeight],
    );

    /**
     * 处理高度输入变更
     */
    const handleHeightChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomHeight(value);

        const parsedWidth = sizeSelectorUtils.parseSizeInput(customWidth);
        const parsedHeight = sizeSelectorUtils.parseSizeInput(value);

        const validationError = sizeSelectorUtils.getValidationError(
          parsedWidth,
          parsedHeight,
        );
        setError(validationError);
      },
      [customWidth],
    );

    /**
     * 应用自定义尺寸
     */
    const handleApplyCustomSize = useCallback(() => {
      const parsedWidth = sizeSelectorUtils.parseSizeInput(customWidth);
      const parsedHeight = sizeSelectorUtils.parseSizeInput(customHeight);

      const validationError = sizeSelectorUtils.getValidationError(
        parsedWidth,
        parsedHeight,
      );

      if (validationError) {
        setError(validationError);
        return;
      }

      if (parsedWidth !== null && parsedHeight !== null) {
        const clampedWidth = sizeSelectorUtils.clampSize(parsedWidth);
        const clampedHeight = sizeSelectorUtils.clampSize(parsedHeight);
        onSizeChange(clampedWidth, clampedHeight);
        onClose();
      }
    }, [customWidth, customHeight, onSizeChange, onClose]);

    return (
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            选择海报尺寸
          </DialogTitle>
        </DialogHeader>

        {/* 预设尺寸 */}
        <PresetGrid>
          {SIZE_PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              $selected={selectedPreset === preset.id}
              onClick={() => handlePresetSelect(preset)}
            >
              <PresetPreview
                $aspectRatio={sizeSelectorUtils.getAspectRatio(
                  preset.width,
                  preset.height,
                )}
              />
              <PresetName>{preset.name}</PresetName>
              <PresetDescription>{preset.description}</PresetDescription>
              <PresetSize>
                {preset.width} × {preset.height}
              </PresetSize>
            </PresetCard>
          ))}
        </PresetGrid>

        <Divider>或自定义尺寸</Divider>

        {/* 自定义尺寸 */}
        <CustomSizeSection>
          <SizeInputGroup>
            <SizeInputWrapper>
              <Label htmlFor="width">宽度 (px)</Label>
              <SizeInput
                id="width"
                type="number"
                min={SIZE_MIN}
                max={SIZE_MAX}
                value={customWidth}
                onChange={handleWidthChange}
                placeholder={`${SIZE_MIN}-${SIZE_MAX}`}
              />
            </SizeInputWrapper>

            <SizeMultiply>×</SizeMultiply>

            <SizeInputWrapper>
              <Label htmlFor="height">高度 (px)</Label>
              <SizeInput
                id="height"
                type="number"
                min={SIZE_MIN}
                max={SIZE_MAX}
                value={customHeight}
                onChange={handleHeightChange}
                placeholder={`${SIZE_MIN}-${SIZE_MAX}`}
              />
            </SizeInputWrapper>
          </SizeInputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </CustomSizeSection>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleApplyCustomSize} disabled={!!error}>
            <Check className="h-4 w-4 mr-2" />
            应用
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  },
);

SizeSelector.displayName = "SizeSelector";

/**
 * 尺寸选择器对话框包装组件
 */
export interface SizeSelectorDialogProps extends SizeSelectorProps {
  /** 是否打开 */
  open: boolean;
}

export const SizeSelectorDialog: React.FC<SizeSelectorDialogProps> = memo(
  ({ open, ...props }) => {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && props.onClose()}>
        <SizeSelector {...props} />
      </Dialog>
    );
  },
);

SizeSelectorDialog.displayName = "SizeSelectorDialog";
