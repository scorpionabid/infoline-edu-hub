
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EntryValue } from '@/types/dataEntry';
import { Column } from '@/types/column';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface FormFieldsProps {
  columns: Column[];
  values: EntryValue[];
  onChange: (columnId: string, value: string) => void;
  disabled?: boolean;
}

export function FormFields({
  columns,
  values,
  onChange,
  disabled = false
}: FormFieldsProps) {
  const getValue = (columnId: string): string => {
    const entry = values.find(v => v.columnId === columnId);
    return entry?.value || '';
  };

  const getError = (columnId: string): string | undefined => {
    const entry = values.find(v => v.columnId === columnId);
    return entry?.isValid === false ? entry.error : undefined;
  };

  const renderField = (column: Column) => {
    const value = getValue(column.id);
    const error = getError(column.id);
    
    switch (column.type) {
      case 'text':
        return (
          <Input
            id={column.id}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={column.id}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
        
      case 'number':
        return (
          <Input
            id={column.id}
            type="number"
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
        
      case 'date':
        return (
          <Input
            id={column.id}
            type="date"
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
        
      case 'select':
        const options = column.options ? JSON.parse(column.options) : [];
        return (
          <Select
            value={value}
            onValueChange={(val) => onChange(column.id, val)}
            disabled={disabled}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={column.placeholder || 'Seçin'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        const checkboxOptions = column.options ? JSON.parse(column.options) : [];
        const selectedValues = value ? value.split(',') : [];
        
        return (
          <div className="space-y-2">
            {checkboxOptions.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${column.id}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(val => val !== option);
                    onChange(column.id, newValues.join(','));
                  }}
                  disabled={disabled}
                />
                <Label htmlFor={`${column.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );
        
      case 'radio':
        const radioOptions = column.options ? JSON.parse(column.options) : [];
        
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => onChange(column.id, val)}
            disabled={disabled}
          >
            <div className="space-y-2">
              {radioOptions.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${column.id}-${option}`} />
                  <Label htmlFor={`${column.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );
        
      default:
        return (
          <Input
            id={column.id}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {columns.map(column => (
        <div key={column.id} className="space-y-2">
          <div className="flex items-center">
            <Label
              htmlFor={column.id}
              className="text-sm font-medium"
            >
              {column.name}
            </Label>
            {column.is_required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </div>
          
          {column.description && (
            <div className="text-xs text-muted-foreground mb-2">
              {column.description}
            </div>
          )}
          
          {renderField(column)}
          
          {getError(column.id) && (
            <div className="text-xs text-red-500 mt-1">
              {getError(column.id)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
