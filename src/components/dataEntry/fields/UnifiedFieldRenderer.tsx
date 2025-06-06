
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Column, ColumnType } from '@/types/column';

export interface UnifiedFieldRendererProps {
  column: Column;
  value: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
  readOnly?: boolean;
  error?: string;
  className?: string;
}

/**
 * Unified Field Renderer - birləşdirilmiş sahə render komponenti
 * Bütün sahə tiplərini dəstəkləyir və vahid interface təmin edir
 */
const UnifiedFieldRenderer: React.FC<UnifiedFieldRendererProps> = ({
  column,
  value,
  onChange,
  onValueChange,
  isDisabled = false,
  readOnly = false,
  error,
  className
}) => {
  // Safely handle value change
  const handleChange = (newValue: any) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
    if (onChange) {
      onChange({
        target: { name: column.id, value: newValue }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Common input props
  const commonProps = {
    name: column.id,
    disabled: isDisabled || readOnly,
    readOnly,
    className: cn(error && 'border-destructive', className)
  };

  // Render field based on type
  switch (column.type) {
    case 'text':
      return (
        <Input
          {...commonProps}
          type="text"
          value={value || ''}
          onChange={onChange}
          placeholder={column.placeholder}
          required={column.is_required}
        />
      );

    case 'textarea':
      return (
        <Textarea
          {...commonProps}
          value={value || ''}
          onChange={onChange}
          placeholder={column.placeholder}
          required={column.is_required}
          rows={4}
        />
      );

    case 'number':
      return (
        <Input
          {...commonProps}
          type="number"
          value={value || ''}
          onChange={onChange}
          placeholder={column.placeholder}
          required={column.is_required}
        />
      );

    case 'email':
      return (
        <Input
          {...commonProps}
          type="email"
          value={value || ''}
          onChange={onChange}
          placeholder={column.placeholder}
          required={column.is_required}
        />
      );

    case 'select':
      const options = Array.isArray(column.options) ? column.options : [];
      return (
        <Select
          value={value || ''}
          onValueChange={handleChange}
          disabled={isDisabled}
        >
          <SelectTrigger className={cn(error && 'border-destructive', className)}>
            <SelectValue placeholder={column.placeholder || 'Seçin...'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option: any, index: number) => (
              <SelectItem key={index} value={option.value || option}>
                {option.label || option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={value === true || value === 'true'}
            onCheckedChange={handleChange}
            disabled={isDisabled}
          />
          <span className="text-sm">{column.placeholder}</span>
        </div>
      );

    case 'switch':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={value === true || value === 'true'}
            onCheckedChange={handleChange}
            disabled={isDisabled}
          />
          <span className="text-sm">{column.placeholder}</span>
        </div>
      );

    case 'radio':
      const radioOptions = Array.isArray(column.options) ? column.options : [];
      return (
        <RadioGroup 
          value={value || ''} 
          onValueChange={handleChange}
          disabled={isDisabled}
        >
          {radioOptions.map((option: any, index: number) => {
            const optionValue = option.value || option;
            const optionLabel = option.label || option;
            const optionId = `${column.id}-${index}`;
            
            return (
              <div key={optionId} className="flex items-center space-x-2">
                <RadioGroupItem value={optionValue} id={optionId} />
                <label className="text-sm" htmlFor={optionId}>
                  {optionLabel}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      );

    case 'date':
      const validDate = value ? new Date(value) : undefined;
      const isValidDate = validDate && !isNaN(validDate.getTime());
      
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !isValidDate && "text-muted-foreground",
                error && "border-destructive",
                isDisabled && "opacity-50 cursor-not-allowed",
                className
              )}
              disabled={isDisabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {isValidDate ? format(validDate, "PPP") : 
                <span>{column.placeholder || 'Tarix seçin'}</span>
              }
            </Button>
          </PopoverTrigger>
          {!isDisabled && (
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={isValidDate ? validDate : undefined}
                onSelect={(date) => handleChange(date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          )}
        </Popover>
      );

    default:
      return (
        <Input
          {...commonProps}
          value={value || ''}
          onChange={onChange}
          placeholder={column.placeholder}
          required={column.is_required}
        />
      );
  }
};

export default UnifiedFieldRenderer;
