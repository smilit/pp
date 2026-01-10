/**
 * @file 图层面板组件
 * @description 显示图层列表，支持拖拽排序、锁定、可见性切换和重命名
 * @module components/content-creator/canvas/poster/LayerPanel
 */

import React, { memo, useState, useCallback, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  X,
  Type,
  Image,
  Square,
  Layers,
  GripVertical,
} from "lucide-react";
import type { LayerPanelProps, ElementType } from "./types";

const Panel = styled.div`
  width: 240px;
  background: hsl(var(--background));
  border-left: 1px solid hsl(var(--border));
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid hsl(var(--border));
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground));
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: hsl(var(--muted-foreground));
  transition: all 0.15s ease;

  &:hover {
    background: hsl(var(--muted));
    color: hsl(var(--foreground));
  }
`;

const LayerList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  text-align: center;
  padding: 24px;
  gap: 8px;
`;

const LayerItem = styled.div<{ $selected: boolean; $dragging: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: ${(props) =>
    props.$selected ? "hsl(var(--accent))" : "transparent"};
  opacity: ${(props) => (props.$dragging ? 0.5 : 1)};
  border: 1px solid
    ${(props) =>
      props.$selected ? "hsl(var(--primary) / 0.3)" : "transparent"};

  &:hover {
    background: ${(props) =>
      props.$selected ? "hsl(var(--accent))" : "hsl(var(--muted))"};
  }
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--muted-foreground));
  cursor: grab;
  padding: 2px;

  &:active {
    cursor: grabbing;
  }
`;

const LayerIcon = styled.div<{ $type: ElementType }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
`;

const LayerName = styled.div`
  flex: 1;
  font-size: 13px;
  color: hsl(var(--foreground));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LayerNameInput = styled.input`
  flex: 1;
  font-size: 13px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--primary));
  border-radius: 4px;
  padding: 2px 6px;
  outline: none;
`;

const LayerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const ActionButton = styled.button<{ $active?: boolean; $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: ${(props) =>
    props.$danger
      ? "hsl(var(--destructive))"
      : props.$active
        ? "hsl(var(--foreground))"
        : "hsl(var(--muted-foreground))"};
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) =>
      props.$danger ? "hsl(var(--destructive) / 0.1)" : "hsl(var(--muted))"};
    color: ${(props) =>
      props.$danger ? "hsl(var(--destructive))" : "hsl(var(--foreground))"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * 获取元素类型对应的图标
 */
function getTypeIcon(type: ElementType) {
  switch (type) {
    case "text":
      return <Type size={14} />;
    case "image":
      return <Image size={14} />;
    case "group":
      return <Layers size={14} />;
    default:
      return <Square size={14} />;
  }
}

/**
 * 图层面板组件
 *
 * 显示当前页面的所有图层，支持：
 * - 图层列表显示
 * - 拖拽排序
 * - 锁定/解锁
 * - 显示/隐藏
 * - 双击重命名
 * - 点击选中元素
 *
 * @param props - 组件属性
 * @returns 图层面板组件
 */
export const LayerPanel: React.FC<LayerPanelProps> = memo(
  ({
    layers,
    selectedIds,
    onSelect,
    onReorder,
    onToggleVisibility,
    onToggleLock,
    onRename,
    onClose,
  }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * 开始编辑图层名称
     */
    const startEditing = useCallback((id: string, name: string) => {
      setEditingId(id);
      setEditingName(name);
    }, []);

    /**
     * 完成编辑
     */
    const finishEditing = useCallback(() => {
      if (editingId && editingName.trim()) {
        onRename(editingId, editingName.trim());
      }
      setEditingId(null);
      setEditingName("");
    }, [editingId, editingName, onRename]);

    /**
     * 取消编辑
     */
    const cancelEditing = useCallback(() => {
      setEditingId(null);
      setEditingName("");
    }, []);

    /**
     * 处理键盘事件
     */
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          finishEditing();
        } else if (e.key === "Escape") {
          cancelEditing();
        }
      },
      [finishEditing, cancelEditing],
    );

    /**
     * 聚焦输入框
     */
    useEffect(() => {
      if (editingId && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [editingId]);

    /**
     * 处理拖拽开始
     */
    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    }, []);

    /**
     * 处理拖拽经过
     */
    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
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
        const fromIndex = dragIndex;
        setDragIndex(null);
        setDragOverIndex(null);

        if (fromIndex !== null && fromIndex !== toIndex) {
          onReorder(fromIndex, toIndex);
        }
      },
      [dragIndex, onReorder],
    );

    /**
     * 处理拖拽结束
     */
    const handleDragEnd = useCallback(() => {
      setDragIndex(null);
      setDragOverIndex(null);
    }, []);

    /**
     * 处理图层点击
     */
    const handleLayerClick = useCallback(
      (id: string, e: React.MouseEvent) => {
        // 如果正在编辑，不处理点击
        if (editingId) return;

        // 多选模式
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
          const newIds = selectedIds.includes(id)
            ? selectedIds.filter((i) => i !== id)
            : [...selectedIds, id];
          onSelect(newIds);
        } else {
          onSelect([id]);
        }
      },
      [editingId, selectedIds, onSelect],
    );

    /**
     * 处理双击编辑
     */
    const handleDoubleClick = useCallback(
      (id: string, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        startEditing(id, name);
      },
      [startEditing],
    );

    return (
      <Panel>
        <Header>
          <Title>
            <Layers size={16} />
            图层
          </Title>
          <CloseButton onClick={onClose} title="关闭图层面板">
            <X size={16} />
          </CloseButton>
        </Header>

        <LayerList>
          {layers.length === 0 ? (
            <EmptyState>
              <Layers size={32} strokeWidth={1.5} />
              <span>暂无图层</span>
              <span style={{ fontSize: 12 }}>添加元素后将显示在这里</span>
            </EmptyState>
          ) : (
            layers.map((layer, index) => (
              <LayerItem
                key={layer.id}
                $selected={selectedIds.includes(layer.id)}
                $dragging={dragIndex === index}
                onClick={(e) => handleLayerClick(layer.id, e)}
                onDoubleClick={(e) =>
                  handleDoubleClick(layer.id, layer.name, e)
                }
                draggable={!editingId}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                style={{
                  borderTop:
                    dragOverIndex === index &&
                    dragIndex !== null &&
                    dragIndex > index
                      ? "2px solid hsl(var(--primary))"
                      : undefined,
                  borderBottom:
                    dragOverIndex === index &&
                    dragIndex !== null &&
                    dragIndex < index
                      ? "2px solid hsl(var(--primary))"
                      : undefined,
                }}
              >
                <DragHandle>
                  <GripVertical size={14} />
                </DragHandle>

                <LayerIcon $type={layer.type}>
                  {getTypeIcon(layer.type)}
                </LayerIcon>

                {editingId === layer.id ? (
                  <LayerNameInput
                    ref={inputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <LayerName style={{ opacity: layer.visible ? 1 : 0.5 }}>
                    {layer.name}
                  </LayerName>
                )}

                <LayerActions>
                  <ActionButton
                    $active={layer.visible}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layer.id);
                    }}
                    title={layer.visible ? "隐藏图层" : "显示图层"}
                  >
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </ActionButton>

                  <ActionButton
                    $active={layer.locked}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(layer.id);
                    }}
                    title={layer.locked ? "解锁图层" : "锁定图层"}
                  >
                    {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </ActionButton>
                </LayerActions>
              </LayerItem>
            ))
          )}
        </LayerList>
      </Panel>
    );
  },
);

LayerPanel.displayName = "LayerPanel";
