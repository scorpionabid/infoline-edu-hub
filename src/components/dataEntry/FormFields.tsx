import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormFieldProps, FormFieldsProps } from '@/types/dataEntry';
import { Column, ColumnType } from '@/types/column';
import { useFormContext } from 'react-hook-form';

// Individual form field renderer component
const FormFieldRenderer: React.FC<FormFieldProps> = ({ column, value, onChange, onValueChange, isDisabled = false }) => {
  const renderField = () => {
    switch (column.type as ColumnType) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
      case 'password':
        return (
          <Input 
            id={column.id} 
            type={column.type === 'password' ? 'password' : 'text'} 
            placeholder={column.placeholder} 
            value={value || ''} 
            onChange={onChange} 
            disabled={isDisabled}
          />
        );
      
      case 'textarea':
        return (
          <Textarea 
            id={column.id} 
            placeholder={column.placeholder} 
            value={value || ''} 
            onChange={onChange} 
            disabled={isDisabled}
          />
        );
      
      case 'number':
        return (
          <Input 
            id={column.id} 
            type="number" 
            placeholder={column.placeholder} 
            value={value || ''} 
            onChange={onChange} 
            disabled={isDisabled}
          />
        );
      
      case 'select':
        return (
          <Select 
            value={value || ''} 
            onValueChange={onValueChange} 
            disabled={isDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={column.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <div className="flex flex-col space-y-2">
            {column.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${column.id}-${option.id}`}
                  checked={(value && Array.isArray(value) && value.includes(option.value)) || false}
                  onCheckedChange={(checked) => {
                    if (!onValueChange) return;
                    
                    const currentValue = Array.isArray(value) ? [...value] : [];
                    if (checked) {
                      onValueChange([...currentValue, option.value]);
                    } else {
                      onValueChange(currentValue.filter(val => val !== option.value));
                    }
                  }}
                  disabled={isDisabled}
                />
                <label className="text-sm" htmlFor={`${column.id}-${option.id}`}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'radio':
        return (
          <RadioGroup 
            value={value || ''} 
            onValueChange={onValueChange}
            disabled={isDisabled}
          >
            {column.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${column.id}-${option.id}`} />
                <label className="text-sm" htmlFor={`${column.id}-${option.id}`}>
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        );
      
      default:
        return (
          <Input 
            id={column.id} 
            placeholder={column.placeholder} 
            value={value || ''} 
            onChange={onChange} 
            disabled={isDisabled}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium" htmlFor={column.id}>
        {column.name}
        {column.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {column.help_text && <p className="text-xs text-gray-500">{column.help_text}</p>}
    </div>
  );
};

// Main component to render a collection of form fields
const FormFields: React.FC<FormFieldsProps> = ({ columns = [], disabled = false, readOnly = false }) => {
  // Xətaları önləmək üçün defensive programming
  const safeColumns = Array.isArray(columns) ? columns : [];
  const formContext = useFormContext();
  
  // Form konteksti olmadıqda statik render
  if (!formContext) {
    return (
      <div className="space-y-6">
        {safeColumns.map((column) => {
          // Sütun mövcud deyilsə, keç
          if (!column || !column.id) return null;
          
          return (
            <FormFieldRenderer
              key={column.id}
              column={column}
              value=""
              onChange={() => {}}
              onValueChange={() => {}}
              isDisabled={disabled || readOnly}
            />
          );
        })}
      </div>
    );
  }

  // Form konteksti ilə render
  const { control } = formContext;
  
  return (
    <div className="space-y-6">
      {safeColumns.map((column) => {
        // Sütun və ya sütun ID null-dırsa, keç
        if (!column || !column.id) {
          console.warn('Invalid column or column.id is undefined', column);
          return null;
        }
        
        return (
          <FormField
            key={column.id}
            control={control}
            name={column.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {column.name || 'Unnamed Field'}
                  {column.is_required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <FormFieldRenderer
                    column={column}
                    value={field?.value}
                    onChange={field?.onChange}
                    onValueChange={field?.onChange}
                    isDisabled={disabled || readOnly}
                  />
                </FormControl>
                {column.help_text && <FormDescription>{column.help_text}</FormDescription>}
                {column.description && !column.help_text && (
                  <FormDescription>{column.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </div>
  );
};

// Default export əlavə edirik ki, import problemləri həll olunsun
export default FormFields;
