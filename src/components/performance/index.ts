
// Main performance optimization exports
export { 
  default as LazyWrapper, 
  withLazyLoading, 
  LoadingIndicator 
} from './LazyWrapper';

export { 
  default as VirtualTable
} from './VirtualTable';

export type { VirtualItem } from './VirtualTable';

export {
  useEnhancedDebounce,
  useStableCallback,
  usePerformanceMonitor,
  useIntersectionObserver,
  useMemoryOptimization,
  useOptimizedState,
  // useBatchedUpdates
} from '../../hooks/performance/usePerformanceOptimization';

export {
  withPerformanceMemo,
  NavigationItem,
  TableRow,
  PerformanceCard,
  // OptimizedList
} from './MemoizedComponents';

export { default as PerformanceDashboard } from './PerformanceDashboard';

// Performance utilities
export type {
  VirtualScrollOptions,
  PerformanceMetrics,
  // PerformanceIssue
} from './types';

// CSS class utilities for performance
export const performanceClasses = {
  // GPU acceleration
  gpuAccelerated: 'gpu-accelerated',
  transitionOptimized: 'transition-optimized',
  preventLayoutShift: 'prevent-layout-shift',
  
  // Virtual scrolling
  virtualContainer: 'virtual-scrolling-container',
  virtualItem: 'virtual-item',
  
  // Animations
  fadeInOptimized: 'animate-fade-in-optimized',
  slideInOptimized: 'animate-slide-in-optimized',
  scaleInOptimized: 'animate-scale-in-optimized',
  
  // Components
  cardOptimized: 'card-optimized',
  buttonOptimized: 'button-optimized',
  navItemOptimized: 'nav-item-optimized',
  tableOptimized: 'performance-table',
  
  // Loading states
  skeletonOptimized: 'skeleton-optimized',
  spinnerOptimized: 'spinner-optimized',
  
  // Content visibility
  contentVisibilityAuto: 'content-visibility-auto',
  willChangeTransform: 'will-change-transform',
  willChangeOpacity: 'will-change-opacity',
  willChangeScroll: 'will-change-scroll'
};

// Performance configuration constants
export const performanceConfig = {
  // Virtual scrolling defaults
  virtualScrolling: {
    defaultItemHeight: 60,
    defaultOverscan: 3,
    defaultBuffer: 5,
    maxContainerHeight: 800
  },
  
  // Debounce defaults
  debounce: {
    search: 300,
    resize: 150,
    scroll: 100,
    input: 200
  },
  
  // Intersection observer defaults
  intersectionObserver: {
    threshold: 0.1,
    rootMargin: '50px'
  },
  
  // Performance thresholds
  thresholds: {
    fps: { warning: 50, error: 40 },
    memoryUsage: { warning: 70, error: 85 },
    networkLatency: { warning: 150, error: 200 },
    renderTime: { warning: 20, error: 30 }
  }
};
