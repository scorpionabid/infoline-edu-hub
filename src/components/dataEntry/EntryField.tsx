
import React from 'react';
import { FormControl, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import DateInput from '@/components/ui/date-input';
import { Label } from '@/components/ui/label';
import { FileInput } from '@/components/ui/file-input';
import { Column } from '@/types/column';
import NumberInput from './inputs/NumberInput';
import SelectInput from './inputs/SelectInput';

interface EntryFieldProps {
  column: Column;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export const EntryField: React.FC<EntryFieldProps> = ({
  column,
  value,
  onChange,
  error,
  disabled = false
}) => {
  switch (column.type) {
    case 'text':
      return (
        <div className="space-y-2">
          {column.name && <FormLabel>{column.name}</FormLabel>}
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={disabled}
            className={error ? "border-red-500" : ""}
          />
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          {error && <FormMessage>{error}</FormMessage>}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          {column.name && <FormLabel>{column.name}</FormLabel>}
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={disabled}
            className={error ? "border-red-500" : ""}
          />
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          {error && <FormMessage>{error}</FormMessage>}
        </div>
      );

    case 'number':
      return (
        <NumberInput
          column={column}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      );

    case 'date':
      return (
        <div className="space-y-2">
          {column.name && <FormLabel>{column.name}</FormLabel>}
          <DateInput
            value={value || null}
            onChange={(date) => onChange(date)}
            disabled={disabled}
            className={error ? "border-red-500" : ""}
          />
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          {error && <FormMessage>{error}</FormMessage>}
        </div>
      );

    case 'select':
      return (
        <SelectInput
          column={column}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={column.id}
              checked={value === true}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            {column.name && <Label htmlFor={column.id}>{column.name}</Label>}
          </div>
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          {error && <FormMessage>{error}</FormMessage>}
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {column.name && <FormLabel>{column.name}</FormLabel>}
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled}
          >
            {column.options && Array.isArray(column.options) && column.options.map((option: any) => (
              <div className="flex items-center space-x-2" key={option.value}>
                <RadioGroupItem value={option.value} id={`${column.id}-${option.value}`} />
                <Label htmlFor={`${column.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          {error && <FormMessage>{error}</FormMessage>}
        </div>
      );

    case 'file':
      return (
        <div className="space-y-2">
          {column.name && <FormLabel>{column.name}</FormLabel>}
          <FileInput
            value={value}
            onChange={(file) => onChange(file)}
            disabled={disabled}
          />
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          {error && <FormMessage>{error}</FormMessage>}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          {column.name && <FormLabel>{column.name}</FormLabel>}
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={disabled}
            className={error ? "border-red-500" : ""}
          />
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          {error && <FormMessage>{error}</FormMessage>}
        </div>
      );
  }
};

export default EntryField;
