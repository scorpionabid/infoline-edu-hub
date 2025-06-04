
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Column } from '@/types/column';

interface DynamicFormProps {
  columns: Column[];
  values: Record<string, any>;
  onChange: (columnId: string, value: any) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  title?: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  columns,
  values,
  onChange,
  onSubmit,
  isSubmitting = false,
  title = 'Məlumat Daxil Etmə'
}) => {
  const renderField = (column: Column) => {
    const value = values[column.id] || '';
    
    switch (column.type) {
      case 'text':
        return (
          <Input
            id={column.id}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            required={column.is_required}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            id={column.id}
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            required={column.is_required}
          />
        );
      
      case 'number':
        return (
          <Input
            id={column.id}
            type="number"
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            required={column.is_required}
          />
        );
      
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => onChange(column.id, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={column.placeholder || 'Seçin'} />
            </SelectTrigger>
            <SelectContent>
              {column.options && Array.isArray(column.options) && column.options.map((option: any) => (
                <SelectItem key={option.value || option} value={option.value || option}>
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
            value={value}
            onChange={(e) => onChange(column.id, e.target.value)}
            placeholder={column.placeholder || ''}
            required={column.is_required}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {columns.map((column) => (
          <div key={column.id} className="space-y-2">
            <Label htmlFor={column.id} className="text-sm font-medium">
              {column.name}
              {column.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderField(column)}
            {column.help_text && (
              <p className="text-sm text-muted-foreground">{column.help_text}</p>
            )}
          </div>
        ))}
        <div className="pt-4">
          <Button 
            onClick={onSubmit} 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Saxlanılır...' : 'Saxla'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicForm;
