
import React from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Column } from '@/types/column';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface DateFieldProps {
  column: Column;
  value: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
}

const DateField: React.FC<DateFieldProps> = ({ 
  column, 
  value, 
  onChange,
  onValueChange,
  isDisabled = false 
}) => {
  const { t } = useLanguage();
  
  // Ensure column is valid before proceeding
  if (!column || !column.id) {
    console.warn('Invalid column provided to DateField');
    return null;
  }

  // Safely parse the date value
  let currentDate;
  let validDate;
  
  try {
    if (value) {
      currentDate = new Date(value);
      // Check if date is valid
      validDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) ? currentDate : undefined;
    } else {
      validDate = undefined;
    }
  } catch (err) {
    console.warn(`Failed to parse date value for column ${column.id}:`, err);
    validDate = undefined;
  }

  // Handle date selection with safety checks
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const isoString = date.toISOString();
    
    // Use onValueChange if available, otherwise fallback to onChange
    if (typeof onValueChange === 'function') {
      onValueChange(isoString);
    } else if (typeof onChange === 'function') {
      const fakeEvent = {
        target: {
          name: column.id,
          value: isoString
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(fakeEvent);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !validDate && "text-muted-foreground",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={isDisabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {validDate ? format(validDate, "PPP") : <span>{column.placeholder || t('selectDate')}</span>}
        </Button>
      </PopoverTrigger>
      {!isDisabled && (
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <Calendar
            mode="single"
            selected={validDate}
            onSelect={handleSelect}
            initialFocus
            className="p-3"
          />
        </PopoverContent>
      )}
    </Popover>
  );
};

export default DateField;
