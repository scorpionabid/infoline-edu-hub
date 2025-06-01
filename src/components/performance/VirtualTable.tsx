
import React, { useRef, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useVirtualScrolling } from '@/hooks/performance/useVirtualScrolling';

interface VirtualTableProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

function VirtualTable<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className = '',
}: VirtualTableProps<T>) {
  const listRef = useRef<List>(null);

  const Row = useCallback(({ index, style }: any) => {
    const item = items[index];
    return (
      <div style={style} className="border-b">
        {renderItem(item, index)}
      </div>
    );
  }, [items, renderItem]);

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-gray-500">No items to display</p>
      </div>
    );
  }

  return (
    <List
      ref={listRef}
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      className={className}
    >
      {Row}
    </List>
  );
}

export default VirtualTable;
