import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnType } from '@/types/column';

// Debug logger function
const useDebugLogger = (debugMode: boolean) => {
  return useCallback(
    (
      message: string,
      data?: Record<string, unknown>,
      groupName?: string,
      isGroupEnd = false
    ) => {
      if (!debugMode) return;

      if (groupName && !isGroupEnd) {
        console.group(groupName);
      }

      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }

      if (groupName && isGroupEnd) {
        console.groupEnd();
      }
    },
    [debugMode]
  );
};

// Safe error handling wrapper
const withErrorHandling = <T extends unknown>(
  fn: (...args: any[]) => T,
  errorHandler: (error: Error) => void
) => {
  return (...args: Parameters<typeof fn>): ReturnType<typeof fn> | undefined => {
    try {
      return fn(...args);
    } catch (error) {
      errorHandler(error instanceof Error ? error : new Error(String(error)));
      return undefined;
    }
  };
};

// Format and validate options
type Option = { label: string; value: string } | string;

const formatOptions = (options: any[] | undefined): { label: string; value: string }[] => {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return [];
  }

  return options.map((option, index) => {
    if (typeof option === 'object' && option !== null) {
      return {
        value: String(option.value || `option-${index}`),
        label: String(option.label || option.value || option || `Option ${index + 1}`)
      };
    }
    return {
      value: String(option || `option-${index}`),
      label: String(option || `Option ${index + 1}`)
    };
  });
};

// Daha yaxşı tip təhlükəsizliyi ilə interface
interface FieldRendererSimpleProps {
  type: ColumnType;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  options?: Array<{ label?: string; value?: string } | string>;
  placeholder?: string;
  name?: string;
  id?: string;
}

// TypeScript ilə forwardRef tipini düzgün müəyyən edirik
type FieldRendererRef = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const FieldRendererSimple = React.forwardRef<FieldRendererRef, FieldRendererSimpleProps>((
  {
    type,
    value,
    onChange,
    onBlur,
    disabled = false,
    required = false,
    readOnly = false,
    options = [],
    placeholder = '',
    name,
    id
  }, 
  ref
) => {
  // Optimallaşdırılmış state idarəsi
  const [localValue, setLocalValue] = useState(value || '');
  
  // Debug loqları üçün çıxarılmış funksiya
  const debugMode = process.env.NODE_ENV === 'development';
  const logDebug = useDebugLogger(debugMode);

  // Props dəyişdikdə lokal state-i yenilə
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value || '');
    }
  }, [value, localValue]);
  
  // Effektiv parametrlər
  const effectiveDisabled = disabled;
  const effectiveReadOnly = readOnly;
  
  // Komponent yükləndikdə debug loqları
  useEffect(() => {
    logDebug(
      'Field properties', 
      {
        type,
        value,
        disabled,
        readOnly,
        name,
        id,
        effectiveState: effectiveDisabled ? 'DISABLED' : effectiveReadOnly ? 'READONLY' : 'EDITABLE'
      }, 
      `FieldRendererSimple - ${type} field debugging`
    );
    
    return () => {
      logDebug('', {}, `FieldRendererSimple - ${type} field debugging`, true);
    };
  }, [type, value, disabled, readOnly, name, id, effectiveDisabled, effectiveReadOnly, logDebug]);

  // Mərkəzləşdirilmiş hadisə emalı funksiyaları
  const handleValueChange = useCallback(
    (newValue: string, source: string) => {
      // Xəta emalı wrapper-i ilə bütün dəyişiklikləri təhlükəsiz emal edirik
      withErrorHandling(
        () => {
          // Lokal state-i yenilə
          setLocalValue(newValue);
          // Parent komponentə dəyişiklik haqqında xəbər veririk
          onChange(newValue);
          
          // Debug loq
          logDebug(
            `Value changed from ${source}`, 
            {
              newValue,
              previousValue: localValue,
              fieldType: type,
              fieldName: name
            },
            'Value Change Event'
          );
        },
        (error) => {
          logDebug(
            'Error handling value change', 
            { error: error.message, source, newValue },
            'Error Event'
          );
        }
      )();
    },
    [localValue, onChange, type, name, logDebug]
  );
  
  // Konkret hadisə idarəediciləri
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleValueChange(e.target.value, 'input');
    },
    [handleValueChange]
  );

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleValueChange(e.target.value, 'textarea');
    },
    [handleValueChange]
  );

  const handleSelectChange = useCallback(
    (selectValue: string) => {
      handleValueChange(selectValue, 'select');
    },
    [handleValueChange]
  );

  const handleCheckboxChange = useCallback(
    (checked: boolean) => {
      const newValue = checked ? 'true' : 'false';
      handleValueChange(newValue, 'checkbox');
    },
    [handleValueChange]
  );

  // Options massivini təhlükəsiz şəkildə işləmək üçün
  const safeOptions = useMemo(() => {
    // formatOptions utility funksiyadan istifadə edirik
    const formattedOptions = formatOptions(options);
    
    // Debug loqları
    if (formattedOptions.length === 0) {
      logDebug('Options array is empty or invalid', { rawOptions: options });
    } else {
      logDebug('Options processed successfully', { 
        count: formattedOptions.length,
        sample: formattedOptions.slice(0, 2)
      });
    }
    
    return formattedOptions;
  }, [options, logDebug]);
  
  // Basic input props for all field types
  const baseFieldProps = {
    value: localValue,
    onBlur,
    disabled: effectiveDisabled,
    readOnly: effectiveReadOnly,
    required,
    placeholder,
    name,
    id,
    'data-testid': `field-${id || name}`
  };

  // Text input renderers
  const renderTextInput = (inputType: string = 'text') => {
    return (
      <Input
        ref={ref as React.Ref<HTMLInputElement>}
        type={inputType}
        onChange={handleInputChange}
        {...baseFieldProps}
      />
    );
  };
  
  const renderTextarea = () => {
    return (
      <Textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        onChange={handleTextareaChange}
        {...baseFieldProps}
      />
    );
  };
  
  // Select, radio, checkbox renderers
  const renderSelect = () => {
    return (
      <Select 
        value={localValue} 
        onValueChange={handleSelectChange}
        disabled={effectiveDisabled}
        onOpenChange={(open) => {
          open && logDebug('Select opened', { options: safeOptions });
        }}
      >
        <SelectTrigger id={id} data-testid={`field-${id || name}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {debugMode && (
            <div className="p-1 text-xs text-muted-foreground">
              Options: {safeOptions.length || 0}
            </div>
          )}
          
          {safeOptions.length > 0 ? (
            safeOptions.map((option, index) => (
              <SelectItem 
                key={`${index}-${option.value}`} 
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-center text-sm text-muted-foreground">
              {debugMode ? 'No options available (debug)' : 'No options available'}
            </div>
          )}
        </SelectContent>
      </Select>
    );
  };
  
  const renderRadio = () => {
    return (
      <div className="space-y-2">
        {debugMode && (
          <div className="text-xs text-muted-foreground mb-2">
            Options: {safeOptions.length || 0}
          </div>
        )}
        
        {safeOptions.length > 0 ? (
          safeOptions.map((option, index) => (
            <div key={`radio-${index}-${option.value}`} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${id || name}-${option.value}`}
                value={option.value}
                checked={localValue === option.value}
                onChange={() => handleSelectChange(option.value)}
                disabled={effectiveDisabled}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <label 
                htmlFor={`${id || name}-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No options available</div>
        )}
      </div>
    );
  };
  
  const renderCheckbox = () => {
    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={localValue === 'true'}
          onCheckedChange={handleCheckboxChange}
          disabled={effectiveDisabled}
          name={name}
          data-testid={`field-${id || name}`}
        />
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {placeholder}
        </label>
      </div>
    );
  };
  
  // File input renderer
  const renderImageUpload = () => {
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          handleValueChange(result, 'image-upload');
        };
        reader.readAsDataURL(file);
      }
    };
    
    return (
      <div className="space-y-2">
        <Input
          ref={ref as React.Ref<HTMLInputElement>}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={effectiveDisabled}
          required={required}
          name={name}
          id={id}
          data-testid={`field-${id || name}`}
        />
        {localValue && localValue.startsWith('data:image') && (
          <div className="mt-2">
            <img 
              src={localValue} 
              alt="Preview" 
              className="max-h-40 max-w-full object-contain border rounded"
            />
          </div>
        )}
      </div>
    );
  };
  
  // Tipə görə rendering - indi daha qısa və oxunaqlıdır
  switch (type) {
    case 'text':
      return renderTextInput('text');
      
    case 'textarea':
      return renderTextarea();
      
    case 'number':
      return renderTextInput('number');
      
    case 'email':
      return renderTextInput('email');
      
    case 'date':
      return renderTextInput('date');
      
    case 'select':
      return renderSelect();
      
    case 'radio':
      return renderRadio();
      
    case 'checkbox':
      return renderCheckbox();
      
    case 'image':
      return renderImageUpload();
      
    default:
      return renderTextInput('text');
  }
});

FieldRendererSimple.displayName = "FieldRendererSimple";

export default FieldRendererSimple;
