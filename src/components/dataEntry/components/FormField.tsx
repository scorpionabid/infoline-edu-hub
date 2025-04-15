
import React from 'react';
import { ColumnType } from '@/types/column';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import DatePicker from '@/components/ui/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

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
  disabled?: boolean;
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
  isRejected = false,
  rejectionReason,
  status,
  disabled = false
}) => {
  const isApproved = status === 'approved';
  const inputClassName = `w-full ${isRejected ? 'border-destructive' : ''} ${isApproved ? 'bg-muted' : ''}`;

  const renderField = () => {
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
            disabled={disabled || isApproved}
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
            disabled={disabled || isApproved}
          />
        );
        
      case 'date':
        return (
          <DatePicker
            id={id}
            date={value ? new Date(value) : undefined}
            onSelect={(date) => onChange(date?.toISOString())}
            disabled={disabled || isApproved}
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
            disabled={disabled || isApproved}
          />
        );
        
      case 'checkbox':
        return (
          <Checkbox
            id={id}
            checked={value === true}
            onCheckedChange={(checked) => onChange(checked)}
            disabled={disabled || isApproved}
          />
        );
        
      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={(val) => onChange(val)}
            className="flex flex-col space-y-1"
            disabled={disabled || isApproved}
          >
            {options?.map((option) => (
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
            disabled={disabled || isApproved}
          >
            <SelectTrigger className={inputClassName}>
              <SelectValue placeholder={placeholder || 'Seçin'} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'file':
      case 'image':
        return (
          <Input
            id={id}
            type="file"
            accept={type === 'image' ? 'image/*' : undefined}
            onChange={(e) => onChange(e.target.files?.[0])}
            className={inputClassName}
            disabled={disabled || isApproved}
          />
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
            disabled={disabled || isApproved}
          />
        );
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <Label htmlFor={id} className={isRequired ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
          {name}
        </Label>
        {isRequired && <span className="text-xs text-muted-foreground">Məcburi</span>}
      </div>
      
      {helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
      
      {renderField()}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {isRejected && rejectionReason && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{rejectionReason}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FormField;
