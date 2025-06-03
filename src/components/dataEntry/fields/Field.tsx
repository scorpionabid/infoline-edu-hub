import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
import { Column, ColumnOption } from '@/types/column';
import { FormAdapter } from './adapters/FormAdapter';

// Re-export adapters for convenience
export * from './adapters/FormAdapter';

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'email' | 'phone' | 'url';

export interface FieldProps {
  column: Column;
  adapter: FormAdapter;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

/**
 * Unified Field komponenti - bütün sahə tiplərini render edir
 * Adapter pattern istifadə edərək müxtəlif form idarəetmə üsulları ilə işləyir
 */
const Field: React.FC<FieldProps> = ({
  column,
  adapter,
  disabled = false,
  readOnly = false,
  className
}) => {
  // Sahənin təhlükəsizlik yoxlanışı
  if (!column || !column.id) {
    console.warn('Field: Invalid column provided:', column);
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50">
        <p className="text-red-600 text-sm">Sütun məlumatları tapılmadı</p>
      </div>
    );
  }

  // Adapter vasitəsilə dəyərləri və xətaları alırıq
  const value = adapter.getValue(column.id);
  const error = adapter.getError(column.id);
  
  // Lokal state - UI-da dəyişikliklərin dərhal göstərilməsi üçün
  const [localValue, setLocalValue] = useState<any>(value);
  
  // Əgər xarici dəyər dəyişərsə, lokal state-i yeniləyirik
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Effective state-lər
  const effectiveDisabled = adapter.isDisabled(disabled);
  const effectiveReadOnly = adapter.isReadOnly(readOnly);

  // Hadisə idarəedicilər
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    adapter.setValue(column.id, newValue);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newValue = val ? parseFloat(val) : null;
    setLocalValue(val);
    adapter.setValue(column.id, newValue);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    adapter.setValue(column.id, newValue);
  };

  const handleSelectChange = (newValue: string) => {
    setLocalValue(newValue);
    adapter.setValue(column.id, newValue);
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    const newValue = checked === "indeterminate" ? false : checked;
    setLocalValue(newValue);
    adapter.setValue(column.id, newValue);
  };

  const handleRadioChange = (newValue: string) => {
    setLocalValue(newValue);
    adapter.setValue(column.id, newValue);
  };

  const handleDateChange = (date: Date | undefined) => {
    setLocalValue(date);
    adapter.setValue(column.id, date);
  };

  // Options-ın təhlükəsiz işlənməsi
  const getSafeOptions = (options: any): ColumnOption[] => {
    // Əgər options mövcud deyilsə, boş array qaytar
    if (!options) {
      return [];
    }
    
    // Əgər artıq array-dirsə və düzgün formatdadırsa, qaytar
    if (Array.isArray(options)) {
      return options.filter(opt => opt && (opt.label || opt.value));
    }
    
    // Əgər string-dirsə, JSON parse etməyə çalış
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) {
          return parsed.filter(opt => opt && (opt.label || opt.value));
        }
      } catch (e) {
        console.warn(`[Field] Failed to parse options JSON for ${column.name}:`, options);
        return [];
      }
    }
    
    // Əgər object-dirsə və values var, onu array-ə çevir
    if (typeof options === 'object' && options.values) {
      return Array.isArray(options.values) ? options.values : [];
    }
    
    console.warn(`[Field] Invalid options format for ${column.name}:`, options);
    return [];
  };
  
  const safeOptions = getSafeOptions(column.options);

  // Debug məlumatları
  console.log(`[Field] Rendering field for ${column.name}:`, {
    columnType: column.type,
    value: localValue,
    readOnly: effectiveReadOnly,
    disabled: effectiveDisabled,
    optionsCount: safeOptions.length,
    rawOptions: column.options
  });

  // Render funksiyası
  const renderField = () => {
    const fieldType = column.type as FieldType;
    
    switch (fieldType) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <Input
            id={column.id}
            name={column.id}
            type={fieldType}
            placeholder={column.placeholder || `${column.name} daxil edin`}
            value={localValue || ''}
            onChange={handleInputChange}
            disabled={effectiveDisabled}
            readOnly={effectiveReadOnly}
            className={cn(error && 'border-destructive')}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={column.id}
            name={column.id}
            placeholder={column.placeholder || `${column.name} daxil edin`}
            value={localValue || ''}
            onChange={handleTextareaChange}
            disabled={effectiveDisabled}
            readOnly={effectiveReadOnly}
            className={cn(
              error && 'border-destructive',
              'min-h-[120px] resize-y'
            )}
          />
        );

      case 'number':
        return (
          <Input
            id={column.id}
            name={column.id}
            type="number"
            placeholder={column.placeholder || `${column.name} daxil edin`}
            value={localValue ?? ''}
            onChange={handleNumberChange}
            disabled={effectiveDisabled}
            readOnly={effectiveReadOnly}
            className={cn(error && 'border-destructive')}
          />
        );

      case 'select':
        return (
          <Select 
            disabled={effectiveDisabled}
            value={localValue || ''}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger id={column.id} className={cn(error && 'border-destructive')}>
              <SelectValue placeholder={column.placeholder || `${column.name} seçin`} />
            </SelectTrigger>
            <SelectContent>
              {safeOptions.length > 0 ? (
                safeOptions.map((option: ColumnOption, index: number) => (
                  <SelectItem key={option.value || index} value={option.value || option.label || String(index)}>
                    {option.label || option.value || String(index)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options" disabled>
                  Seçənək tapılmadı
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            disabled={effectiveDisabled}
            value={localValue || ''}
            onValueChange={handleRadioChange}
          >
            {safeOptions.length > 0 ? (
              safeOptions.map((option: ColumnOption, index: number) => (
                <div key={option.value || index} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value={option.value || option.label || String(index)} id={`${column.id}-${option.value || index}`} />
                  <Label htmlFor={`${column.id}-${option.value || index}`}>{option.label || option.value || String(index)}</Label>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-2">
                Seçənək tapılmadı
              </div>
            )}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={column.id}
              checked={!!localValue}
              onCheckedChange={handleCheckboxChange}
              disabled={effectiveDisabled}
            />
            <Label>{column.help_text || column.name}</Label>
          </div>
        );

      case 'date':
        return (
          <DatePicker
            value={localValue ? new Date(localValue) : undefined}
            onChange={handleDateChange}
            disabled={effectiveDisabled}
            placeholder={column.placeholder || `${column.name} seçin`}
            onSelect={handleDateChange}
          />
        );

      case 'time':
        return (
          <Input
            id={column.id}
            name={column.id}
            type="time"
            placeholder={column.placeholder || `${column.name} daxil edin`}
            value={localValue || ''}
            onChange={handleInputChange}
            disabled={effectiveDisabled}
            readOnly={effectiveReadOnly}
            className={cn(error && 'border-destructive')}
          />
        );

      default:
        return (
          <Input
            id={column.id}
            name={column.id}
            placeholder={column.placeholder || `${column.name} daxil edin`}
            value={localValue || ''}
            onChange={handleInputChange}
            disabled={effectiveDisabled}
            readOnly={effectiveReadOnly}
            className={cn(error && 'border-destructive')}
          />
        );
    }
  };

  // Checkbox-lar fərqli layout istifadə edir
  if (column.type === 'checkbox') {
    return (
      <div className={cn("py-2", className)}>
        {renderField()}
        {error && <p className="text-xs text-destructive font-medium mt-1">{error}</p>}
      </div>
    );
  }

  // Standart field layout
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={column.id} className="text-sm font-medium">
        {column.name}
        {column.is_required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {column.help_text && (
        <p className="text-xs text-muted-foreground">{column.help_text}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

export default Field;
