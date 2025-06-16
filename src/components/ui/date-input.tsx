import React from "react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/contexts/TranslationContext";

interface DateInputProps {
  value: string | null;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  min,
  max,
  required,
  placeholder,
  className = "",
  disabled = false,
}) => {
  const { t } = useTranslation();
  const placeholderText =
    placeholder || t("common.dateInput.placeholder", "YYYY-MM-DD");
  return (
    <Input
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      required={required}
      placeholder={placeholderText}
      className={className}
      disabled={disabled}
    />
  );
};

export default DateInput;
