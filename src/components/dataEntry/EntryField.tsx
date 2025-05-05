
import React from 'react';
import { Column } from '@/types/column';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NumberInput } from '@/components/dataEntry/inputs/NumberInput';
import { DateInput } from '@/components/ui/date-input';
import { SelectInput } from '@/components/dataEntry/inputs/SelectInput';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileInput } from '@/components/ui/file-input';

export interface EntryFieldProps {
  column: Column;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  readOnly?: boolean;
}

const EntryField: React.FC<EntryFieldProps> = ({
  column,
  value,
  onChange,
  error,
  readOnly = false
}) => {
  // Tip dəyərinə əsasən uyğun komponenti render et
  switch (column.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name}{column.is_required && <span className="text-red-500">*</span>}</Label>
          <Input
            id={column.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={readOnly}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
    
    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name}{column.is_required && <span className="text-red-500">*</span>}</Label>
          <Textarea
            id={column.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={readOnly}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
    
    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name}{column.is_required && <span className="text-red-500">*</span>}</Label>
          <NumberInput
            column={column}
            value={value || ''}
            onChange={onChange}
            error={error}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
    
    case 'date':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name}{column.is_required && <span className="text-red-500">*</span>}</Label>
          <DateInput
            value={value ? new Date(value) : undefined}
            onChange={(date) => onChange(date?.toISOString() || '')}
            disabled={readOnly}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
    
    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name}{column.is_required && <span className="text-red-500">*</span>}</Label>
          <SelectInput
            column={column}
            value={value || ''}
            onChange={onChange}
            error={error}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
    
    case 'checkbox':
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={column.id}
              checked={value === 'true' || value === true}
              onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
              disabled={readOnly}
            />
            <Label htmlFor={column.id}>{column.name}{column.is_required && <span className="text-red-500">*</span>}</Label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );

    case 'radio':
      const radioOptions = typeof column.options === 'string' 
        ? JSON.parse(column.options) 
        : column.options || [];
        
      return (
        <div className="space-y-2">
          <Label>{column.name}{column.is_required && <span className="text-red-500">*</span>}</Label>
          <RadioGroup 
            value={value || ''} 
            onValueChange={onChange}
            disabled={readOnly}
          >
            {radioOptions.map((option: any) => (
              <div className="flex items-center space-x-2" key={option.value}>
                <RadioGroupItem value={option.value} id={`${column.id}-${option.value}`} />
                <Label htmlFor={`${column.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
    
    case 'file':
    case 'image':
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name}{column.is_required && <span className="text-red-500">*</span>}</Label>
          <FileInput 
            id={column.id}
            disabled={readOnly}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange(file.name);
              }
            }}
          />
          {value && <p className="text-sm text-muted-foreground">{value}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
    
    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={column.id}>{column.name}{column.is_required && <span className="text-red-500">*</span>}</Label>
          <Input
            id={column.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={readOnly}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
  }
};

export default EntryField;
