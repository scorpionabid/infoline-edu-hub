
// Core translation module - Essential system translations
export const core = {
  // System messages
  system_error: 'Sistem xətası',
  network_error: 'Şəbəkə xətası',
  permission_denied: 'İcazə verilmədi',
  session_expired: 'Sessiya vaxtı bitdi',
  
  // Operations
  operation_successful: 'Əməliyyat uğurla həyata keçirildi',
  operation_failed: 'Əməliyyat uğursuz oldu',
  operation_cancelled: 'Əməliyyat ləğv edildi',
  
  // Data states
  data_loaded: 'Məlumatlar yükləndi',
  data_loading: 'Məlumatlar yüklənir',
  data_not_found: 'Məlumat tapılmadı',
  data_corrupted: 'Məlumat pozulub',
  
  // Authentication
  login_required: 'Giriş tələb olunur',
  access_restricted: 'Giriş məhdudlaşdırılıb',
  role_required: 'Xüsusi rol tələb olunur',
  
  // File operations
  file_uploaded: 'Fayl yükləndi',
  file_deleted: 'Fayl silindi',
  file_not_found: 'Fayl tapılmadı',
  file_too_large: 'Fayl çox böyükdür',
  
  // Connection
  connecting: 'Bağlanır',
  connected: 'Bağlandı',
  connection_lost: 'Bağlantı kəsildi',
  reconnecting: 'Yenidən bağlanır'
} as const;

export type Core = typeof core;
export default core;
