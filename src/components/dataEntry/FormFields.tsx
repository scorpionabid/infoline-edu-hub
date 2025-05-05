
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EntryValue } from '@/types/dataEntry';
import { Column, ColumnType } from '@/types/column';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface FormFieldsProps {
  columns: Column[];
  values: EntryValue[];
  onChange: (columnId: string, value: string) => void;
  disabled?: boolean;
}

export interface ColumnOption {
  label: string;
  value: string;
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
    return entry?.error;
  };

  const parseOptions = (options: any): ColumnOption[] => {
    if (!options) return [];
    
    if (typeof options === 'string') {
      try {
        return JSON.parse(options);
      } catch (e) {
        console.error('Options parse error:', e);
        return [];
      }
    }
    
    if (Array.isArray(options)) {
      return options.map(opt => {
        if (typeof opt === 'string') {
          return { label: opt, value: opt };
        }
        return opt;
      });
    }
    
    return [];
  };

  return (
    <div className="space-y-6">
      {columns.map(column => {
        const value = getValue(column.id);
        const error = getError(column.id);
        
        return (
          <div key={column.id} className="space-y-2">
            <Label 
              htmlFor={column.id} 
              className={`text-sm font-medium ${disabled ? 'text-muted-foreground' : ''}`}
            >
              {column.name}
              {column.is_required && <span className="text-destructive ml-1">*</span>}
            </Label>
            
            {column.type === 'text' && (
              <Input
                id={column.id}
                value={value}
                onChange={(e) => onChange(column.id, e.target.value)}
                placeholder={column.placeholder || ''}
                disabled={disabled}
                className={error ? 'border-destructive' : ''}
              />
            )}
            
            {column.type === 'textarea' && (
              <Textarea
                id={column.id}
                value={value}
                onChange={(e) => onChange(column.id, e.target.value)}
                placeholder={column.placeholder || ''}
                disabled={disabled}
                className={error ? 'border-destructive' : ''}
                rows={5}
              />
            )}
            
            {column.type === 'number' && (
              <Input
                id={column.id}
                type="number"
                value={value}
                onChange={(e) => onChange(column.id, e.target.value)}
                placeholder={column.placeholder || ''}
                disabled={disabled}
                className={error ? 'border-destructive' : ''}
              />
            )}
            
            {column.type === 'select' && (
              <Select
                value={value}
                onValueChange={(value) => onChange(column.id, value)}
                disabled={disabled}
              >
                <SelectTrigger className={error ? 'border-destructive' : ''}>
                  <SelectValue placeholder={column.placeholder || 'Seçin...'} />
                </SelectTrigger>
                <SelectContent>
                  {parseOptions(column.options).map((option, i) => (
                    <SelectItem key={i} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {column.type === 'date' && (
              <Input
                id={column.id}
                type="date"
                value={value}
                onChange={(e) => onChange(column.id, e.target.value)}
                disabled={disabled}
                className={error ? 'border-destructive' : ''}
              />
            )}
            
            {column.type === 'checkbox' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={column.id}
                  checked={value === 'true'}
                  onCheckedChange={(checked) => onChange(column.id, checked ? 'true' : 'false')}
                  disabled={disabled}
                />
                <Label htmlFor={column.id} className="text-sm">
                  {column.placeholder || column.name}
                </Label>
              </div>
            )}
            
            {column.type === 'radio' && column.options && (
              <RadioGroup
                value={value}
                onValueChange={(value) => onChange(column.id, value)}
                disabled={disabled}
              >
                <div className="flex flex-col space-y-1">
                  {parseOptions(column.options).map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${column.id}-${i}`} />
                      <Label htmlFor={`${column.id}-${i}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
            
            {error && <p className="text-xs text-destructive">{error}</p>}
            
            {column.help_text && (
              <p className="text-xs text-muted-foreground">{column.help_text}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FormFields;
