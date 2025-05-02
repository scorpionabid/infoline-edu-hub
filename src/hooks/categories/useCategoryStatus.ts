
import { useMemo } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';

interface UseCategoryStatusOptions {
  entries?: DataEntry[];
}

export const useCategoryStatus = (
  category: CategoryWithColumns,
  options: UseCategoryStatusOptions = {}
) => {
  const { entries = [] } = options;

  // Status hesablanması
  const status = useMemo<DataEntryStatus>(() => {
    if (!category.columns || category.columns.length === 0) {
      return 'draft';
    }

    // Əgər verilmiş giriş yoxdursa
    if (!entries || entries.length === 0) {
      return 'draft';
    }

    // Bütün girişlər təsdiqlənibsə
    const allApproved = entries.every(entry => entry.status === 'approved');
    if (allApproved) {
      return 'approved';
    }

    // Bütün girişlər rədd edilibsə
    const allRejected = entries.every(entry => entry.status === 'rejected');
    if (allRejected) {
      return 'rejected';
    }

    // Heç bir giriş təsdiqlənməyibsə və ya rədd edilməyibsə
    const hasPending = entries.some(entry => entry.status === 'pending');
    if (hasPending) {
      return 'pending';
    }

    // Default olaraq qaralama vəziyyəti
    return 'draft';
  }, [category, entries]);

  // Tamamlanma faizi hesablanması
  const completionPercentage = useMemo<number>(() => {
    if (!category.columns || category.columns.length === 0) {
      return 0;
    }

    if (!entries || entries.length === 0) {
      return 0;
    }

    const requiredColumns = category.columns.filter(column => column.is_required);
    if (requiredColumns.length === 0) {
      return 0;
    }

    const filledRequiredEntries = entries.filter(entry => {
      const column = category.columns.find(col => col.id === entry.column_id);
      return column && column.is_required && entry.value && entry.value.trim() !== '';
    });

    if (filledRequiredEntries.length === 0) {
      return 0;
    }

    return Math.round((filledRequiredEntries.length / requiredColumns.length) * 100);
  }, [category, entries]);

  // Status badge rəngi
  const getStatusBadgeColor = (status: DataEntryStatus | string): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Status etiketi
  const getStatusLabel = (status: DataEntryStatus | string): string => {
    switch (status) {
      case 'approved':
        return 'Təsdiqlənib';
      case 'pending':
        return 'Gözləyir';
      case 'rejected':
        return 'Rədd edilib';
      case 'draft':
        return 'Qaralama';
      default:
        return 'Naməlum';
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
