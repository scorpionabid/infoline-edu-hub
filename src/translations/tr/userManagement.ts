// User management translation module
export const userManagement = {
  title: 'Kullanıcı Yönetimi',
  description: 'Kullanıcılar, roller ve izinlerin yönetimi',
  
  // Basic actions
  actions: {
    create_user: 'Kullanıcı Oluştur',
    edit_user: 'Kullanıcı Düzenle',
    delete_user: 'Kullanıcı Sil',
    view_user: 'Kullanıcı Görüntüle',
    assign_role: 'Rol Ata',
    change_password: 'Şifre Değiştir',
    reset_password: 'Şifre Sıfırla',
    activate_user: 'Kullanıcı Etkinleştir',
    deactivate_user: 'Kullanıcı Devre Dışı Bırak',
    export_users: 'Kullanıcıları Dışa Aktar',
    import_users: 'Kullanıcıları İçe Aktar',
    bulk_actions: 'Toplu İşlemler',
    invite_user: 'Kullanıcı Davet Et',
    send_notification: 'Bildirim Gönder'
  },

  // User form
  form: {
    personal_info: 'Kişisel Bilgiler',
    full_name: 'Tam İsim',
    first_name: 'İsim',
    last_name: 'Soyisim',
    email: 'E-posta Adresi',
    phone: 'Telefon Numarası',
    position: 'Pozisyon',
    department: 'Departman',
    
    account_info: 'Hesap Bilgileri',
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    confirm_password: 'Şifre Onayı',
    role: 'Rol',
    permissions: 'İzinler',
    status: 'Durum',
    
    location_info: 'Konum Bilgileri',
    region: 'Bölge',
    sector: 'Sektör',
    school: 'Okul',
    
    preferences: 'Tercihler',
    language: 'Dil',
    timezone: 'Saat Dilimi',
    notifications: 'Bildirimler'
  },

  // Roles
  roles: {
    superadmin: 'Süper Admin',
    regionadmin: 'Bölge Yöneticisi',
    sectoradmin: 'Sektör Yöneticisi',
    schooladmin: 'Okul Yöneticisi',
    user: 'Kullanıcı',
    viewer: 'Görüntüleyici',
    editor: 'Editör',
    moderator: 'Moderatör'
  },

  // Statuses
  statuses: {
    active: 'Aktif',
    inactive: 'Pasif',
    pending: 'Bekliyor',
    suspended: 'Askıya Alındı',
    banned: 'Yasaklandı',
    invited: 'Davet Edildi',
    expired: 'Süresi Doldu'
  },

  // Table headers
  table: {
    name: 'İsim',
    email: 'E-posta',
    role: 'Rol',
    status: 'Durum',
    region: 'Bölge',
    sector: 'Sektör',
    school: 'Okul',
    last_login: 'Son Giriş',
    created_at: 'Oluşturuldu',
    actions: 'İşlemler',
    select: 'Seç',
    no_users: 'Kullanıcı bulunamadı',
    loading_users: 'Kullanıcılar yükleniyor...'
  },

  // Messages
  // Page sections
  tabs: {
    overview: 'Genel Bakış',
    users: 'Kullanıcılar',
    roles: 'Roller',
    permissions: 'İzinler',
    activity: 'Aktivite',
    settings: 'Ayarlar',
    audit_log: 'Denetim Kaydı'
  },

  messages: {
    user_created: 'Kullanıcı başarıyla oluşturuldu',
    user_updated: 'Kullanıcı bilgileri güncellendi',
    user_deleted: 'Kullanıcı silindi',
    user_activated: 'Kullanıcı etkinleştirildi',
    user_deactivated: 'Kullanıcı devre dışı bırakıldı',
    password_reset: 'Şifre sıfırlandı',
    password_changed: 'Şifre değiştirildi',
    invitation_sent: 'Davet gönderildi',
    notification_sent: 'Bildirim gönderildi',
    bulk_action_completed: 'Toplu işlem tamamlandı',
    
    // Error messages
    user_not_found: 'Kullanıcı bulunamadı',
    email_already_exists: 'Bu e-posta zaten mevcut',
    username_taken: 'Bu kullanıcı adı zaten alınmış',
    invalid_role: 'Geçersiz rol',
    permission_denied: 'İzin reddedildi',
    cannot_delete_self: 'Kendinizi silemezsiniz',
    cannot_delete_admin: 'Admin kullanıcısını silemezsiniz',
    
    // Confirmation messages
    confirm_delete: 'Bu kullanıcıyı silmek istediğinizden emin misiniz?',
    confirm_deactivate: 'Bu kullanıcıyı devre dışı bırakmak istediğinizden emin misiniz?',
    confirm_bulk_delete: '{{count}} kullanıcıyı silmek istediğinizden emin misiniz?',
    confirm_password_reset: 'Bu kullanıcının şifresini sıfırlamak istediğinizden emin misiniz?'
  },

  // Statistics
  stats: {
    total_users: 'Toplam Kullanıcı',
    active_users: 'Aktif Kullanıcılar',
    inactive_users: 'Pasif Kullanıcılar',
    pending_users: 'Bekleyen Kullanıcılar',
    online_users: 'Çevrimiçi Kullanıcılar',
    new_this_month: 'Bu ay yeni',
    admins: 'Yöneticiler',
    regular_users: 'Normal Kullanıcılar',
    last_login_today: 'Bugün giriş yapan',
    never_logged: 'Hiç giriş yapmamış'
  }
} as const;

export type UserManagement = typeof userManagement;
export default userManagement;