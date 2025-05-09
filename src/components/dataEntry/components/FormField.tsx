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
import { toast } from 'sonner';

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
  // options dəyişəninin array olub-olmadığını yoxlayırıq
  const normalizedOptions = Array.isArray(options) 
    ? options.map((option, index) => {
        if (typeof option === 'string') {
          return { 
            label: option, 
            value: option || `option-${index}` 
          };
        }
        // Ensure there's always a non-empty value
        if (!option.value || option.value === '') {
          return {
            ...option,
            value: `option-${option.label || index}`
          };
        }
        return option;
      }) 
    : [];

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
            onValueChange={(newValue) => {
              onChange(newValue);
              // Seçim dəyişdikdə bildiriş göstərmək
              toast.success(t('optionSaved') || 'Seçim yadda saxlanıldı');
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder || t('selectOption') || 'Seçim edin'} />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(normalizedOptions) && normalizedOptions.length === 0 ? (
                <div className="p-2 text-center text-muted-foreground">
                  {t('noOptionsAvailable') || 'Seçim variantları mövcud deyil'}
                </div>
              ) : (
                Array.isArray(normalizedOptions) && normalizedOptions.map((option, index) => {
                  // Ensure option value is never an empty string
                  const optionValue = option.value || `option-${index}`;
                  
                  return (
                    <SelectItem 
                      key={`${id}-${index}`} 
                      value={optionValue}
                    >
                      {option.label || optionValue}
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        );
      
      case 'multiselect':
        return (
          <div className="space-y-2 border rounded-md p-3">
            <div className="text-sm font-medium mb-2 text-muted-foreground">
              {t('selectMultipleOptions') || 'Bir neçə variant seçin'}
            </div>
            
            {Array.isArray(normalizedOptions) && normalizedOptions.length === 0 ? (
              <div className="p-2 text-center text-muted-foreground">
                {t('noOptionsAvailable') || 'Seçim variantları mövcud deyil'}
              </div>
            ) : (
              Array.isArray(normalizedOptions) && normalizedOptions.map((option) => {
                const isChecked = Array.isArray(value) ? value.includes(option.value) : false;
                
                return (
                  <div key={option.value} className="flex items-center space-x-2 py-1 hover:bg-muted/50 px-1 rounded-sm">
                    <Checkbox
                      id={`${id}-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        let newValue;
                        
                        if (checked) {
                          newValue = Array.isArray(value) ? [...value, option.value] : [option.value];
                        } else {
                          newValue = Array.isArray(value) 
                            ? value.filter(v => v !== option.value) 
                            : [];
                        }
                        
                        onChange(newValue);
                        
                        // Seçim dəyişdikdə bildiriş göstərmək
                        toast.success(t('optionSaved') || 'Seçim yadda saxlanıldı');
                      }}
                    />
                    <label
                      htmlFor={`${id}-${option.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                    >
                      {option.label}
                    </label>
                  </div>
                );
              })
            )}
            
            {Array.isArray(value) && value.length > 0 && (
              <div className="mt-2 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {t('selectedOptions') || 'Seçilmiş variantlar'}: {value.length}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onChange([]);
                    toast.success(t('optionsCleared') || 'Bütün seçimlər silindi');
                  }}
                >
                  {t('clearAll') || 'Hamısını sil'}
                </Button>
              </div>
            )}
          </div>
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
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {Array.isArray(normalizedOptions) && normalizedOptions.map((option) => {
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
            {Array.isArray(normalizedOptions) && normalizedOptions.map((option) => (
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
