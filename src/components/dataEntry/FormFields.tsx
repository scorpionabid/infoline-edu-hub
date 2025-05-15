import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { Column } from '@/types/column';

export interface ValidationResult {
  valid: boolean;
  message?: string;
  errors?: Record<string, string>;
}

// Tip tərifini genişləndirərək string | number | boolean | Date tipləri ilə işləyəcək hala gətirək
interface FormFieldsProps {
  fields: any[];
  values: Record<string, string>; // Dəyişdik - Əvvəlcə string olaraq dəyərləri alaq
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  disabled?: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({ 
  fields, 
  values, 
  setValues, 
  errors,
  setErrors,
  disabled = false
}) => {
  const validateField = (field: any, value: any): string | null => {
    if (!field || !field.validation) return null;
    
    const { validation } = field;
    
    if (field.isRequired && (!value || value === "")) {
      return "Bu sahə məcburidir";
    }
    
    if (validation.min !== undefined && Number(value) < validation.min) {
      return `Minimum dəyər ${validation.min} olmalıdır`;
    }
    
    if (validation.max !== undefined && Number(value) > validation.max) {
      return `Maksimum dəyər ${validation.max} olmalıdır`;
    }
    
    if (validation.minLength !== undefined && value.length < validation.minLength) {
      return `Minimum ${validation.minLength} simvol olmalıdır`;
    }
    
    if (validation.maxLength !== undefined && value.length > validation.maxLength) {
      return `Maksimum ${validation.maxLength} simvol olmalıdır`;
    }
    
    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      return validation.patternMessage || "Dəyər düzgün formatda deyil";
    }
    
    return null;
  };

  const handleChange = (id: string, value: string) => {
    // Dəyəri əvvəlcə string olaraq saxla
    setValues(prev => ({
      ...prev,
      [id]: value
    }));

    // Xətaları yoxla
    const field = fields.find(f => f.id === id);
    const error = validateField(field, value);
    
    if (error) {
      setErrors(prev => ({ ...prev, [id]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const renderField = (field: any) => {
    const { id, name, type, placeholder, helpText, options = [], defaultValue, validation = {} } = field;
    const value = values[id] || '';
    const error = errors[id];

    switch (type) {
      case 'text':
        return (
          <Input
            id={id}
            value={value}
            onChange={(e) => handleChange(id, e.target.value)}
            placeholder={placeholder}
            className={cn(error && 'border-destructive')}
            disabled={disabled}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            id={id}
            value={value}
            onChange={(e) => handleChange(id, e.target.value)}
            placeholder={placeholder}
            className={cn(error && 'border-destructive')}
            disabled={disabled}
          />
        );
      
      case 'number':
        return (
          <Input
            id={id}
            type="number"
            value={value}
            onChange={(e) => handleChange(id, e.target.value)}
            placeholder={placeholder}
            className={cn(error && 'border-destructive')}
            disabled={disabled}
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={id}
              checked={value === 'true'}
              onCheckedChange={(checked) => handleChange(id, checked ? 'true' : 'false')}
              disabled={disabled}
            />
            <Label htmlFor={id}>{placeholder}</Label>
          </div>
        );
      
      case 'date':
        return (
          <DatePicker
            value={value ? new Date(value) : undefined}
            onChange={(date) => handleChange(id, date ? date.toISOString() : '')}
            disabled={disabled}
          />
        );
        
      case 'select':
        return (
          <select
            id={id}
            value={value}
            onChange={(e) => handleChange(id, e.target.value)}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-muted-foreground file:h-10 file:w-full file:flex-1 file:cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && 'border-destructive'
            )}
            disabled={disabled}
          >
            <option value="">{placeholder}</option>
            {options.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="flex flex-col space-y-2">
            {options.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id={`${id}-${option.value}`}
                  name={id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleChange(id, option.value)}
                  disabled={disabled}
                />
                <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <Input
            id={id}
            value={value}
            onChange={(e) => handleChange(id, e.target.value)}
            placeholder={placeholder}
            className={cn(error && 'border-destructive')}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor={field.id} className={cn(field.isRequired && 'after:content-["*"] after:ml-0.5 after:text-destructive')}>
              {field.name}
            </Label>
            {field.helpText && <span className="text-xs text-muted-foreground">{field.helpText}</span>}
          </div>
          
          {renderField(field)}
          
          {errors[field.id] && (
            <p className="text-xs text-destructive">{errors[field.id]}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FormFields;
