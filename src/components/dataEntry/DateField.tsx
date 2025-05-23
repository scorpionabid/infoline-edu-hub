
import React from 'react';
import { Column } from '@/types/column';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const currentDate = value ? new Date(value) : undefined;
  const validDate = currentDate instanceof Date && !isNaN(currentDate.getTime()) ? currentDate : undefined;

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Use onValueChange if available, otherwise fallback
    if (onValueChange) {
      onValueChange(date.toISOString());
    } else if (onChange) {
      const fakeEvent = {
        target: {
          name: column.id,
          value: date.toISOString()
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
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={validDate}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      )}
    </Popover>
  );
};

export default DateField;
