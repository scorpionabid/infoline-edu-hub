
import { useMemo } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';

interface UseCategoryStatusProps {
  entries: DataEntry[];
}

export const useCategoryStatus = (category: CategoryWithColumns, props?: UseCategoryStatusProps) => {
  const { t } = useLanguage();
  const entries = props?.entries || category.entries || [];

  // Kateqoriyanın statusunu hesablayaq
  const status = useMemo(() => {
    if (!entries || entries.length === 0) return 'draft';

    const statuses = entries.map(entry => entry.status);
    
    if (statuses.every(s => s === 'approved')) return 'approved';
    if (statuses.every(s => s === 'rejected')) return 'rejected';
    if (statuses.every(s => s === 'pending')) return 'pending';
    if (statuses.every(s => s === 'draft')) return 'draft';
    
    // Qarışıq statuslar
    if (statuses.some(s => s === 'approved')) return 'partial';
    if (statuses.some(s => s === 'pending')) return 'pending';
    if (statuses.some(s => s === 'rejected')) return 'partial';
    
    return 'draft';
  }, [entries]);
  
  // Tamamlanma faizini hesablayaq
  const completionPercentage = useMemo(() => {
    if (!category.columns || category.columns.length === 0) return 0;
    
    // Məcburi sütunları tap
    const requiredColumns = category.columns.filter(col => col.is_required);
    
    // Tamamlanmış sütunlar
    const completedEntries = entries.filter(entry => 
      entry.value && entry.value.trim() !== ''
    );
    
    // Məcburi sütun yoxdursa
    if (!requiredColumns.length) {
      return completedEntries.length > 0 ? 100 : 0;
    }
    
    // Məcburi sütunlardan neçəsi doldurulub
    const filledRequiredColumns = requiredColumns.filter(column => 
      entries.some(entry => 
        entry.column_id === column.id && 
        entry.value && 
        entry.value.trim() !== ''
      )
    );
    
    return Math.round((filledRequiredColumns.length / requiredColumns.length) * 100);
  }, [category.columns, entries]);
  
  // Status üçün badge rəngini təyin edək
  const getStatusBadgeColor = (status: DataEntryStatus | 'partial') => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Status əsasında mətn təyin edək
  const getStatusLabel = (status: DataEntryStatus | 'partial') => {
    switch(status) {
      case 'approved': return t('approved');
      case 'pending': return t('pending');
      case 'rejected': return t('rejected');
      case 'draft': return t('draft');
      case 'partial': return t('partial');
      default: return t('unknown');
    }
  };
  
  return {
    status,
    completionPercentage,
    getStatusBadgeColor,
    getStatusLabel
  };
};
