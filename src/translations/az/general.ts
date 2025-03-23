
/**
 * Ümumi tərcümələr
 */
const general = {
  // General
  welcome: "Xoş gəlmisiniz",
  dashboard: "İdarəetmə paneli",
  settings: "Tənzimləmələr",
  profile: "Profil",
  logout: "Çıxış",
  login: "Daxil ol",
  register: "Qeydiyyat",
  save: "Saxla",
  cancel: "Ləğv et",
  delete: "Sil",
  edit: "Redaktə et",
  create: "Yarat",
  search: "Axtar",
  filter: "Filtrlə",
  sort: "Sırala",
  export: "İxrac et",
  import: "İdxal et",
  download: "Yüklə",
  uploadFile: "Fayl yüklə",
  submit: "Təsdiq et",
  confirm: "Təsdiqlə",
  back: "Geri",
  next: "İrəli",
  previous: "Əvvəlki",
  loading: "Yüklənir...",
  success: "Uğurlu",
  error: "Xəta",
  warning: "Xəbərdarlıq",
  info: "Məlumat",
  required: "Məcburi",
  optional: "İstəyə bağlı",
  
  // Form status tərcümələri
  formStatus: "Form statusu",
  allForms: "Bütün formlar",
  pendingForms: "Gözləyən formlar",
  approvedForms: "Təsdiqlənmiş",
  rejectedForms: "Rədd edilmiş",
  dueSoonForms: "Vaxtı yaxınlaşır",
  overdueForms: "Vaxtı keçmiş",
  draft: "Qaralama",
  
  // Tooltip mətnləri
  allFormsTooltip: "Bütün mövcud formlar",
  pendingFormsTooltip: "Təsdiq gözləyən formlar",
  approvedFormsTooltip: "Təsdiqlənmiş formlar",
  rejectedFormsTooltip: "Düzəliş tələb edən formlar",
  dueSoonTooltip: "Son tarixi yaxınlaşan formlar",
  overdueTooltip: "Vaxtı keçmiş formlar",
  
  // Form statusları
  pending: "Gözləyən",
  approved: "Təsdiqlənmiş",
  rejected: "Rədd edilmiş",
  dueSoon: "Vaxtı yaxınlaşır",
  overdue: "Vaxtı keçmiş",
  empty: "Boş",
  
  // Form axtarış və filtrləmə
  searchForms: "Formları axtar...",
  filterByCategory: "Kateqoriyaya görə filtrlə",
  filterByStatus: "Statusa görə filtrlə",
  allCategories: "Bütün kateqoriyalar",
  allStatuses: "Bütün statuslar",
  noFormsFound: "Form tapılmadı",
  adjustSearchFilters: "Axtarış parametrlərini dəyişin",
  noFormsInThisCategory: "Bu kateqoriyada form yoxdur",
  noPendingForms: "Gözləyən form yoxdur",
  allFormsCompleted: "Bütün formlar tamamlanıb",
  noUrgentForms: "Təcili form yoxdur",
  allFormsOnTrack: "Bütün formlar plana uyğundur",
  
  // Şifrə ilə bağlı
  showPassword: "Şifrəni göstər",
  hidePassword: "Şifrəni gizlət",
  passwordChanged: "Şifrə dəyişdirildi",
  passwordChangedDesc: "Şifrəniz uğurla yeniləndi",
  passwordChangeFailed: "Şifrə dəyişdirilmədi",
  passwordChangeFailedDesc: "Şifrəniz dəyişdirilərkən xəta baş verdi",
  passwordRequirementsNotMet: "Şifrə ən azı bir böyük hərf, bir kiçik hərf və bir rəqəm daxil etməlidir",
  
  // Data Entry və Formlar
  enterData: "Məlumat daxil et",
  forms: "Formlar",
  recentForms: "Son formlar",
  // pendingForms: "Gözləyən formlar", (Bu təkrarlanan sətri silindi)
  urgentForms: "Təcili formlar",
  openingForm: "Form açılır",
  formId: "Form ID",
  navigatingToDataEntry: "Məlumat daxil etmə səhifəsinə keçid edilir",
  navigatingToDataEntryDesc: "Məlumatlarınızı daxil etmək və redaktə etmək üçün yönləndirilirsiniz",
  
  // App specific
  appName: "InfoLine",
  appDescription: "Məlumat idarəetmə sistemi",
  appVersion: "Versiya",
  appCopyright: "Bütün hüquqlar qorunur",
  appTerms: "İstifadə şərtləri",
  appPrivacy: "Gizlilik siyasəti",
  
  // Deadline related
  upcomingDeadlines: "Yaxınlaşan son tarixlər",
  daysLeft: "gün qalıb",
  lastEditedCategory: "Son işlədiyiniz kateqoriya",
  continueEditing: "davam etmək istəyirsiniz?",
  continue: "Davam et",
  
  // Dashboard specific
  completionRate: "Tamamlanma",
  
  // Error related
  errorLoadingData: "Məlumatlar yüklənərkən xəta baş verdi",
  statusUpdateFailed: "Status yenilənmədi",
  deleteFailed: "Silinmə uğursuz oldu",
  
  // Category related
  noMatchingRecordsFound: "Uyğun nəticə tapılmadı",
  openMenu: "Menyunu aç",
  deleteConfirmationMessage: "Bu əməliyyat geri qaytarıla bilməz",
  categoryDeactivated: "Kateqoriya deaktiv edildi",
  categoryActivated: "Kateqoriya aktiv edildi",
  categoryDeleted: "Kateqoriya silindi",
  categoryArchived: "Kateqoriya arxivləşdirildi",
  categoryUnarchived: "Kateqoriya arxivdən çıxarıldı",
  archive: "Arxivləşdir",
  unarchive: "Arxivdən çıxar",
  archived: "Arxivlənmiş",
  allRegions: "Bütün regionlar",
  sectorsOnly: "Yalnız sektorlar"
};

export default general;
