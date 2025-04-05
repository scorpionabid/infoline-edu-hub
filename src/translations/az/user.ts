
/**
 * İstifadəçi və rol tərcümələri
 */
const user = {
  // User roles
  superadmin: "Super Admin",
  regionadmin: "Region Admini",
  sectoradmin: "Sektor Admini",
  schooladmin: "Məktəb Admini",
  user: "İstifadəçi",
  
  // User actions and labels
  login: "Daxil ol",
  logout: "Çıxış",
  register: "Qeydiyyat",
  forgotPassword: "Şifrəni unutmusunuz?",
  resetPassword: "Şifrəni sıfırla",
  profile: "Profil",
  settings: "Tənzimləmələr",
  username: "İstifadəçi adı",
  email: "E-poçt",
  password: "Şifrə",
  confirmPassword: "Şifrəni təsdiqləyin",
  newPassword: "Yeni şifrə",
  currentPassword: "Cari şifrə",
  
  // User status
  active: "Aktiv",
  inactive: "Qeyri-aktiv",
  blocked: "Bloklanıb",
  
  // User fields
  firstName: "Ad",
  lastName: "Soyad",
  fullName: "Tam ad",
  phoneNumber: "Telefon nömrəsi",
  address: "Ünvan",
  dateOfBirth: "Doğum tarixi",
  gender: "Cins",
  male: "Kişi",
  female: "Qadın",
  other: "Digər",
  
  // User management
  createUser: "İstifadəçi yarat",
  editUser: "İstifadəçini redaktə et",
  deleteUser: "İstifadəçini sil",
  userDetails: "İstifadəçi məlumatları",
  userList: "İstifadəçilər siyahısı",
  addUser: "İstifadəçi əlavə et",
  removeUser: "İstifadəçini sil",
  assignRole: "Rol təyin et",
  changeRole: "Rolu dəyişdir",
  lastLogin: "Son giriş",
  loginHistory: "Giriş tarixçəsi",
  accountCreated: "Hesab yaradıldı",
  
  // User feedback
  accountCreatedSuccess: "Hesabınız uğurla yaradıldı",
  loginSuccess: "Uğurla daxil oldunuz",
  loginFailed: "Daxil olmaq alınmadı",
  logoutSuccess: "Uğurla çıxış etdiniz",
  passwordResetSuccess: "Şifrəniz uğurla sıfırlandı",
  passwordResetFailed: "Şifrə sıfırlama alınmadı",
  passwordResetEmailSent: "Şifrə sıfırlama e-poçtu göndərildi",
  passwordUpdateSuccess: "Şifrəniz uğurla yeniləndi",
  
  // User notifications
  emailVerification: "E-poçt doğrulaması",
  emailVerified: "E-poçtunuz doğrulandı",
  emailVerificationRequired: "E-poçt doğrulaması tələb olunur",
  emailVerificationSent: "Doğrulama e-poçtu göndərildi",
  
  // User permissions
  canViewUsers: "İstifadəçiləri görmək icazəsi",
  canCreateUsers: "İstifadəçi yaratmaq icazəsi",
  canEditUsers: "İstifadəçiləri redaktə etmək icazəsi",
  canDeleteUsers: "İstifadəçiləri silmək icazəsi",
  canAssignRoles: "Rol təyin etmək icazəsi",
  
  // User preferences
  language: "Dil",
  theme: "Tema",
  notifications: "Bildirişlər",
  privacy: "Gizlilik",
  
  // Admin user fields
  adminName: "Admin adı",
  adminEmail: "Admin e-poçtu",
  adminPassword: "Admin şifrəsi",
  
  // Entity information
  adminEntity: "İdarə edilən qurum",
  adminEntityDetails: "Qurum məlumatları",
  entityName: "Qurum adı",
  entityType: "Qurum tipi",
  region: "Region",
  sector: "Sektor",
  school: "Məktəb",
  entityStatus: "Qurum statusu",
  schoolType: "Məktəb tipi",
  
  // Timestamps
  createdAt: "Yaradılma tarixi",
  updatedAt: "Yenilənmə tarixi",
  
  // Languages
  language_az: "Azərbaycan dili",
  language_ru: "Rus dili",
  language_en: "İngilis dili",
  language_tr: "Türk dili",
  
  // UI elements
  selectRole: "Rol seçin",
  selectStatus: "Status seçin",
  allRoles: "Bütün rollar",
  allStatuses: "Bütün statuslar",
  searchUsers: "İstifadəçiləri axtar...",
  
  // Misc
  users: "İstifadəçilər",
  allUsers: "Bütün istifadəçilər",
  activeUsers: "Aktiv istifadəçilər",
  admins: "Adminlər",
  userUpdated: "İstifadəçi məlumatları yeniləndi",
  userDeleted: "İstifadəçi silindi",
  loading: "Yüklənir...",
  noUsersFound: "İstifadəçi tapılmadı",
  viewDetails: "Təfərrüatları göstər",
  page: "Səhifə",
  of: "/",
  close: "Bağla",
  save: "Saxla",
  cancel: "Ləğv et",
  edit: "Redaktə et",
  delete: "Sil",
  previous: "Əvvəlki",
  next: "Sonrakı",
  notAvailable: "Mövcud deyil",
  invalidDate: "Yanlış tarix",
  viewUserInfoDesc: "İstifadəçi haqqında ətraflı məlumat",
  
  // Form validation and error messages
  requiredFieldsMissing: "Zəhmət olmasa bütün vacib sahələri doldurun",
  creating: "Yaradılır...",
  created: "Yaradıldı",
  userCreated: "İstifadəçi yaradıldı",
  userCreatedDesc: "Yeni istifadəçi uğurla yaradıldı",
  errorCreatingUser: "İstifadəçi yaradılarkən xəta baş verdi",
  errorOccurred: "Xəta baş verdi",
  userAlreadyExists: "Bu e-poçt ünvanı ilə istifadəçi artıq mövcuddur",
  enterPassword: "Şifrə daxil edin",
  enterNewPassword: "Yeni şifrə daxil edin",
  passwordResetHelp: "İstifadəçini məcbur edəcək ki, növbəti girişdə şifrəni dəyişsin",
  
  // Dialog titles and descriptions
  addNewRegionWithAdmin: "Yeni region və admin əlavə et",
  addNewRegionWithAdminDesc: "Yeni region yaradın və onun üçün admin təyin edin",
  addNewSectorWithAdmin: "Yeni sektor və admin əlavə et",
  addNewSectorWithAdminDesc: "Yeni sektor yaradın və onun üçün admin təyin edin",
  addNewSchoolWithAdmin: "Yeni məktəb və admin əlavə et",
  addNewSchoolWithAdminDesc: "Yeni məktəb yaradın və onun üçün admin təyin edin",
  addNewUser: "Yeni istifadəçi əlavə et",
  addNewUserDesc: "Sistemə yeni istifadəçi əlavə edin",
  adminDetails: "Admin məlumatları",
  entityDetailsDescription: "Qurumun əsas məlumatlarını daxil edin"
};

export default user;
