import React, { createContext, useContext, useState } from 'react';

export type Language = 'az' | 'en' | 'tr' | 'ru';

export interface LanguageConfig {
  nativeName: string;
  flag: string;
}

export interface Translations {
  [key: string]: string;
}

export interface LanguageContextType {
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  languages: Record<Language, LanguageConfig>;
  currentLanguage: Language;
  availableLanguages: Language[];
}

const languages: Record<Language, LanguageConfig> = {
  az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
  en: { nativeName: 'English', flag: '🇬🇧' },
  tr: { nativeName: 'Türkçe', flag: '🇹🇷' },
  ru: { nativeName: 'Русский', flag: '🇷🇺' }
};

// Tərcümə açarları
const translations: Record<Language, Translations> = {
  az: {
    loginTitle: 'Daxil ol',
    loginButton: 'Daxil ol',
    loginSuccess: 'Uğurla daxil oldunuz',
    loggingIn: 'Daxil olunur...',
    email: 'E-poçt',
    password: 'Şifrə',
    loginDescription: 'Hesabınıza daxil olun',
    forgotPassword: 'Şifrəni unutmusunuz?',
    emailRequired: 'E-poçt tələb olunur',
    passwordRequired: 'Şifrə tələb olunur',
    invalidEmail: 'Düzgün e-poçt formatı deyil',
    passwordTooShort: 'Şifrə ən azı 6 simvol olmalıdır',
    invalidCredentials: 'Yanlış e-poçt və ya şifrə',
    unexpectedError: 'Gözlənilməz xəta baş verdi',
    language: 'Dil',
    light: 'İşıqlı',
  },
  en: {
    loginTitle: 'Login',
    loginButton: 'Sign in',
    loginSuccess: 'Successfully logged in',
    loggingIn: 'Logging in...',
    email: 'Email',
    password: 'Password',
    loginDescription: 'Sign in to your account',
    forgotPassword: 'Forgot password?',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    invalidEmail: 'Invalid email format',
    passwordTooShort: 'Password must be at least 6 characters',
    invalidCredentials: 'Invalid email or password',
    unexpectedError: 'An unexpected error occurred',
    language: 'Language',
    light: 'Light',
  },
  tr: {
    loginTitle: 'Giriş',
    loginButton: 'Giriş yap',
    loginSuccess: 'Başarıyla giriş yapıldı',
    loggingIn: 'Giriş yapılıyor...',
    email: 'E-posta',
    password: 'Şifre',
    loginDescription: 'Hesabınıza giriş yapın',
    forgotPassword: 'Şifreyi unuttunuz mu?',
    emailRequired: 'E-posta gereklidir',
    passwordRequired: 'Şifre gereklidir',
    invalidEmail: 'Geçersiz e-posta formatı',
    passwordTooShort: 'Şifre en az 6 karakter olmalıdır',
    invalidCredentials: 'Geçersiz e-posta veya şifre',
    unexpectedError: 'Beklenmeyen bir hata oluştu',
    language: 'Dil',
    light: 'Aydınlık',
  },
  ru: {
    loginTitle: 'Вход',
    loginButton: 'Войти',
    loginSuccess: 'Успешный вход',
    loggingIn: 'Выполняется вход...',
    email: 'Эл. почта',
    password: 'Пароль',
    loginDescription: 'Войдите в свой аккаунт',
    forgotPassword: 'Забыли пароль?',
    emailRequired: 'Необходимо указать адрес эл. почты',
    passwordRequired: 'Необходимо указать пароль',
    invalidEmail: 'Неверный формат эл. почты',
    passwordTooShort: 'Пароль должен содержать не менее 6 символов',
    invalidCredentials: 'Неверный адрес эл. почты или пароль',
    unexpectedError: 'Произошла непредвиденная ошибка',
    language: 'Язык',
    light: 'Светлый',
  }
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('az');

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    // Burada dil dəyişikliyi ilə əlaqədar əlavə işlər görülə bilər
  };

  const t = (key: string): string => {
    // Tərcümə funksiyası
    return translations[currentLanguage][key] || key;
  };

  const value: LanguageContextType = {
    t,
    setLanguage,
    languages,
    currentLanguage,
    availableLanguages: Object.keys(languages) as Language[]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// useLanguageSafe - təhlükəsiz dil hook-u
// useLanguage-dən fərqli olaraq, kontekst olmadıqda xəta atmır
export const useLanguageSafe = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Xəta atmaq əvəzinə default dəyərlər qaytarırıq
    return {
      t: (key: string) => key, // Açarı olduğu kimi qaytarırıq
      setLanguage: () => {}, // Boş funksiya
      languages,
      currentLanguage: 'az', // Default dil
      availableLanguages: Object.keys(languages) as Language[]
    };
  }
  return context;
};
