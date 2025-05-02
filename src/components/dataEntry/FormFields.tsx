
import React from 'react';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Column } from '@/types/column';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EntryValue {
  column_id?: string;
  columnId?: string;
  value: string;
  name?: string;
  isValid?: boolean;
  error?: string;
}

interface FormFieldsProps {
  columns: Column[];
  values: EntryValue[];
  onChange: (columnId: string, value: string) => void;
  disabled?: boolean;
}

export function FormFields({ columns, values, onChange, disabled = false }: FormFieldsProps) {
  // Verilən sütun ID-si üçün dəyəri tapmaq
  const getValue = (columnId: string): string => {
    const entry = values.find(v => (v.columnId || v.column_id) === columnId);
    return entry?.value || '';
  };
  
  // Sütun tipinə görə uyğun input elementini render etmək
  const renderFieldByType = (column: Column) => {
    const value = getValue(column.id);
    const error = values.find(v => (v.columnId || v.column_id) === column.id)?.error;
    
    switch (column.type) {
      case 'text':
        return (
          <FormItem key={column.id}>
            <FormLabel>
              {column.name}
              {column.is_required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <Input 
                placeholder={column.placeholder || ''}
                value={value}
                onChange={(e) => onChange(column.id, e.target.value)}
                disabled={disabled}
              />
            </FormControl>
            {column.help_text && (
              <FormDescription>{column.help_text}</FormDescription>
            )}
            {error && <FormMessage>{error}</FormMessage>}
          </FormItem>
        );
        
      case 'textarea':
        return (
          <FormItem key={column.id}>
            <FormLabel>
              {column.name}
              {column.is_required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder={column.placeholder || ''}
                value={value}
                onChange={(e) => onChange(column.id, e.target.value)}
                disabled={disabled}
                rows={4}
              />
            </FormControl>
            {column.help_text && (
              <FormDescription>{column.help_text}</FormDescription>
            )}
            {error && <FormMessage>{error}</FormMessage>}
          </FormItem>
        );
        
      case 'number':
        return (
          <FormItem key={column.id}>
            <FormLabel>
              {column.name}
              {column.is_required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <Input 
                type="number"
                placeholder={column.placeholder || ''}
                value={value}
                onChange={(e) => onChange(column.id, e.target.value)}
                disabled={disabled}
              />
            </FormControl>
            {column.help_text && (
              <FormDescription>{column.help_text}</FormDescription>
            )}
            {error && <FormMessage>{error}</FormMessage>}
          </FormItem>
        );
        
      case 'date':
        return (
          <FormItem key={column.id}>
            <FormLabel>
              {column.name}
              {column.is_required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !value && "text-muted-foreground"
                    )}
                    disabled={disabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(new Date(value), "PP") : <span>Tarix seçin</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value ? new Date(value) : undefined}
                    onSelect={(date) => date && onChange(column.id, date.toISOString())}
                    initialFocus
                    disabled={disabled}
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
            {column.help_text && (
              <FormDescription>{column.help_text}</FormDescription>
            )}
            {error && <FormMessage>{error}</FormMessage>}
          </FormItem>
        );
        
      case 'select':
        return (
          <FormItem key={column.id}>
            <FormLabel>
              {column.name}
              {column.is_required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <Select
              value={value}
              onValueChange={(val) => onChange(column.id, val)}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={column.placeholder || 'Seçin'} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {column.options?.map((option: any, index: number) => (
                  <SelectItem 
                    key={index} 
                    value={typeof option === 'string' ? option : option.value || ''}
                  >
                    {typeof option === 'string' ? option : option.label || option.value}
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
        
      case 'checkbox':
        return (
          <FormItem key={column.id} className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={value === 'true'}
                onCheckedChange={(checked) => {
                  onChange(column.id, checked ? 'true' : 'false');
                }}
                disabled={disabled}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                {column.name}
                {column.is_required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {column.help_text && (
                <FormDescription>{column.help_text}</FormDescription>
              )}
            </div>
            {error && <FormMessage>{error}</FormMessage>}
          </FormItem>
        );
        
      // Standart tip halı - text input istifadə edirik
      default:
        return (
          <FormItem key={column.id}>
            <FormLabel>
              {column.name}
              {column.is_required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <Input 
                placeholder={column.placeholder || ''}
                value={value}
                onChange={(e) => onChange(column.id, e.target.value)}
                disabled={disabled}
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

  return (
    <div className="space-y-6">
      {columns.map(column => renderFieldByType(column))}
    </div>
  );
}

export default FormFields;
