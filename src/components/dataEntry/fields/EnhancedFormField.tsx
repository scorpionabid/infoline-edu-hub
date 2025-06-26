import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Column } from '@/types/column';
import { ValidationError } from '@/hooks/dataEntry/common/useRealTimeValidation';

interface EnhancedFormFieldProps {
  id: string;
  name: string;
  value?: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  column?: Column;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: any[];
  readOnly?: boolean;
  disabled?: boolean;
  error?: ValidationError;
  warning?: ValidationError;
  isValidating?: boolean;
  showValidationIcons?: boolean;
  className?: string;
}

/**
 * Təkmilləşdirilmiş Form Field Komponenti
 * 
 * Bu komponent aşağıdakı funksiyaları təmin edir:
 * - Müxtəlif sahə tipləri (text, number, email, select, etc.)
 * - Real-time validation feedback
 * - Loading states for async validation
 * - Enhanced user experience
 * - Accessibility support
 */
const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  column,
  type = 'text',
  placeholder,
  required = false,
  options = [],
  readOnly = false,
  disabled = false,
  error,
  warning,
  isValidating = false,
  showValidationIcons = true,
  // className
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Get field properties from column or props
  const fieldType = column?.type || type;
  const fieldPlaceholder = column?.placeholder || placeholder;
  const fieldRequired = column?.is_required || required;
  const fieldOptions = column?.options || options;
  const helpText = column?.help_text;
  
  // Handle change events
  const handleChange = (newValue: any) => {
    if (!readOnly && !disabled) {
      onChange(newValue);
    }
  };
  
  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  
  // Handle blur events
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
  // Get validation status
  const getValidationStatus = () => {
    if (isValidating) return 'validating';
    if (error) return 'error';
    if (warning) return 'warning';
    if (value && String(value).trim() !== '') return 'success';
    return 'default';
  };
  
  // Get validation icon
  const getValidationIcon = () => {
    if (!showValidationIcons) return null;
    
    const status = getValidationStatus();
    const iconClass = "h-4 w-4";
    
    switch (status) {
      case 'validating': {
        return <Clock className={cn(iconClass, "animate-spin text-blue-500")} />;
      case 'error': {
        return <AlertCircle className={cn(iconClass, "text-red-500")} />;
      case 'warning': {
        return <AlertCircle className={cn(iconClass, "text-yellow-500")} />;
      case 'success': {
        return <CheckCircle2 className={cn(iconClass, "text-green-500")} />;
      default:
        return null;
    }
  };
  
  // Get field class names
  const getFieldClassName = () => {
    const baseClass = "w-full transition-all duration-200";
    const status = getValidationStatus();
    
    let statusClass = "";
    switch (status) {
      case 'error': {
        statusClass = "border-red-500 focus:border-red-500 focus:ring-red-500";
        break; }
      case 'warning': {
        statusClass = "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500";
        break; }
      case 'success': {
        statusClass = "border-green-500 focus:border-green-500 focus:ring-green-500";
        break; }
      case 'validating': {
        statusClass = "border-blue-500 focus:border-blue-500 focus:ring-blue-500";
        break; }
      default:
        statusClass = "border-input focus:border-primary focus:ring-primary";
    }
    
    if (isFocused) {
      statusClass += " ring-2 ring-opacity-20";
    }
    
    return cn(baseClass, statusClass, className);
  };
  
  // Render field based on type
  const renderField = () => {
    switch (fieldType) {
      case 'text': {
      case 'email': {
      case 'url': {
      case 'phone': {
        return (
          <div className="relative">
            <Input
              id={id}
              name={name}
              type={fieldType}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={fieldPlaceholder}
              required={fieldRequired}
              readOnly={readOnly}
              disabled={disabled}
              className={getFieldClassName()}
              aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
              aria-invalid={!!error}
            />
            {showValidationIcons && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>
        );
        
      case 'password': {
        return (
          <div className="relative">
            <Input
              id={id}
              name={name}
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={fieldPlaceholder}
              required={fieldRequired}
              readOnly={readOnly}
              disabled={disabled}
              className={getFieldClassName()}
              aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
              aria-invalid={!!error}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {showValidationIcons && getValidationIcon()}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Şifrəni gizlə' : 'Şifrəni göstər'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        );

      case 'number': {
        return (
          <div className="relative">
            <Input
              id={id}
              name={name}
              type="number"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={fieldPlaceholder}
              required={fieldRequired}
              readOnly={readOnly}
              disabled={disabled}
              className={getFieldClassName()}
              aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
              aria-invalid={!!error}
              min={column?.validation?.min}
              max={column?.validation?.max}
              step={column?.validation?.step || 'any'}
            />
            {showValidationIcons && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>
        );

      case 'textarea': {
        return (
          <div className="relative">
            <Textarea
              id={id}
              name={name}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={fieldPlaceholder}
              required={fieldRequired}
              readOnly={readOnly}
              disabled={disabled}
              className={getFieldClassName()}
              aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
              aria-invalid={!!error}
              rows={4}
            />
            {showValidationIcons && (
              <div className="absolute right-3 top-3">
                {getValidationIcon()}
              </div>
            )}
          </div>
        );

      case 'select': {
        const selectOptions = fieldOptions;
        const validOptions = selectOptions
          .filter((option: any) => {
            const optionValue = option?.value !== undefined ? option.value : option;
            return optionValue !== null && optionValue !== undefined && String(optionValue).trim() !== '';
          })
          .map((option: any, index: number) => {
            const optionValue = option?.value !== undefined ? option.value : option;
            const optionLabel = option?.label !== undefined ? option.label : option;
            
            const safeValue = String(optionValue).trim() || `option-${index}`;
            
            return {
              value: safeValue,
              label: optionLabel || safeValue
            };
          });
        
        return (
          <div className="relative">
            <Select 
              value={value || undefined} 
              onValueChange={handleChange}
              disabled={readOnly || disabled}
              onOpenChange={(open) => {
                if (open) handleFocus();
                else handleBlur();
              }}
            >
              <SelectTrigger 
                className={getFieldClassName()}
                aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
                aria-invalid={!!error}
              >
                <SelectValue placeholder={fieldPlaceholder || 'Seçin...'} />
              </SelectTrigger>
              <SelectContent>
                {validOptions.length > 0 ? (
                  validOptions.map((option: any, index: number) => (
                    <SelectItem 
                      key={`${option.value}-${index}`} 
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-options-available" disabled>
                    Seçim yoxdur
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {showValidationIcons && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>
        );

      case 'checkbox': {
        return (
          <div className="flex items-center space-x-3">
            <Checkbox
              id={id}
              checked={value || false}
              onCheckedChange={handleChange}
              disabled={readOnly || disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
              aria-invalid={!!error}
            />
            <Label 
              htmlFor={id}
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                error && "text-red-600",
                warning && "text-yellow-600"
              )}
            >
              {name}
              {fieldRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {showValidationIcons && (
              <div className="ml-2">
                {getValidationIcon()}
              </div>
            )}
          </div>
        );

      case 'radio': {
        const radioOptions = fieldOptions || [];
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={handleChange}
            disabled={readOnly || disabled}
            className="space-y-2"
          >
            {radioOptions.map((option: any, index: number) => {
              const optionValue = option?.value !== undefined ? option.value : option;
              const optionLabel = option?.label !== undefined ? option.label : option;
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={optionValue}
                    id={`${id}-${index}`}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <Label htmlFor={`${id}-${index}`} className="text-sm">
                    {optionLabel}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        );

      case 'date': {
        return (
          <div className="relative">
            <Input
              id={id}
              name={name}
              type="date"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required={fieldRequired}
              readOnly={readOnly}
              disabled={disabled}
              className={getFieldClassName()}
              aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
              aria-invalid={!!error}
            />
            {showValidationIcons && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>
        );

      case 'time': {
        return (
          <div className="relative">
            <Input
              id={id}
              name={name}
              type="time"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required={fieldRequired}
              readOnly={readOnly}
              disabled={disabled}
              className={getFieldClassName()}
              aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
              aria-invalid={!!error}
            />
            {showValidationIcons && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="relative">
            <Input
              id={id}
              name={name}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={fieldPlaceholder}
              required={fieldRequired}
              readOnly={readOnly}
              disabled={disabled}
              className={getFieldClassName()}
              aria-describedby={error ? `${id}-error` : warning ? `${id}-warning` : undefined}
              aria-invalid={!!error}
            />
            {showValidationIcons && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>
        );
    }
  };

  // For checkbox and radio, render differently
  if (fieldType === 'checkbox' || fieldType === 'radio') {
    return (
      <div className="space-y-2">
        {renderField()}
        
        {/* Help text */}
        {helpText && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
        
        {/* Error message */}
        {error && (
          <Alert variant="destructive" id={`${id}-error`} className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              {error.message}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Warning message */}
        {warning && !error && (
          <Alert id={`${id}-warning`} className="py-2 border-yellow-200 bg-yellow-50">
            <Info className="h-3 w-3 text-yellow-600" />
            <AlertDescription className="text-xs text-yellow-800">
              {warning.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Standard field layout
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        <span>
          {name}
          {fieldRequired && <span className="text-red-500 ml-1">*</span>}
        </span>
        
        {/* Validation status badge */}
        {isValidating && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1 animate-spin" />
            Yoxlanılır
          </Badge>
        )}
      </Label>
      
      {renderField()}
      
      {/* Help text */}
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" id={`${id}-error`} className="py-2">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">
            {error.message}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Warning message */}
      {warning && !error && (
        <Alert id={`${id}-warning`} className="py-2 border-yellow-200 bg-yellow-50">
          <Info className="h-3 w-3 text-yellow-600" />
          <AlertDescription className="text-xs text-yellow-800">
            {warning.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedFormField;

/**
 * Bu komponent artıq aşağıdakı funksiyaları dəstəkləyir:
 * 
 * ✅ Müxtəlif sahə tipləri (text, number, email, select, checkbox, radio, date, time, etc.)
 * ✅ Real-time validation feedback
 * ✅ Loading states for async validation
 * ✅ Enhanced user experience
 * ✅ Accessibility support (ARIA attributes)
 * ✅ Password visibility toggle
 * ✅ Validation icons və status indicators
 * ✅ Error və warning mesajları
 * ✅ Help text support
 * ✅ Focus states və animations
 */