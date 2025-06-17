
import { useCallback } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

export const useTranslationValidation = () => {
  const { t } = useTranslation();

  const tModule = useCallback((module: string, key: string, params?: Record<string, any>) => {
    return t(`${module}.${key}`, params);
  }, [t]);

  const tValidation = useCallback((rule: string, field: string, params?: Record<string, any>) => {
    return t(`validation.${rule}`, { field, ...params });
  }, [t]);

  const tComponent = useCallback((component: string, key: string, params?: Record<string, any>) => {
    return t(`components.${component}.${key}`, params);
  }, [t]);

  return {
    t,
    tModule,
    tValidation,
    tComponent
  };
};
