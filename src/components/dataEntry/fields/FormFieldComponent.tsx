
import React from 'react';
import { Column } from '@/types/column';

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
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let newValue = event.target.value;
    
    // Type conversion based on column type
    if (column.type === 'number') {
      newValue = newValue ? parseFloat(newValue) : null;
    }
    
    onChange(newValue);
  };

  const renderField = () => {
    switch (column.type) {
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={handleChange}
            placeholder={column.placeholder || `${column.name} daxil edin`}
            disabled={disabled || readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={handleChange}
            disabled={disabled || readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seçin...</option>
            {column.options?.map((option: any, index: number) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={handleChange}
            placeholder={column.placeholder || `${column.name} daxil edin`}
            disabled={disabled || readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={handleChange}
            disabled={disabled || readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled || readOnly}
            className="rounded focus:ring-2 focus:ring-primary"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={handleChange}
            placeholder={column.placeholder || `${column.name} daxil edin`}
            disabled={disabled || readOnly}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {column.name}
        {column.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {column.help_text && (
        <p className="text-xs text-muted-foreground">{column.help_text}</p>
      )}
    </div>
  );
};

export default FormFieldComponent;
