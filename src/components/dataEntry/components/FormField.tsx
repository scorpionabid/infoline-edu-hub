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
      
      case 'multiselect':
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
      
      case 'email':
        return (
          <Input
            id={id}
            type="email"
            placeholder={placeholder || 'example@domain.com'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      
      case 'phone':
        return (
          <Input
            id={id}
            type="tel"
            placeholder={placeholder || '+994 XX XXX XX XX'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            <Input
              id={id}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onChange(file);
                }
              }}
            />
            {value && typeof value === 'object' && (
              <div className="text-sm text-muted-foreground">
                {value.name} ({Math.round(value.size / 1024)} KB)
              </div>
            )}
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <Input
              id={id}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onChange(file);
                }
              }}
            />
            {value && typeof value === 'object' && (
              <div className="mt-2">
                <img 
                  src={typeof value === 'string' ? value : URL.createObjectURL(value)} 
                  alt={name}
                  className="max-w-full h-auto max-h-32 rounded-md"
                />
              </div>
            )}
          </div>
        );
      
      case 'boolean':
        return (
          <RadioGroup
            value={value?.toString() || ''}
            onValueChange={(val) => onChange(val === 'true')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${id}-true`} />
              <label
                htmlFor={`${id}-true`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('yes')}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${id}-false`} />
              <label
                htmlFor={`${id}-false`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('no')}
              </label>
            </div>
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
