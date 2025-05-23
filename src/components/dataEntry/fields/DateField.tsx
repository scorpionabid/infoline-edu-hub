
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

  // Safely parse the date value with extensive error handling
  const validDate = React.useMemo(() => {
    try {
      if (!value) return undefined;
      
      // Handle different date formats
      let date: Date | undefined;
      
      if (typeof value === 'string') {
        date = new Date(value);
      } else if (value instanceof Date) {
        date = value;
      } else {
        console.warn(`Unexpected date value type for column ${column.id}:`, typeof value);
        return undefined;
      }
      
      // Verify the date is valid
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date;
      }
      
      console.warn(`Invalid date value for column ${column.id}:`, value);
      return undefined;
    } catch (err) {
      console.error(`Failed to parse date value for column ${column.id}:`, err);
      return undefined;
    }
  }, [column.id, value]);

  // Handle date selection with safety checks
  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      console.log(`No date selected for column ${column.id}`);
      return;
    }
    
    try {
      const isoString = date.toISOString();
      console.log(`Date selected for column ${column.id}:`, isoString);
      
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
    } catch (err) {
      console.error(`Error handling date selection for column ${column.id}:`, err);
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
