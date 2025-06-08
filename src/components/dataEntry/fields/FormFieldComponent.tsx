
import React from 'react';
import { Column } from '@/types/column';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FormFieldComponentProps {
  column: Column;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

const FormFieldComponent: React.FC<FormFieldComponentProps> = ({
  column,
  value,
  onChange,
  disabled = false,
  readOnly = false
}) => {
  const handleChange = (newValue: any) => {
    if (!disabled && !readOnly) {
      onChange(newValue);
    }
  };

  const renderField = () => {
    switch (column.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={disabled}
            readOnly={readOnly}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={disabled}
            readOnly={readOnly}
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={disabled}
            readOnly={readOnly}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={column.placeholder || 'Seçin...'} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
              onCheckedChange={(checked) => handleChange(checked)}
              disabled={disabled}
            />
            <span className="text-sm">{column.placeholder || 'Bəli'}</span>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            readOnly={readOnly}
          />
        );

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={disabled}
            readOnly={readOnly}
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
        <p className="text-xs text-muted-foreground">{column.help_text}</p>
      )}
    </div>
  );
};

export default FormFieldComponent;
