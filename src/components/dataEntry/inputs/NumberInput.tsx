
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Column } from '@/types/column';

interface NumberInputProps {
  column: Column;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  column,
  value,
  onChange,
  error
}) => {
  const [localValue, setLocalValue] = useState<string>(value ? String(value) : '');
  
  // Dəyər dəyişikliyi prop vasitəsilə ötürüldükdə yerli dəyəri yeniləyirik
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(String(value));
    }
  }, [value]);

  // Validasiya məlumatlarını əldə edirik
  const validation = typeof column.validation === 'string' 
    ? JSON.parse(column.validation) 
    : column.validation || {};

  // Min və max dəyərləri əldə edirik
  const minValue = validation?.minValue !== undefined ? Number(validation.minValue) : undefined;
  const maxValue = validation?.maxValue !== undefined ? Number(validation.maxValue) : undefined;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    
    // Boş dəyər halında
    if (e.target.value === '') {
      onChange('');
      return;
    }
    
    // Yalnız ədədlərə icazə veririk
    const numericValue = e.target.value.replace(/[^0-9.-]/g, '');
    
    if (numericValue) {
      onChange(numericValue);
    } else {
      onChange('');
    }
  };

  // Fokusdan çıxdıqda dəyəri yoxlayırıq
  const handleBlur = () => {
    if (localValue === '') return;
    
    const num = Number(localValue);
    if (isNaN(num)) {
      onChange('');
      setLocalValue('');
      return;
    }
    
    // Min/max məhdudiyyətləri yoxlayırıq
    if (minValue !== undefined && num < minValue) {
      onChange(String(minValue));
      setLocalValue(String(minValue));
    } else if (maxValue !== undefined && num > maxValue) {
      onChange(String(maxValue));
      setLocalValue(String(maxValue));
    }
  };

  return (
    <div>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        min={minValue}
        max={maxValue}
        placeholder={column.placeholder}
        className={error ? 'border-red-500' : ''}
      />
      {(minValue !== undefined || maxValue !== undefined) && (
        <p className="text-xs text-muted-foreground mt-1">
          {minValue !== undefined && maxValue !== undefined
            ? `${minValue} - ${maxValue} arası`
            : minValue !== undefined
            ? `Minimum: ${minValue}`
            : `Maksimum: ${maxValue}`}
        </p>
      )}
    </div>
  );
};
