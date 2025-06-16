// App-specific translations
export const app = {
  name: 'İnfoLine',
  description: 'Məktəb Məlumatları Toplama Sistemi',
  tagline: 'Təhsil məlumatlarını idarə etmək üçün mərkəzi platforma',
  version: 'Versiya',
  welcome: 'Xoş gəlmisiniz',
  loading: 'Yüklənir...',
  error: 'Xəta baş verdi',
  success: 'Əməliyyat uğurla tamamlandı'
} as const;

export type App = typeof app;
export default app;