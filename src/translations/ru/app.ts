// App-specific translations
export const app = {
  name: 'ИнфоЛайн',
  description: 'Система сбора школьных данных',
  tagline: 'Центральная платформа для управления образовательными данными',
  version: 'Версия',
  welcome: 'Добро пожаловать',
  loading: 'Загрузка...',
  error: 'Произошла ошибка',
  success: 'Операция выполнена успешно'
} as const;

export type App = typeof app;
export default app;