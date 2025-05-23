import { useMemo } from 'react';
import { createIndexedMap, safeGetByUUID } from '@/utils/dataIndexing';

/**
 * Hər hansı bir massivi ID-yə görə indekslənmiş obyektə çevirmək üçün hook
 * Bu hook, UUID əsaslı axtarış əməliyyatlarını optimallaşdırır və TypeScript tipləmə dəstəyi təmin edir
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
    return createIndexedMap(items, keyField);
  }, [items, keyField]);
  
  // Element almaq üçün təhlükəsiz funksiya
  const getItem = useMemo(() => {
    return (id: string | null | undefined) => safeGetByUUID(map, id);
  }, [map]);
  
  // Elementin mövcudluğunu yoxlamaq üçün funksiya
  const hasItem = useMemo(() => {
    return (id: string | null | undefined) => !!id && !!map[id];
  }, [map]);
  
  return { map, getItem, hasItem };
}
