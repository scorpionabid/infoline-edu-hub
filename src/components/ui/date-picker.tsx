
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DatePickerProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}

export function DatePicker({
  selected,
  onSelect,
  disabled = false,
  className,
  placeholder = "Pick a date",
  value,
  onChange
}: DatePickerProps) {
  // Handle both prop patterns (either selected/onSelect or value/onChange)
  const handleSelect = (date: Date | undefined) => {
    if (onSelect) {
      onSelect(date);
    }
    if (onChange) {
      onChange(date);
    }
  };

  const dateValue = value || selected;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
