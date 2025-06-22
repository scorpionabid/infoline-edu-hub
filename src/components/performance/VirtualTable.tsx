import React, { useCallback } from 'react';
import { useEnhancedVirtualScrolling, VirtualItem } from '../../hooks/performance/useEnhancedVirtualScrolling';

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
    onScrollEnd
  } = props;

  const {
    visibleItems,
    totalHeight,
    handleScroll,
    isScrolling,
    scrollProgress
  } = useEnhancedVirtualScrolling(items, {
    itemHeight,
    containerHeight: height,
    overscan: 3,
    buffer: 5
  });

  const handleScrollWithCallback = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    handleScroll(event);
    
    // Call onScrollEnd when near bottom
    if (onScrollEnd && scrollProgress > 0.9) {
      onScrollEnd();
    }
  }, [handleScroll, onScrollEnd, scrollProgress]);

  return (
    <div
      className={`relative overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScrollWithCallback}
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
              height: itemHeight,
              transform: isScrolling ? 'translateZ(0)' : undefined // GPU acceleration during scroll
            }}
          >
            {renderItem(virtualItem)}
          </div>
        ))}
      </div>
      
      {/* Scroll indicator */}
      {isScrolling && (
        <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded">
          {Math.round(scrollProgress * 100)}%
        </div>
      )}
    </div>
  );
}

export default VirtualTable;
