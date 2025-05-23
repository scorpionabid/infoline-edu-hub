import { useMemo } from 'react';

/**
 * Hər hansı bir massivi ID-yə görə indekslənmiş obyektə çevirmək üçün hook
 * Bu hook, UUID əsaslı axtarış əməliyyatlarını optimallaşdırır və TypeScript tipləmə dəstəyi təmin edir
 * 
 * @template T - İndekslənəcək elementlərin tipi
 * @param items - İndekslənəcək elementlər massivi
 * @param keyField - Elementlərin indekslənəcəyi açar sahəsi (default: 'id')
 * @returns İndekslənmiş map və element əldə etmək üçün funksiyalar
 */
export function useIndexedData<T extends { [key: string]: any }>(
  items: T[] | null | undefined,
  keyField: keyof T = 'id' as keyof T
): {
  map: Record<string, T>;
  getItem: (id: string | null | undefined) => T | null;
  hasItem: (id: string | null | undefined) => boolean;
} {
  // İndekslənmiş map obyektini yaradırıq
  const map = useMemo(() => {
    if (!items || !Array.isArray(items)) {
      return {} as Record<string, T>;
    }
    
    return items.reduce((acc, item) => {
      const key = item[keyField];
      if (key) {
        acc[key as string] = item;
      }
      return acc;
    }, {} as Record<string, T>);
  }, [items, keyField]);
  
  // Element almaq üçün təhlükəsiz funksiya
  const getItem = useMemo(() => {
    return (id: string | null | undefined) => {
      if (!id || !map[id]) return null;
      return map[id];
    };
  }, [map]);
  
  // Elementin mövcudluğunu yoxlamaq üçün funksiya
  const hasItem = useMemo(() => {
    return (id: string | null | undefined) => !!id && !!map[id];
  }, [map]);
  
  return { map, getItem, hasItem };
}

export default useIndexedData;
