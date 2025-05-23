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
            type={column.type}
            placeholder={column.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            readOnly={readOnly}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
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
            readOnly={readOnly}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
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
            readOnly={readOnly}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={column.id}
            checked={value === true || value === 'true'}
            onCheckedChange={(checked) => onChange(checked)}
            disabled={readOnly}
          />
          <Label htmlFor={column.id}>{column.name} {column.is_required && <span className="text-red-500">*</span>}</Label>
          {error && <p className="text-red-500 text-sm ml-2">{error}</p>}
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
            <SelectTrigger id={column.id}>
              <SelectValue placeholder={column.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-red-500 text-sm">{error}</p>}
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      );

    case 'date':
    case 'time':
    case 'datetime':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name} {column.is_required && <span className="text-red-500">*</span>}</Label>
          <Input
            id={column.id}
            type={column.type === 'datetime' ? 'datetime-local' : column.type}
            placeholder={column.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            readOnly={readOnly}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      );

    // Bilinməyən tip üçün default olaraq text input
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
            readOnly={readOnly}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      );
  }
};

export default EntryField;
