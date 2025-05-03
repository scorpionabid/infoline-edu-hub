
import React from 'react';
import { Column } from '@/types/column';

interface FormFieldProps {
  column: Column;
  value: any;
  onChange: (columnId: string, value: any) => void;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ column, value, onChange, error }) => {
  // Sadə bir form field komponenti
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(column.id, e.target.value);
  };

  const renderField = () => {
    switch(column.type) {
      case 'text':
        return (
          <input
            type="text"
            id={column.id}
            value={value || ''}
            onChange={handleChange}
            placeholder={column.placeholder || ''}
            className="w-full p-2 border rounded"
            required={column.is_required}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={column.id}
            value={value || ''}
            onChange={handleChange}
            placeholder={column.placeholder || ''}
            className="w-full p-2 border rounded"
            required={column.is_required}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            id={column.id}
            value={value || ''}
            onChange={handleChange}
            placeholder={column.placeholder || ''}
            className="w-full p-2 border rounded"
            required={column.is_required}
          />
        );
      case 'select':
        const options = typeof column.options === 'string' 
          ? JSON.parse(column.options) 
          : column.options || [];
        
        return (
          <select
            id={column.id}
            value={value || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required={column.is_required}
          >
            <option value="">{column.placeholder || 'Seçin'}</option>
            {options.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            id={column.id}
            value={value || ''}
            onChange={handleChange}
            placeholder={column.placeholder || ''}
            className="w-full p-2 border rounded"
            required={column.is_required}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={column.id} className="block mb-1">
        {column.name}
        {column.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {column.help_text && (
        <p className="text-sm text-gray-500 mt-1">{column.help_text}</p>
      )}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};
