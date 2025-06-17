// Profile translation module - User profile related translations
export const profile = {
  // Page titles
  title: 'Profil',
  profile_settings: 'Profil Parametrləri',
  account_settings: 'Hesab Parametrləri',
  profile_information: 'Profil Məlumatları',
  personal_information: 'Şəxsi Məlumatlar',
  
  // Profile fields
  full_name: 'Ad Soyad',
  first_name: 'Ad',
  last_name: 'Soyad', 
  email: 'E-poçt',
  phone: 'Telefon',
  position: 'Vəzifə',
  department: 'Şöbə',
  role: 'Rol',
  status: 'Status',
  language: 'Dil',
  timezone: 'Vaxt zonası',
  
  // Profile placeholders
  enter_full_name: 'Ad və soyadınızı daxil edin',
  enter_first_name: 'Adınızı daxil edin',
  enter_last_name: 'Soyadınızı daxil edin',
  enter_email: 'E-poçt ünvanınızı daxil edin',
  enter_phone: 'Telefon nömrənizi daxil edin',
  enter_position: 'Vəzifənizi daxil edin',
  enter_department: 'Şöbənizi daxil edin',
  
  // Profile actions
  edit_profile: 'Profili redaktə et',
  save_profile: 'Profili yadda saxla',
  update_profile: 'Profili yenilə',
  cancel_edit: 'Redaktəni ləğv et',
  change_avatar: 'Avatar dəyişdir',
  upload_photo: 'Şəkil yüklə',
  remove_photo: 'Şəkli sil',
  
  // Password settings
  change_password: 'Şifrəni dəyişdir',
  current_password: 'Mövcud şifrə',
  new_password: 'Yeni şifrə',
  confirm_password: 'Şifrəni təsdiqlə',
  password_requirements: 'Şifrə tələbləri',
  strong_password: 'Güclü şifrə',
  weak_password: 'Zəif şifrə',
  
  // Security settings
  security: 'Təhlükəsizlik',
  two_factor_auth: 'İki faktorlu təsdiq',
  enable_2fa: '2FA-nı aktiv et',
  disable_2fa: '2FA-nı deaktiv et',
  backup_codes: 'Ehtiyat kodları',
  login_history: 'Giriş tarixçəsi',
  active_sessions: 'Aktiv sessiyalar',
  
  // Notification preferences
  notifications: 'Bildirişlər',
  email_notifications: 'E-poçt bildirişləri',
  sms_notifications: 'SMS bildirişləri',
  push_notifications: 'Push bildirişləri',
  notification_types: 'Bildiriş növləri',
  
  // Privacy settings
  privacy: 'Məxfilik',
  privacy_settings: 'Məxfilik parametrləri',
  data_sharing: 'Məlumat paylaşımı',
  visibility: 'Görünürlük',
  public_profile: 'İctimai profil',
  private_profile: 'Şəxsi profil',
  
  // Profile validation
  profile_updated: 'Profil uğurla yeniləndi',
  profile_update_failed: 'Profil yenilənərkən xəta baş verdi',
  invalid_email_format: 'E-poçt formatı səhvdir',
  invalid_phone_format: 'Telefon formatı səhvdir',
  password_too_short: 'Şifrə çox qısadır',
  passwords_dont_match: 'Şifrələr uyğun gəlmir',
  
  // Profile completion
  profile_completion: 'Profil tamamlanması',
  complete_profile: 'Profili tamamla',
  profile_incomplete: 'Profil natamam',
  required_fields: 'Mütləq sahələr',
  optional_fields: 'İsteğe bağlı sahələr',
  
  // Account status
  account_active: 'Hesab aktiv',
  account_inactive: 'Hesab qeyri-aktiv',
  account_suspended: 'Hesab dayandırılıb',
  account_verified: 'Hesab təsdiqlənib',
  account_unverified: 'Hesab təsdiqlənməyib',
  
  // Profile menu
  view_profile: 'Profile bax',
  edit_profile_menu: 'Profili redaktə et',
  account_settings_menu: 'Hesab parametrləri',
  logout: 'Çıxış'
} as const;

export type Profile = typeof profile;
export default profile;
