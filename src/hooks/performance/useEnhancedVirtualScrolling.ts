
export interface VirtualItem<T> {
  item: T;
  index: number;
}

export const useEnhancedVirtualScrolling = <T>(items: T[], containerHeight: number) => {
  return {
    virtualItems: items.map((item, index) => ({ item, index })),
    scrollToIndex: (index: number) => {},
    totalSize: items.length * 50
  };
};
