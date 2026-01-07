/**
 * @file ComponentDebugOverlay.tsx
 * @description 组件视图调试覆盖层 - Alt+悬浮显示轮廓，Alt+点击显示组件信息
 */
import { useEffect, useCallback, useState } from "react";
import { useComponentDebug, ComponentInfo } from "@/contexts/ComponentDebugContext";
import { X, Copy, Check, Component, FileCode, Layers, Hash } from "lucide-react";

/**
 * 从 React Fiber 节点获取组件信息
 */
function getReactFiberInfo(element: HTMLElement): Partial<ComponentInfo> | null {
  const fiberKey = Object.keys(element).find(
    (key) => key.startsWith("__reactFiber$") || key.startsWith("__reactInternalInstance$")
  );

  if (!fiberKey) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fiber = (element as any)[fiberKey];
  if (!fiber) return null;

  let depth = 0;
  while (fiber) {
    const type = fiber.type;
    if (type && typeof type === "function") {
      const name = type.displayName || type.name || "Anonymous";
      if (!name.startsWith("_") && name !== "Anonymous") {
        // 尝试多种方式获取文件路径
        let filePath = "";
        
        // 方式1: _debugSource (开发模式)
        if (fiber._debugSource) {
          const source = fiber._debugSource;
          filePath = source.fileName || "";
          if (source.lineNumber) {
            filePath += `:${source.lineNumber}`;
          }
        }
        // 方式2: type._source
        else if (type._source) {
          const source = type._source;
          filePath = source.fileName || "";
          if (source.lineNumber) {
            filePath += `:${source.lineNumber}`;
          }
        }
        // 方式3: 尝试从函数的 toString 中提取（某些打包器会保留）
        else if (type.toString) {
          const funcStr = type.toString();
          // 检查是否有 sourceURL 注释
          const sourceMatch = funcStr.match(/\/\/# sourceURL=(.+)/);
          if (sourceMatch) {
            filePath = sourceMatch[1];
          }
        }

        // 如果还是没有路径，显示提示信息
        if (!filePath) {
          filePath = "仅开发模式可用 (需要 React DevTools)";
        }

        const props = fiber.memoizedProps || {};
        const safeProps: Record<string, unknown> = {};
        for (const key of Object.keys(props)) {
          const value = props[key];
          if (typeof value === "function") {
            safeProps[key] = "[Function]";
          } else if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
              safeProps[key] = `[Array(${value.length})]`;
            } else if (value.$$typeof) {
              safeProps[key] = "[ReactElement]";
            } else {
              safeProps[key] = "[Object]";
            }
          } else {
            safeProps[key] = value;
          }
        }

        return { name, filePath, props: safeProps, depth };
      }
    }
    fiber = fiber.return;
    depth++;
  }
  return null;
}

/** 组件信息弹窗 */
function ComponentInfoPopup() {
  const { componentInfo, hideComponentInfo } = useComponentDebug();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!componentInfo) return null;

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const propsEntries = Object.entries(componentInfo.props || {}).filter(
    ([key]) => key !== "children"
  );

  return (
    <div
      className="fixed z-[99999] rounded-lg shadow-xl min-w-[320px] max-w-[450px] border border-gray-200 bg-white text-gray-900"
      style={{
        left: Math.min(componentInfo.x, window.innerWidth - 470),
        top: Math.min(componentInfo.y, window.innerHeight - 300),
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 rounded-t-lg bg-gray-50">
        <div className="flex items-center gap-2">
          <Component className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">组件信息</span>
        </div>
        <button onClick={hideComponentInfo} className="p-1 hover:bg-muted rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="p-3 space-y-3">
        {/* 组件名称 */}
        <div className="flex items-start gap-2">
          <Component className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-0.5">组件名称</div>
            <div className="flex items-center gap-2">
              <code className="font-mono text-sm text-primary font-medium">{componentInfo.name}</code>
              <button onClick={() => handleCopy(componentInfo.name, "name")} className="p-0.5 hover:bg-muted rounded shrink-0" title="复制名称">
                {copiedField === "name" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </div>

        {/* 文件路径 */}
        <div className="flex items-start gap-2">
          <FileCode className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-0.5">文件路径</div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded truncate flex-1 block">{componentInfo.filePath}</code>
              <button onClick={() => handleCopy(componentInfo.filePath, "path")} className="p-0.5 hover:bg-muted rounded shrink-0" title="复制路径">
                {copiedField === "path" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </div>

        {/* HTML 标签 */}
        <div className="flex items-start gap-2">
          <Hash className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-0.5">DOM 元素</div>
            <code className="text-xs text-muted-foreground">&lt;{componentInfo.tagName.toLowerCase()}&gt;</code>
          </div>
        </div>

        {/* 组件层级 */}
        <div className="flex items-start gap-2">
          <Layers className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-0.5">组件层级</div>
            <span className="text-xs">第 {componentInfo.depth} 层</span>
          </div>
        </div>

        {/* Props */}
        {propsEntries.length > 0 && (
          <div className="border-t pt-3">
            <div className="text-xs text-muted-foreground mb-2">Props</div>
            <div className="bg-muted/50 rounded p-2 max-h-[150px] overflow-auto">
              <div className="space-y-1">
                {propsEntries.slice(0, 10).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2 text-xs">
                    <span className="text-blue-500 font-mono shrink-0">{key}:</span>
                    <span className="text-muted-foreground font-mono truncate">
                      {typeof value === "string" ? `"${value}"` : String(value)}
                    </span>
                  </div>
                ))}
                {propsEntries.length > 10 && (
                  <div className="text-xs text-muted-foreground">... 还有 {propsEntries.length - 10} 个属性</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="px-3 py-2 border-t border-gray-200 rounded-b-lg bg-gray-50">
        <p className="text-[10px] text-muted-foreground">提示: 按 Esc 或点击其他区域关闭</p>
      </div>
    </div>
  );
}

/** 调试交互处理 */
function DebugInteractionHandler() {
  const { enabled, showComponentInfo, hideComponentInfo } = useComponentDebug();
  const [altPressed, setAltPressed] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);

  // 监听 Alt 键
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setAltPressed(true);
      }
      if (e.key === "Escape") {
        hideComponentInfo();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setAltPressed(false);
        setHoveredElement(null);
      }
    };

    // 窗口失焦时重置状态
    const handleBlur = () => {
      setAltPressed(false);
      setHoveredElement(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, hideComponentInfo]);

  // 监听鼠标移动（仅在 Alt 按下时）
  useEffect(() => {
    if (!enabled || !altPressed) {
      setHoveredElement(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // 忽略弹窗内的元素
      if (target.closest(".component-debug-popup")) return;
      setHoveredElement(target);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [enabled, altPressed]);

  // 监听点击（仅在 Alt 按下时）
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 点击弹窗外部关闭弹窗
      if (!target.closest(".component-debug-popup")) {
        if (!e.altKey) {
          hideComponentInfo();
          return;
        }

        // Alt + 点击显示组件信息
        e.preventDefault();
        e.stopPropagation();

        const fiberInfo = getReactFiberInfo(target);
        showComponentInfo({
          name: fiberInfo?.name || "DOM Element",
          filePath: fiberInfo?.filePath || "非 React 组件",
          props: fiberInfo?.props || {},
          depth: fiberInfo?.depth || 0,
          tagName: target.tagName,
          x: e.clientX + 10,
          y: e.clientY + 10,
        });
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [enabled, showComponentInfo, hideComponentInfo]);

  // 渲染悬浮高亮框
  if (!altPressed || !hoveredElement) return null;

  const rect = hoveredElement.getBoundingClientRect();

  return (
    <div
      className="fixed pointer-events-none z-[99998]"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        outline: "2px solid rgba(59, 130, 246, 0.8)",
        outlineOffset: "-2px",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      }}
    />
  );
}

export function ComponentDebugOverlay() {
  const { enabled } = useComponentDebug();

  if (!enabled) return null;

  return (
    <>
      <DebugInteractionHandler />
      <div className="component-debug-popup">
        <ComponentInfoPopup />
      </div>
    </>
  );
}
