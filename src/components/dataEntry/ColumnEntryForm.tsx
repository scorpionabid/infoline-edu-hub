
import React from 'react';
import { Column } from '@/types/column';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormItem, FormControl, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface ColumnEntryFormProps {
  column: Column;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const ColumnEntryForm: React.FC<ColumnEntryFormProps> = ({ 
  column, 
  value, 
  onChange,
  error
}) => {
  switch (column.type) {
    case 'checkbox':
      return (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={value === true || value === 'true'}
              onCheckedChange={(checked) => {
                onChange(checked);
              }}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{column.name}</FormLabel>
            {column.help_text && (
              <FormDescription>{column.help_text}</FormDescription>
            )}
          </div>
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      );
      
    case 'select':
      return (
        <FormItem>
          <FormLabel>{column.name}</FormLabel>
          <Select value={value || ''} onValueChange={onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={column.placeholder || 'Seçin...'} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {column.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      );
      
    default:
      return (
        <FormItem>
          <FormLabel>{column.name}</FormLabel>
          <FormControl>
            <Input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={column.placeholder}
            />
          </FormControl>
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      );
  }
};

export default ColumnEntryForm;
