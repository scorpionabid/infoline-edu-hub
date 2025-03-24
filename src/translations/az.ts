
import common from './az/common';
import auth from './az/auth';
import dashboard from './az/dashboard';
import categories from './az/categories';
import navigation from './az/navigation';

// Yeni tərcümələri əlavə edək
const az = {
  ...common,
  ...auth,
  ...dashboard,
  ...categories,
  ...navigation,

  // Ümumi
  errorOccurred: "Xəta baş verdi",
  tryAgainLater: "Zəhmət olmasa, daha sonra yenidən cəhd edin",
  
  // Region
  regions: "Regionlar",
  region: "Region",
  couldNotLoadRegions: "Regionların yüklənməsi mümkün olmadı",
  regionAdded: "Region əlavə edildi",
  regionAddedDesc: "Yeni region uğurla əlavə edildi",
  couldNotAddRegion: "Region əlavə edilə bilmədi",
  regionUpdated: "Region yeniləndi",
  regionUpdatedDesc: "Region məlumatları uğurla yeniləndi",
  couldNotUpdateRegion: "Region yenilənə bilmədi",
  regionDeleted: "Region silindi",
  regionDeletedDesc: "Region uğurla silindi",
  couldNotDeleteRegion: "Region silinə bilmədi",
  
  // Sektor
  sectors: "Sektorlar",
  sector: "Sektor",
  couldNotLoadSectors: "Sektorların yüklənməsi mümkün olmadı",
  sectorAdded: "Sektor əlavə edildi",
  sectorAddedDesc: "Yeni sektor uğurla əlavə edildi",
  couldNotAddSector: "Sektor əlavə edilə bilmədi",
  sectorUpdated: "Sektor yeniləndi",
  sectorUpdatedDesc: "Sektor məlumatları uğurla yeniləndi",
  couldNotUpdateSector: "Sektor yenilənə bilmədi",
  sectorDeleted: "Sektor silindi",
  sectorDeletedDesc: "Sektor uğurla silindi",
  couldNotDeleteSector: "Sektor silinə bilmədi",
  
  // Məktəblər
  schools: "Məktəblər",
  school: "Məktəb",
  couldNotLoadSchools: "Məktəblərin yüklənməsi mümkün olmadı",
  schoolAdded: "Məktəb əlavə edildi",
  schoolAddedDesc: "Yeni məktəb uğurla əlavə edildi",
  couldNotAddSchool: "Məktəb əlavə edilə bilmədi",
  schoolUpdated: "Məktəb yeniləndi",
  schoolUpdatedDesc: "Məktəb məlumatları uğurla yeniləndi",
  couldNotUpdateSchool: "Məktəb yenilənə bilmədi",
  schoolDeleted: "Məktəb silindi",
  schoolDeletedDesc: "Məktəb uğurla silindi",
  couldNotDeleteSchool: "Məktəb silinə bilmədi",
  
  // Kateqoriyalar
  categories: "Kateqoriyalar",
  category: "Kateqoriya",
  couldNotLoadCategories: "Kateqoriyaların yüklənməsi mümkün olmadı",
  categoryAdded: "Kateqoriya əlavə edildi",
  categoryAddedDesc: "Yeni kateqoriya uğurla əlavə edildi",
  couldNotAddCategory: "Kateqoriya əlavə edilə bilmədi",
  categoryUpdated: "Kateqoriya yeniləndi",
  categoryUpdatedDesc: "Kateqoriya məlumatları uğurla yeniləndi",
  couldNotUpdateCategory: "Kateqoriya yenilənə bilmədi",
  categoryDeleted: "Kateqoriya silindi",
  categoryDeletedDesc: "Kateqoriya uğurla silindi",
  couldNotDeleteCategory: "Kateqoriya silinə bilmədi",
  
  // Sütunlar
  columns: "Sütunlar",
  column: "Sütun",
  couldNotLoadColumns: "Sütunların yüklənməsi mümkün olmadı",
  columnAdded: "Sütun əlavə edildi",
  columnAddedDesc: "Yeni sütun uğurla əlavə edildi",
  couldNotAddColumn: "Sütun əlavə edilə bilmədi",
  columnUpdated: "Sütun yeniləndi",
  columnUpdatedDesc: "Sütun məlumatları uğurla yeniləndi",
  couldNotUpdateColumn: "Sütun yenilənə bilmədi",
  columnDeleted: "Sütun silindi",
  columnDeletedDesc: "Sütun uğurla silindi",
  couldNotDeleteColumn: "Sütun silinə bilmədi",
  
  // Məlumat daxil etmə
  dataEntrySaved: "Məlumat saxlanıldı",
  dataEntrySavedDesc: "Məlumatlarınız uğurla saxlanıldı",
  couldNotSaveData: "Məlumatlar saxlanıla bilmədi",
  dataEntryUpdated: "Məlumat yeniləndi",
  dataEntryUpdatedDesc: "Məlumatlarınız uğurla yeniləndi",
  couldNotUpdateData: "Məlumatlar yenilənə bilmədi",
  dataEntryDeleted: "Məlumat silindi",
  dataEntryDeletedDesc: "Məlumatlarınız uğurla silindi",
  couldNotDeleteData: "Məlumatlar silinə bilmədi",
  
  // Təsdiq statusları
  pending: "Gözləyir",
  approved: "Təsdiqlənib",
  rejected: "Rədd edilib",
  submissionSuccess: "Təqdim edildi",
  submissionDescription: "Məlumatlarınız təsdiq üçün göndərildi",
  changesAutoSaved: "Dəyişikliklər avtomatik saxlanıldı",
};

export default az;
