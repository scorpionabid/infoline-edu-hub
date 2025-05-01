
import { useMemo } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';

interface CategoryStatusOptions {
  entries?: DataEntry[];
  showPartialStatus?: boolean;
}

/**
 * Kateqoriya statusunu və tamamlanma faizini hesablamaq üçün hook
 */
export const useCategoryStatus = (category: CategoryWithColumns, options: CategoryStatusOptions = {}) => {
  const { entries = [], showPartialStatus = true } = options;
  
  // Kateqoriyanın statusu və tamamlanma faizini hesablayaq
  const { status, completionPercentage } = useMemo(() => {
    if (!category || !category.columns || category.columns.length === 0) {
      return { status: category.status, completionPercentage: 0 };
    }

    // Kateqoriya daxilində datalar var
    if (entries && entries.length > 0) {
      // Status hesablaması
      const statuses = entries.map(entry => entry.status || 'draft');
      const uniqueStatuses = [...new Set(statuses)];
      
      // Tamamlanma faizi hesablaması
      const columnCount = category.columns.length;
      const filledColumnsCount = entries.length;
      const percentage = Math.round((filledColumnsCount / columnCount) * 100);
      
      // Əgər bütün sütunlar dolmayıb
      if (filledColumnsCount < columnCount && showPartialStatus) {
        return { status: 'partial', completionPercentage: percentage };
      }
      
      // Əgər bütün stauslar eynidir
      if (uniqueStatuses.length === 1) {
        return { status: uniqueStatuses[0] as DataEntryStatus, completionPercentage: percentage };
      }
      
      // Müxtəlif statuslar var, prioritet təyin edək
      if (uniqueStatuses.includes('rejected')) {
        return { status: 'rejected', completionPercentage: percentage };
      }
      
      if (uniqueStatuses.includes('pending')) {
        return { status: 'pending', completionPercentage: percentage };
      }
      
      if (uniqueStatuses.includes('approved')) {
        return { status: 'approved', completionPercentage: percentage };
      }
      
      return { status: 'draft', completionPercentage: percentage };
    }
    
    // Heç bir data yoxdur
    return { status: category.status, completionPercentage: 0 };
  }, [category, entries, showPartialStatus]);
  
  // Status badge rəngini təyin edək
  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Status təsvirini əldə edək
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'Təsdiqlənib';
      case 'pending':
        return 'Gözləmədə';
      case 'rejected':
        return 'Rədd edilib';
      case 'partial':
        return 'Qismən doldurulub';
      case 'active':
        return 'Aktiv';
      case 'inactive':
        return 'Deaktiv';
      case 'draft':
        return 'Qaralama';
      default:
        return status;
    }
  };
  
  return {
    status,
    completionPercentage,
    getStatusBadgeColor,
    getStatusLabel
  };
};

export default useCategoryStatus;
