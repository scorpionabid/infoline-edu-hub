import auth from './auth';
import general from './general';
import navigation from './navigation';
import notifications from './notifications';
import organization from './organization';
import reports from './reports';
import status from './status';
import time from './time';
import ui from './ui';
import user from './user';
import validation from './validation';
import feedback from './feedback';
import dataEntry from './dataEntry';

const translations = {
  ...auth,
  ...general,
  ...navigation,
  ...notifications,
  ...organization,
  ...reports,
  ...status,
  ...time,
  ...ui,
  ...user,
  ...validation,
  ...feedback,
  ...dataEntry,

  // Kateqoriyalar və Sütunlar səhifəsi üçün tərcümələr
  categories: "Kateqoriyalar",
  categoryName: "Kateqoriya adı",
  assignment: "Təyinat",
  priority: "Prioritet",
  description: "Təsvir",
  columnCount: "Sütun sayı",
  all: "Hamısı",
  sectors: "Sektorlar",
  active: "Aktiv",
  inactive: "Deaktiv",
  addCategory: "Kateqoriya əlavə et",
  editCategory: "Kateqoriyanı redaktə et",
  deleteCategory: "Kateqoriyanı sil",
  searchCategories: "Kateqoriyalarda axtar...",
  categoryAdded: "Kateqoriya əlavə edildi",
  categoryAddedSuccess: "Kateqoriya uğurla əlavə edildi",
  categoryAddFailed: "Kateqoriya əlavə edilmədi",
  categoryAddFailedDesc: "Kateqoriya əlavə edilərkən xəta baş verdi",
  categoryUpdated: "Kateqoriya yeniləndi",
  categoryUpdatedSuccess: "Kateqoriya uğurla yeniləndi",
  categoryUpdateFailed: "Kateqoriya yenilənmədi",
  categoryUpdateFailedDesc: "Kateqoriya yenilənərkən xəta baş verdi",
  categoryDeleted: "Kateqoriya silindi",
  categoryDeletedSuccess: "Kateqoriya uğurla silindi",
  categoryDeleteFailed: "Kateqoriya silinmədi",
  categoryDeleteFailedDesc: "Kateqoriya silinərkən xəta baş verdi",
  categoryStatusUpdatedSuccess: "Kateqoriya statusu uğurla yeniləndi",
  
  // Sütunlar
  columns: "Sütunlar",
  columnName: "Sütun adı",
  type: "Növ",
  required: "Məcburi",
  optional: "İxtiyari",
  addColumn: "Sütun əlavə et",
  editColumn: "Sütunu redaktə et",
  deleteColumn: "Sütunu sil",
  searchColumns: "Sütunlarda axtar...",
  columnAdded: "Sütun əlavə edildi",
  columnAddedSuccess: "Sütun uğurla əlavə edildi",
  columnAddFailed: "Sütun əlavə edilmədi",
  columnAddFailedDesc: "Sütun əlavə edilərkən xəta baş verdi",
  columnUpdated: "Sütun yeniləndi",
  columnUpdatedSuccess: "Sütun uğurla yeniləndi",
  columnUpdateFailed: "Sütun yenilənmədi",
  columnUpdateFailedDesc: "Sütun yenilənərkən xəta baş verdi",
  columnDeleted: "Sütun silindi",
  columnDeletedSuccess: "Sütun uğurla silindi",
  columnDeleteFailed: "Sütun silinmədi",
  columnDeleteFailedDesc: "Sütun silinərkən xəta baş verdi",
  columnStatusUpdatedSuccess: "Sütun statusu uğurla yeniləndi",
  noColumnsFound: "Sütun tapılmadı",
  noColumnsFoundDesc: "Axtarış şərtlərinə uyğun sütun tapılmadı",
  adjustFiltersOrAddNew: "Filtrləri dəyişin və ya yeni sütun əlavə edin",
  
  // Sütun növləri
  text: "Mətn",
  number: "Rəqəm",
  date: "Tarix",
  select: "Seçim",
  checkbox: "Çoxseçimli",
  radio: "Tək seçimli",
  file: "Fayl",
  image: "Şəkil",
  
  // Statistika
  totalColumns: "Ümumi sütunlar",
  requiredColumns: "Məcburi sütunlar",
  completionRate: "Tamamlanma",
  
  // Import/Export
  importColumns: "Sütunlar idxal et",
  exportTemplate: "Şablon ixrac et",
  columnsImported: "Sütunlar idxal edildi",
  columnsImportedSuccess: "Sütunlar uğurla idxal edildi",
  importFailed: "İdxal xətası",
  importFailedDesc: "Sütunlar idxal edilərkən xəta baş verdi",
  templateExported: "Şablon ixrac edildi",
  templateExportedSuccess: "Excel şablonu uğurla ixrac edildi",
  
  // Görünüş
  listView: "Cədvəl",
  gridView: "Şəbəkə",
  
  // Filter labels
  filterByCategory: "Kateqoriyaya görə",
  filterByType: "Növə görə",
  filterByStatus: "Statusa görə",
  
  // Common actions
  edit: "Redaktə et",
  delete: "Sil",
  cancel: "Ləğv et",
  confirm: "Təsdiqlə",
  save: "Yadda saxla",
  import: "İdxal et",
  export: "İxrac et",
  upload: "Yüklə",
  download: "Endir",
  
  // Confirmations
  deleteColumnConfirmation: "Bu sütunu silmək istədiyinizə əminsiniz?",
  
  // Other
  unknownCategory: "Naməlum kateqoriya"
};

export default translations;
