
import React from 'react';
import { Column } from '@/types/column';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldComponentProps {
  column: Column;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  className?: string;
}

const FormFieldComponent: React.FC<FormFieldComponentProps> = ({
  column,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  error,
  className
}) => {
  const handleChange = (newValue: any) => {
    if (!disabled && !readOnly) {
      onChange(newValue);
    }
  };

  const renderField = () => {
    const baseClasses = cn(
      "transition-colors",
      error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
    );

    switch (column.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={column.placeholder || `${column.name} daxil edin...`}
            disabled={disabled}
            readOnly={readOnly}
            className={baseClasses}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={column.placeholder || `${column.name} daxil edin...`}
            disabled={disabled}
            readOnly={readOnly}
            rows={4}
            className={baseClasses}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={column.placeholder || `${column.name} daxil edin...`}
            disabled={disabled}
            readOnly={readOnly}
            className={baseClasses}
          />
        );

      case 'select':
        if (!column.options || !Array.isArray(column.options) || column.options.length === 0) {
          return (
            <div className="border border-amber-200 bg-amber-50 p-3 rounded-md">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Seçim seçənəkləri yüklənmir</span>
              </div>
            </div>
          );
        }

        return (
          <Select
            value={value || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className={baseClasses}>
              <SelectValue placeholder={column.placeholder || 'Seçin...'} />
            </SelectTrigger>
            <SelectContent>
              {column.options.map((option, index) => {
                const optionValue = option.value || option.id || String(option);
                const optionLabel = option.label || option.name || optionValue;

                return (
                  <SelectItem key={optionValue} value={optionValue}>
                    {optionLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === true || value === 'true'}
              onCheckedChange={(checked) => handleChange(checked)}
              disabled={disabled}
            />
            <span className="text-sm">{column.placeholder || 'Bəli'}</span>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            readOnly={readOnly}
            className={baseClasses}
          />
        );

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={column.placeholder || `${column.name} daxil edin...`}
            disabled={disabled}
            readOnly={readOnly}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor={column.id} className="text-sm font-medium">
          {column.name}
          {column.is_required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {column.help_text && (
          <div className="group relative">
            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 max-w-64">
              {column.help_text}
            </div>
          </div>
        )}
      </div>

      {renderField()}

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormFieldComponent;
