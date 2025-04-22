
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Column } from '@/types/column';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TextInputProps {
  column: Column;
  form: UseFormReturn<any>;
  disabled?: boolean;
  showLabel?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ 
  column, 
  form, 
  disabled = false,
  showLabel = true
}) => {
  // Validasiya mesajlarını hazırla
  const getValidationMessage = () => {
    const messages = [];
    
    if (column.validation) {
      const validation = column.validation;
      if (column.type === 'text' || column.type === 'textarea') {
        if (validation.minLength) {
          messages.push(`Minimum ${validation.minLength} simvol`);
        }
        if (validation.maxLength) {
          messages.push(`Maksimum ${validation.maxLength} simvol`);
        }
      }
      
      if (column.type === 'email' && validation.pattern) {
        messages.push('Düzgün email formatı olmalıdır');
      }
      
      if (column.type === 'url' && validation.pattern) {
        messages.push('Düzgün URL formatı olmalıdır');
      }
    }
    
    return messages.length > 0 ? messages.join('. ') : null;
  };

  const validationMessage = getValidationMessage();

  return (
    <FormField
      control={form.control}
      name={`fields.${column.id}`}
      render={({ field }) => (
        <FormItem className="w-full">
          {showLabel && (
            <div className="flex items-center gap-2">
              <FormLabel className="flex items-center">
                {column.name}
                {column.is_required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {column.help_text && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{column.help_text}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
          <FormControl>
            {column.type === 'textarea' ? (
              <Textarea
                {...field}
                placeholder={column.placeholder || `${column.name} daxil edin...`}
                disabled={disabled}
                aria-label={column.name}
                id={`field-${column.id}`}
                className="min-h-[120px] resize-y"
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                }}
              />
            ) : (
              <Input
                {...field}
                placeholder={column.placeholder || `${column.name} daxil edin...`}
                disabled={disabled}
                aria-label={column.name}
                id={`field-${column.id}`}
                type={column.type === 'email' ? 'email' : column.type === 'url' ? 'url' : 'text'}
                value={field.value || ''}
                onChange={(e) => {
                  field.onChange(e);
                }}
                className={column.validation?.pattern ? "peer" : ""}
              />
            )}
          </FormControl>
          {validationMessage && (
            <p className="text-xs text-muted-foreground">{validationMessage}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TextInput;
