
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Column {
  id: string;
  name: string;
  type: string;
  placeholder?: string;
  help_text?: string;
  options?: any[];
  is_required?: boolean;
}

interface FormFieldProps {
  id: string;
  name: string;
  value?: any;
  onChange: (value: any) => void;
  column?: Column;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: any[];
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  value,
  onChange,
  column,
  type = 'text',
  placeholder,
  required = false,
  options = []
}) => {
  const fieldType = column?.type || type;
  const fieldPlaceholder = column?.placeholder || placeholder;
  const fieldRequired = column?.is_required || required;

  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  const renderField = () => {
    switch (fieldType) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            id={id}
            name={name}
            type={fieldType}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldPlaceholder}
            required={fieldRequired}
          />
        );

      case 'number':
        return (
          <Input
            id={id}
            name={name}
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldPlaceholder}
            required={fieldRequired}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={id}
            name={name}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldPlaceholder}
            required={fieldRequired}
          />
        );

      case 'select':
        const selectOptions = column?.options || options;
        return (
          <Select value={value} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder={fieldPlaceholder || 'Seçin...'} />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((option: any, index: number) => (
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
              id={id}
              checked={value || false}
              onCheckedChange={handleChange}
            />
            <Label htmlFor={id}>{name}</Label>
          </div>
        );

      default:
        return (
          <Input
            id={id}
            name={name}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldPlaceholder}
            required={fieldRequired}
          />
        );
    }
  };

  if (fieldType === 'checkbox') {
    return renderField();
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {name}
        {fieldRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {column?.help_text && (
        <p className="text-sm text-muted-foreground">{column.help_text}</p>
      )}
    </div>
  );
};

export default FormField;
