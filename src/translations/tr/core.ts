// Core translation module - Common texts
export const core = {
  // Basic actions
  actions: {
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
    create: 'Oluştur',
    search: 'Ara',
    filter: 'Filtrele',
    export: 'Dışa Aktar',
    import: 'İçe Aktar',
    refresh: 'Yenile',
    upload: 'Yükle',
    download: 'İndir',
    submit: 'Gönder',
    confirm: 'Onayla',
    reject: 'Reddet',
    approve: 'Onayla',
    close: 'Kapat',
    open: 'Aç',
    view: 'Görüntüle',
    details: 'Detaylar',
    back: 'Geri',
    next: 'İleri',
    previous: 'Önceki',
    first: 'İlk',
    last: 'Son',
    select: 'Seç',
    selectAll: 'Tümünü Seç',
    deselectAll: 'Seçimi Kaldır',
    clear: 'Temizle',
    reset: 'Sıfırla',
    apply: 'Uygula'
  },

  // Loading states
  loading: {
    default: 'Yükleniyor...',
    saving: 'Kaydediliyor...',
    deleting: 'Siliniyor...',
    creating: 'Oluşturuluyor...',
    updating: 'Güncelleniyor...',
    uploading: 'Yükleniyor...',
    downloading: 'İndiriliyor...',
    processing: 'İşleniyor...',
    sending: 'Gönderiliyor...',
    loading: 'Yükleniyor...',
    please_wait: 'Lütfen bekleyin...'
  },

  // Status
  status: {
    active: 'Aktif',
    inactive: 'Pasif',
    pending: 'Bekliyor',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    completed: 'Tamamlandı',
    in_progress: 'Devam Ediyor',
    draft: 'Taslak',
    published: 'Yayınlandı',
    archived: 'Arşivlendi',
    expired: 'Süresi Doldu',
    scheduled: 'Planlandı',
    paused: 'Duraklatıldı',
    cancelled: 'İptal Edildi'
  },

  // Common fields
  fields: {
    name: 'İsim',
    title: 'Başlık',
    description: 'Açıklama',
    date: 'Tarih',
    time: 'Zaman',
    email: 'E-posta',
    phone: 'Telefon',
    address: 'Adres',
    city: 'Şehir',
    country: 'Ülke',
    region: 'Bölge',
    sector: 'Sektör',
    school: 'Okul',
    category: 'Kategori',
    type: 'Tür',
    priority: 'Öncelik',
    tags: 'Etiketler',
    notes: 'Notlar',
    comments: 'Yorumlar',
    attachments: 'Ekler',
    files: 'Dosyalar',
    links: 'Bağlantılar',
    url: 'URL',
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    full_name: 'Tam İsim',
    first_name: 'İsim',
    last_name: 'Soyisim',
    position: 'Pozisyon',
    role: 'Rol',
    department: 'Departman',
    organization: 'Organizasyon'
  },

  // Responses
  responses: {
    yes: 'Evet',
    no: 'Hayır',
    ok: 'Tamam',
    maybe: 'Belki',
    not_sure: 'Emin Değilim',
    agree: 'Katılıyorum',
    disagree: 'Katılmıyorum'
  },

  // Time expressions
  time: {
    today: 'Bugün',
    yesterday: 'Dün',
    tomorrow: 'Yarın',
    this_week: 'Bu Hafta',
    last_week: 'Geçen Hafta',
    this_month: 'Bu Ay',
    last_month: 'Geçen Ay',
    this_year: 'Bu Yıl',
    last_year: 'Geçen Yıl',
    now: 'Şimdi',
    soon: 'Yakında',
    later: 'Sonra',
    never: 'Asla',
    always: 'Her Zaman',
    recently: 'Son Zamanlarda',
    ago: 'önce',
    in: 'sonra',
    minutes: 'dakika',
    hours: 'saat',
    days: 'gün',
    weeks: 'hafta',
    months: 'ay',
    years: 'yıl'
  },

  // Message types
  messages: {
    success: 'Başarı',
    error: 'Hata',
    warning: 'Uyarı',
    info: 'Bilgi',
    notification: 'Bildirim',
    confirmation: 'Onay',
    reminder: 'Hatırlatma'
  },

  // Validation messages
  validation: {
    required: 'Bu alan zorunludur',
    invalid_email: 'E-posta geçersiz',
    invalid_phone: 'Telefon numarası geçersiz',
    min_length: 'En az {{min}} karakter olmalıdır',
    max_length: 'En fazla {{max}} karakter olabilir',
    min_value: 'Minimum değer {{min}} olmalıdır',
    max_value: 'Maksimum değer {{max}} olabilir',
    invalid_date: 'Tarih geçersiz',
    invalid_url: 'URL geçersiz',
    password_too_short: 'Şifre çok kısa',
    password_too_weak: 'Şifre çok zayıf',
    passwords_dont_match: 'Şifreler eşleşmiyor',
    invalid_format: 'Format geçersiz',
    file_too_large: 'Dosya çok büyük',
    invalid_file_type: 'Dosya türü desteklenmiyor',
    number_required: 'Bir sayı girin',
    positive_number: 'Pozitif bir sayı girin',
    integer_required: 'Tam sayı girin'
  }
} as const;

export type Core = typeof core;
export default core;