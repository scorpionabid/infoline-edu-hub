
import React, { useState } from 'react';
import { Column } from '@/types/column';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ValidationResult } from '@/types/dataEntry';
import { validateField, cn } from '@/components/dataEntry/utils/formUtils';

interface FormFieldProps {
  column: Column;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
}

export const FormFields: React.FC<FormFieldProps> = ({ 
  column, 
  value, 
  onChange, 
  onValueChange,
  isDisabled = false
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({ valid: true });

  const handleBlur = () => {
    const result = validateField(value, column);
    setValidationResult(result);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (onValueChange) {
      onValueChange(date ? date.toISOString() : '');
    }
  };

  const handleBooleanChange = (checked: boolean) => {
    if (onValueChange) {
      onValueChange(checked);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (onValueChange) {
      onValueChange(checked ? 'true' : 'false');
    }
  };

  const handleRadioChange = (value: string) => {
    if (onValueChange) {
      onValueChange(value);
    }
  };

  const handleSelectChange = (value: string) => {
    if (onValueChange) {
      onValueChange(value);
    }
  };

  const renderField = () => {
    switch (column.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'password':
        return (
          <Input
            type={column.type}
            name={column.id}
            value={value || ''}
            onChange={onChange}
            onBlur={handleBlur}
            placeholder={column.placeholder}
            required={column.is_required}
            disabled={isDisabled}
            className={cn(
              "w-full",
              !validationResult.valid && "border-destructive"
            )}
          />
        );

      case 'textarea':
        return (
          <Textarea
            name={column.id}
            value={value || ''}
            onChange={onChange}
            onBlur={handleBlur}
            placeholder={column.placeholder}
            required={column.is_required}
            disabled={isDisabled}
            className={cn(
              "w-full resize-y min-h-[100px]",
              !validationResult.valid && "border-destructive"
            )}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            name={column.id}
            value={value || ''}
            onChange={onChange}
            onBlur={handleBlur}
            placeholder={column.placeholder}
            required={column.is_required}
            disabled={isDisabled}
            min={column.validation?.min}
            max={column.validation?.max}
            className={cn(
              "w-full",
              !validationResult.valid && "border-destructive"
            )}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value === 'true' || value === true}
              onCheckedChange={handleCheckboxChange}
              disabled={isDisabled}
            />
            <Label htmlFor={column.id}>{column.placeholder || column.name}</Label>
          </div>
        );

      case 'date':
        return (
          <DatePicker
            date={value ? new Date(value) : undefined}
            onSelect={handleDateChange}
            disabled={isDisabled}
          />
        );

      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={handleRadioChange}
            disabled={isDisabled}
            className="space-y-1"
          >
            {column.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${column.id}-${option.value}`} />
                <Label htmlFor={`${column.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={handleSelectChange}
            disabled={isDisabled}
          >
            <SelectTrigger className={cn(
              "w-full",
              !validationResult.valid && "border-destructive"
            )}>
              <SelectValue placeholder={column.placeholder || `Select ${column.name}`} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            type="text"
            name={column.id}
            value={value || ''}
            onChange={onChange}
            onBlur={handleBlur}
            placeholder={column.placeholder}
            required={column.is_required}
            disabled={isDisabled}
            className={cn(
              "w-full",
              !validationResult.valid && "border-destructive"
            )}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={column.id} className={cn(!validationResult.valid && "text-destructive")}>
        {column.name}
        {column.is_required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {renderField()}
      
      {column.help_text && (
        <p className="text-xs text-muted-foreground">{column.help_text}</p>
      )}
      
      {!validationResult.valid && validationResult.message && (
        <p className="text-xs text-destructive mt-1">{validationResult.message}</p>
      )}
    </div>
  );
};

export default FormFields;
