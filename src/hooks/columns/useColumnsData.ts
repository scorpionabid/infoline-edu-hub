
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { v4 as uuid } from 'uuid';
import { Column } from '@/types/column';

export const useColumnsData = (categoryId?: string) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  // Fetch columns for a specific category
  const fetchColumns = async () => {
    setIsLoading(true);
    try {
      // Mock fetch - in a real app, this would call an API or DB service
      setTimeout(() => {
        const mockColumns: Column[] = [
          {
            id: 'col1',
            categoryId: categoryId || 'default',
            name: 'Şagird sayı',
            type: 'number',
            isRequired: true,
            order: 1,
            orderIndex: 1,
            status: 'active',
            validation: {
              min: 0,
              max: 10000
            }
          },
          {
            id: 'col2',
            categoryId: categoryId || 'default',
            name: 'Müəllim sayı',
            type: 'number',
            isRequired: true,
            order: 2,
            orderIndex: 2,
            status: 'active',
            validation: {
              min: 0,
              max: 1000
            }
          },
          {
            id: 'col3',
            categoryId: categoryId || 'default',
            name: 'Məktəb tipi',
            type: 'select',
            isRequired: true,
            order: 3,
            orderIndex: 3,
            status: 'active',
            options: [
              { label: 'İbtidai məktəb', value: 'primary' },
              { label: 'Orta məktəb', value: 'middle' },
              { label: 'Tam orta məktəb', value: 'high' }
            ]
          }
        ];

        setColumns(mockColumns);
        setIsLoading(false);
      }, 800);
    } catch (err: any) {
      console.error('Error fetching columns:', err);
      setError(err);
      setIsLoading(false);
      toast({
        title: t('error'),
        description: t('errorFetchingColumns'),
        variant: 'destructive',
      });
    }
  };

  // Create new column
  const createColumn = async (columnData: Omit<Column, 'id'>) => {
    try {
      // Mock create - in a real app, this would call an API or DB service
      const newColumn: Column = {
        ...columnData,
        id: uuid()
      };

      setColumns(prev => [...prev, newColumn]);
      return newColumn;
    } catch (err: any) {
      console.error('Error creating column:', err);
      toast({
        title: t('error'),
        description: t('errorCreatingColumn'),
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Update existing column
  const updateColumn = async (columnData: Column) => {
    try {
      // Mock update - in a real app, this would call an API or DB service
      setColumns(prev => prev.map(col => 
        col.id === columnData.id ? columnData : col
      ));
      return columnData;
    } catch (err: any) {
      console.error('Error updating column:', err);
      toast({
        title: t('error'),
        description: t('errorUpdatingColumn'),
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Delete column
  const deleteColumn = async (columnId: string) => {
    try {
      // Mock delete - in a real app, this would call an API or DB service
      setColumns(prev => prev.filter(col => col.id !== columnId));
      return true;
    } catch (err: any) {
      console.error('Error deleting column:', err);
      toast({
        title: t('error'),
        description: t('errorDeletingColumn'),
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Load columns on mount or when categoryId changes
  useEffect(() => {
    fetchColumns();
  }, [categoryId]);

  return {
    columns,
    isLoading,
    error,
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn
  };
};
