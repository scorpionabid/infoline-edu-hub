
// UI translation module - Common UI elements and actions
export const ui = {
  // Basic actions
  save: 'Saxla',
  cancel: 'İmtina',
  delete: 'Sil',
  edit: 'Redaktə et',
  create: 'Yarat',
  add: 'Əlavə et',
  remove: 'Sil',
  update: 'Yenilə',
  submit: 'Təqdim et',
  reset: 'Sıfırla',
  clear: 'Təmizlə',
  search: 'Axtar',
  filter: 'Filtr',
  sort: 'Sırala',
  export: 'İxrac et',
  import: 'İdxal et',
  upload: 'Yüklə',
  download: 'Endir',
  print: 'Çap et',
  copy: 'Kopyala',
  paste: 'Yerləşdir',
  cut: 'Kəs',
  
  // States
  loading: 'Yüklənir...',
  saving: 'Saxlanır...',
  creating: 'Yaradılır...',
  updating: 'Yenilənir...',
  deleting: 'Silinir...',
  importing: 'İdxal edilir...',
  exporting: 'İxrac edilir...',
  uploading: 'Yüklənir...',
  downloading: 'Endirilir...',
  processing: 'İşlənir...',
  
  // Common terms
  yes: 'Bəli',
  no: 'Xeyr',
  ok: 'Tamam',
  close: 'Bağla',
  back: 'Geri',
  next: 'Növbəti',
  previous: 'Əvvəlki',
  finish: 'Bitir',
  done: 'Hazır',
  
  // Form elements
  name: 'Ad',
  title: 'Başlıq',
  description: 'Təsvir',
  status: 'Status',
  type: 'Tip',
  category: 'Kateqoriya',
  date: 'Tarix',
  time: 'Vaxt',
  email: 'E-poçt',
  phone: 'Telefon',
  address: 'Ünvan',
  
  // Selection and dates
  select: 'Seç',
  select_all: 'Hamısını seç',
  deselect_all: 'Seçimi ləğv et',
  select_date: 'Tarix seç',
  select_time: 'Vaxt seç',
  
  // Data states
  no_data: 'Məlumat yoxdur',
  no_data_available: 'Mövcud məlumat yoxdur',
  empty: 'Boş',
  loading_data: 'Məlumatlar yüklənir...',
  
  // Notifications
  success: 'Uğur',
  error: 'Xəta',
  warning: 'Xəbərdarlıq',
  info: 'Məlumat',
  
  // Pagination
  page: 'Səhifə',
  of: 'dan',
  items: 'element',
  per_page: 'səhifə başına',
  first: 'İlk',
  last: 'Son',
  
  // File operations
  file: 'Fayl',
  files: 'Fayllar',
  choose_file: 'Fayl seç',
  upload_file: 'Fayl yüklə',
  download_file: 'Fayl endir',
  
  // View modes
  list_view: 'Siyahı görünüşü',
  grid_view: 'Şəbəkə görünüşü',
  card_view: 'Kart görünüşü',
  table_view: 'Cədvəl görünüşü'
} as const;

export type UI = typeof ui;
export default ui;
