/**
 * Data Entry hook-ları üçün mərkəzi ixrac nöqtəsi
 * 
 * Bu fayl həm köhnə, həm də yeni hook-ların uyğunluğunu təmin edir.
 * Yeni komponentlər üçün core/ qovluğundakı versiyalar istifadə edilməlidir.
 */

// Əsas hook-lar
export { useDataEntry } from './useDataEntry';
export { useDataEntryState } from './useDataEntryState';
export { useCategoryData } from './useCategoryData';
export { useCategories } from './useCategories';

// Əlavə hook-lar
import useDataEntries from './useDataEntries';
export { useDataEntries };
export { useDataUpdates } from './useDataUpdates';
export { useIndexedData } from './useIndexedData';
export { useSchool } from './useSchool';
export { useSectorDataEntry } from './useSectorDataEntry';
export { useCategoryStatus } from './useCategoryStatus';

// Köhnə interfeys və funksionallıq uyğunluğu
export * from './useDataEntry';
