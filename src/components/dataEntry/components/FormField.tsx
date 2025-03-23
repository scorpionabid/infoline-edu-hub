
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  required = false,
  disabled = false,
  readOnly = false,
  placeholder,
  helpText,
  options = [],
  value,
  onChange,
  error
}) => {
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    onChange(newValue);
  };
  
  const renderField = () => {
    switch (type) {
      case 'text':
        return (
          <Input
            id={id}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(error && "border-red-500")}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={id}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(error && "border-red-500")}
          />
        );
        
      case 'number':
        return (
          <Input
            id={id}
            type="number"
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(error && "border-red-500")}
          />
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
                disabled={disabled || readOnly}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : placeholder || "Tarix seçin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
        
      case 'select':
        return (
          <Select
            value={value || ""}
            onValueChange={onChange}
            disabled={disabled || readOnly}
          >
            <SelectTrigger className={cn(error && "border-red-500")}>
              <SelectValue placeholder={placeholder || "Seçin..."} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <Checkbox
            id={id}
            checked={Boolean(value)}
            onCheckedChange={onChange}
            disabled={disabled || readOnly}
          />
        );
        
      case 'radio':
        return (
          <RadioGroup
            value={value || ""}
            onValueChange={onChange}
            disabled={disabled || readOnly}
            className="flex flex-col space-y-1"
          >
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${id}-${option}`} />
                <label htmlFor={`${id}-${option}`} className="text-sm font-medium">
                  {option}
                </label>
              </div>
            ))}
          </RadioGroup>
        );
        
      default:
        return (
          <Input
            id={id}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(error && "border-red-500")}
          />
        );
    }
  };
  
  return (
    <div className="space-y-1 mb-4">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
      {renderField()}
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
};

export default FormField;
