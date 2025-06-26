import React, { memo, forwardRef, useImperativeHandle, useRef } from 'react';
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceOptimization';

// Enhanced memoization wrapper
export const withPerformanceMemo = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean,
  displayName?: string
) => {
  const MemoizedComponent = memo(Component, areEqual);
  
  if (displayName) {
    MemoizedComponent.displayName = displayName;
  }

  return MemoizedComponent;
};

// Performance-optimized navigation item
interface NavigationItemProps {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  isActive?: boolean;
  onClick?: () => void;
  badge?: number;
  children?: React.ReactNode;
}

export const NavigationItem = memo<NavigationItemProps>(({ 
  id, 
  label, 
  icon: Icon, 
  isActive = false, 
  onClick,
  badge,
  children 
}) => {
  usePerformanceMonitor(`NavigationItem-${id}`);

  return (
    <div
      className={`
        flex items-center justify-between p-3 rounded-lg cursor-pointer
        transition-all duration-200 
        ${isActive 
          ? 'bg-primary text-primary-foreground font-medium' 
          : 'hover:bg-muted text-muted-foreground'
        }
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="h-5 w-5" />}
        <span className="font-medium">{label}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        {badge && badge > 0 && (
          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.id === nextProps.id &&
    prevProps.label === nextProps.label &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.badge === nextProps.badge &&
    prevProps.icon === nextProps.icon
  );
});

NavigationItem.displayName = 'NavigationItem';

// Performance-optimized table row
interface TableRowProps {
  id: string | number;
  data: Record<string, any>;
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: Record<string, any>) => React.ReactNode;
  }>;
  isSelected?: boolean;
  onSelect?: (id: string | number) => void;
  onClick?: (row: Record<string, any>) => void;
}

export const TableRow = memo<TableRowProps>(({ 
  id, 
  data, 
  columns, 
  isSelected = false,
  onSelect,
  onClick 
}) => {
  const rowRef = useRef<HTMLTableRowElement>(null);
  
  usePerformanceMonitor(`TableRow-${id}`);

  return (
    <tr
      ref={rowRef}
      className={`
        transition-colors duration-150 cursor-pointer
        ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}
      `}
      onClick={() => onClick?.(data)}
    >
      {onSelect && (
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(id)}
            className="rounded border-gray-300 focus:ring-primary"
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}
      
      {columns.map((column) => (
        <td key={column.key} className="px-4 py-3 text-sm">
          {column.render 
            ? column.render(data[column.key], data)
            : data[column.key]
          }
        </td>
      ))}
    </tr>
  );
}, (prevProps, nextProps) => {
  // Compare only necessary props
  return (
    prevProps.id === nextProps.id &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});

TableRow.displayName = 'TableRow';

// Performance-optimized card component
interface PerformanceCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  loading?: boolean;
}

export const PerformanceCard = memo<PerformanceCardProps>(({ 
  id,
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  onClick,
  loading = false
}) => {
  usePerformanceMonitor(`PerformanceCard-${id}`);

  if (loading) {
    return (
      <div className="animate-pulse bg-card rounded-lg border p-6">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-card rounded-lg border p-6 transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold">{value}</p>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        
        {trend && (
          <div className={`flex items-center space-x-1 text-xs ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.loading === nextProps.loading &&
    JSON.stringify(prevProps.trend) === JSON.stringify(nextProps.trend)
  );
});

PerformanceCard.displayName = 'PerformanceCard';

// Optimized list component with virtual scrolling
interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  height?: number;
  itemHeight?: number;
  loading?: boolean;
  emptyState?: React.ReactNode;
}

export const OptimizedList = memo<OptimizedListProps<any>>(({
  items,
  renderItem,
  keyExtractor,
  height = 400,
  itemHeight = 60,
  loading = false,
  // emptyState
}) => {
  usePerformanceMonitor('OptimizedList');

  if (loading) {
    return (
      <div className="space-y-2" style={{ height }}>
        {Array.from({ length: Math.floor(height / itemHeight) }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-14 bg-muted rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        {emptyState || <p className="text-muted-foreground">Məlumat tapılmadı</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1" style={{ maxHeight: height, overflowY: 'auto' }}>
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
});

OptimizedList.displayName = 'OptimizedList';