
import React from 'react';
import { Column } from '@/types/column';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  column: Column;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  column,
  value,
  onChange,
  disabled = false
}) => {
  const renderField = () => {
    switch (column.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
            rows={3}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
          />
        );
      
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={column.placeholder || 'Seçin'} />
            </SelectTrigger>
            <SelectContent>
              {column.options && Array.isArray(column.options) && column.options.map((option: any, index: number) => (
                <SelectItem key={index} value={option.value || option}>
                  {option.label || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <Checkbox
            checked={value || false}
            onCheckedChange={onChange}
            disabled={disabled}
          />
        );
      
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={column.id} className="text-sm font-medium">
        {column.name}
        {column.is_required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {column.help_text && (
        <p className="text-sm text-muted-foreground">{column.help_text}</p>
      )}
    </div>
  );
};

export { FormField };
export default FormField;
