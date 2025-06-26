
import { useCallback } from 'react';
import { useSmartTranslation } from './useSmartTranslation';

export const useTranslationValidation = () => {
  const { t, tSafe, tContext } = useSmartTranslation();

  const tModule = useCallback((module: string, key: string, params?: Record<string, any>) => {
    return tSafe(`${module}.${key}`, undefined, { interpolation: params });
  }, [tSafe]);

  const tValidation = useCallback((rule: string, field: string, params?: Record<string, any>) => {
    return tSafe(`validation.${rule}`, undefined, { interpolation: { field, ...params });
  }, [tSafe]);

  const tComponent = useCallback((component: string, key: string, params?: Record<string, any>) => {
    return tSafe(`components.${component}.${key}`, undefined, { interpolation: params });
  }, [tSafe]);

  return {
    t,
    tSafe,
    tContext,
    tModule,
    tValidation,
    // tComponent
  };
};
