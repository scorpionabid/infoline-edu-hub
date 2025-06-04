
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ColumnType } from '@/types/column';

interface FieldRendererSimpleProps {
  id: string;
  type: ColumnType;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

const FieldRendererSimple: React.FC<FieldRendererSimpleProps> = ({
  id,
  type,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  placeholder,
  required = false,
  options = []
}) => {
  // Helper to create event object for non-input components
  const createEvent = (newValue: any) => ({
    target: { name: id, value: newValue }
  } as React.ChangeEvent<HTMLInputElement>);

  switch (type) {
    case 'text':
      return (
        <Input
          data-testid={`field-${id}`}
          name={id}
          type="text"
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
        />
      );

    case 'textarea':
      return (
        <Textarea
          data-testid={`field-${id}`}
          name={id}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
          rows={4}
        />
      );

    case 'number':
      return (
        <Input
          data-testid={`field-${id}`}
          name={id}
          type="number"
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
        />
      );

    case 'email':
      return (
        <Input
          data-testid={`field-${id}`}
          name={id}
          type="email"
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
        />
      );

    case 'tel':
    case 'phone':
      return (
        <Input
          data-testid={`field-${id}`}
          name={id}
          type="tel"
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
        />
      );

    case 'url':
      return (
        <Input
          data-testid={`field-${id}`}
          name={id}
          type="url"
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
        />
      );

    case 'password':
      return (
        <Input
          data-testid={`field-${id}`}
          name={id}
          type="password"
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
        />
      );

    case 'date':
      return (
        <Input
          data-testid={`field-${id}`}
          name={id}
          type="date"
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      );

    case 'datetime-local':
      return (
        <Input
          data-testid={`field-${id}`}
          name={id}
          type="datetime-local"
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      );

    case 'time':
      return (
        <Input
          data-testid={`field-${id}`}
          name={id}
          type="time"
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
        />
      );

    case 'select':
      return (
        <Select
          value={value || ''}
          onValueChange={(newValue) => onChange(createEvent(newValue))}
          disabled={disabled}
        >
          <SelectTrigger data-testid={`field-${id}`}>
            <SelectValue placeholder={placeholder || 'Seçin...'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option, index) => (
              <SelectItem key={index} value={option.value}>
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
            data-testid={`field-${id}`}
            checked={value === true || value === 'true'}
            onCheckedChange={(checked) => onChange(createEvent(checked))}
            disabled={disabled}
          />
          {placeholder && <span className="text-sm">{placeholder}</span>}
        </div>
      );

    case 'switch':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            data-testid={`field-${id}`}
            checked={value === true || value === 'true'}
            onCheckedChange={(checked) => onChange(createEvent(checked))}
            disabled={disabled}
          />
          {placeholder && <span className="text-sm">{placeholder}</span>}
        </div>
      );

    case 'file':
      return (
        <Input
          data-testid={`field-${id}`}
          name={id}
          type="file"
          onChange={onChange}
          disabled={disabled}
          required={required}
        />
      );

    default:
      return (
        <Input
          data-testid={`field-${id}`}
          name={id}
          type="text"
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          required={required}
        />
      );
  }
};

export default FieldRendererSimple;

