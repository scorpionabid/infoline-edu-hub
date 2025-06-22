import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  buffer?: number;
}

export interface VirtualItem<T> {
  item: T;
  index: number;
  offsetY: number;
  isVisible: boolean;
}

export const useEnhancedVirtualScrolling = <T>(
  items: T[],
  options: VirtualScrollOptions
) => {
  const { itemHeight, containerHeight, overscan = 5, buffer = 10 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout>();
  const [isScrolling, setIsScrolling] = useState(false);

  // Memoized calculations for performance
  const calculations = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
    const totalHeight = items.length * itemHeight;
    
    return {
      visibleCount,
      startIndex,
      endIndex,
      totalHeight
    };
  }, [items.length, itemHeight, containerHeight, scrollTop, overscan]);

  // Optimized visible items calculation
  const visibleItems = useMemo<VirtualItem<T>[]>(() => {
    const { startIndex, endIndex } = calculations;
    
    return items.slice(startIndex, endIndex).map((item, index) => {
      const actualIndex = startIndex + index;
      return {
        item,
        index: actualIndex,
        offsetY: actualIndex * itemHeight,
        isVisible: true
      };
    });
  }, [items, calculations, itemHeight]);

  // Optimized scroll handler with debouncing
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    
    // Only update if scroll position changed significantly
    if (Math.abs(newScrollTop - scrollTop) > itemHeight / 4) {
      setScrollTop(newScrollTop);
    }
    
    // Track scrolling state for optimization
    setIsScrolling(true);
    
    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current);
    }
    
    scrollingTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [scrollTop, itemHeight]);

  // Buffer management for smooth scrolling
  const getBufferedItems = useCallback(() => {
    if (!buffer) return visibleItems;
    
    const { startIndex, endIndex } = calculations;
    const bufferedStart = Math.max(0, startIndex - buffer);
    const bufferedEnd = Math.min(items.length, endIndex + buffer);
    
    return items.slice(bufferedStart, bufferedEnd).map((item, index) => {
      const actualIndex = bufferedStart + index;
      const isInViewport = actualIndex >= startIndex && actualIndex < endIndex;
      
      return {
        item,
        index: actualIndex,
        offsetY: actualIndex * itemHeight,
        isVisible: isInViewport
      };
    });
  }, [visibleItems, calculations, items, buffer, itemHeight]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, []);

  return {
    visibleItems: buffer > 0 ? getBufferedItems() : visibleItems,
    totalHeight: calculations.totalHeight,
    handleScroll,
    startIndex: calculations.startIndex,
    endIndex: calculations.endIndex,
    isScrolling,
    scrollProgress: calculations.totalHeight > 0 ? scrollTop / (calculations.totalHeight - containerHeight) : 0
  };
};