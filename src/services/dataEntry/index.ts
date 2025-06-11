/**
 * Data Entry Service Module
 * 
 * Bu modul bütün məlumat daxil etmə əməliyyatları üçün
 * mərkəzləşdirilmiş service-ləri eksport edir.
 */

export { DataEntryService } from './dataEntryService';
export type { 
  SaveDataEntryOptions, 
  SaveResult, 
  SubmitResult 
} from './dataEntryService';

// Legacy compatibility - köhnə import-lar üçün
import { DataEntryService } from './dataEntryService';

/**
 * @deprecated Use DataEntryService.saveFormData instead
 * Legacy function wrapper for backward compatibility
 */
export const saveDataEntriesLegacy = async (
  entries: any[],
  categoryId: string,
  schoolId: string,
  userId?: string
) => {
  console.warn('saveDataEntries is deprecated. Use DataEntryService.saveFormData instead.');
  
  // Convert old format to new format
  const formData = entries.reduce((acc, entry) => {
    acc[entry.column_id] = entry.value;
    return acc;
  }, {});
  
  return DataEntryService.saveFormData(formData, {
    categoryId,
    schoolId,
    userId,
    status: 'draft'
  });
};

// Backward compatibility alias
export { saveDataEntriesLegacy as saveDataEntries };
