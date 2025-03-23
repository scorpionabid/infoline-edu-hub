
import { EntryValue } from '@/types/dataEntry';

/**
 * Verilmiş sütun ID-si üçün dəyəri kateqoriya məlumatları içərisindən əldə edir
 */
export const getValueForColumn = (values: EntryValue[], columnId: string): any => {
  const value = values.find(v => v.columnId === columnId)?.value;
  return value !== undefined ? value : '';
};

/**
 * Verilmiş sütun ID-si üçün statusu kateqoriya məlumatları içərisindən əldə edir
 */
export const getStatusForColumn = (values: EntryValue[], columnId: string): 'pending' | 'approved' | 'rejected' => {
  return values.find(v => v.columnId === columnId)?.status || 'pending';
};

