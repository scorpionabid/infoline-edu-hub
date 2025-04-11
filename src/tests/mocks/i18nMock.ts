// src/tests/mocks/i18nMock.ts faylını yaradın
import { vi } from 'vitest';


export const mockTranslations = {
  az: {
    unknownUser: 'Naməlum istifadəçi',
    noRole: 'Rol təyin edilməyib',
    myProfile: 'Mənim profilim',
    refresh: 'Yenilə',
    thisQuarter: 'Bu kvartal',
    searchDashboard: 'Axtarış'
    // Digər tərcümələr
  }
};

// LanguageProvider mockunu yaradın
vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'az',
    setLanguage: vi.fn(),
    t: (key) => mockTranslations.az[key] || `${key} (az)`
  }),
  LanguageProvider: ({ children }) => children
}));