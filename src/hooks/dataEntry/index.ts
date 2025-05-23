/**
 * Data Entry ilə əlaqəli bütün hook-ları export edir
 * 
 * Bu fayl data entry ilə əlaqəli bütün hook-ları bir yerdən export etmək üçün istifadə olunur.
 * 
 * Eyi zamanda bu index faylı köhnə hook-ları yeni versiyalara yönləndirir (@/hooks/business/dataEntry).
 * Bu, layihədə mövcud olan kodların işləməyə davam etməsini təmin edir, həmzaman da yeni hook-lara
 * keçidi asanlaşdırır.
 * 
 * ```typescript
 * // Sadələşdirilmiş import
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
// Aşağıdakı hook-ların yəni versiyaları @/hooks/business/dataEntry qovluğunda yerləşir
// Lakin uyumluluq üçün onları burada da export edirik
export * from './useDataEntries';       // Məlumat daxil etmə qeydlərini əldə etmək üçün
export * from './useDataEntry';         // Məlumat daxil etmə formasını idarə etmək üçün (köhnə versiya)
export * from './useDataEntryState';    // Məlumat daxil etmə vəziyyətini idarə etmək üçün (köhnə versiya)
export * from './useDataUpdates';       // Məlumat yeniləmələrini idarə etmək üçün
export * from './useSectorDataEntry';   // Sektor məlumatlarını daxil etmək üçün

// İndeksləmə və utilit hook-lar
export * from './useIndexedData';       // Məlumatları indeksləmək üçün

// Yeni optimizə edilmiş business hook-larını da ixrac edirik (köhnə adlarla)
import { useDataEntryBusiness, useDataEntryStateBusiness } from '@/hooks';

// Bu re-export-lar köhnə kodun işləməyə davam etməsini təmin edir
// Eyni zamanda yeni hook-lara keçidi asanlaşdırır
export {
  useDataEntryBusiness as useDataEntryNew,
  useDataEntryStateBusiness as useDataEntryStateNew
};
