// App-specific translations
export const app = {
  name: 'BilgiHattı',
  description: 'Okul Veri Toplama Sistemi',
  tagline: 'Eğitim verilerini yönetmek için merkezi platform',
  version: 'Sürüm',
  welcome: 'Hoş geldiniz',
  loading: 'Yükleniyor...',
  error: 'Bir hata oluştu',
  success: 'İşlem başarıyla tamamlandı'
} as const;

export type App = typeof app;
export default app;