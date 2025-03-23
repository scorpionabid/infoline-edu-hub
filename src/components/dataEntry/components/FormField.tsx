
import React from 'react';
import { Column } from '@/types/column';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { az } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStatusForColumn, getValueForColumn } from '../utils/formUtils';
import FormFieldHelp from './FormFieldHelp';
import StatusBadge from './StatusBadge';
import RejectionAlert from './RejectionAlert';
import { EntryValue } from '@/types/dataEntry';

interface FormFieldProps {
  column: Column;
  categoryId: string;
  values: EntryValue[];
  onValueChange: (categoryId: string, columnId: string, value: any) => void;
  getErrorForColumn: (columnId: string) => string | undefined;
  isDisabled: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  column,
  categoryId,
  values,
  onValueChange,
  getErrorForColumn,
  isDisabled
}) => {
  const errorMessage = getErrorForColumn(column.id);
  const status = getStatusForColumn(values, column.id);
  
  const isRejected = status === 'rejected';
  const isApproved = status === 'approved';
  
  const value = getValueForColumn(values, column.id);
  const errorMessageFromValue = values.find(v => v.columnId === column.id)?.errorMessage;
  
  return (
    <div key={column.id} className="mb-6">
      <FormItem className={cn(
        "space-y-2", 
        isRejected && "bg-red-50 p-3 rounded-md dark:bg-red-900/20",
        isApproved && "bg-green-50 p-3 rounded-md dark:bg-green-900/20"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FormLabel className="flex items-center space-x-2">
              <span>{column.name}</span>
              {column.isRequired && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <StatusBadge status={status} />
          </div>
          <FormFieldHelp helpText={column.helpText || ''} />
        </div>
        
        {renderFormControl()}
        
        <RejectionAlert errorMessage={isRejected ? errorMessageFromValue : undefined} />
        
        {errorMessage && !isRejected && (
          <FormMessage>
            {errorMessage}
          </FormMessage>
        )}
        
        {column.helpText && (
          <FormDescription className={
            isRejected ? "text-red-600 dark:text-red-400" : 
            isApproved ? "text-green-600 dark:text-green-400" : 
            ""
          }>
            {column.helpText}
          </FormDescription>
        )}
      </FormItem>
    </div>
  );
  
  function renderFormControl() {
    switch(column.type) {
      case 'text':
        return column.multiline ? renderTextarea() : renderTextInput();
      case 'number':
        return renderNumberInput();
      case 'select':
        return renderSelect();
      case 'date':
        return renderDatePicker();
      case 'checkbox':
        return renderCheckbox();
      default:
        return renderTextInput();
    }
  }
  
  function renderTextInput() {
    return (
      <FormControl>
        <Input
          value={value || ''}
          onChange={(e) => onValueChange(categoryId, column.id, e.target.value)}
          placeholder={column.placeholder || `${column.name} daxil edin`}
          className={cn(
            errorMessage ? 'border-red-500' : '', 
            isRejected && "border-red-400",
            isApproved && "border-green-400 bg-green-50/50"
          )}
          disabled={isDisabled}
        />
      </FormControl>
    );
  }
  
  function renderTextarea() {
    return (
      <FormControl>
        <Textarea
          value={value || ''}
          onChange={(e) => onValueChange(categoryId, column.id, e.target.value)}
          placeholder={column.placeholder || `${column.name} daxil edin`}
          className={cn(
            errorMessage ? 'border-red-500' : '', 
            isRejected && "border-red-400",
            isApproved && "border-green-400 bg-green-50/50"
          )}
          rows={4}
          disabled={isDisabled}
        />
      </FormControl>
    );
  }
  
  function renderNumberInput() {
    return (
      <FormControl>
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onValueChange(categoryId, column.id, e.target.value ? Number(e.target.value) : '')}
          placeholder={column.placeholder || `${column.name} daxil edin`}
          className={cn(
            errorMessage ? 'border-red-500' : '', 
            isRejected && "border-red-400",
            isApproved && "border-green-400 bg-green-50/50"
          )}
          disabled={isDisabled}
          min={column.validationRules?.minValue}
          max={column.validationRules?.maxValue}
        />
      </FormControl>
    );
  }
  
  function renderSelect() {
    if (!column.options) return null;
    
    return (
      <Select
        value={String(value || '')}
        onValueChange={(val) => onValueChange(categoryId, column.id, val)}
        disabled={isDisabled}
      >
        <FormControl>
          <SelectTrigger className={cn(
            errorMessage ? 'border-red-500' : '', 
            isRejected && "border-red-400",
            isApproved && "border-green-400 bg-green-50/50"
          )}>
            <SelectValue placeholder={column.placeholder || 'Seçin'} />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="max-h-80 overflow-y-auto">
          {column.options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  
  function renderDatePicker() {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !value && "text-muted-foreground",
                errorMessage && "border-red-500",
                isRejected && "border-red-400",
                isApproved && "border-green-400 bg-green-50/50"
              )}
              disabled={isDisabled}
            >
              {value ? (
                format(new Date(value), 'dd MMMM yyyy', { locale: az })
              ) : (
                <span>Tarix seçin</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => onValueChange(categoryId, column.id, date)}
            disabled={isDisabled}
            className={cn("p-3 pointer-events-auto")}
            locale={az}
          />
        </PopoverContent>
      </Popover>
    );
  }
  
  function renderCheckbox() {
    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id={column.id}
          checked={!!value}
          onCheckedChange={(checked) => onValueChange(categoryId, column.id, checked)}
          disabled={isDisabled}
          className={cn(
            isRejected ? "border-red-400" : "",
            isApproved ? "border-green-400" : ""
          )}
        />
        <label
          htmlFor={column.id}
          className={cn(
            "text-sm", 
            isRejected ? "text-red-600 dark:text-red-400" : 
            isApproved ? "text-green-600 dark:text-green-400" : 
            "text-muted-foreground"
          )}
        >
          {column.placeholder || 'Seçin'}
        </label>
      </div>
    );
  }
};

export default FormField;
