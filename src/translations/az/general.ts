
// General translation module - Common terms and phrases
export const general = {
  // Common page elements
  page_title: 'Səhifə başlığı',
  page_description: 'Səhifə təsviri', 
  page_header: 'Səhifə başlığı',
  section_title: 'Bölmə başlığı',
  
  // Settings sections
  settings: 'Parametrlər',
  settings_description: 'Sistem parametrlərini idarə edin',
  system_settings: 'Sistem parametrləri',
  user_settings: 'İstifadəçi parametrləri',
  application_settings: 'Tətbiq parametrləri',
  
  // Data management
  data_management: 'Məlumat idarəetməsi',
  data_columns: 'Məlumat sütunları',
  manage_data_columns: 'Məlumat sütunlarını idarə et',
  column_management: 'Sütun idarəetməsi',
  
  // Statistics and analytics
  statistics: 'Statistika',
  analytics: 'Analitika',
  form_statistics: 'Form Statistikaları',
  recent_activity: 'Son Fəaliyyət',
  activity_log: 'Fəaliyyət jurnalı',
  
  // Data operations
  export_data: 'Məlumatları ixrac et',
  import_data: 'Məlumat idxal et', 
  reset_data: 'Məlumatları sıfırla',
  backup_data: 'Məlumatların ehtiyat nüsxəsi',
  restore_data: 'Məlumatları bərpa et',
  
  // Time and dates
  created_at: 'Yaradılma tarixi',
  updated_at: 'Yenilənmə tarixi',
  last_modified: 'Son dəyişiklik',
  date_range: 'Tarix aralığı',
  
  // Quantities and measurements
  total: 'Ümumi',
  count: 'Say',
  amount: 'Məbləğ',
  percentage: 'Faiz',
  rate: 'Nisbət',
  
  // System information
  version: 'Versiya',
  build: 'Build',
  environment: 'Mühit',
  server_status: 'Server statusu',
  connection_status: 'Bağlantı statusu',
  
  // User interface elements
  menu: 'Menyu',
  sidebar: 'Yan panel',
  header: 'Başlıq',
  footer: 'Alt hissə',
  toolbar: 'Alət paneli',
  
  // Content states
  content: 'Məzmun',
  description: 'Təsvir',
  details: 'Təfərrüatlar',
  summary: 'Xülasə',
  overview: 'Ümumi baxış',
  
  // Categories and organization
  category: 'Kateqoriya',
  section: 'Bölmə',
  group: 'Qrup',
  collection: 'Kolleksiya',
  archive: 'Arxiv',
  
  // Help and information
  help: 'Kömək',
  information: 'Məlumat',
  documentation: 'Sənədlər',
  support: 'Dəstək',
  contact: 'Əlaqə',
  
  // Common fields
  name: 'Ad',
  title: 'Başlıq',
  
  // Miscellaneous
  other: 'Digər',
  unknown: 'Naməlum',
  not_applicable: 'Tətbiq edilmir',
  not_available: 'Mövcud deyil',
  coming_soon: 'Tezliklə'
} as const;

export type General = typeof general;
export default general;
