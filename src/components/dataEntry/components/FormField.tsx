
import React from 'react';
import {
  FormControl,
  FormDescription,
  FormField as UIFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ColumnType } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

interface FormFieldProps {
  id: string;
  label: string;
  type: ColumnType;
  required: boolean;
  disabled?: boolean;
  options?: string[] | { label: string; value: string }[];
  placeholder?: string;
  helpText?: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  required,
  disabled = false,
  options = [],
  placeholder,
  helpText,
  value,
  onChange,
  error,
}) => {
  const { t } = useLanguage();
  
  // Seçim variantlarını hazırlayırıq
  const normalizedOptions = options 
    ? options.map(opt => typeof opt === 'string' ? { label: opt, value: opt } : opt)
    : [];

  // Sahəyə görə müxtəlif input tiplərini render edirik
  const renderField = () => {
    switch (type) {
      case 'text':
        return (
          <Input 
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
        
      case 'textarea':
        return (
          <Textarea 
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
        
      case 'number':
        return (
          <Input 
            id={id}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
        
      case 'checkbox':
        return (
          <Checkbox 
            id={id}
            checked={!!value}
            onCheckedChange={(checked) => onChange(checked)}
            disabled={disabled}
          />
        );
        
      case 'radio':
        return (
          <RadioGroup 
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled}
          >
            {normalizedOptions.map((option) => (
              <div className="flex items-center space-x-2" key={option.value}>
                <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
                <label htmlFor={`${id}-${option.value}`} className="text-sm font-medium">
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case 'select':
        return (
          <Select 
            value={value || ''} 
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={placeholder || t('select')} />
            </SelectTrigger>
            <SelectContent>
              {normalizedOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
                {value ? format(new Date(value), 'PPP') : <span>{placeholder || t('selectDate')}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date)}
                disabled={disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
        
      default:
        return (
          <div className="text-sm text-red-500">
            {t('unsupportedFieldType')}: {type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
      {renderField()}
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
};

export default FormField;
