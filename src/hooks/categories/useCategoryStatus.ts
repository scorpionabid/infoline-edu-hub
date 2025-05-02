
import { useState, useEffect } from 'react';
import { CategoryWithColumns } from '@/types/category';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';

interface UseCategoryStatusOptions {
  entries?: DataEntry[];
}

export const useCategoryStatus = (category: CategoryWithColumns, options?: UseCategoryStatusOptions) => {
  const [status, setStatus] = useState<DataEntryStatus | 'partial'>(category.status as DataEntryStatus || 'draft');
  const [completionPercentage, setCompletionPercentage] = useState<number>(category.completionPercentage || 0);
  const { t } = useLanguage();

  // Statusun badge rəngini qaytar
  const getStatusBadgeColor = (status: DataEntryStatus | 'partial') => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'partial':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Statusun label mətnini qaytar
  const getStatusLabel = (status: DataEntryStatus | 'partial') => {
    switch (status) {
      case 'approved':
        return t('approved');
      case 'pending':
        return t('pending');
      case 'rejected':
        return t('rejected');
      case 'draft':
        return t('draft');
      case 'partial':
        return t('partial');
      default:
        return t('unknown');
    }
  };

  // Entries dəyişəndə statusu yenidən hesabla
  useEffect(() => {
    if (!options?.entries || !category.columns) {
      return;
    }

    const entries = options.entries;
    const totalColumns = category.columns.length;
    const filledColumns = entries.length;
    
    // Tamamlanma faizini hesabla
    const percentage = totalColumns > 0 ? Math.round((filledColumns / totalColumns) * 100) : 0;
    setCompletionPercentage(percentage);

    // Statusu təyin et
    if (filledColumns === 0) {
      setStatus('draft');
    } else if (filledColumns < totalColumns) {
      setStatus('partial');
    } else {
      // Əgər bütün sütunlar doldurulubsa, entrieslərin ümumi statusunu hesabla
      const approvedCount = entries.filter(e => e.status === 'approved').length;
      const rejectedCount = entries.filter(e => e.status === 'rejected').length;
      const pendingCount = entries.filter(e => e.status === 'pending').length;
      
      if (rejectedCount > 0) {
        setStatus('rejected');
      } else if (pendingCount > 0) {
        setStatus('pending');
      } else if (approvedCount === totalColumns) {
        setStatus('approved');
      } else {
        setStatus('partial');
      }
    }
  }, [options?.entries, category.columns]);

  return {
    status,
    completionPercentage,
    getStatusBadgeColor,
    getStatusLabel
  };
};

export default useCategoryStatus;
