/**
 * DEPRECATED: Bu hook artıq @/context/LanguageContext ilə əvəz edilib
 * Bu, əvvəlki import yollarının işləməsini təmin etmək üçün bir körpüdür
 */

export { useLanguage } from '@/context/LanguageContext';

// useTranslation adlı bir export da əlavə edirik - useLanguage-ə istiqamətləndirir
export { useLanguage as useTranslation } from '@/context/LanguageContext';
