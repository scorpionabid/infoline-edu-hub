
/**
 * Validasiya tərcümələri
 */
const validation = {
  // Form validation
  fieldRequired: "Bu sahə məcburidir",
  invalidFormat: "Yanlış format",
  minLength: "Minimum {min} simvol olmalıdır",
  maxLength: "Maksimum {max} simvol olmalıdır",
  minValue: "Minimum {min} olmalıdır",
  maxValue: "Maksimum {max} olmalıdır",
  
  // Additional validations
  invalidEmail: "Düzgün e-poçt formatında deyil",
  invalidPhone: "Düzgün telefon formatında deyil",
  invalidDate: "Düzgün tarix formatında deyil",
  minDate: "{date} tarixindən sonra olmalıdır",
  maxDate: "{date} tarixindən əvvəl olmalıdır",
  uniqueValue: "Bu dəyər artıq mövcuddur",
  passwordMismatch: "Şifrələr uyğun gəlmir",
  passwordRequirements: "Şifrə minimum 8 simvol, 1 böyük hərf, 1 kiçik hərf və 1 rəqəm olmalıdır",
  incorrectValue: "Düzgün dəyər deyil",
  
  // Warning messages
  unusualValue: "Qeyri-adi dəyər, zəhmət olmasa təkrar yoxlayın",
  
  // Success messages
  validationPassed: "Validasiya uğurla keçdi",
  
  // Autosave messages
  changesSaved: "Dəyişikliklər saxlanıldı",
  changesNotSaved: "Dəyişikliklər saxlanılmadı",
  
  // Excel validation
  invalidFileFormat: "Yanlış fayl formatı. Yalnız .xlsx və .xls formatları dəstəklənir",
  headersMismatch: "Fayl sütunları sistemdəki sahələrə uyğun gəlmir",
  emptyFile: "Fayl boşdur, heç bir məlumat yoxdur",
  importSuccess: "Məlumatlar uğurla idxal edildi",
  importPartialSuccess: "Məlumatlar qismən idxal edildi, bəzi sətirlərdə problemlər var",
  importError: "Məlumatlar idxal edilə bilmədi",
  rowErrors: "Sətir {row}: {error}",
  
  // Data types
  string: "Mətn",
  number: "Rəqəm",
  date: "Tarix",
  boolean: "Bəli/Xeyr",
  array: "Siyahı",
  object: "Obyekt",
  null: "Boş",
  undefined: "Təyin edilməyib",
  
  // Specific field validations
  nameValidation: "Ad yalnız hərflərdən ibarət olmalıdır",
  phoneValidation: "Telefon nömrəsi formatı: +994XX XXXXXXX",
  zipCodeValidation: "Poçt indeksi 5 rəqəmdən ibarət olmalıdır",
  urlValidation: "Düzgün URL formatı deyil",
  positiveNumber: "Müsbət rəqəm olmalıdır",
  wholeNumber: "Tam rəqəm olmalıdır",
  decimalPlaces: "Maksimum {max} onluq işarəsi ola bilər",
};

export default validation;
