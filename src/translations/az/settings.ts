// Settings translation module
export const settings = {
  // Page title and description
  title: 'Tənzimləmələr',
  description: 'Tətbiq tənzimləmələri və konfiqurasiyaları',
  
  // System settings
  systemSettings: 'Sistem Tənzimləmələri',
  
  // Data management
  dataManagement: 'Məlumatların idarə edilməsi',
  exportData: 'Məlumatları ixrac et',
  exportDataDesc: 'Bütün məlumatlarınızı yedəkləmə üçün ixrac edin',
  importData: 'Məlumatları idxal et',
  importDataDesc: 'Əvvəlcədən ixrac edilmiş məlumatları idxal edin',
  resetData: 'Məlumatları sıfırla',
  resetDataDesc: 'Bütün məlumatları orijinal vəziyyətinə qaytarın',
  
  // Status messages
  exporting: 'İxrac olunur...',
  importing: 'İdxal olunur...',
  resetting: 'Sıfırlanır...',
  
  // Confirmation dialogs
  confirmReset: 'Məlumatları sıfırlamaq istədiyinizə əminsiniz?',
  confirmResetDesc: 'Bu əməliyyat geri qaytarıla bilməz. Bütün məlumatlar silinəcək və sistem ilkin vəziyyətinə qaytarılacaq.',
  
  // Buttons
  cancel: 'Ləğv et',
  confirm: 'Təsdiq et',
  
  // Success messages
  dataReset: 'Məlumatlar sıfırlandı',
  dataResetSuccess: 'Bütün məlumatlar uğurla sıfırlandı',
  dataExported: 'Məlumatlar ixrac edildi',
  dataExportSuccess: 'Məlumatlar uğurla ixrac edildi',
  dataImported: 'Məlumatlar idxal edildi',
  dataImportSuccess: 'Məlumatlar uğurla idxal edildi',
  
  // Error messages
  dataResetFailed: 'Məlumatlar sıfırlanarkən xəta baş verdi',
  dataResetFailedDesc: 'Məlumatları sıfırlamaq mümkün olmadı, zəhmət olmasa yenidən cəhd edin',
  dataExportFailed: 'İxrac uğursuz oldu',
  dataExportFailedDesc: 'Məlumatları ixrac etmək mümkün olmadı, zəhmət olmasa yenidən cəhd edin',
  dataImportFailed: 'İdxal uğursuz oldu',
  dataImportFailedDesc: 'Məlumatları idxal etmək mümkün olmadı, zəhmət olmasa faylın düzgün formatda olduğundan əmin olun',
  
  // System information
  appVersion: 'Tətbiq versiyası',
  lastUpdate: 'Son yenilənmə',
  systemStatus: 'Sistem statusu',
  databaseStatus: 'Verilənlər bazası statusu',
  storageUsage: 'Saxlama istifadəsi',
  
  // User interface
  language: 'Dil',
  theme: 'Mövzu',
  notifications: 'Bildirişlər',
  
  // Security
  security: 'Təhlükəsizlik',
  changePassword: 'Şifrəni dəyiş',
  twoFactorAuth: 'İki faktorlu autentifikasiya',
  sessionTimeout: 'Sessiya müddəti',
  
  // Backup & Restore
  backup: 'Yedəkləmə',
  restore: 'Bərpa',
  lastBackup: 'Son yedəkləmə',
  createBackup: 'Yedəkləmə yarat',
  restoreFromBackup: 'Yedəkləmədən bərpa et',
  
  // Logs
  systemLogs: 'Sistem loqları',
  errorLogs: 'Xəta loqları',
  activityLogs: 'Fəaliyyət loqları',
  
  // Maintenance
  maintenance: 'Texniki xidmət',
  clearCache: 'Keşi təmizlə',
  optimizeDatabase: 'Verilənlər bazasını optimallaşdır',
  checkForUpdates: 'Yenilikləri yoxla',
  
  // About
  about: 'Haqqında',
  version: 'Versiya',
  license: 'Lisenziya',
  termsOfService: 'Xidmət şərtləri',
  privacyPolicy: 'Məxfilik siyasəti',
  
  // Help & Support
  helpAndSupport: 'Kömək və Dəstək',
  documentation: 'Sənədlər',
  contactSupport: 'Dəstək ilə əlaqə',
  reportIssue: 'Problem bildir',
  
  // Customization
  customization: 'Fərdiləşdirmə',
  uiSettings: 'İnterfeys tənzimləmələri',
  dashboardLayout: 'İdarə paneli düzülüşü',
  colorScheme: 'Rəng sxemi',
  
  // API
  apiSettings: 'API tənzimləmələri',
  apiKey: 'API Açarı',
  generateNewKey: 'Yeni açar yarat',
  apiDocumentation: 'API Sənədləri',
  
  // Advanced
  advancedSettings: 'Qabaqcıl tənzimləmələr',
  developerOptions: 'İnkişaf etdirici seçimləri',
  experimentalFeatures: 'Eksperimental xüsusiyyətlər',
  resetToDefaults: 'Standartlara sıfırla'
} as const;

export type Settings = typeof settings;
export default settings;
