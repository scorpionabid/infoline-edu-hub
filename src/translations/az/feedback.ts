
/**
 * Geri bildiriş və xəta mesajları üçün tərcümələr
 */
const feedback = {
  // Ümumi feedback mesajları
  success: "Uğurlu",
  error: "Xəta",
  warning: "Xəbərdarlıq",
  info: "Məlumat",
  
  // Giriş və avtorizasiya
  loginSuccess: "Uğurla daxil oldunuz",
  loginError: "Daxil olarkən xəta baş verdi",
  logoutSuccess: "Uğurla çıxış etdiniz",
  unauthorized: "Bu əməliyyat üçün icazəniz yoxdur",
  sessionExpired: "Sessiyanız başa çatıb, yenidən daxil olun",
  
  // Form əməliyyatları
  formSubmitted: "Form uğurla göndərildi",
  formSaved: "Məlumatlar uğurla saxlanıldı",
  dataSaved: "Məlumatlar saxlanıldı",
  dataSavedSuccessfully: "Məlumatlar uğurla saxlanıldı",
  dataSubmittedForApproval: "Məlumatlar təsdiq üçün göndərildi",
  dataApproved: "Məlumatlar təsdiqləndi",
  dataRejected: "Məlumatlar rədd edildi",
  formError: "Form göndərilərkən xəta baş verdi",
  validationError: "Zəhmət olmasa formdakı xətaları düzəldin",
  requiredFieldsMissing: "Zəhmət olmasa bütün tələb olunan sahələri doldurun",
  invalidFormat: "Format düzgün deyil",
  
  // Məlumat əməliyyatları
  itemCreated: "Element uğurla yaradıldı",
  itemUpdated: "Element uğurla yeniləndi",
  itemDeleted: "Element uğurla silindi",
  itemNotFound: "Element tapılmadı",
  createError: "Element yaradılarkən xəta baş verdi",
  updateError: "Element yenilənərkən xəta baş verdi",
  deleteError: "Element silinərkən xəta baş verdi",
  deleteConfirmation: "Bu elementi silmək istədiyinizə əminsiniz?",
  
  // API və server səhvləri
  serverError: "Server xətası baş verdi",
  connectionError: "Əlaqə xətası, internet bağlantınızı yoxlayın",
  timeoutError: "Sorğu vaxtı bitdi",
  unknownError: "Naməlum xəta baş verdi",
  
  // İdxal/İxrac
  importSuccess: "Məlumatlar uğurla idxal edildi",
  exportSuccess: "Məlumatlar uğurla ixrac edildi",
  importError: "Məlumatlar idxal edilərkən xəta baş verdi",
  exportError: "Məlumatlar ixrac edilərkən xəta baş verdi",
  
  // İstifadəçi əməliyyatları
  userCreated: "İstifadəçi uğurla yaradıldı",
  userUpdated: "İstifadəçi uğurla yeniləndi",
  userDeleted: "İstifadəçi uğurla silindi",
  passwordChanged: "Şifrə uğurla dəyişdirildi",
  passwordResetSent: "Şifrə sıfırlama təlimatları e-poçt ünvanınıza göndərildi",
  
  // İcazələr
  permissionDenied: "İcazə yoxdur",
  noPermission: "Bu əməliyyat üçün icazəniz yoxdur",
  adminPermissionRequired: "Bu əməliyyat üçün admin icazəsi tələb olunur",
  
  // Vəziyyət və təsdiq
  statusChanged: "Status uğurla dəyişdirildi",
  approvalRequired: "Bu əməliyyat təsdiq tələb edir",
  approved: "Təsdiqləndi",
  rejected: "Rədd edildi",
  pending: "Gözləmədə",
  
  // Data giriş və validasiya 
  errorFetchingDataEntries: "Məlumat girişləri alınarkən xəta baş verdi",
  fixValidationErrors: "Məlumatları təqdim etmədən əvvəl validasiya xətalarını düzəldin",
  saving: "Saxlanılır",
  submittingForApproval: "Təsdiq üçün göndərilir",
  
  // Konfirmasiya dialoqları
  submitConfirmationTitle: "Təsdiq üçün göndərmək istəyirsiniz?",
  submitConfirmationDescription: "Təsdiq üçün göndərildikdən sonra bu məlumatları dəyişdirə bilməyəcəksiniz.",
  approveConfirmationTitle: "Təsdiq etmək istəyirsiniz?",
  approveConfirmationDescription: "Bu məlumatları təsdiq etmək istədiyinizə əminsiniz?",
  rejectConfirmationTitle: "Rədd etmək istəyirsiniz?",
  rejectConfirmationDescription: "Bu məlumatları rədd etmək istədiyinizə əminsiniz?",

  // Məlumat yüklənməsi ilə bağlı statuslar
  loading: "Yüklənir...",
  errorLoadingData: "Məlumatlar yüklənərkən xəta baş verdi",
  categoryNotFound: "Kateqoriya tapılmadı",
  schoolNotFound: "Məktəb tapılmadı",
  noDashboardData: "Göstərilən məlumatlar tapılmadı",
};

export default feedback;
