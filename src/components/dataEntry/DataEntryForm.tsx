
import React from 'react';
import { CategoryWithColumns } from '@/types/category';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface DataEntryFormProps {
  category: CategoryWithColumns;
  schoolId: string;
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  onFieldChange: (columnId: string, value: any) => void;
  readOnly?: boolean;
  isLoading?: boolean;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({
  category,
  schoolId,
  formData,
  onFormDataChange,
  onFieldChange,
  readOnly = false,
  isLoading = false
}) => {
  const handleFieldChange = (columnId: string, value: any) => {
    onFieldChange(columnId, value);
  };

  const renderField = (column: any) => {
    const value = formData[column.id] || '';

    switch (column.type) {
      case 'text':
        return (
          <Input
            id={column.id}
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            disabled={readOnly || isLoading}
            required={column.is_required}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={column.id}
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            disabled={readOnly || isLoading}
            required={column.is_required}
          />
        );
        
      case 'number':
        return (
          <Input
            type="number"
            id={column.id}
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            disabled={readOnly || isLoading}
            required={column.is_required}
          />
        );
        
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(column.id, val)}
            disabled={readOnly || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={column.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <Checkbox
            checked={value === 'true' || value === true}
            onCheckedChange={(checked) => handleFieldChange(column.id, checked)}
            disabled={readOnly || isLoading}
          />
        );
        
      default:
        return (
          <Input
            id={column.id}
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            disabled={readOnly || isLoading}
            required={column.is_required}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {category.columns.map((column) => (
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
    </div>
  );
};

export default DataEntryForm;
