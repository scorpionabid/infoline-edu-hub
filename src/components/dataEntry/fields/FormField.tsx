
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
  readOnly?: boolean;
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
  options = [],
  readOnly = false
}) => {
  const fieldType = column?.type || type;
  const fieldPlaceholder = column?.placeholder || placeholder;
  const fieldRequired = column?.is_required || required;

  const handleChange = (newValue: any) => {
    if (!readOnly) {
      onChange(newValue);
    }
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
            readOnly={readOnly}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
          />
        );

      case 'select':
        const selectOptions = column?.options || options;
        // Filter and validate options to ensure no empty values
        const validOptions = selectOptions
          .filter((option: any) => {
            const optionValue = option?.value !== undefined ? option.value : option;
            return optionValue !== null && optionValue !== undefined && String(optionValue).trim() !== '';
          })
          .map((option: any, index: number) => {
            const optionValue = option?.value !== undefined ? option.value : option;
            const optionLabel = option?.label !== undefined ? option.label : option;
            
            // Ensure value is never empty string
            const safeValue = String(optionValue).trim() || `option-${index}`;
            
            return {
              value: safeValue,
              label: optionLabel || safeValue
            };
          });
        
        return (
          <Select 
            value={value || undefined} 
            onValueChange={handleChange} 
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder={fieldPlaceholder || 'Seçin...'} />
            </SelectTrigger>
            <SelectContent>
              {validOptions.length > 0 ? (
                validOptions.map((option: any, index: number) => (
                  <SelectItem 
                    key={`${option.value}-${index}`} 
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options-available" disabled>
                  Seçim yoxdur
                </SelectItem>
              )}
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
              disabled={readOnly}
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
            readOnly={readOnly}
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
