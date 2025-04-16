
import { ValidationRules as ColumnValidationRules } from '@/types/column';

// ValidationRules üçün adaptasiya funksiyası
export const adaptValidationRules = (rules: any): ColumnValidationRules => {
  return {
    required: rules?.required || false,
    min: rules?.min,
    max: rules?.max,
    minLength: rules?.minLength,
    maxLength: rules?.maxLength,
    pattern: rules?.pattern ? String(rules.pattern) : undefined,
    email: rules?.email,
    url: rules?.url,
    numeric: rules?.numeric,
    integer: rules?.integer,
    date: rules?.date,
    custom: rules?.custom
  };
};
