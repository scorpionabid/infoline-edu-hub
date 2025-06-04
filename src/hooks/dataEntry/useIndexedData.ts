
import { useMemo } from 'react';

export interface UseIndexedDataProps<T extends Record<string, any>> {
  items: T[];
  keyProperty: keyof T;
}

export interface UseIndexedDataResult<T> {
  map: Record<string, T>;
  getItem: (key: string) => T | undefined;
  hasItem: (key: string) => boolean;
  keys: string[];
  values: T[];
}

export function useIndexedData<T extends Record<string, any>>(
  items: T[],
  keyProperty: keyof T = 'id'
): UseIndexedDataResult<T> {
  return useMemo(() => {
    const map: Record<string, T> = {};
    
    if (!Array.isArray(items)) {
      return {
        map,
        getItem: () => undefined,
        hasItem: () => false,
        keys: [],
        values: []
      };
    }
    
    items.forEach(item => {
      if (item && item[keyProperty]) {
        const key = String(item[keyProperty]);
        map[key] = item;
      }
    });
    
    const getItem = (key: string): T | undefined => {
      return map[key];
    };
    
    const hasItem = (key: string): boolean => {
      return key in map;
    };
    
    const keys = Object.keys(map);
    const values = Object.values(map);
    
    return {
      map,
      getItem,
      hasItem,
      keys,
      values
    };
  }, [items, keyProperty]);
}

export default useIndexedData;
