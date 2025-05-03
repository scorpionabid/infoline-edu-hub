
const ui = {
  // Header və menyu elementləri
  header: {
    dashboard: "İdarəetmə paneli",
    notifications: "Bildirişlər",
    settings: "Tənzimləmələr",
    profile: "Profil",
    logout: "Çıxış",
    newMessages: "{count} yeni bildiriş",
  },
  
  // Buttons
  buttons: {
    submit: "Təsdiqlə",
    cancel: "Ləğv et",
    save: "Yadda saxla",
    delete: "Sil",
    edit: "Redaktə et",
    add: "Əlavə et",
    apply: "Tətbiq et",
    reset: "Sıfırla",
    back: "Geri qayıt",
    next: "Növbəti",
    prev: "Əvvəlki",
    search: "Axtar",
    filter: "Filtrlə",
    sort: "Sırala",
    clear: "Təmizlə",
    close: "Bağla",
    upload: "Yüklə",
    download: "Endir",
    moreOptions: "Daha çox...",
    expand: "Genişlət",
    collapse: "Daralt",
    confirmDelete: "Silməyi təsdiqləyin",
    confirmAction: "Əməliyyatı təsdiqləyin",
  },
  
  // Form labels və mesajlar
  forms: {
    required: "Məcburidir",
    optional: "İstəyə bağlıdır",
    invalidInput: "Yanlış məlumat",
    invalidEmail: "Düzgün e-poçt ünvanı daxil edin",
    passwordMismatch: "Şifrələr uyğun gəlmir",
    minLength: "Ən azı {count} simvol olmalıdır",
    maxLength: "Ən çox {count} simvol olmalıdır",
    pleaseSelect: "Seçim edin",
    inputPlaceholder: "Daxil edin...",
    searchPlaceholder: "Axtar...",
    selectPlaceholder: "Seçin...",
    submitting: "Göndərilir...",
    submitted: "Göndərildi",
    error: "Xəta baş verdi",
    success: "Uğurla tamamlandı",
    saveChanges: "Dəyişiklikləri yadda saxla",
    discardChanges: "Dəyişiklikləri ləğv et",
    confirmChanges: "Dəyişiklikləri təsdiqləyirsiniz?",
    unsavedChanges: "Saxlanılmamış dəyişikliklər var",
    errorMessage: "Xəta: {message}",
  },
  
  // Modals/Dialogs
  modals: {
    confirm: "Təsdiqlə",
    cancel: "Ləğv et",
    confirmTitle: "Əməliyyatı təsdiqləyin",
    confirmMessage: "Bu əməliyyatı təsdiqləmək istədiyinizdən əminsiniz?",
    deleteTitle: "Silinməni təsdiqlə",
    deleteMessage: "Bu elementi silmək istədiyinizdən əminsiniz?",
    warningTitle: "Diqqət",
    errorTitle: "Xəta",
    successTitle: "Uğurlu",
    infoTitle: "Məlumat",
  },
  
  // Tables
  tables: {
    rowsPerPage: "Səhifə başına sətir:",
    of: "{current}-dən {total}",
    noData: "Məlumat yoxdur",
    loading: "Məlumatlar yüklənir...",
    search: "Cədvəldə axtar",
    filter: "Filtrlə",
    page: "Səhifə",
    showColumns: "Sütunları göstər",
    nextPage: "Növbəti səhifə",
    previousPage: "Əvvəlki səhifə",
    rowsSelected: "{count} sətir seçildi",
  },
  
  // Status mesajları
  status: {
    success: "Uğurlu əməliyyat",
    error: "Xəta baş verdi",
    warning: "Diqqət",
    info: "Məlumat",
    pending: "Gözləmədə",
    processing: "Emal olunur...",
    completed: "Tamamlandı",
    failed: "Uğursuz oldu",
    saved: "Yadda saxlandı",
    deleted: "Silindi",
    uploaded: "Yükləndi",
    downloaded: "Endirildi",
  },
  
  // Drag & Drop
  dragDrop: {
    dragHere: "Faylları buraya sürükləyin",
    dropHere: "Yükləmək üçün buraya buraxın",
    browseFiles: "Və ya faylları seçin",
    fileSelected: "{count} fayl seçildi",
    invalidFileType: "Yanlış fayl növü",
    fileTooLarge: "Fayl həcmi çox böyükdür",
    fileNotAccepted: "Fayl qəbul edilmədi",
  },
  
  // Loading states
  loadingStates: {
    default: "Yüklənir...",
    data: "Məlumatlar yüklənir...",
    submitting: "Göndərilir...",
    processing: "Emal olunur...",
    uploading: "Yüklənir: {percent}%",
    downloading: "Endirilir: {percent}%",
    initializing: "İlkin yükləmə...",
    authenticating: "İdentifikasiya olunur...",
  },
  
  // Tooltips
  tooltips: {
    moreInfo: "Ətraflı məlumat",
    clickToEdit: "Redaktə etmək üçün klikləyin",
    requiredField: "Məcburi sahə",
    dragToReorder: "Yenidən düzmək üçün sürükləyin",
    copyToClipboard: "Buferə kopyalamaq üçün klikləyin",
    copied: "Kopyalandı!",
    pressEsc: "Bağlamaq üçün ESC düyməsini basın",
  },
  
  // Xəta mesajları
  errors: {
    general: "Bir xəta baş verdi",
    notFound: "Tapılmadı",
    accessDenied: "Giriş qadağandır",
    serverError: "Server xətası",
    connectionError: "Bağlantı xətası",
    timeoutError: "Vaxt bitdi",
    validationError: "Təsdiqləmə xətası",
    pageNotFound: "Səhifə tapılmadı",
    tryAgain: "Yenidən cəhd edin",
    contactSupport: "Dəstək xidməti ilə əlaqə saxlayın",
  }
};

export default ui;
