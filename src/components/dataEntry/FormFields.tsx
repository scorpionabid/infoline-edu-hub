
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Column } from '@/types/column';
import { EntryValue } from '@/types/dataEntry';

interface FormFieldsProps {
  columns: Column[];
  values: EntryValue[];
  onChange: (columnId: string, value: string) => void;
  disabled?: boolean;
}

export function FormFields({ columns, values, onChange, disabled = false }: FormFieldsProps) {
  const getValue = (columnId: string): string => {
    const foundValue = values.find(v => v.column_id === columnId || v.columnId === columnId);
    return foundValue ? foundValue.value : '';
  };
  
  const getError = (columnId: string): string | undefined => {
    const foundValue = values.find(v => v.column_id === columnId || v.columnId === columnId);
    return foundValue?.error;
  };
  
  const renderField = (column: Column) => {
    const value = getValue(column.id);
    const error = getError(column.id);
    
    switch (column.type) {
      case 'text':
        return (
          <div className="space-y-2" key={column.id}>
            <Label htmlFor={column.id} className="flex items-center">
              {column.name}
              {column.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={column.id}
              name={column.id}
              placeholder={column.placeholder}
              value={value || ''}
              onChange={(e) => onChange(column.id, e.target.value)}
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2" key={column.id}>
            <Label htmlFor={column.id} className="flex items-center">
              {column.name}
              {column.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={column.id}
              name={column.id}
              type="number"
              placeholder={column.placeholder}
              value={value || ''}
              onChange={(e) => onChange(column.id, e.target.value)}
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          </div>
        );
      
      case 'textarea':
        return (
          <div className="space-y-2" key={column.id}>
            <Label htmlFor={column.id} className="flex items-center">
              {column.name}
              {column.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={column.id}
              name={column.id}
              placeholder={column.placeholder}
              value={value || ''}
              onChange={(e) => onChange(column.id, e.target.value)}
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-2" key={column.id}>
            <Label htmlFor={column.id} className="flex items-center">
              {column.name}
              {column.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => onChange(column.id, val)}
              disabled={disabled}
            >
              <SelectTrigger id={column.id} className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={column.placeholder || 'Seçin'} />
              </SelectTrigger>
              <SelectContent>
                {column.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2" key={column.id}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={column.id}
                checked={value === 'true'}
                onCheckedChange={(checked) => onChange(column.id, checked ? 'true' : 'false')}
                disabled={disabled}
              />
              <Label htmlFor={column.id} className="flex items-center">
                {column.name}
                {column.is_required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2" key={column.id}>
            <Label className="flex items-center">
              {column.name}
              {column.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => onChange(column.id, val)}
              className="flex flex-col space-y-1"
              disabled={disabled}
            >
              {column.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${column.id}-${option.value}`} />
                  <Label htmlFor={`${column.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          </div>
        );
      
      default:
        return (
          <div className="space-y-2" key={column.id}>
            <Label htmlFor={column.id} className="flex items-center">
              {column.name}
              {column.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={column.id}
              name={column.id}
              placeholder={column.placeholder}
              value={value || ''}
              onChange={(e) => onChange(column.id, e.target.value)}
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      {columns.map(renderField)}
    </div>
  );
}
