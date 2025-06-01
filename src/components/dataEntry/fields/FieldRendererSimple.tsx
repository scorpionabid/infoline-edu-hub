
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Column } from '@/types/column';

// Local type definition to avoid conflicts
export type ColumnType = 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'time';

interface FieldProps {
  column: Column;
  disabled?: boolean;
  readOnly?: boolean;
}

const FieldRendererSimple: React.FC<FieldProps> = ({ column, disabled = false, readOnly = false }) => {
  // Safety check for column
  if (!column || !column.id) {
    console.warn('FieldRendererSimple: Invalid column provided:', column);
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50">
        <p className="text-red-600 text-sm">Sütun məlumatları tapılmadı</p>
      </div>
    );
  }
  
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const value = watch(column.id);

  const handleDateChange = (date: Date | undefined) => {
    setValue(column.id, date || null);
  };

  const renderField = () => {
    const fieldType = column.type as ColumnType;
    
    switch (fieldType) {
      case 'text':
      case 'time':
        return (
          <Input
            {...register(column.id, { 
              required: column.is_required ? `${column.name} sahəsi məcburidir` : false 
            })}
            type={fieldType === 'time' ? 'time' : 'text'}
            placeholder={column.placeholder || `${column.name} daxil edin`}
            disabled={disabled || readOnly}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...register(column.id, { 
              required: column.is_required ? `${column.name} sahəsi məcburidir` : false 
            })}
            placeholder={column.placeholder || `${column.name} daxil edin`}
            disabled={disabled || readOnly}
            rows={3}
          />
        );

      case 'number':
        return (
          <Input
            {...register(column.id, { 
              required: column.is_required ? `${column.name} sahəsi məcburidir` : false,
              valueAsNumber: true
            })}
            type="number"
            placeholder={column.placeholder || `${column.name} daxil edin`}
            disabled={disabled || readOnly}
          />
        );

      case 'select':
        return (
          <Select 
            value={value || ''} 
            onValueChange={(newValue) => setValue(column.id, newValue)}
            disabled={disabled || readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder={column.placeholder || `${column.name} seçin`} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option: any, index: number) => (
                <SelectItem key={index} value={option.value || option}>
                  {option.label || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup 
            value={value || ''} 
            onValueChange={(newValue) => setValue(column.id, newValue)}
            disabled={disabled || readOnly}
          >
            {column.options?.map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value || option} id={`${column.id}-${index}`} />
                <Label htmlFor={`${column.id}-${index}`}>
                  {option.label || option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value || false}
              onCheckedChange={(checked) => setValue(column.id, checked)}
              disabled={disabled || readOnly}
            />
            <Label>{column.help_text || column.name}</Label>
          </div>
        );

      case 'date':
        return (
          <DatePicker
            value={value ? new Date(value) : undefined}
            onChange={handleDateChange}
            disabled={disabled || readOnly}
            placeholder={column.placeholder || `${column.name} seçin`}
            onSelect={handleDateChange}
          />
        );

      default:
        return (
          <Input
            {...register(column.id)}
            placeholder={column.placeholder || `${column.name} daxil edin`}
            disabled={disabled || readOnly}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={column.id} className="text-sm font-medium">
        {column.name}
        {column.is_required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {column.help_text && (
        <p className="text-xs text-muted-foreground">{column.help_text}</p>
      )}
      {errors[column.id] && (
        <p className="text-xs text-red-500">
          {errors[column.id]?.message as string}
        </p>
      )}
    </div>
  );
};

export default FieldRendererSimple;
