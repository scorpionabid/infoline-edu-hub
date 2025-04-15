
import React from 'react';
import { 
  FormControl, 
  FormDescription, 
  FormField as UIFormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface FormFieldProps {
  id: string;
  name: string;
  type: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
  validation?: any;
  isRequired?: boolean;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  helpText,
  options = [],
  validation,
  isRequired = false,
  error,
}) => {
  const { t } = useLanguage();
  
  // Seçim növləri üçün seçim variantlarını standardlaşdırmaq
  const normalizedOptions = options?.map(option => 
    typeof option === 'string' 
      ? { label: option, value: option } 
      : option
  ) || [];

  // Müxtəlif sütun tipləri üçün inputları render etmək
  const renderInput = () => {
    switch (type) {
      case 'text':
        return (
          <Input
            id={id}
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      
      case 'number':
        return (
          <Input
            id={id}
            type="number"
            placeholder={placeholder}
            value={value ?? ''}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            min={validation?.minValue}
            max={validation?.maxValue}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            id={id}
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={onChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder || t('selectOption')} />
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
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {normalizedOptions.map((option) => {
              const isChecked = Array.isArray(value) ? value.includes(option.value) : false;
              
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${id}-${option.value}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const newValue = Array.isArray(value) ? [...value, option.value] : [option.value];
                        onChange(newValue);
                      } else {
                        const newValue = Array.isArray(value) 
                          ? value.filter(v => v !== option.value) 
                          : [];
                        onChange(newValue);
                      }
                    }}
                  />
                  <label
                    htmlFor={`${id}-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
        );
      
      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
          >
            {normalizedOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
                <label
                  htmlFor={`${id}-${option.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>{placeholder || t('selectDate')}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date ? date.toISOString() : null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      
      default:
        return (
          <div className="text-sm text-muted-foreground">
            {t('unsupportedFieldType')}: {type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {name}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </label>
        {error && <div className="text-xs text-destructive">{error}</div>}
      </div>
      {renderInput()}
      {helpText && <div className="text-xs text-muted-foreground">{helpText}</div>}
    </div>
  );
};

export default FormField;
