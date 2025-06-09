import React from 'react';
import { Column } from '@/types/column';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedFormFieldComponentProps {
  column: Column;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  className?: string;
}

export const EnhancedFormFieldComponent: React.FC<EnhancedFormFieldComponentProps> = ({
  column,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  error,
  className
}) => {
  // Debug logging for select options
  React.useEffect(() => {
    if (column.type === 'select') {
      console.group(`🔍 Select Field Debug: ${column.name}`);
      console.log('Column ID:', column.id);
      console.log('Column Type:', column.type);
      console.log('Raw Options:', column.options);
      console.log('Options Type:', typeof column.options);
      console.log('Options Array?:', Array.isArray(column.options));
      console.log('Options Length:', column.options?.length || 0);
      
      if (column.options && column.options.length > 0) {
        console.log('First Option:', column.options[0]);
        console.log('First Option Type:', typeof column.options[0]);
        console.log('Has value?:', 'value' in (column.options[0] || {}));
        console.log('Has label?:', 'label' in (column.options[0] || {}));
      }
      console.groupEnd();
    }
  }, [column]);

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
        // Enhanced debugging for select
        console.log(`🎯 Rendering select for ${column.name}:`, {
          options: column.options,
          optionsLength: column.options?.length,
          currentValue: value
        });

        if (!column.options || !Array.isArray(column.options) || column.options.length === 0) {
          console.warn(`⚠️ Select field "${column.name}" has no valid options:`, column.options);
          return (
            <div className="border border-amber-200 bg-amber-50 p-3 rounded-md">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Seçim seçənəkləri yüklənmir</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Bu sahə üçün seçim variantları mövcud deyil.
              </p>
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
                // Validate option structure
                if (!option || typeof option !== 'object') {
                  console.warn(`⚠️ Invalid option at index ${index}:`, option);
                  return null;
                }

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

      case 'radio':
        if (!column.options || !Array.isArray(column.options)) {
          return (
            <div className="text-sm text-muted-foreground">
              Radio seçənəkləri mövcud deyil
            </div>
          );
        }

        return (
          <div className="space-y-2">
            {column.options.map((option, index) => {
              const optionValue = option.value || option.id || String(option);
              const optionLabel = option.label || option.name || optionValue;
              
              return (
                <div key={optionValue} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${column.id}-${index}`}
                    name={column.id}
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={disabled}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <label htmlFor={`${column.id}-${index}`} className="text-sm">
                    {optionLabel}
                  </label>
                </div>
              );
            })}
          </div>
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
      {/* Enhanced Label with Help */}
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

      {/* Field */}
      {renderField()}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      
      {/* Debug Info in Development */}
      {process.env.NODE_ENV === 'development' && column.type === 'select' && (
        <details className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-1 text-xs">
            {JSON.stringify({
              columnId: column.id,
              columnType: column.type,
              optionsCount: column.options?.length || 0,
              options: column.options,
              currentValue: value
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default EnhancedFormFieldComponent;
