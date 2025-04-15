
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ColumnType } from '@/types/column';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface FormFieldProps {
  id: string;
  type: ColumnType;
  name: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
  validation?: any;
  isRequired?: boolean;
  error?: string;
  isRejected?: boolean;
  rejectionReason?: string;
  status?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  type,
  name,
  value,
  onChange,
  placeholder,
  helpText,
  options = [],
  validation,
  isRequired = false,
  error,
  isRejected,
  rejectionReason,
  status,
}) => {
  const { t } = useLanguage();
  const isApproved = status === 'approved';
  const isDisabled = isApproved;
  
  const renderField = () => {
    const inputClassName = cn(
      'w-full',
      error ? 'border-destructive' : '',
      isRejected ? 'border-destructive' : '',
      isApproved ? 'bg-muted' : ''
    );
    
    switch (type) {
      case 'text':
        return (
          <Input
            id={id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || ''}
            className={inputClassName}
            disabled={isDisabled}
          />
        );
        
      case 'number':
        return (
          <Input
            id={id}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || ''}
            className={inputClassName}
            disabled={isDisabled}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || ''}
            className={inputClassName}
            disabled={isDisabled}
          />
        );
        
      case 'checkbox':
        return (
          <Checkbox
            id={id}
            checked={value === true}
            onCheckedChange={(checked) => onChange(checked)}
            disabled={isDisabled}
          />
        );
        
      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(val) => onChange(val)}
            className="flex flex-col space-y-1"
            disabled={isDisabled}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
                <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => onChange(val)}
            disabled={isDisabled}
          >
            <SelectTrigger className={inputClassName}>
              <SelectValue placeholder={placeholder || t('select')} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
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
            id={id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || ''}
            className={inputClassName}
            disabled={isDisabled}
          />
        );
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <Label 
          htmlFor={id} 
          className={isRequired ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}
        >
          {name}
        </Label>
        
        {isRequired && (
          <span className="text-xs text-muted-foreground">{t('required')}</span>
        )}
      </div>
      
      {helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
      
      {renderField()}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {isRejected && rejectionReason && (
        <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded-md">
          {rejectionReason}
        </div>
      )}
    </div>
  );
};

export default FormField;
