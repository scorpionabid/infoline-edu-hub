import React, { useState } from 'react';
import { Column } from '@/types/column';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale'; // Azərbaycan locale mövcud deyilsə türk istifadə edərik
import { 
  Calendar as CalendarIcon, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle, 
  Upload,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedFormFieldProps {
  column: Column;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
  showValidation?: boolean;
}

export const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  column,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  showValidation = true
}) => {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleChange = (newValue: any) => {
    if (!disabled && !readOnly) {
      onChange(newValue);
      setTouched(true);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  // Validation logic
  const getValidationState = () => {
    if (!touched && !value) return 'neutral';
    
    if (column.is_required && (!value || value.toString().trim() === '')) {
      return 'error';
    }
    
    if (value && column.validation) {
      // Number validation
      if (column.type === 'number') {
        const numValue = parseFloat(value);
        if (column.validation.min && numValue < column.validation.min) return 'error';
        if (column.validation.max && numValue > column.validation.max) return 'error';
      }
      
      // Text length validation
      if (column.type === 'text' || column.type === 'textarea') {
        if (column.validation.minLength && value.length < column.validation.minLength) return 'error';
        if (column.validation.maxLength && value.length > column.validation.maxLength) return 'error';
      }
      
      // Email validation
      if (column.validation.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) return 'error';
    }
    
    if (value && value.toString().trim() !== '') return 'success';
    return 'neutral';
  };

  const validationState = getValidationState();

  const getValidationIcon = () => {
    switch (validationState) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getValidationMessage = () => {
    if (!touched) return null;
    
    if (column.is_required && (!value || value.toString().trim() === '')) {
      return 'Bu sahə məcburidir';
    }
    
    if (value && column.validation) {
      if (column.type === 'number') {
        const numValue = parseFloat(value);
        if (column.validation.min && numValue < column.validation.min) {
          return `Minimum dəyər: ${column.validation.min}`;
        }
        if (column.validation.max && numValue > column.validation.max) {
          return `Maksimum dəyər: ${column.validation.max}`;
        }
      }
      
      if (column.type === 'text' || column.type === 'textarea') {
        if (column.validation.minLength && value.length < column.validation.minLength) {
          return `Minimum ${column.validation.minLength} simvol tələb olunur`;
        }
        if (column.validation.maxLength && value.length > column.validation.maxLength) {
          return `Maksimum ${column.validation.maxLength} simvol icazə verilir`;
        }
      }
      
      if (column.validation.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
        return 'Düzgün e-poçt ünvanı daxil edin';
      }
    }
    
    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleChange(file.name);
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const renderField = () => {
    const commonProps = {
      disabled,
      readOnly,
      onBlur: handleBlur,
      className: `transition-all duration-200 ${
        validationState === 'error' 
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
          : validationState === 'success'
          ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
          : ''
      }`
    };

    switch (column.type) {
      case 'text':
      case 'email':
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type={column.type}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={column.placeholder}
            />
            {showValidation && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>
        );

      case 'password':
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={column.placeholder}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        );

      case 'textarea':
        return (
          <div className="relative">
            <Textarea
              {...commonProps}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={column.placeholder}
              rows={4}
              className="resize-none"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              {column.validation?.maxLength && (
                <Badge variant="outline" className="text-xs">
                  {(value || '').length}/{column.validation.maxLength}
                </Badge>
              )}
              {showValidation && getValidationIcon()}
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="relative">
            <Input
              {...commonProps}
              type="number"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={column.placeholder}
              min={column.validation?.min}
              max={column.validation?.max}
            />
            {showValidation && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
            {(column.validation?.min || column.validation?.max) && (
              <div className="text-xs text-muted-foreground mt-1">
                {column.validation.min && column.validation.max 
                  ? `${column.validation.min} - ${column.validation.max} arası`
                  : column.validation.min 
                  ? `Minimum: ${column.validation.min}`
                  : `Maksimum: ${column.validation.max}`
                }
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className={commonProps.className}>
              <SelectValue placeholder={column.placeholder || 'Seçin...'} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !value && "text-muted-foreground"
                } ${commonProps.className}`}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "dd MMMM yyyy", { locale: tr }) : "Tarix seçin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleChange(date?.toISOString().split('T')[0])}
                initialFocus
                locale={tr}
              />
            </PopoverContent>
          </Popover>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                onChange={handleFileUpload}
                disabled={disabled}
                className="hidden"
                id={`file-${column.id}`}
              />
              <Label
                htmlFor={`file-${column.id}`}
                className="flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Fayl seçin
              </Label>
              {value && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{value}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChange('')}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            {filePreview && (
              <div className="border rounded-md p-2">
                <img src={filePreview} alt="Preview" className="max-w-full h-32 object-contain" />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="relative">
            <Input
              {...commonProps}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={column.placeholder}
            />
            {showValidation && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>
        );
    }
  };

  const validationMessage = getValidationMessage();

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={column.id} className="text-sm font-medium flex items-center gap-1">
            {column.name}
            {column.is_required && <span className="text-red-500">*</span>}
            {column.help_text && (
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>{column.help_text}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </Label>
          
          {column.is_required && (
            <Badge variant="outline" className="text-xs">
              Məcburi
            </Badge>
          )}
        </div>
        
        {renderField()}
        
        {validationMessage && showValidation && (
          <Alert variant={validationState === 'error' ? 'destructive' : 'default'} className="py-2">
            <AlertDescription className="text-xs">
              {validationMessage}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  );
};

export default EnhancedFormField;
