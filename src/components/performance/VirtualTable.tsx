
import React, { useRef, useCallback } from 'react';

interface VirtualTableProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  width?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

/**
 * Sadə Virtual Table komponenti
 * react-window əvəzinə native scroll istifadə edir
 */
function VirtualTable<T>({
  items,
  itemHeight,
  height,
  width = 300,
  renderItem,
  className = '',
}: VirtualTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-gray-500">No items to display</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`overflow-auto border rounded ${className}`}
      style={{ height, width }}
    >
      <div className="space-y-0">
        {items.map((item, index) => (
          <div 
            key={index}
            className="border-b last:border-b-0"
            style={{ minHeight: itemHeight }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualTable;
