
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnType } from '@/types/column';

interface FieldRendererSimpleProps {
  type: ColumnType;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  options?: any[];
  placeholder?: string;
}

const FieldRendererSimple: React.FC<FieldRendererSimpleProps> = ({
  type,
  value,
  onChange,
  disabled = false,
  required = false,
  readOnly = false,
  options = [],
  placeholder = ''
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSelectChange = (newValue: string) => {
    onChange(newValue);
  };

  const handleCheckboxChange = (checked: boolean) => {
    onChange(checked ? 'true' : 'false');
  };

  switch (type) {
    case 'text':
      return (
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
        />
      );

    case 'textarea':
      return (
        <Textarea
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          rows={4}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
        />
      );

    case 'email':
      return (
        <Input
          type="email"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
        />
      );

    case 'date':
      return (
        <Input
          type="date"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      );

    case 'select':
      return (
        <Select
          value={value}
          onValueChange={handleSelectChange}
          disabled={disabled}
          required={required}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder || 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              
              return (
                <SelectItem key={`${index}-${optionValue}`} value={String(optionValue)}>
                  {optionLabel}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={value === 'true'}
            onCheckedChange={handleCheckboxChange}
            disabled={disabled}
            required={required}
          />
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {placeholder}
          </label>
        </div>
      );

    case 'file':
      return (
        <Input
          type="file"
          onChange={handleInputChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      );

    default:
      return (
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
        />
      );
  }
};

export default FieldRendererSimple;
