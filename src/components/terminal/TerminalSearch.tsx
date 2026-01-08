/**
 * @file TerminalSearch.tsx
 * @description 终端搜索组件
 * @module components/terminal/TerminalSearch
 *
 * 提供终端内搜索功能的 UI 组件。
 * 支持正则表达式、大小写敏感、全词匹配等选项。
 *
 * _Requirements: 8.3, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { ISearchOptions } from "@xterm/addon-search";

/** 搜索结果信息 */
export interface SearchResultInfo {
  /** 当前匹配索引（从 1 开始） */
  currentIndex: number;
  /** 总匹配数 */
  totalCount: number;
}

/** 搜索组件属性 */
export interface TerminalSearchProps {
  /** 是否显示 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 搜索回调，返回是否找到匹配 */
  onSearch: (term: string, options: ISearchOptions) => boolean;
  /** 搜索下一个，返回是否找到匹配 */
  onSearchNext: (term: string, options: ISearchOptions) => boolean;
  /** 搜索上一个，返回是否找到匹配 */
  onSearchPrevious: (term: string, options: ISearchOptions) => boolean;
  /** 清除搜索 */
  onClearSearch: () => void;
  /** 搜索结果信息（可选，用于显示匹配计数）
   * _Requirements: 11.4, 11.5_
   */
  searchResultInfo?: SearchResultInfo;
}

/** 搜索图标 */
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/** 关闭图标 */
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/** 上箭头图标 */
const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

/** 下箭头图标 */
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className || "w-4 h-4"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/**
 * 终端搜索组件
 *
 * _Requirements: 8.3, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
 */
export const TerminalSearch: React.FC<TerminalSearchProps> = ({
  visible,
  onClose,
  onSearch,
  onSearchNext,
  onSearchPrevious,
  onClearSearch,
  searchResultInfo,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  // 区分大小写选项
  // _Requirements: 11.2_
  const [caseSensitive, setCaseSensitive] = useState(false);
  // 全词匹配选项
  // _Requirements: 11.3_
  const [wholeWord, setWholeWord] = useState(false);
  // 正则表达式选项
  // _Requirements: 11.1_
  const [regex, setRegex] = useState(false);
  const [hasResults, setHasResults] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 构建搜索选项
  const getSearchOptions = useCallback(
    (): ISearchOptions => ({
      caseSensitive,
      wholeWord,
      regex,
      incremental: true,
      // 启用装饰器以高亮所有匹配项
      // _Requirements: 11.4_
      decorations: {
        matchBackground: "#7aa2f7",
        matchBorder: "#7aa2f7",
        matchOverviewRuler: "#7aa2f7",
        activeMatchBackground: "#ff9e64",
        activeMatchBorder: "#ff9e64",
        activeMatchColorOverviewRuler: "#ff9e64",
      },
    }),
    [caseSensitive, wholeWord, regex],
  );

  // 执行搜索
  const doSearch = useCallback(() => {
    if (!searchTerm) {
      onClearSearch();
      setHasResults(null);
      return;
    }
    const found = onSearch(searchTerm, getSearchOptions());
    setHasResults(found);
  }, [searchTerm, getSearchOptions, onSearch, onClearSearch]);

  // 搜索下一个
  // _Requirements: 11.6_
  const handleNext = useCallback(() => {
    if (!searchTerm) return;
    const found = onSearchNext(searchTerm, getSearchOptions());
    setHasResults(found);
  }, [searchTerm, getSearchOptions, onSearchNext]);

  // 搜索上一个
  // _Requirements: 11.6_
  const handlePrevious = useCallback(() => {
    if (!searchTerm) return;
    const found = onSearchPrevious(searchTerm, getSearchOptions());
    setHasResults(found);
  }, [searchTerm, getSearchOptions, onSearchPrevious]);

  // 关闭搜索
  // _Requirements: 11.7_
  const handleClose = useCallback(() => {
    onClearSearch();
    setSearchTerm("");
    setHasResults(null);
    onClose();
  }, [onClose, onClearSearch]);

  // 键盘事件处理
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "Enter") {
        if (e.shiftKey) {
          handlePrevious();
        } else {
          handleNext();
        }
      }
      // Alt+C 切换大小写敏感
      if (e.altKey && e.key === "c") {
        e.preventDefault();
        setCaseSensitive((prev) => !prev);
      }
      // Alt+W 切换全词匹配
      if (e.altKey && e.key === "w") {
        e.preventDefault();
        setWholeWord((prev) => !prev);
      }
      // Alt+R 切换正则表达式
      if (e.altKey && e.key === "r") {
        e.preventDefault();
        setRegex((prev) => !prev);
      }
    },
    [handleClose, handleNext, handlePrevious],
  );

  // 搜索词变化时自动搜索
  useEffect(() => {
    doSearch();
  }, [searchTerm, caseSensitive, wholeWord, regex, doSearch]);

  // 显示时聚焦输入框
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [visible]);

  if (!visible) return null;

  // 渲染搜索结果计数
  // _Requirements: 11.5_
  const renderResultCount = () => {
    if (!searchTerm) return null;

    if (hasResults === false) {
      return <span className="terminal-search-no-results">无结果</span>;
    }

    if (searchResultInfo && searchResultInfo.totalCount > 0) {
      return (
        <span className="terminal-search-count">
          {searchResultInfo.currentIndex} / {searchResultInfo.totalCount}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="terminal-search-bar">
      <div className="terminal-search-input-wrapper">
        <SearchIcon className="terminal-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className={`terminal-search-input ${hasResults === false ? "no-results" : ""}`}
          placeholder="搜索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {renderResultCount()}
      </div>

      {/* 搜索选项
       * _Requirements: 11.1, 11.2, 11.3_
       */}
      <div className="terminal-search-options">
        <button
          className={`terminal-search-option ${caseSensitive ? "active" : ""}`}
          onClick={() => setCaseSensitive(!caseSensitive)}
          title="区分大小写 (Alt+C)"
        >
          Aa
        </button>
        <button
          className={`terminal-search-option ${wholeWord ? "active" : ""}`}
          onClick={() => setWholeWord(!wholeWord)}
          title="全词匹配 (Alt+W)"
        >
          W
        </button>
        <button
          className={`terminal-search-option ${regex ? "active" : ""}`}
          onClick={() => setRegex(!regex)}
          title="正则表达式 (Alt+R)"
        >
          .*
        </button>
      </div>

      {/* 导航按钮
       * _Requirements: 11.6_
       */}
      <div className="terminal-search-nav">
        <button
          className="terminal-search-nav-btn"
          onClick={handlePrevious}
          disabled={!searchTerm || hasResults === false}
          title="上一个 (Shift+Enter)"
        >
          <ChevronUpIcon />
        </button>
        <button
          className="terminal-search-nav-btn"
          onClick={handleNext}
          disabled={!searchTerm || hasResults === false}
          title="下一个 (Enter)"
        >
          <ChevronDownIcon />
        </button>
      </div>

      {/* 关闭按钮
       * _Requirements: 11.7_
       */}
      <button
        className="terminal-search-close"
        onClick={handleClose}
        title="关闭 (Esc)"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export default TerminalSearch;
