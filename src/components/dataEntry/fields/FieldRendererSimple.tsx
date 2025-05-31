
import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import field components
import BaseField from './BaseField';

// Import UI components needed for file upload
import { cn } from '@/lib/utils';
import { ColumnType, ColumnOption } from '@/types/column';

export interface FieldRendererSimpleProps {
  // Field identification
  id?: string;
  name?: string;
  label?: string;
  
  // Field data
  type: ColumnType;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: ColumnOption[];
  
  // Validation 
  validation?: {
    required?: boolean;
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
  };
  error?: string;
  
  // Presentation
  disabled?: boolean;
  readOnly?: boolean;
  description?: string;
  helpText?: string;
  className?: string;
}

/**
 * FieldRendererSimple - A unified field renderer with simple validation
 * 
 * Renders various field types with consistent layout and validation.
 * Uses BaseField for all field types except those requiring special handling.
 */
const FieldRendererSimple: React.FC<FieldRendererSimpleProps> = ({
  // Field identification props
  id,
  name,
  label,
  
  // Field data props
  type,
  value,
  onChange,
  placeholder,
  options = [],
  
  // Validation props
  validation,
  error,
  
  // Presentation props
  disabled = false,
  readOnly = false,
  helpText,
  description,
  className
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024;
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        toast({
          title: t('error'),
          description: t('fileTooLarge').replace('{filename}', file.name),
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      onChange([...uploadedFiles, ...validFiles]);
    }
  }, [uploadedFiles, onChange, t, toast]);

  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onChange(newFiles);
  }, [uploadedFiles, onChange]);

  // Sahələrin base və xüsusi xassələrini ayırırıq
  // Debug məlumatları əlavə edirik
  console.group(`FieldRendererSimple rendering for ${name || id}`);
  console.log('Field type:', type);
  console.log('disabled:', disabled);
  console.log('readOnly:', readOnly);
  console.log('value:', value);
  console.groupEnd();
  
  const baseFieldProps = {
    id: id || name || '',
    name: name || '',
    label: label || name || '',
    required: validation?.required,
    disabled: disabled,
    description: description || helpText,
    error,
    className
  };

  // Komponentimizin nə qaytarıcağını təyin edirik
  switch (type) {
    case 'text':
    case 'email':
    case 'url':
    case 'phone':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Input
              id={id || name}
              name={name}
              type={type}
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled} // yalnız disabled parametrini istifadə edirik
              readOnly={readOnly} // readOnly ayrıca parametr kimi ötürülür
              className={cn(
                'focus:ring-1 focus:ring-primary',
                error && 'border-destructive',
                readOnly && 'bg-muted cursor-default'
              )}
            />
          )}
        />
      );

    case 'textarea':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Textarea
              id={id || name}
              name={name}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled} // yalnız disabled parametrini istifadə edirik
              readOnly={readOnly} // readOnly ayrıca parametr kimi ötürülür
              className={cn(
                'min-h-[120px] resize-y focus:ring-1 focus:ring-primary',
                error && 'border-destructive',
                readOnly && 'bg-muted cursor-default'
              )}
            />
          )}
        />
      );

    case 'number':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Input 
              id={id || name}
              name={name}
              type="number"
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => {
                const val = e.target.value;
                // Empty value check
                if (val === '') {
                  onChange('');
                  return;
                }
                
                // Number validation and conversion
                const numValue = parseFloat(val);
                if (!isNaN(numValue)) {
                  onChange(numValue);
                }
              }}
              disabled={disabled} 
              readOnly={readOnly} 
              className={cn(
                'focus:ring-1 focus:ring-primary',
                error && 'border-destructive',
                readOnly && 'bg-muted cursor-default'
              )}
            />
          )}
        />
      );
      
    case 'date':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Input
              id={id || name}
              name={name}
              type="date"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled} // yalnız disabled parametrini istifadə edirik
              readOnly={readOnly} // readOnly ayrıca parametr kimi ötürülür
              className={cn(
                'focus:ring-1 focus:ring-primary',
                error && 'border-destructive',
                readOnly && 'bg-muted cursor-default'
              )}
            />
          )}
        />
      );
      
    case 'select':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Select 
              value={value || ''}
              onValueChange={onChange}
              disabled={disabled || readOnly} // readOnly vəziyyətində select değişdirilə bilməz
            >
              <SelectTrigger
                className={cn(
                  'focus:ring-1 focus:ring-primary w-full',
                  error && 'border-destructive'
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      );
      
    case 'checkbox':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={id || name}
                checked={value === true}
                onCheckedChange={onChange}
                disabled={disabled || readOnly} // readOnly vəziyyətində checkbox dəyişdirilə bilməz
                className={cn(
                  error && 'border-destructive',
                  readOnly && 'opacity-70'
                )}
              />
            </div>
          )}
        />
      );
      
    case 'radio':
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <RadioGroup
              value={value || ''}
              onValueChange={onChange}
              disabled={disabled || readOnly} // readOnly vəziyyətində radio seçimi dəyişdirilə bilməz
              className={cn(
                "flex flex-col space-y-1",
                readOnly && "opacity-70"
              )}
            >
              {options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${id || name}-${option.value}`} />
                  <Label htmlFor={`${id || name}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      );

    case 'file':
      // Fayl yükləmə sahəsi üçün BaseField istifadə edirik
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <div className="space-y-4">
              <div className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center",
                error ? "border-destructive" : "border-gray-300"
              )}>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id={`file-upload-${id || name}`}
                  multiple
                  disabled={disabled}
                />
                <label 
                  htmlFor={`file-upload-${id || name}`} 
                  className={cn(
                    "cursor-pointer",
                    (disabled || readOnly) && "cursor-not-allowed opacity-50"
                  )}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className={cn(
                    "mt-2 text-sm",
                    error ? "text-destructive" : "text-gray-600"
                  )}>
                    {placeholder || t('clickToUploadFiles')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('maxFileSize')}: 10MB
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('uploadedFiles')}:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({Math.round(file.size / 1024)} KB)
                        </span>
                      </div>
                      {!readOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        />
      );

    default:
      // Tanınmayan sahə növləri üçün adi text input göstərək
      return (
        <BaseField
          {...baseFieldProps}
          renderField={() => (
            <Input
              id={id || name}
              name={name}
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              className={cn(
                'focus:ring-1 focus:ring-primary',
                error && 'border-destructive'
              )}
            />
          )}
        />
      );
  }
};

export default FieldRendererSimple;
