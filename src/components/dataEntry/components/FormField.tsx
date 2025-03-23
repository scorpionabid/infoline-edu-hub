
import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { ColumnType } from '@/types/column';
import FormFieldHelp from './FormFieldHelp';

export interface FormFieldProps {
  id: string;
  label: string;
  type: ColumnType;
  required: boolean;
  options?: string[] | { label: string; value: string }[];
  placeholder?: string;
  helpText?: string;
  value: string | number | boolean | string[] | Date;
  error?: string;
  onChange: (value: any) => void;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  required,
  options = [],
  placeholder,
  helpText,
  value,
  error,
  onChange,
  disabled = false
}) => {
  const { t } = useLanguageSafe();
  
  const renderField = () => {
    switch (type) {
      case 'text':
        return (
          <Input
            id={id}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(error && "border-red-500")}
            required={required}
            disabled={disabled}
          />
        );
        
      case 'number':
        return (
          <Input
            id={id}
            type="number"
            value={value as number || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            className={cn(error && "border-red-500")}
            required={required}
            disabled={disabled}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={id}
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(error && "border-red-500")}
            required={required}
            disabled={disabled}
          />
        );
        
      case 'checkbox':
        return (
          <Checkbox
            id={id}
            checked={Boolean(value)}
            onCheckedChange={onChange}
            className={cn(error && "border-red-500")}
            disabled={disabled}
          />
        );
        
      case 'radio':
        return (
          <RadioGroup
            value={value as string}
            onValueChange={onChange}
            className="flex flex-col space-y-1"
            disabled={disabled}
          >
            {options.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <div key={optionValue} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={optionValue} 
                    id={`${id}-${optionValue}`} 
                    className={cn(error && "border-red-500")}
                  />
                  <label htmlFor={`${id}-${optionValue}`} className="text-sm">
                    {optionLabel}
                  </label>
                </div>
              );
            })}
          </RadioGroup>
        );
        
      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(error && "border-red-500")}>
              <SelectValue placeholder={placeholder || t('select')} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                
                return (
                  <SelectItem key={optionValue} value={optionValue}>
                    {optionLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
        
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  error && "border-red-500"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value as string), 'PPP') : placeholder || t('selectDate')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value as string) : undefined}
                onSelect={(date) => onChange(date?.toISOString())}
                initialFocus
                disabled={disabled}
              />
            </PopoverContent>
          </Popover>
        );
        
      default:
        return <div>{t('unsupportedFieldType')}</div>;
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {helpText && <FormFieldHelp text={helpText} />}
        </div>
      </div>
      
      <div className={cn("w-full", type === 'checkbox' && "flex items-center space-x-2")}>
        {renderField()}
      </div>
      
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
