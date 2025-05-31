
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'email' 
  | 'phone' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'url';

interface FieldRendererSimpleProps {
  type: ColumnType;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
  };
  disabled?: boolean;
  readOnly?: boolean;
  helpText?: string;
  name?: string;
  id?: string;
  className?: string;
}

const FieldRendererSimple: React.FC<FieldRendererSimpleProps> = ({
  type,
  value,
  onChange,
  placeholder,
  options = [],
  validation,
  disabled = false,
  readOnly = false,
  helpText,
  name,
  id,
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

  const baseProps = {
    disabled: disabled || readOnly,
    className: cn(
      "w-full",
      readOnly && "bg-gray-50 cursor-default",
      className
    ),
    name,
    id
  };

  switch (type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
      return (
        <div className="space-y-2">
          <Input
            {...baseProps}
            type={type === 'email' ? 'email' : type === 'phone' ? 'tel' : type === 'url' ? 'url' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            minLength={validation?.minLength}
            maxLength={validation?.maxLength}
            pattern={validation?.pattern}
          />
          {helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Textarea
            {...baseProps}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            minLength={validation?.minLength}
            maxLength={validation?.maxLength}
            rows={4}
          />
          {helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Input
            {...baseProps}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={placeholder}
            readOnly={readOnly}
            min={validation?.minValue}
            max={validation?.maxValue}
          />
          {helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      );

    case 'date':
      return (
        <div className="space-y-2">
          <DatePicker
            value={value ? new Date(value) : undefined}
            onChange={(date) => onChange(date?.toISOString().split('T')[0])}
            disabled={disabled || readOnly}
            placeholder={placeholder}
          />
          {helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled || readOnly}
          >
            <SelectTrigger className={baseProps.className}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={value || false}
              onCheckedChange={onChange}
              disabled={disabled || readOnly}
            />
            <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {placeholder}
            </Label>
          </div>
          {helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled || readOnly}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
                <Label htmlFor={`${id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
          {helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      );

    case 'file':
      return (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id={`file-upload-${id}`}
              multiple
              disabled={disabled || readOnly}
            />
            <label 
              htmlFor={`file-upload-${id}`} 
              className={cn(
                "cursor-pointer",
                (disabled || readOnly) && "cursor-not-allowed opacity-50"
              )}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
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

          {helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Input
            {...baseProps}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
          />
          {helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      );
  }
};

export default FieldRendererSimple;
