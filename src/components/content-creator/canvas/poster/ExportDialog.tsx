/**
 * @file 导出对话框组件
 * @description 提供海报导出设置界面，支持格式选择、质量调整、倍率选择和多页导出
 * @module components/content-creator/canvas/poster/ExportDialog
 */

/* eslint-disable react-refresh/only-export-components */
import React, { memo, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import { Download, Image, FileImage, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExportDialogProps, ExportConfig, ExportFormat } from "./types";

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin: 0;
`;

const FormatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const FormatCard = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid
    ${(props) =>
      props.$selected ? "hsl(var(--primary))" : "hsl(var(--border))"};
  border-radius: 8px;
  background: ${(props) =>
    props.$selected ? "hsl(var(--primary) / 0.1)" : "transparent"};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: hsl(var(--primary));
  }
`;

const FormatIcon = styled.div<{ $selected: boolean }>`
  color: ${(props) =>
    props.$selected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"};
`;

const FormatName = styled.span<{ $selected: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) =>
    props.$selected ? "hsl(var(--primary))" : "hsl(var(--foreground))"};
`;

const FormatDesc = styled.span`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

const QualityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const QualityValue = styled.span`
  min-width: 48px;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: hsl(var(--foreground));
`;

const ScaleGrid = styled.div`
  display: flex;
  gap: 12px;
`;

const ScaleButton = styled.button<{ $selected: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  border: 2px solid
    ${(props) =>
      props.$selected ? "hsl(var(--primary))" : "hsl(var(--border))"};
  border-radius: 8px;
  background: ${(props) =>
    props.$selected ? "hsl(var(--primary) / 0.1)" : "transparent"};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: hsl(var(--primary));
  }
`;

const ScaleValue = styled.span<{ $selected: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) =>
    props.$selected ? "hsl(var(--primary))" : "hsl(var(--foreground))"};
`;

const ScaleSize = styled.span`
  font-size: 11px;
  color: hsl(var(--muted-foreground));
`;

const PageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
`;

const PageItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: hsl(var(--muted));
  }
`;

const PageThumbnail = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: hsl(var(--muted));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

const PageInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PageName = styled.span`
  font-size: 14px;
  color: hsl(var(--foreground));
`;

const PageSize = styled.span`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid hsl(var(--border));
`;

const ExportInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: hsl(var(--muted));
  border-radius: 8px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: hsl(var(--destructive) / 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: hsl(var(--destructive));
`;

/**
 * 导出对话框组件
 *
 * 提供以下功能：
 * - 格式选择（PNG/JPG）
 * - 质量调整（仅 JPG）
 * - 倍率选择（1x/2x/3x）
 * - 多页选择导出
 * - 批量导出
 *
 * @param props - 组件属性
 * @returns 导出对话框组件
 */
export const ExportDialog: React.FC<ExportDialogProps> = memo(
  ({ open, pages, onExport, onClose }) => {
    // 导出配置状态
    const [format, setFormat] = useState<ExportFormat>("png");
    const [quality, setQuality] = useState(100);
    const [scale, setScale] = useState<1 | 2 | 3>(1);
    const [selectedPages, setSelectedPages] = useState<number[]>([0]);

    // 计算导出尺寸预览
    const exportSizePreview = useMemo(() => {
      if (pages.length === 0) return null;
      const firstSelectedPage = pages[selectedPages[0]] || pages[0];
      return {
        width: firstSelectedPage.width * scale,
        height: firstSelectedPage.height * scale,
      };
    }, [pages, selectedPages, scale]);

    // 验证配置
    const validationError = useMemo(() => {
      if (selectedPages.length === 0) {
        return "请至少选择一个页面";
      }
      return null;
    }, [selectedPages]);

    /**
     * 切换页面选择
     */
    const handleTogglePage = useCallback((pageIndex: number) => {
      setSelectedPages((prev) => {
        if (prev.includes(pageIndex)) {
          return prev.filter((i) => i !== pageIndex);
        }
        return [...prev, pageIndex].sort((a, b) => a - b);
      });
    }, []);

    /**
     * 全选/取消全选
     */
    const handleSelectAll = useCallback(() => {
      if (selectedPages.length === pages.length) {
        // 取消全选，保留第一页
        setSelectedPages([0]);
      } else {
        // 全选
        setSelectedPages(pages.map((_, i) => i));
      }
    }, [pages, selectedPages]);

    /**
     * 处理导出
     */
    const handleExport = useCallback(() => {
      if (validationError) return;

      const config: ExportConfig = {
        format,
        quality,
        scale,
        pageIndices: selectedPages,
      };

      onExport(config);
    }, [format, quality, scale, selectedPages, validationError, onExport]);

    /**
     * 处理质量变更
     */
    const handleQualityChange = useCallback((value: number[]) => {
      setQuality(value[0]);
    }, []);

    if (!open) return null;

    return (
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            导出图片
          </DialogTitle>
          <DialogDescription>选择导出格式、质量和页面</DialogDescription>
        </DialogHeader>

        <ContentWrapper>
          {/* 格式选择 */}
          <Section>
            <SectionTitle>导出格式</SectionTitle>
            <FormatGrid>
              <FormatCard
                $selected={format === "png"}
                onClick={() => setFormat("png")}
              >
                <FormatIcon $selected={format === "png"}>
                  <Image className="h-8 w-8" />
                </FormatIcon>
                <FormatName $selected={format === "png"}>PNG</FormatName>
                <FormatDesc>无损压缩，支持透明</FormatDesc>
              </FormatCard>

              <FormatCard
                $selected={format === "jpg"}
                onClick={() => setFormat("jpg")}
              >
                <FormatIcon $selected={format === "jpg"}>
                  <FileImage className="h-8 w-8" />
                </FormatIcon>
                <FormatName $selected={format === "jpg"}>JPG</FormatName>
                <FormatDesc>有损压缩，文件更小</FormatDesc>
              </FormatCard>
            </FormatGrid>
          </Section>

          {/* 质量调整（仅 JPG） */}
          {format === "jpg" && (
            <Section>
              <SectionTitle>图片质量</SectionTitle>
              <QualityRow>
                <Slider
                  value={[quality]}
                  onValueChange={handleQualityChange}
                  min={60}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <QualityValue>{quality}%</QualityValue>
              </QualityRow>
            </Section>
          )}

          {/* 倍率选择 */}
          <Section>
            <SectionTitle>导出倍率</SectionTitle>
            <ScaleGrid>
              {([1, 2, 3] as const).map((s) => (
                <TooltipProvider key={s}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ScaleButton
                        $selected={scale === s}
                        onClick={() => setScale(s)}
                      >
                        <ScaleValue $selected={scale === s}>{s}x</ScaleValue>
                        {exportSizePreview && (
                          <ScaleSize>
                            {(pages[selectedPages[0]]?.width || 1080) * s} ×{" "}
                            {(pages[selectedPages[0]]?.height || 1080) * s}
                          </ScaleSize>
                        )}
                      </ScaleButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      {s === 1 && "标准分辨率"}
                      {s === 2 && "高清分辨率（Retina）"}
                      {s === 3 && "超高清分辨率"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </ScaleGrid>
          </Section>

          {/* 页面选择（多页时显示） */}
          {pages.length > 1 && (
            <Section>
              <SectionTitle>选择页面</SectionTitle>
              <PageList>
                <SelectAllRow>
                  <Checkbox
                    id="select-all"
                    checked={selectedPages.length === pages.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="cursor-pointer">
                    全选 ({selectedPages.length}/{pages.length})
                  </Label>
                </SelectAllRow>

                {pages.map((page, index) => (
                  <PageItem key={page.id}>
                    <Checkbox
                      id={`page-${index}`}
                      checked={selectedPages.includes(index)}
                      onCheckedChange={() => handleTogglePage(index)}
                    />
                    <PageThumbnail>{index + 1}</PageThumbnail>
                    <PageInfo>
                      <PageName>{page.name}</PageName>
                      <PageSize>
                        {page.width} × {page.height}
                      </PageSize>
                    </PageInfo>
                    {selectedPages.includes(index) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </PageItem>
                ))}
              </PageList>
            </Section>
          )}

          {/* 导出信息 */}
          {!validationError && exportSizePreview && (
            <ExportInfo>
              <Image className="h-4 w-4" />
              将导出 {selectedPages.length} 张图片，尺寸{" "}
              {exportSizePreview.width} × {exportSizePreview.height} 像素
            </ExportInfo>
          )}

          {/* 错误信息 */}
          {validationError && (
            <ErrorMessage>
              <AlertCircle className="h-4 w-4" />
              {validationError}
            </ErrorMessage>
          )}
        </ContentWrapper>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleExport}
            disabled={!!validationError}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            导出 {selectedPages.length > 1 ? `(${selectedPages.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  },
);

ExportDialog.displayName = "ExportDialog";

/**
 * 导出对话框工具函数（用于测试）
 */
export const exportDialogUtils = {
  /**
   * 创建默认导出配置
   */
  createDefaultConfig: (pageCount: number = 1): ExportConfig => ({
    format: "png",
    quality: 100,
    scale: 1,
    pageIndices: pageCount > 0 ? [0] : [],
  }),

  /**
   * 验证导出配置
   */
  validateConfig: (config: ExportConfig, totalPages: number): string | null => {
    if (config.pageIndices.length === 0) {
      return "请至少选择一个页面";
    }

    const invalidIndices = config.pageIndices.filter(
      (i) => i < 0 || i >= totalPages,
    );
    if (invalidIndices.length > 0) {
      return `无效的页面索引: ${invalidIndices.join(", ")}`;
    }

    if (config.quality < 60 || config.quality > 100) {
      return "质量必须在 60-100 之间";
    }

    if (![1, 2, 3].includes(config.scale)) {
      return "倍率必须是 1、2 或 3";
    }

    return null;
  },
};
