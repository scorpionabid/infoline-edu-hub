
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Column } from '@/types/column';

export interface FieldRendererProps {
  column: Column;
  value: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
  readOnly?: boolean;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  column,
  value,
  onChange,
  onValueChange,
  isDisabled = false,
  readOnly = false
}) => {
  const handleChange = (newValue: any) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
    if (onChange) {
      onChange({
        target: { name: column.id, value: newValue }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  switch (column.type) {
    case 'text':
      return (
        <Input
          name={column.id}
          value={value || ''}
          onChange={onChange}
          placeholder={column.placeholder}
          disabled={isDisabled}
          readOnly={readOnly}
          required={column.is_required}
        />
      );

    case 'textarea':
      return (
        <Textarea
          name={column.id}
          value={value || ''}
          onChange={onChange}
          placeholder={column.placeholder}
          disabled={isDisabled}
          readOnly={readOnly}
          required={column.is_required}
          rows={4}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          name={column.id}
          value={value || ''}
          onChange={onChange}
          placeholder={column.placeholder}
          disabled={isDisabled}
          readOnly={readOnly}
          required={column.is_required}
        />
      );

    case 'select':
      const options = Array.isArray(column.options) ? column.options : [];
      return (
        <Select
          value={value || ''}
          onValueChange={handleChange}
          disabled={isDisabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={column.placeholder || 'Seçin...'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option: any, index: number) => (
              <SelectItem key={index} value={option.value || option}>
                {option.label || option}
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
            onCheckedChange={handleChange}
            disabled={isDisabled}
          />
          <span className="text-sm">{column.placeholder}</span>
        </div>
      );

    case 'switch':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={value === true || value === 'true'}
            onCheckedChange={handleChange}
            disabled={isDisabled}
          />
          <span className="text-sm">{column.placeholder}</span>
        </div>
      );

    case 'date':
      return (
        <Input
          type="date"
          name={column.id}
          value={value || ''}
          onChange={onChange}
          disabled={isDisabled}
          readOnly={readOnly}
          required={column.is_required}
        />
      );

    case 'email':
      return (
        <Input
          type="email"
          name={column.id}
          value={value || ''}
          onChange={onChange}
          placeholder={column.placeholder}
          disabled={isDisabled}
          readOnly={readOnly}
          required={column.is_required}
        />
      );

    default:
      return (
        <Input
          name={column.id}
          value={value || ''}
          onChange={onChange}
          placeholder={column.placeholder}
          disabled={isDisabled}
          readOnly={readOnly}
          required={column.is_required}
        />
      );
  }
};

export default FieldRenderer;
