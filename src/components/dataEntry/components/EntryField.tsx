
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Column } from '@/types/column';
import { Label } from '@/components/ui/label';

export interface EntryFieldProps {
  key: string;
  column: Column;
  value: any;
  onChange: (value: any) => void;
  error: string;
  readOnly?: boolean;
}

export const EntryField: React.FC<EntryFieldProps> = ({ column, value, onChange, error, readOnly }) => {
  // Column tipinə görə fərqli input render edək
  switch (column.type) {
    case 'text':
    case 'email':
    case 'url':
    case 'phone':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name} {column.is_required && <span className="text-red-500">*</span>}</Label>
          <Input
            id={column.id}
            type={column.type === 'phone' ? 'tel' : column.type}
            placeholder={column.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className={error ? 'border-red-500' : ''}
          />
          {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name} {column.is_required && <span className="text-red-500">*</span>}</Label>
          <Textarea
            id={column.id}
            placeholder={column.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className={error ? 'border-red-500' : ''}
          />
          {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name} {column.is_required && <span className="text-red-500">*</span>}</Label>
          <Input
            id={column.id}
            type="number"
            placeholder={column.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            min={column.validation?.min}
            max={column.validation?.max}
            className={error ? 'border-red-500' : ''}
          />
          {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'date':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name} {column.is_required && <span className="text-red-500">*</span>}</Label>
          <Input
            id={column.id}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className={error ? 'border-red-500' : ''}
          />
          {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name} {column.is_required && <span className="text-red-500">*</span>}</Label>
          <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={readOnly}
          >
            <SelectTrigger id={column.id} className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={column.placeholder || "Seçin"} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'checkbox':
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={column.id}
              checked={value === true || value === 'true'}
              onCheckedChange={onChange}
              disabled={readOnly}
            />
            <Label htmlFor={column.id}>
              {column.name} {column.is_required && <span className="text-red-500">*</span>}
            </Label>
          </div>
          {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      );
      
    case 'radio':
      return (
        <div className="space-y-2">
          <Label>{column.name} {column.is_required && <span className="text-red-500">*</span>}</Label>
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
            disabled={readOnly}
          >
            {column.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${column.id}-${option.value}`} />
                <Label htmlFor={`${column.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      );
      
    // Digər tiplər üçün componentlər də əlavə edə bilərsiniz
    // file, image, time, datetime, richtext və s.
      
    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name} {column.is_required && <span className="text-red-500">*</span>}</Label>
          <Input
            id={column.id}
            type="text"
            placeholder={column.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className={error ? 'border-red-500' : ''}
          />
          {column.help_text && <p className="text-xs text-muted-foreground">{column.help_text}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      );
  }
};

export default EntryField;
