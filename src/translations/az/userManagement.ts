// User management translation module
export const userManagement = {
  title: 'İstifadəçi İdarəetməsi',
  description: 'İstifadəçilərin, rolların və icazələrin idarə edilməsi',
  
  // Əsas əməliyyatlar
  actions: {
    create_user: 'İstifadəçi yarat',
    edit_user: 'İstifadəçini redaktə et',
    delete_user: 'İstifadəçini sil',
    view_user: 'İstifadəçiyə bax',
    assign_role: 'Rol təyin et',
    change_password: 'Şifrəni dəyiş',
    reset_password: 'Şifrəni sıfırla',
    activate_user: 'İstifadəçini aktivləşdir',
    deactivate_user: 'İstifadəçini deaktivləşdir',
    export_users: 'İstifadəçiləri ixrac et',
    import_users: 'İstifadəçiləri idxal et',
    bulk_actions: 'Kütləvi əməliyyatlar',
    invite_user: 'İstifadəçini dəvət et',
    send_notification: 'Bildiriş göndər'
  },

  // İstifadəçi formu
  form: {
    personal_info: 'Şəxsi məlumatlar',
    full_name: 'Ad və Soyad',
    first_name: 'Ad',
    last_name: 'Soyad',
    email: 'E-poçt ünvanı',
    phone: 'Telefon nömrəsi',
    position: 'Vəzifə',
    department: 'Şöbə',
    
    account_info: 'Hesab məlumatları',
    username: 'İstifadəçi adı',
    password: 'Şifrə',
    confirm_password: 'Şifrəni təsdiq et',
    role: 'Rol',
    permissions: 'İcazələr',
    status: 'Status',
    
    location_info: 'Yer məlumatları',
    region: 'Region',
    sector: 'Sektor',
    school: 'Məktəb',
    
    preferences: 'Seçimlər',
    language: 'Dil',
    timezone: 'Vaxt zonası',
    notifications: 'Bildirişlər',
    
    // Placeholder mətnlər
    enter_full_name: 'Ad və soyadı daxil edin',
    enter_email: 'E-poçt ünvanı daxil edin',
    enter_phone: 'Telefon nömrəsi daxil edin',
    enter_position: 'Vəzifəni daxil edin',
    select_role: 'Rol seçin',
    select_region: 'Region seçin',
    select_sector: 'Sektor seçin',
    select_school: 'Məktəb seçin',
    select_language: 'Dil seçin',
    select_status: 'Status seçin'
  },

  // Rollar
  roles: {
    superadmin: 'Super Admin',
    regionadmin: 'Region Admini',
    sectoradmin: 'Sektor Admini',
    schooladmin: 'Məktəb Admini',
    user: 'İstifadəçi',
    viewer: 'Baxış icazəsi',
    editor: 'Redaktə icazəsi',
    moderator: 'Moderator'
  },

  // Statuslar
  statuses: {
    active: 'Aktiv',
    inactive: 'Qeyri-aktiv',
    pending: 'Gözləyir',
    suspended: 'Dayandırılmış',
    banned: 'Qadağan edilmiş',
    invited: 'Dəvət edilmiş',
    expired: 'Vaxtı keçmiş'
  },

  // Cədvəl başlıqları
  table: {
    name: 'Ad',
    email: 'E-poçt',
    role: 'Rol',
    status: 'Status',
    region: 'Region',
    sector: 'Sektor',
    school: 'Məktəb',
    last_login: 'Son giriş',
    created_at: 'Yaradıldı',
    actions: 'Əməliyyatlar',
    select: 'Seç',
    no_users: 'İstifadəçi tapılmadı',
    loading_users: 'İstifadəçilər yüklənir...'
  },

  // Filtrlər
  filters: {
    search_users: 'İstifadəçi axtar...',
    filter_by_role: 'Rola görə filtr',
    filter_by_status: 'Statusa görə filtr',
    filter_by_region: 'Regiona görə filtr',
    filter_by_sector: 'Sektora görə filtr',
    all_roles: 'Bütün rollar',
    all_statuses: 'Bütün statuslar',
    all_regions: 'Bütün regionlar',
    all_sectors: 'Bütün sektorlar',
    active_only: 'Yalnız aktiv',
    inactive_only: 'Yalnız qeyri-aktiv',
    recent_login: 'Son giriş',
    never_logged: 'Heç girmyənlər'
  },

  // Mesajlar
  messages: {
    user_created: 'İstifadəçi uğurla yaradıldı',
    user_updated: 'İstifadəçi məlumatları yeniləndi',
    user_deleted: 'İstifadəçi silindi',
    user_activated: 'İstifadəçi aktivləşdirildi',
    user_deactivated: 'İstifadəçi deaktivləşdirildi',
    password_reset: 'Şifrə sıfırlandı',
    password_changed: 'Şifrə dəyişdirildi',
    invitation_sent: 'Dəvət göndərildi',
    notification_sent: 'Bildiriş göndərildi',
    bulk_action_completed: 'Kütləvi əməliyyat tamamlandı',
    
    // Xəta mesajları
    user_not_found: 'İstifadəçi tapılmadı',
    email_already_exists: 'Bu e-poçt artıq mövcuddur',
    username_taken: 'Bu istifadəçi adı artıq alınıb',
    invalid_role: 'Yanlış rol',
    permission_denied: 'İcazə verilmədi',
    cannot_delete_self: 'Özünüzü silə bilməzsiniz',
    cannot_delete_admin: 'Admin istifadəçini silə bilməzsiniz',
    
    // Təsdiq mesajları
    confirm_delete: 'Bu istifadəçini silmək istədiyinizə əminsiniz?',
    confirm_deactivate: 'Bu istifadəçini deaktivləşdirmək istədiyinizə əminsiniz?',
    confirm_bulk_delete: '{{count}} istifadəçini silmək istədiyinizə əminsiniz?',
    confirm_password_reset: 'Bu istifadəçinin şifrəsini sıfırlamaq istədiyinizə əminsiniz?'
  },

  // Statistika
  stats: {
    total_users: 'Ümumi İstifadəçilər',
    active_users: 'Aktiv İstifadəçilər',
    inactive_users: 'Qeyri-aktiv İstifadəçilər',
    pending_users: 'Gözləyən İstifadəçilər',
    online_users: 'Onlayn İstifadəçilər',
    new_this_month: 'Bu ay yeni',
    admins: 'Adminlər',
    regular_users: 'Adi İstifadəçilər',
    last_login_today: 'Bu gün giriş edən',
    never_logged: 'Heç girmyən'
  },

  // Səhifə bölmələri
  tabs: {
    overview: 'Ümumi baxış',
    users: 'İstifadəçilər',
    roles: 'Rollar',
    permissions: 'İcazələr',
    activity: 'Fəaliyyət',
    settings: 'Parametrlər',
    audit_log: 'Audit jurnal'
  },

  // İcazələr
  permissions: {
    view: 'Baxış',
    create: 'Yaratma',
    edit: 'Redaktə',
    delete: 'Silmə',
    manage: 'İdarəetmə',
    approve: 'Təsdiqləmə',
    export: 'İxrac',
    import: 'İdxal',
    full_access: 'Tam giriş',
    read_only: 'Yalnız oxu',
    limited_access: 'Məhdud giriş'
  },

  // Dəvət prosesi
  invitation: {
    invite_user: 'İstifadəçi dəvət et',
    send_invitation: 'Dəvət göndər',
    invitation_email: 'Dəvət e-poçtu',
    invitation_message: 'Dəvət mesajı',
    invitation_expires: 'Dəvət bitir',
    custom_message: 'Xüsusi mesaj',
    default_message: 'Sizi İnfoLine sisteminə dəvət edirik',
    pending_invitations: 'Gözləyən dəvətlər',
    accepted_invitations: 'Qəbul edilən dəvətlər',
    expired_invitations: 'Vaxtı keçən dəvətlər',
    resend_invitation: 'Dəvəti yenidən göndər',
    cancel_invitation: 'Dəvəti ləğv et'
  }
} as const;

export type UserManagement = typeof userManagement;
export default userManagement;