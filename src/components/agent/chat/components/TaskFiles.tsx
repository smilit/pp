/**
 * @file 任务文件列表组件
 * @description 展示内容创作过程中生成的文件列表
 */

import React, { memo } from "react";
import styled from "styled-components";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

/** 任务文件类型 */
export interface TaskFile {
  id: string;
  name: string;
  type: "document" | "image" | "audio" | "video" | "other";
  content?: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

interface TaskFileListProps {
  /** 文件列表 */
  files: TaskFile[];
  /** 当前选中的文件 ID */
  selectedFileId?: string;
  /** 文件点击回调 */
  onFileClick?: (file: TaskFile) => void;
  /** 是否展开 */
  expanded?: boolean;
  /** 展开状态变更回调 */
  onExpandedChange?: (expanded: boolean) => void;
}

const Container = styled.div`
  padding: 8px 16px;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--muted) / 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
`;

const FileCount = styled.span`
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
`;

const FileList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FileItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${(props) =>
    props.$selected ? "hsl(var(--primary) / 0.1)" : "hsl(var(--background))"};
  border: 1px solid
    ${(props) =>
      props.$selected ? "hsl(var(--primary))" : "hsl(var(--border))"};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: hsl(var(--primary));
    background: hsl(var(--primary) / 0.05);
  }
`;

const FileIcon = styled.div`
  color: hsl(var(--primary));
`;

const FileName = styled.span`
  font-size: 13px;
  color: hsl(var(--foreground));
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileVersion = styled.span`
  font-size: 11px;
  color: hsl(var(--muted-foreground));
`;

/**
 * 任务文件列表组件
 *
 * 展示内容创作过程中生成的文件列表，支持点击查看文件内容
 */
export const TaskFileList: React.FC<TaskFileListProps> = memo(
  ({
    files,
    selectedFileId,
    onFileClick,
    expanded = true,
    onExpandedChange,
  }) => {
    if (files.length === 0) {
      return null;
    }

    return (
      <Container>
        <Header>
          <Title>
            <FileText size={14} />
            生成的文件
            <FileCount>{files.length}</FileCount>
          </Title>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExpandedChange?.(!expanded)}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </Header>

        {expanded && (
          <FileList>
            {files.map((file) => (
              <FileItem
                key={file.id}
                $selected={selectedFileId === file.id}
                onClick={() => onFileClick?.(file)}
              >
                <FileIcon>
                  <FileText size={16} />
                </FileIcon>
                <FileName title={file.name}>{file.name}</FileName>
                {file.version > 1 && <FileVersion>v{file.version}</FileVersion>}
              </FileItem>
            ))}
          </FileList>
        )}
      </Container>
    );
  },
);

TaskFileList.displayName = "TaskFileList";
