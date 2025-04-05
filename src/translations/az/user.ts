
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
  
  // Misc
  users: "İstifadəçilər",
  allUsers: "Bütün istifadəçilər",
  activeUsers: "Aktiv istifadəçilər",
  admins: "Adminlər",
};

export default user;
