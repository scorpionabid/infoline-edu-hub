
import React from 'react';
import { CategoryWithColumns, EntryValue } from '@/types/dataEntry';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormFieldsProps {
  category: CategoryWithColumns;
  entries: EntryValue[];
  onChange: (columnId: string, value: string | number | boolean | null) => void;
  disabled?: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({
  category,
  entries,
  onChange,
  disabled = false
}) => {
  const { t } = useLanguage();
  
  // Sütuna aid giriş məlumatını tapan funksiya
  const getEntryValue = (columnId: string) => {
    const entry = entries.find(e => e.columnId === columnId);
    return entry ? entry.value : null;
  };

  // Sütun tipinə uyğun giriş komponenti yaradan funksiya
  const renderField = (column: any) => {
    const value = getEntryValue(column.id);
    
    switch (column.type) {
      case 'text':
        return (
          <Input
            id={column.id}
            placeholder={column.placeholder || ''}
            value={value as string || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            disabled={disabled}
            required={column.is_required}
          />
        );
      
      case 'number':
        return (
          <Input
            id={column.id}
            type="number"
            placeholder={column.placeholder || ''}
            value={value as string || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            disabled={disabled}
            required={column.is_required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            id={column.id}
            placeholder={column.placeholder || ''}
            value={value as string || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            disabled={disabled}
            required={column.is_required}
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={column.id}
              checked={!!value}
              onCheckedChange={(checked) => onChange(column.id, !!checked)}
              disabled={disabled}
            />
            <Label htmlFor={column.id}>{column.name}</Label>
          </div>
        );
      
      case 'select':
        const options = column.options || [];
        return (
          <Select
            value={value as string || ''}
            onValueChange={(newValue) => onChange(column.id, newValue)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={column.placeholder || t('select')} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any, index: number) => (
                <SelectItem 
                  key={`${option.value || option}-${index}`} 
                  value={option.value || option}
                >
                  {option.label || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            id={column.id}
            placeholder={column.placeholder || ''}
            value={value as string || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            disabled={disabled}
            required={column.is_required}
          />
        );
    }
  };

  return (
    <div className="space-y-8">
      {category.columns.map((column) => (
        <div key={column.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={column.id} className="font-medium">
              {column.name} {column.is_required && <span className="text-red-500">*</span>}
            </Label>
          </div>
          
          {column.help_text && (
            <p className="text-sm text-muted-foreground mb-2">{column.help_text}</p>
          )}
          
          {renderField(column)}
        </div>
      ))}
    </div>
  );
};

export default FormFields;
