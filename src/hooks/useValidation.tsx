
import { useState, useEffect } from 'react';
import { ColumnValidation } from '@/types/column';

export const useValidation = (
  value: any,
  validation?: ColumnValidation,
  isRequired?: boolean
) => {
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!validation) {
      if (isRequired && !value) {
        setError('Bu sahə məcburidir');
        return;
      }
      setError(null);
      setWarning(null);
      return;
    }

    // Əsas validasiyalar
    if ((isRequired || validation.required) && !value) {
      setError('Bu sahə məcburidir');
      return;
    }

    if (value) {
      // Mətn validasiyası
      if (validation.minLength && value.length < validation.minLength) {
        setError(`Minimum ${validation.minLength} simvol olmalıdır`);
        return;
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        setError(`Maksimum ${validation.maxLength} simvol olmalıdır`);
        return;
      }

      // Pattern validasiyası
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          setError(validation.patternMessage || 'Düzgün format deyil');
          return;
        }
      }

      // Rəqəm validasiyası
      if (typeof value === 'number' || !isNaN(Number(value))) {
        const numValue = Number(value);
        
        if (validation.min !== undefined && numValue < validation.min) {
          setError(`Minimum dəyər ${validation.min} olmalıdır`);
          return;
        }
        
        if (validation.max !== undefined && numValue > validation.max) {
          setError(`Maksimum dəyər ${validation.max} olmalıdır`);
          return;
        }
        
        // Xəbərdarlıqlar
        if (validation.warningThreshold) {
          if (typeof validation.warningThreshold === 'object') {
            const { min, max } = validation.warningThreshold;
            
            if (min !== undefined && numValue < min) {
              setWarning(`Dəyər ${min}-dən aşağıdır`);
            } else if (max !== undefined && numValue > max) {
              setWarning(`Dəyər ${max}-dən yuxarıdır`);
            } else {
              setWarning(null);
            }
          } else {
            if (numValue > validation.warningThreshold) {
              setWarning(`Dəyər ${validation.warningThreshold}-dən yuxarıdır`);
            } else {
              setWarning(null);
            }
          }
        }
      }
      
      // Tarix validasiyası
      if (validation.minDate && new Date(value) < new Date(validation.minDate)) {
        setError(`Tarix ${new Date(validation.minDate).toLocaleDateString()}-dan sonra olmalıdır`);
        return;
      }

      if (validation.maxDate && new Date(value) > new Date(validation.maxDate)) {
        setError(`Tarix ${new Date(validation.maxDate).toLocaleDateString()}-dan əvvəl olmalıdır`);
        return;
      }
    }

    setError(null);
  }, [value, validation, isRequired]);

  return { error, warning, isValid: !error };
};

export default useValidation;
