
import { CategoryWithColumns } from '@/types/column';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';

/**
 * Kateqoriyanın tamamlanma faizini hesablamaq üçün utilitləri təqdim edən hook
 */
export const useCategoryStatus = () => {
  
  /**
   * Sütunlar və entry-lər əsasında tamamlanma faizini hesablayır
   */
  const calculateCompletionPercentage = (columns: any[], entries: DataEntry[] = []): number => {
    if (!columns.length) return 0;
    
    // Məcburi sütunları tap
    const requiredColumns = columns.filter(col => col.is_required);
    
    // Tamamlanmış sütunları tap (bura məcburi olmayan doldurulmuş sütunlar da daxildir)
    const completedEntries = entries.filter(entry => entry.value && entry.value.trim() !== '');
    
    // Əgər heç bir məcburi sütun yoxdursa
    if (!requiredColumns.length) {
      return completedEntries.length > 0 ? 100 : 0;
    }
    
    // Məcburi sütunların neçəsi doldurulub
    const filledRequiredColumns = requiredColumns.filter(column => 
      entries.some(entry => entry.column_id === column.id && entry.value && entry.value.trim() !== '')
    );
    
    return Math.round((filledRequiredColumns.length / requiredColumns.length) * 100);
  };
  
  /**
   * Entry-lər əsasında kateqoriya statusunu təyin edir
   */
  const determineStatus = (entries: DataEntry[] = []): DataEntryStatus | 'partial' => {
    if (!entries.length) return 'draft';
    
    const statuses = entries.map(entry => entry.status);
    
    if (statuses.every(status => status === 'approved')) return 'approved';
    if (statuses.every(status => status === 'rejected')) return 'rejected';
    if (statuses.every(status => status === 'pending')) return 'pending';
    if (statuses.every(status => status === 'draft')) return 'draft';
    
    // Qarışıq statuslar
    if (statuses.some(status => status === 'approved')) return 'partial';
    if (statuses.some(status => status === 'pending')) return 'pending';
    if (statuses.some(status => status === 'rejected')) return 'partial';
    
    return 'draft';
  };
  
  /**
   * Entry-lər əsasında tamamlanma xəritəsi yaradır
   */
  const generateSummary = (category: CategoryWithColumns) => {
    const { columns = [], entries = [] } = category;
    const completionPercentage = calculateCompletionPercentage(columns, entries as DataEntry[]);
    const status = determineStatus(entries as DataEntry[]);
    
    return {
      ...category,
      completionPercentage,
      status
    };
  };
  
  return {
    calculateCompletionPercentage,
    determineStatus,
    generateSummary
  };
};
