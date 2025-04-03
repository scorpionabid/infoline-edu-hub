
import { useState, useEffect, useCallback } from 'react';
import { Column } from '@/types/column';

export const useColumnData = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [filteredColumns, setFilteredColumns] = useState<Column[]>([]);

  // Burada filtirləmə və sıralama funksiyaları əlavə edilə bilər
  const filterColumns = useCallback((categoryId: string) => {
    const filtered = columns.filter(column => column.categoryId === categoryId);
    setFilteredColumns(filtered);
  }, [columns]);

  return {
    columns,
    filteredColumns,
    setColumns,
    setFilteredColumns,
    filterColumns
  };
};
