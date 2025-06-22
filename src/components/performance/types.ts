// Performance-related type definitions

export interface VirtualScrollOptions {
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

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  cacheHitRate: number;
  activeConnections: number;
  timestamp?: Date;
}

export interface PerformanceIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  component?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  resolved?: boolean;
}

export interface PerformanceThresholds {
  fps: { warning: number; error: number };
  memoryUsage: { warning: number; error: number };
  networkLatency: { warning: number; error: number };
  renderTime: { warning: number; error: number };
}

export interface LazyLoadingOptions {
  fallbackHeight?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export interface MemoizationOptions<T> {
  shouldUpdate?: (prev: T, next: T) => boolean;
  maxAge?: number;
  maxSize?: number;
}

export interface VirtualTableProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: VirtualItem<T>) => React.ReactNode;
  className?: string;
  onScrollEnd?: () => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
}

export interface PerformanceMonitorConfig {
  componentName: string;
  trackRenderCount?: boolean;
  trackRenderTime?: boolean;
  logToConsole?: boolean;
  alertThreshold?: number;
}

export interface IntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
}

export interface MemoryOptimizationOptions<T> {
  maxCacheSize?: number;
  ttl?: number;
  shouldCache?: (value: T) => boolean;
  onEvict?: (key: string, value: T) => void;
}

export interface BatchUpdateOptions {
  maxBatchSize?: number;
  batchTimeout?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface DebounceOptions {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface PerformanceReport {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  memoryUsage: number;
  issues: PerformanceIssue[];
  recommendations: string[];
  score: number;
  timestamp: Date;
}

export interface OptimizationResult {
  before: PerformanceMetrics;
  after: PerformanceMetrics;
  improvement: {
    fps: number;
    memoryUsage: number;
    renderTime: number;
    networkLatency: number;
  };
  summary: string;
}

// Component-specific types
export interface OptimizedNavigationItemProps {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  isActive?: boolean;
  onClick?: () => void;
  badge?: number;
  children?: React.ReactNode;
  loading?: boolean;
}

export interface OptimizedTableRowProps {
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

export interface OptimizedCardProps {
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
  className?: string;
}

export interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  height?: number;
  itemHeight?: number;
  loading?: boolean;
  emptyState?: React.ReactNode;
  virtualized?: boolean;
}

// Hook return types
export interface UsePerformanceMonitorReturn {
  renderCount: number;
  logRender: (extraInfo?: string) => void;
  getReport: () => PerformanceReport;
  reset: () => void;
}

export interface UseIntersectionObserverReturn {
  isIntersecting: boolean;
  hasIntersected: boolean;
  entry: IntersectionObserverEntry | null;
}

export interface UseVirtualScrollingReturn<T> {
  visibleItems: VirtualItem<T>[];
  totalHeight: number;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  startIndex: number;
  endIndex: number;
  isScrolling: boolean;
  scrollProgress: number;
}

export interface UseMemoryOptimizationReturn<T> {
  value: T;
  cacheSize: number;
  hitRate: number;
  clear: () => void;
  invalidate: (key?: string) => void;
}

// Performance monitoring events
export type PerformanceEvent = 
  | { type: 'RENDER_START'; componentName: string; timestamp: number }
  | { type: 'RENDER_END'; componentName: string; timestamp: number; duration: number }
  | { type: 'MEMORY_WARNING'; usage: number; threshold: number }
  | { type: 'FPS_DROP'; current: number; expected: number }
  | { type: 'SLOW_COMPONENT'; componentName: string; renderTime: number }
  | { type: 'CACHE_MISS'; key: string; componentName?: string }
  | { type: 'NETWORK_DELAY'; latency: number; endpoint?: string };

// Configuration types
export interface PerformanceConfig {
  virtualScrolling: {
    defaultItemHeight: number;
    defaultOverscan: number;
    defaultBuffer: number;
    maxContainerHeight: number;
  };
  debounce: {
    search: number;
    resize: number;
    scroll: number;
    input: number;
  };
  intersectionObserver: {
    threshold: number;
    rootMargin: string;
  };
  thresholds: PerformanceThresholds;
  monitoring: {
    enabled: boolean;
    sampleRate: number;
    maxEvents: number;
  };
}

export default PerformanceConfig;