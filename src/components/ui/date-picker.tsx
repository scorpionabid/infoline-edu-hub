
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/context/LanguageContext";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  // Əlavə prop olaraq date əlavə edirik (geriyə uyğunluq üçün)
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
  placeholder,
  className,
  // Əlavə propları da qəbul edirik və əgər varsa, value və onChange-ə yönləndiririk
  date,
  onSelect,
}: DatePickerProps) {
  const { t } = useLanguage();
  
  // date və onSelect proplarını da nəzərə alırıq
  const effectiveValue = value || date;
  const effectiveOnChange = (date: Date | undefined) => {
    if (onChange) onChange(date);
    if (onSelect) onSelect(date);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !effectiveValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {effectiveValue ? format(effectiveValue, "PPP") : <span>{placeholder || t("selectDate")}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={effectiveValue}
          onSelect={effectiveOnChange}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
