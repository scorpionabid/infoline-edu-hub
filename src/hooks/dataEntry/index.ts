/**
 * Data Entry ilə əlaqəli bütün hook-ları export edir
 * 
 * Bu fayl data entry ilə əlaqəli bütün hook-ları bir yerdən export etmək üçün istifadə olunur.
 * Bu, import-ları daha sadə və təmiz edir:
 * 
 * ```typescript
 * // Əvvəlki import üslubu
 * import { useDataEntry } from '@/hooks/dataEntry/useDataEntry';
 * import { useCategories } from '@/hooks/dataEntry/useCategories';
 * 
 * // Yeni import üslubu
 * import { useDataEntry, useCategories } from '@/hooks/dataEntry';
 * ```
 */

// Kateqoriya ilə əlaqəli hook-lar
// Bu hook-lar kateqoriyaları əldə etmək və idarə etmək üçün istifadə olunur
export * from './useCategoryData';      // Kateqoriya və sütun məlumatlarını əldə etmək üçün
export * from './useCategoryStatus';    // Kateqoriya statusunu və tamamlanma faizini hesablamaq üçün
export * from './useCategories';        // Bütün kateqoriyaları əldə etmək üçün

// Məktəb ilə əlaqəli hook-lar
// Bu hook-lar məktəb məlumatlarını əldə etmək üçün istifadə olunur
export * from './useSchool';            // Məktəb məlumatlarını əldə etmək üçün

// Data entry ilə əlaqəli hook-lar
// Bu hook-lar məlumat daxil etmə formasını idarə etmək üçün istifadə olunur
export * from './useDataEntry';         // Məlumat daxil etmə formasını idarə etmək üçün
export * from './useDataEntries';       // Məlumat daxil etmə qeydlərini əldə etmək üçün
export * from './useDataEntryState';    // Məlumat daxil etmə vəziyyətini idarə etmək üçün
export * from './useDataUpdates';       // Məlumat yeniləmələrini idarə etmək üçün
export * from './useSectorDataEntry';   // Sektor məlumatlarını daxil etmək üçün
