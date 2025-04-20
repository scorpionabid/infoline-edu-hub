/**
 * UI elementlər ilə bağlı tərcümələr
 */
const ui = {
  // Button Labels
  save: "Saxla",
  saving: "Saxlanılır...",
  cancel: "Ləğv et",
  close: "Bağla",
  confirm: "Təsdiqlə",
  discard: "İmtina et",
  add: "Əlavə et",
  remove: "Sil",
  search: "Axtar",
  filter: "Filtrlə",
  apply: "Tətbiq et",
  clear: "Təmizlə",
  upload: "Yüklə",
  download: "Endir",
  submit: "Təqdim et",
  edit: "Redaktə et",
  create: "Yarat",
  delete: "Sil",
  resetPassword: "Şifrəni sıfırla",
  changePassword: "Şifrəni dəyiş",
  signIn: "Daxil ol",
  signUp: "Qeydiyyatdan keç",
  signOut: "Çıxış",
  
  // General UI elements
  loadMore: "Daha çox yüklə",
  showMore: "Daha çox göstər",
  showLess: "Daha az göstər",
  searchResults: "Axtarış nəticələri",
  noResults: "Nəticə tapılmadı",
  loading: "Yüklənir...",
  success: "Uğurlu",
  error: "Xəta",
  warning: "Xəbərdarlıq",
  info: "Məlumat",
  status: "Status",
  actions: "Əməliyyatlar",
  details: "Detallar",
  summary: "Xülasə",
  description: "Təsvir",
  
  // Status texts
  active: "Aktiv",
  inactive: "Deaktiv",
  pending: "Gözləmədə",
  completed: "Tamamlanmış",
  draft: "Qaralama",
  published: "Dərc edilmiş",
  archived: "Arxivlənmiş",
  deleted: "Silinmiş",
  all: "Hamısı",
  
  // Filter labels
  allStatuses: "Bütün statuslar",
  allTypes: "Bütün tiplər",
  allCategories: "Bütün kateqoriyalar",
  allAssignments: "Bütün təyinatlar",
  allDeadlines: "Bütün son tarixlər",
  filterByStatus: "Statusa görə filtr",
  filterByType: "Tipə görə filtr",
  filterByCategory: "Kateqoriyaya görə filtr",
  filterByAssignment: "Təyinata görə filtr",
  
  // Deadline related
  upcomingDeadlines: "Yaxınlaşan son tarixlər",
  pastDeadlines: "Keçmiş son tarixlər",
  selectDate: "Tarix seçin",
  noDueDate: "Son tarix yoxdur",
  priority: "Prioritet",
  priorityDescription: "Daha yüksək rəqəm daha yüksək prioritet deməkdir",
  
  // Data table elements
  rowsPerPage: "Səhifə başına sətir",
  of: "dən", // e.g. "1-10 of 100"
  previous: "Əvvəlki",
  next: "Növbəti",
  first: "İlk",
  last: "Son",
  page: "Səhifə",
  sortAscending: "Artan sıralama",
  sortDescending: "Azalan sıralama",
  
  // Stats
  totalCategories: "Ümumi kateqoriyalar",
  activeCategories: "Aktiv kateqoriyalar",
  inactiveCategories: "Deaktiv kateqoriyalar",
  draftCategories: "Qaralama kateqoriyalar",
  categoriesForAllSchools: "Bütün məktəblər üçün",
  categoriesForSectors: "Sektorlar üçün",
  categoriesWithDeadline: "Son tarixli kateqoriyalar",
  
  // Form elements
  required: "Tələb olunur",
  optional: "İxtiyari",
  defaultValue: "Standart dəyər",
  placeholder: "Placeholder",
  helpText: "Köməkçi mətn",
  
  // Error messages
  errorOccurred: "Xəta baş verdi",
  pleaseTryAgain: "Zəhmət olmasa yenidən cəhd edin",
  somethingWentWrong: "Nəsə səhv getdi",
  pleaseTryAgainLater: "Zəhmət olmasa daha sonra yenidən cəhd edin",
  couldNotLoadData: "Məlumatlar yüklənə bilmədi",
  couldNotSaveData: "Məlumatlar saxlanıla bilmədi",
  couldNotDeleteData: "Məlumatlar silinə bilmədi",
  couldNotLoadCategories: "Kateqoriyalar yüklənə bilmədi",
  someDataMayNotBeSaved: "Bəzi məlumatlar saxlanılmaya bilər",
  
  // Time related
  today: "Bu gün",
  yesterday: "Dünən",
  tomorrow: "Sabah",
  thisWeek: "Bu həftə",
  lastWeek: "Keçən həftə",
  thisMonth: "Bu ay",
  lastMonth: "Keçən ay",
  thisYear: "Bu il",
  lastYear: "Keçən il",
  
  // Notifications
  notificationsEmpty: "Bildiriş yoxdur",
  markAllAsRead: "Hamısını oxunmuş kimi işarələ",
  clearAllNotifications: "Bütün bildirişləri təmizlə",
  newNotification: "Yeni bildiriş",
  
  // Auth related
  welcomeBack: "Xoş gəlmisiniz",
  loginToYourAccount: "Hesabınıza daxil olun",
  emailAddress: "E-poçt ünvanı",
  password: "Şifrə",
  forgotPassword: "Şifrəni unutmusunuz?",
  rememberMe: "Məni xatırla",
  dontHaveAccount: "Hesabınız yoxdur?",
  createAccount: "Hesab yaradın",
  alreadyHaveAccount: "Artıq hesabınız var?",
  loginHere: "Buradan daxil olun",
  loggedInAs: "Daxil olub:",
  logout: "Çıxış",
  profile: "Profil",
  settings: "Tənzimləmələr",
  
  // Theme
  lightMode: "İşıqlı rejim",
  darkMode: "Qaranlıq rejim",
  systemMode: "Sistem rejimi",
  
  // Language
  language: "Dil",
  azerbaijani: "Azərbaycan",
  english: "İngilis",
  russian: "Rus",
  turkish: "Türk",
  
  // Validation
  invalidEmail: "Yanlış e-poçt ünvanı",
  invalidPhoneNumber: "Yanlış telefon nömrəsi",
  passwordTooShort: "Şifrə çox qısadır",
  fieldRequired: "Bu sahə tələb olunur",
  mustBeNumber: "Rəqəm olmalıdır",
  mustBePositive: "Müsbət rəqəm olmalıdır",
  mustBeDate: "Tarix olmalıdır",
  invalidFormat: "Yanlış format",
  
  // Not found
  pageNotFound: "Səhifə tapılmadı",
  resourceNotFound: "Resurs tapılmadı",
  goBackHome: "Ana səhifəyə qayıt",
  
  // Bulk actions
  bulkActions: "Toplu əməliyyatlar",
  selected: "seçilib",
  selectAll: "Hamısını seç",
  deselectAll: "Seçimi ləğv et",
  
  // Modal titles
  confirmAction: "Əməliyyatı təsdiqləyin",
  confirmDelete: "Silməyi təsdiqləyin",
  confirmCancel: "İmtinanı təsdiqləyin",
  
  // Import/Export
  import: "İdxal",
  export: "İxrac",
  importExport: "İdxal/İxrac",
  importFromExcel: "Excel-dən idxal et",
  exportToExcel: "Excel-ə ixrac et",
  importData: "Məlumatları idxal et",
  exportData: "Məlumatları ixrac et",
  downloadTemplate: "Şablon yüklə",
  uploadFile: "Faylı yüklə",
  dropFileHere: "Faylı buraya atın və ya seçin",
  processing: "Emal edilir...",
  
  // Category changed
  categoryChanged: "Kateqoriya dəyişdirildi",

  // Navigation və Menu
  menu: {
    toggle: "Menyunu aç/bağla",
    main: "Əsas menyu",
    user: "İstifadəçi menyusu",
    admin: "Admin menyusu",
    settings: "Tənzimləmələr menyusu"
  },
  
  // Form elementləri
  form: {
    submit: "Təsdiq et",
    save: "Saxla",
    cancel: "Ləğv et",
    reset: "Sıfırla",
    search: "Axtar",
    filter: "Filtrlə",
    select: "Seç",
    upload: "Yüklə",
    remove: "Sil",
    edit: "Redaktə et",
    add: "Əlavə et"
  },
  
  // Modal və Dialog
  modal: {
    close: "Bağla",
    confirm: "Təsdiqlə",
    cancel: "Ləğv et",
    ok: "OK",
    yes: "Bəli",
    no: "Xeyr"
  },
  
  // Loading və Progress
  loading: {
    default: "Yüklənir...",
    data: "Məlumatlar yüklənir...",
    submitting: "Göndərilir...",
    processing: "Emal edilir...",
    saving: "Saxlanılır...",
    waiting: "Xahiş edirik gözləyin..."
  },

  // İnterfeys elementləri üçün əlavə tərcümələr
  themeToggle: {
    light: 'İşıqlı rejim',
    dark: 'Qaranlıq rejim',
    system: 'Sistem rejimi'
  },
  
  errorMessages: {
    loginError: 'Giriş zamanı xəta baş verdi',
    networkError: 'Şəbəkə xətası',
    sessionExpired: 'Sessiya başa çatıb',
    invalidCredentials: 'Yanlış e-poçt və ya şifrə'
  },

  dashboard: {
    welcome: 'Xoş gəlmisiniz',
    overview: 'Ümumi baxış',
    statistics: 'Statistika',
    recentActivity: 'Son fəaliyyət'
  }
};

export default ui;
