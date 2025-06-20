import React, { useMemo } from 'react';
import { CategoryWithColumns } from '@/types/category';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataEntryFormProps {
  category: CategoryWithColumns;
  schoolId: string;
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  onFieldChange: (columnId: string, value: any) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  showValidation?: boolean;
  compactMode?: boolean;
}

interface FieldValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Simple date formatter without date-fns dependency
const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('az-AZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const DataEntryForm: React.FC<DataEntryFormProps> = ({
  category,
  schoolId,
  formData,
  onFormDataChange,
  onFieldChange,
  readOnly = false,
  isLoading = false,
  showValidation = true,
  compactMode = false
}) => {
  
  // Validation logic
  const validateField = (column: any, value: any): FieldValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (column.is_required && (!value || String(value).trim() === '')) {
      errors.push('Bu sahə məcburidir');
    }

    // Type-specific validation
    if (value && String(value).trim() !== '') {
      switch (column.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push('Rəqəm daxil edin');
          } else {
            const numValue = Number(value);
            if (column.validation?.min !== undefined && numValue < column.validation.min) {
              errors.push(`Minimum dəyər: ${column.validation.min}`);
            }
            if (column.validation?.max !== undefined && numValue > column.validation.max) {
              errors.push(`Maksimum dəyər: ${column.validation.max}`);
            }
          }
          break;
        
        case 'text':
          if (column.validation?.minLength && String(value).length < column.validation.minLength) {
            errors.push(`Minimum ${column.validation.minLength} simvol tələb olunur`);
          }
          if (column.validation?.maxLength && String(value).length > column.validation.maxLength) {
            errors.push(`Maksimum ${column.validation.maxLength} simvol icazə verilir`);
          }
          if (column.validation?.pattern) {
            const regex = new RegExp(column.validation.pattern);
            if (!regex.test(String(value))) {
              errors.push('Format düzgün deyil');
            }
          }
          break;
        
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            errors.push('E-poçt formatı düzgün deyil');
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Field validation results
  const fieldValidations = useMemo(() => {
    const validations: Record<string, FieldValidationResult> = {};
    category.columns.forEach(column => {
      const value = formData[column.id];
      validations[column.id] = validateField(column, value);
    });
    return validations;
  }, [category.columns, formData]);

  const handleFieldChange = (columnId: string, value: any) => {
    onFieldChange(columnId, value);
  };

  const renderFieldValidation = (columnId: string) => {
    if (!showValidation) return null;
    
    const validation = fieldValidations[columnId];
    if (!validation) return null;

    if (validation.errors.length > 0) {
      return (
        <div className="mt-1 space-y-1">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      );
    }

    if (validation.warnings.length > 0) {
      return (
        <div className="mt-1 space-y-1">
          {validation.warnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-1 text-sm text-yellow-600">
              <HelpCircle className="h-3 w-3" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      );
    }

    // Show success indicator for valid required fields
    const column = category.columns.find(col => col.id === columnId);
    if (column?.is_required && formData[columnId] && String(formData[columnId]).trim() !== '') {
      return (
        <div className="mt-1">
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            <span>Düzgün</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderField = (column: any) => {
    const value = formData[column.id] || '';
    const validation = fieldValidations[column.id];
    const hasError = validation && validation.errors.length > 0;
    const isValidRequired = column.is_required && value && String(value).trim() !== '' && validation?.isValid;

    const fieldProps = {
      disabled: readOnly || isLoading,
      className: cn(
        "transition-all",
        hasError && "border-red-500 focus:border-red-500",
        isValidRequired && "border-green-500",
        compactMode && "h-8 text-sm"
      )
    };

    switch (column.type) {
      case 'text':
      case 'email':
        return (
          <Input
            id={column.id}
            type={column.type === 'email' ? 'email' : 'text'}
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            required={column.is_required}
            {...fieldProps}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={column.id}
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            required={column.is_required}
            rows={compactMode ? 2 : 3}
            {...fieldProps}
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
            required={column.is_required}
            min={column.validation?.min}
            max={column.validation?.max}
            step={column.validation?.step || "any"}
            {...fieldProps}
          />
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  fieldProps.className
                )}
                disabled={fieldProps.disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? formatDate(value) : column.placeholder || "Tarix seçin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleFieldChange(column.id, date?.toISOString().split('T')[0])}
                disabled={fieldProps.disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
        
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(column.id, val)}
            disabled={fieldProps.disabled}
          >
            <SelectTrigger className={fieldProps.className}>
              <SelectValue placeholder={column.placeholder || "Seçin"} />
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

      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleFieldChange(column.id, val)}
            disabled={fieldProps.disabled}
            className="space-y-2"
          >
            {column.options?.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${column.id}-${option.value}`} />
                <Label 
                  htmlFor={`${column.id}-${option.value}`}
                  className={cn("text-sm", compactMode && "text-xs")}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === 'true' || value === true}
              onCheckedChange={(checked) => handleFieldChange(column.id, checked)}
              disabled={fieldProps.disabled}
              id={column.id}
            />
            <Label 
              htmlFor={column.id} 
              className={cn("text-sm", compactMode && "text-xs")}
            >
              {column.placeholder || "Təstiq edin"}
            </Label>
          </div>
        );

      case 'file':
        return (
          <Input
            type="file"
            id={column.id}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFieldChange(column.id, file.name);
              }
            }}
            accept={column.validation?.acceptedTypes || "*/*"}
            disabled={fieldProps.disabled}
            {...fieldProps}
          />
        );
        
      default:
        return (
          <Input
            id={column.id}
            value={value}
            onChange={(e) => handleFieldChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            required={column.is_required}
            {...fieldProps}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-6", compactMode && "space-y-4")}>
      {category.columns.map((column) => (
        <div key={column.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <Label 
              htmlFor={column.id} 
              className={cn(
                "text-sm font-medium",
                compactMode && "text-xs"
              )}
            >
              {column.name}
              {column.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {/* Field status indicator */}
            {showValidation && (
              <div className="flex items-center gap-1">
                {fieldValidations[column.id]?.isValid && formData[column.id] && (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                )}
                {fieldValidations[column.id]?.errors.length > 0 && (
                  <AlertCircle className="h-3 w-3 text-red-600" />
                )}
                {column.is_required && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    Məcburi
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Field input */}
          {renderField(column)}

          {/* Help text */}
          {column.help_text && (
            <p className={cn(
              "text-sm text-muted-foreground",
              compactMode && "text-xs"
            )}>
              {column.help_text}
            </p>
          )}

          {/* Validation feedback */}
          {renderFieldValidation(column.id)}
        </div>
      ))}

      {/* Form summary for compact mode */}
      {compactMode && (
        <div className="mt-6 p-3 bg-muted/50 rounded-lg">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Doldurulmuş: {Object.values(formData).filter(v => v && String(v).trim() !== '').length} / {category.columns.length}
            </span>
            <span>
              Məcburi: {category.columns.filter(col => col.is_required && formData[col.id] && String(formData[col.id]).trim() !== '').length} / {category.columns.filter(col => col.is_required).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataEntryForm;