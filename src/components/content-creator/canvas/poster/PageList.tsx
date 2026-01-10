/**
 * @file 页面列表组件
 * @description 显示海报页面缩略图列表，支持页面切换、添加、删除、复制和拖拽排序
 * @module components/content-creator/canvas/poster/PageList
 */

import React, { memo, useState, useCallback, useRef } from "react";
import styled from "styled-components";
import { Plus, Copy, Trash2, GripVertical } from "lucide-react";
import type { PageListProps } from "./types";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: hsl(var(--background));
  border-top: 1px solid hsl(var(--border));
  overflow-x: auto;
  min-height: 80px;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground) / 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--muted-foreground) / 0.5);
  }
`;

const PageThumbnail = styled.div<{
  $isActive: boolean;
  $isDragging: boolean;
  $isDragOver: boolean;
}>`
  position: relative;
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 6px;
  border: 2px solid
    ${(props) =>
      props.$isActive
        ? "hsl(var(--primary))"
        : props.$isDragOver
          ? "hsl(var(--primary) / 0.5)"
          : "hsl(var(--border))"};
  background: hsl(var(--card));
  cursor: pointer;
  transition: all 0.15s ease;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  transform: ${(props) => (props.$isDragOver ? "scale(1.05)" : "scale(1)")};

  &:hover {
    border-color: ${(props) =>
      props.$isActive ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"};
  }

  &:hover .page-actions {
    opacity: 1;
  }
`;

const PageIndex = styled.div`
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--background) / 0.8);
  padding: 1px 4px;
  border-radius: 2px;
`;

const PageActions = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 3px;
  background: hsl(var(--background) / 0.9);
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: hsl(var(--muted));
    color: hsl(var(--foreground));
  }

  &.delete:hover {
    background: hsl(var(--destructive) / 0.1);
    color: hsl(var(--destructive));
  }
`;

const DragHandle = styled.div`
  position: absolute;
  top: 2px;
  left: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: hsl(var(--muted-foreground) / 0.5);
  cursor: grab;
  opacity: 0;
  transition: opacity 0.15s ease;

  ${PageThumbnail}:hover & {
    opacity: 1;
  }

  &:active {
    cursor: grabbing;
  }
`;

const AddButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border: 2px dashed hsl(var(--border));
  border-radius: 6px;
  background: transparent;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: hsl(var(--primary));
    color: hsl(var(--primary));
    background: hsl(var(--primary) / 0.05);
  }
`;

const ThumbnailPreview = styled.div<{ $bgColor: string }>`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: ${(props) => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: hsl(var(--muted-foreground));
  overflow: hidden;
`;

/**
 * 页面列表组件
 *
 * 显示海报页面缩略图列表，支持：
 * - 点击切换页面
 * - 添加新页面
 * - 删除页面
 * - 复制页面
 * - 拖拽排序
 *
 * @param props - 组件属性
 * @returns 页面列表组件
 */
export const PageList: React.FC<PageListProps> = memo(
  ({
    pages,
    currentIndex,
    onPageSelect,
    onAddPage,
    onDeletePage,
    onDuplicatePage,
    onReorderPages,
  }) => {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragStartIndexRef = useRef<number | null>(null);

    /**
     * 处理拖拽开始
     */
    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
      dragStartIndexRef.current = index;
      setDragIndex(index);
    }, []);

    /**
     * 处理拖拽结束
     */
    const handleDragEnd = useCallback(() => {
      setDragIndex(null);
      setDragOverIndex(null);
      dragStartIndexRef.current = null;
    }, []);

    /**
     * 处理拖拽经过
     */
    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (
        dragStartIndexRef.current !== null &&
        dragStartIndexRef.current !== index
      ) {
        setDragOverIndex(index);
      }
    }, []);

    /**
     * 处理拖拽离开
     */
    const handleDragLeave = useCallback(() => {
      setDragOverIndex(null);
    }, []);

    /**
     * 处理放置
     */
    const handleDrop = useCallback(
      (e: React.DragEvent, toIndex: number) => {
        e.preventDefault();
        const fromIndex = dragStartIndexRef.current;
        if (fromIndex !== null && fromIndex !== toIndex) {
          onReorderPages(fromIndex, toIndex);
        }
        setDragIndex(null);
        setDragOverIndex(null);
        dragStartIndexRef.current = null;
      },
      [onReorderPages],
    );

    /**
     * 处理删除点击
     */
    const handleDeleteClick = useCallback(
      (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        onDeletePage(index);
      },
      [onDeletePage],
    );

    /**
     * 处理复制点击
     */
    const handleDuplicateClick = useCallback(
      (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        onDuplicatePage(index);
      },
      [onDuplicatePage],
    );

    return (
      <Container data-testid="page-list">
        {pages.map((page, index) => (
          <PageThumbnail
            key={page.id}
            $isActive={index === currentIndex}
            $isDragging={index === dragIndex}
            $isDragOver={index === dragOverIndex}
            onClick={() => onPageSelect(index)}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            data-testid={`page-thumbnail-${index}`}
          >
            <DragHandle>
              <GripVertical size={12} />
            </DragHandle>

            <ThumbnailPreview $bgColor={page.backgroundColor}>
              {/* 简单的缩略图预览 - 后续可以渲染实际内容 */}
            </ThumbnailPreview>

            <PageIndex>{index + 1}</PageIndex>

            <PageActions className="page-actions">
              <ActionButton
                onClick={(e) => handleDuplicateClick(e, index)}
                title="复制页面"
                data-testid={`duplicate-page-${index}`}
              >
                <Copy size={10} />
              </ActionButton>
              {pages.length > 1 && (
                <ActionButton
                  className="delete"
                  onClick={(e) => handleDeleteClick(e, index)}
                  title="删除页面"
                  data-testid={`delete-page-${index}`}
                >
                  <Trash2 size={10} />
                </ActionButton>
              )}
            </PageActions>
          </PageThumbnail>
        ))}

        <AddButton
          onClick={onAddPage}
          title="添加页面"
          data-testid="add-page-button"
        >
          <Plus size={20} />
        </AddButton>
      </Container>
    );
  },
);

PageList.displayName = "PageList";
