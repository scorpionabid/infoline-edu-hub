
import React, { useCallback, useMemo } from 'react';

export interface VirtualItem<T = any> {
  item: T;
  index: number;
  offsetY: number;
}

interface VirtualTableProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: VirtualItem<T>) => React.ReactNode;
  className?: string;
  onScrollEnd?: () => void;
}

export function VirtualTable<T>(props: VirtualTableProps<T>) {
  const {
    items,
    itemHeight,
    height,
    renderItem,
    className = '',
    // onScrollEnd
  } = props;

  // Simple virtual scrolling implementation
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(height / itemHeight);
    const end = Math.min(start + visibleCount + 1, items.length);
    
    return { start: Math.max(0, start - 1), end };
  }, [scrollTop, itemHeight, height, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      offsetY: (visibleRange.start + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    
    // Call onScrollEnd when near bottom
    const scrollProgress = scrollTop / (totalHeight - height);
    if (onScrollEnd && scrollProgress > 0.9) {
      onScrollEnd();
    }
  }, [onScrollEnd, totalHeight, height]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: virtualItem.offsetY,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(virtualItem)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualTable;
