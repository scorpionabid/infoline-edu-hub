
/**
 * Bildiriş tərcümələri
 */
const notifications = {
  // Notifications
  notifications: "Bildirişlər",
  markAllAsRead: "Hamısını oxunmuş kimi işarələ",
  markAsRead: "Oxunmuş kimi işarələ",
  clearAll: "Hamısını təmizlə",
  noNotifications: "Bildiriş yoxdur",
  noNotificationsDesc: "Hazırda heç bir bildirişiniz yoxdur",
  systemNotifications: "Sistem bildirişləri",
  systemNotificationsDesc: "Sistem daxilində bildirişləri görmək üçün aktivləşdirin",
  
  // Notification types
  newCategory: "Yeni kateqoriya",
  deadline: "Son tarix",
  approvalRequest: "Təsdiq tələbi",
  approved: "Təsdiqləndi",
  rejected: "Rədd edildi",
  systemUpdate: "Sistem yeniləməsi",
  reminder: "Xatırlatma",
  
  // Notification messages
  newCategoryMessage: "{categoryName} kateqoriyası əlavə edildi",
  deadlineApproachingMessage: "{categoryName} kateqoriyası üçün son tarix yaxınlaşır: {deadline}",
  deadlinePassedMessage: "{categoryName} kateqoriyası üçün son tarix keçdi: {deadline}",
  approvalRequestMessage: "{schoolName} məktəbi {categoryName} kateqoriyası üçün məlumatları təsdiq üçün göndərdi",
  approvedMessage: "{categoryName} kateqoriyası təsdiqləndi",
  rejectedMessage: "{categoryName} kateqoriyası rədd edildi: {reason}",
  systemUpdateMessage: "Sistem yeniləməsi: {message}",
  reminderMessage: "{categoryName} kateqoriyası üçün məlumatları doldurmağı unutmayın",
  
  // Notification times
  justNow: "İndicə",
  minutesAgo: "{minutes} dəqiqə əvvəl",
  hoursAgo: "{hours} saat əvvəl",
  daysAgo: "{days} gün əvvəl",
  
  // Info notifications
  unreadNotifications: "Oxunmamış bildirişlər",
  noUnreadNotifications: "Oxunmamış bildiriş yoxdur",
  newNotifications: "Yeni bildirişlər",

  // Success notifications
  success: {
    dataSaved: "Məlumatlar uğurla saxlanıldı",
    dataUpdated: "Məlumatlar uğurla yeniləndi",
    dataDeleted: "Məlumatlar uğurla silindi",
    formSubmitted: "Form uğurla təqdim edildi",
    categoryCreated: "Kateqoriya uğurla yaradıldı",
    settingsSaved: "Tənzimləmələr saxlanıldı"
  },
  
  // Error notifications
  error: {
    generic: "Xəta baş verdi",
    dataNotSaved: "Məlumatlar saxlanılmadı",
    dataNotUpdated: "Məlumatlar yenilənmədi",
    dataNotDeleted: "Məlumatlar silinmədi",
    formNotSubmitted: "Form təqdim edilmədi",
    networkError: "Şəbəkə xətası",
    unauthorized: "İcazəsiz giriş"
  },
  
  // Info notifications
  info: {
    sessionExpired: "Sessiyanın müddəti bitdi",
    newUpdate: "Yeni yeniləmə mövcuddur",
    maintenance: "Texniki xidmət",
    deadlineApproaching: "Son tarix yaxınlaşır"
  },
  
  // Approval process notifications
  reviewAndApprove: "Məlumatları nəzərdən keçir və təsdiq et",
  reviewCategoryDataDescription: "Məktəb tərəfindən təqdim edilmiş kateqoriya məlumatlarını nəzərdən keçirin və təsdiq edin və ya rədd edin",
  pendingApproval: "Təsdiq gözləyir",
  approving: "Təsdiqlənir...",
  rejecting: "Rədd edilir...",
  rejectionReason: "Rədd səbəbi",
  enterRejectionReason: "Rədd səbəbini daxil edin",
  dataApproved: "Məlumatlar təsdiqləndi",
  dataApprovedSuccessfully: "Məlumatlar uğurla təsdiqləndi",
  dataRejected: "Məlumatlar rədd edildi",
  dataRejectedSuccessfully: "Məlumatlar uğurla rədd edildi",
  errorApprovingData: "Məlumatları təsdiqləyərkən xəta baş verdi",
  errorRejectingData: "Məlumatları rədd edərkən xəta baş verdi",
  submittedAt: "Təqdim edilmə tarixi",
  review: "Nəzərdən keçir",
  dataPendingApproval: "Məlumatlar təsdiq gözləyir",
  dataBeingReviewed: "Məlumatlarınız nəzərdən keçirilir",
  dataApprovedDesc: "Məlumatlarınız təsdiqlənib və sistemdə qeyd olunub",
  dataRejectedDesc: "Məlumatlarınız rədd edilib, zəhmət olmasa səbəbi nəzərdən keçirin və yenidən təqdim edin",
  
  // Status notifications
  notStarted: "Başlanmayıb",
  inProgress: "Davam edir",
  formHasErrors: "Formda xətalar var",
  andOtherErrors: "və digər xətalar"
};

export default notifications;
