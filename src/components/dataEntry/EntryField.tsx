
import React from 'react';
import { Column } from '@/types/column';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

export interface EntryFieldProps {
  key: string;
  column: Column;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  readOnly?: boolean;
}

const EntryField: React.FC<EntryFieldProps> = ({ column, value, onChange, error, readOnly = false }) => {
  // Options dəyərini təhlükəsiz şəkildə işləmək üçün funksiya
  const parseOptions = (options: any) => {
    if (!options) return [];
    
    if (Array.isArray(options)) {
      return options;
    }
    
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Options parse error:', e);
        return [];
      }
    }
    
    if (typeof options === 'object' && options !== null) {
      return Object.entries(options).map(([value, label]) => ({
        value,
        label: label as string
      }));
    }
    
    return [];
  };
  
  const renderField = () => {
    const commonProps = {
      id: column.id,
      disabled: readOnly,
      'aria-invalid': error ? true : false,
      className: cn(error && "border-red-500 focus:ring-red-300")
    };
    
    switch (column.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || ''}
            {...commonProps}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || ''}
            {...commonProps}
          />
        );
        
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || ''}
            {...commonProps}
          />
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={column.id}
              checked={value === 'true' || value === true}
              onCheckedChange={(checked) => {
                onChange(checked);
              }}
              disabled={readOnly}
            />
            <Label htmlFor={column.id} className="text-sm">
              {column.name}
            </Label>
          </div>
        );
        
      case 'select':
        const options = parseOptions(column.options);
        
        return (
          <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={readOnly}
          >
            <SelectTrigger className={cn(error && "border-red-500 focus:ring-red-300")}>
              <SelectValue placeholder={column.placeholder || `Seçin...`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => {
                const optionValue = typeof option === 'object' 
                  ? (option.value || `option-${index}`)
                  : (option || `option-${index}`);
                  
                // Ensure optionValue is never an empty string
                const safeOptionValue = optionValue === '' ? `option-${index}` : optionValue;
                  
                const optionLabel = typeof option === 'object' 
                  ? (option.label || optionValue) 
                  : option;
                  
                return (
                  <SelectItem key={index} value={safeOptionValue}>
                    {optionLabel || safeOptionValue}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
        
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors",
                  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  error && "border-red-500 focus:ring-red-300",
                )}
                disabled={readOnly}
                type="button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PP') : <span className="text-muted-foreground">{column.placeholder || 'Tarix seçin'}</span>}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date ? date.toISOString() : null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
        
      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder || ''}
            {...commonProps}
          />
        );
    }
  };
  
  return (
    <div className="space-y-1">
      <Label htmlFor={column.id}>{column.name}{column.is_required && <span className="text-red-500 ml-1">*</span>}</Label>
      {renderField()}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {column.help_text && !error && (
        <p className="text-xs text-muted-foreground">{column.help_text}</p>
      )}
    </div>
  );
};

export default EntryField;
