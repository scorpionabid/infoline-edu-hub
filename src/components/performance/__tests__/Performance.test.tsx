import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Test utilities
import { 
  useEnhancedDebounce, 
  usePerformanceMonitor,
  useIntersectionObserver 
} from '../../../hooks/performance/usePerformanceOptimization';
import { NavigationItem, PerformanceCard } from '../MemoizedComponents';
import { VirtualTable } from '../../../hooks/performance/useEnhancedVirtualScrolling';

// Mock intersection observer
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Performance Hooks', () => {
  describe('useEnhancedDebounce', () => {
    it('should debounce value changes', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useEnhancedDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 100 } }
      );

      expect(result.current).toBe('initial');

      rerender({ value: 'update1', delay: 100 });
      rerender({ value: 'update2', delay: 100 });
      rerender({ value: 'final', delay: 100 });

      expect(result.current).toBe('initial');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current).toBe('final');
    });
  });

  describe('usePerformanceMonitor', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    afterEach(() => {
      consoleSpy.mockClear();
    });

    it('should track render count in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { result, rerender } = renderHook(
        () => usePerformanceMonitor('TestComponent')
      );

      expect(result.current.renderCount).toBe(1);
      rerender();
      expect(result.current.renderCount).toBe(2);

      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('Performance Components', () => {
  describe('NavigationItem', () => {
    const defaultProps = {
      id: 'test-item',
      label: 'Test Item',
      isActive: false
    };

    it('should render navigation item correctly', () => {
      render(<NavigationItem {...defaultProps} />);
      
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should show active state correctly', () => {
      render(<NavigationItem {...defaultProps} isActive={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('should handle click events', () => {
      const onClick = jest.fn();
      render(<NavigationItem {...defaultProps} onClick={onClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('PerformanceCard', () => {
    const defaultProps = {
      id: 'test-card',
      title: 'Test Metric',
      value: '100'
    };

    it('should render card correctly', () => {
      render(<PerformanceCard {...defaultProps} />);
      
      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<PerformanceCard {...defaultProps} loading={true} />);
      
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display trend information', () => {
      const trend = { value: 15, isPositive: true };
      render(<PerformanceCard {...defaultProps} trend={trend} />);
      
      expect(screen.getByText('15%')).toBeInTheDocument();
      expect(screen.getByText('↗')).toBeInTheDocument();
    });
  });
});

describe('Performance Integration Tests', () => {
  it('should maintain performance under heavy load', async () => {
    const startTime = performance.now();
    
    const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    
    render(
      <VirtualTable
        items={items}
        itemHeight={50}
        height={500}
        renderItem={(item) => <div key={item.index}>{item.item.name}</div>}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
  });
});