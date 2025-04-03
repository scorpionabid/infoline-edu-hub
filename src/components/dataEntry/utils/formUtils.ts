
import { v4 as uuidv4 } from 'uuid';
import { CategoryEntryData, DataEntryStatus, ColumnEntry } from '@/types/dataEntry';

export const createEmptyEntries = (categoryIds: string[]): CategoryEntryData[] => {
  return categoryIds.map(categoryId => ({
    id: uuidv4(),
    categoryId,
    categoryName: '',
    order: 0,
    progress: 0,
    status: 'draft',
    values: [],
    entries: {}, // Boş bir object olaraq təyin edildi
    isCompleted: false,
    isSubmitted: false,
    completionPercentage: 0
  }));
};

export const createEmptyEntry = (categoryId: string): CategoryEntryData => {
  return {
    id: uuidv4(),
    categoryId,
    categoryName: '',
    order: 0,
    progress: 0,
    status: 'draft',
    values: [],
    entries: {}, // Boş bir object olaraq təyin edildi
    isSubmitted: false
  };
};

export const createColumnEntry = (columnId: string, value: string = '', status: DataEntryStatus = 'draft'): ColumnEntry => {
  return {
    id: uuidv4(),
    columnId,
    value,
    isValid: true, // isValid əlavə edildi
    status
  };
};

export const calculateProgress = (values: ColumnEntry[], requiredColumnIds: string[]): number => {
  if (requiredColumnIds.length === 0) {
    return 100;
  }

  const completedRequired = requiredColumnIds.filter(id => {
    const entry = values.find(v => v.columnId === id);
    return entry && entry.value && entry.value.trim() !== '';
  }).length;

  return Math.round((completedRequired / requiredColumnIds.length) * 100);
};

export const formatEntryStatus = (status: DataEntryStatus): {
  label: string;
  color: string;
} => {
  switch (status) {
    case 'approved':
      return { label: 'Təsdiqlənmiş', color: 'green' };
    case 'rejected':
      return { label: 'Rədd edilmiş', color: 'red' };
    case 'pending':
      return { label: 'Gözləmədə', color: 'yellow' };
    case 'draft':
      return { label: 'Qaralama', color: 'gray' };
    case 'submitted':
      return { label: 'Göndərilmiş', color: 'blue' };
    default:
      return { label: 'Naməlum', color: 'gray' };
  }
};
