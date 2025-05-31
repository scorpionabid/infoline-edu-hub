import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Column, ColumnOption } from '@/types/column';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Import our new BaseField component
import BaseField from './BaseField';

export interface EntryFieldProps {
  key?: string;
  column: Column;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  readOnly?: boolean;
  className?: string;
}

/**
 * EntryField - Unified form field component based on column type
 * 
 * Renders the appropriate field component based on the column type.
 * Uses BaseField for consistent layout and error handling.
 */
export const EntryField: React.FC<EntryFieldProps> = ({ 
  column, 
  value, 
  onChange, 
  error, 
  readOnly = false,
  className 
}) => {
  // Common props for BaseField
  const baseFieldProps = {
    id: column.id,
    name: column.name,
    label: column.name,
    required: column.is_required,
    // readOnly və disabled ayrı-ayrı parametrlərdir
    disabled: false, // Sahələr həmişə interaktiv olmalıdır
    readOnly: readOnly, // yalnız redaktə imkanı readOnly ilə məhdudlaşdırılır
    description: column.description || column.help_text,
    error,
    className
  };
  
  // Debug məlumatları əlavə edirik
  console.log(`[EntryField] Rendering field for ${column.name}:`, {
    columnType: column.type,
    value,
    readOnly,
    disabled: false
  });

  // Column tipinə görə fərqli input render edək
  switch (column.type) {
    case 'text':
    case 'email':
    case 'url':
    case 'phone':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Input
              id={column.id}
              name={column.id}
              type={column.type}
              placeholder={column.placeholder}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={readOnly}
              readOnly={readOnly}
              className={cn(
                error && 'border-destructive'
              )}
            />
          )}
        />
      );

    case 'textarea':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Textarea
              id={column.id}
              name={column.id}
              placeholder={column.placeholder}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={readOnly}
              readOnly={readOnly}
              className={cn(
                error && 'border-destructive',
                'min-h-[120px] resize-y'
              )}
            />
          )}
        />
      );
    
    case 'number':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Input
              id={column.id}
              name={column.id}
              type="number"
              placeholder={column.placeholder}
              value={value || ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange(val ? parseFloat(val) : null);
              }}
              disabled={readOnly}
              readOnly={readOnly}
              className={cn(
                error && 'border-destructive'
              )}
            />
          )}
        />
      );
    
    case 'select':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Select 
              disabled={readOnly}
              value={value || ''}
              onValueChange={onChange}
            >
              <SelectTrigger id={column.id} className={cn(error && 'border-destructive')}>
                <SelectValue placeholder={column.placeholder || 'Select option'} />
              </SelectTrigger>
              <SelectContent>
                {column.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      );

    case 'checkbox':
      // Checkbox has a different layout, handle separately
      return (
        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id={column.id}
            checked={!!value}
            onCheckedChange={onChange}
            disabled={readOnly}
          />
          <Label 
            htmlFor={column.id}
            className={cn(
              'text-sm font-medium',
              error && 'text-destructive'
            )}>
            {column.name}
          </Label>
          {error && <p className="text-xs text-destructive font-medium ml-2">{error}</p>}
        </div>
      );

    case 'radio':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <RadioGroup
              disabled={readOnly}
              value={value || ''}
              onValueChange={onChange}
              className={cn(
                error && 'border-destructive'
              )}
            >
              {column.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value={option.value} id={`${column.id}-${option.value}`} />
                  <Label htmlFor={`${column.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      );

    case 'date':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Input
              id={column.id}
              name={column.id}
              type="date"
              placeholder={column.placeholder}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={readOnly}
              readOnly={readOnly}
              className={cn(
                error && 'border-destructive'
              )}
            />
          )}
        />
      );

    case 'time':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Input
              id={column.id}
              name={column.id}
              type="time"
              placeholder={column.placeholder}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={readOnly}
              readOnly={readOnly}
              className={cn(
                error && 'border-destructive'
              )}
            />
          )}
        />
      );

    default:
      // Fallback to text input if type is not recognized
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Input
              id={column.id}
              name={column.id}
              type="text"
              placeholder={column.placeholder}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={readOnly}
              readOnly={readOnly}
              className={cn(
                error && 'border-destructive'
              )}
            />
          )}
        />
      );
  }
};

export default EntryField;
