
import React from "react";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { FormFieldHelp } from "@/components/dataEntry/components/FormFieldHelp";
import { Column } from "@/types/column";

interface DataEntryFieldProps {
  column: Column;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const DataEntryField: React.FC<DataEntryFieldProps> = ({
  column,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const renderField = () => {
    switch (column.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={disabled}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={disabled}
          />
        );
      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={disabled}
          />
        );
      case "date":
        return (
          <DatePicker
            date={value ? new Date(value) : undefined}
            setDate={(date) => onChange(date ? date.toISOString() : "")}
            disabled={disabled}
          />
        );
      case "select":
        const options = Array.isArray(column.options) ? column.options : [];
        return (
          <Select
            value={value || ""}
            onValueChange={(val) => onChange(val)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={column.placeholder || ""} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, idx) => {
                const optionValue = typeof option === "string" ? option : option.value;
                const optionLabel = typeof option === "string" ? option : option.label;
                return (
                  <SelectItem key={idx} value={optionValue}>
                    {optionLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
      case "checkbox":
        return (
          <Checkbox
            checked={value === "true"}
            onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
            disabled={disabled}
          />
        );
      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={column.placeholder}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className={`mb-4 ${error ? "error" : ""}`}>
      <div className="flex flex-col mb-1">
        <label className="text-sm font-medium mb-1">
          {column.name}
          {column.isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        {column.helpText && <FormFieldHelp text={column.helpText} />}
      </div>
      {renderField()}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
};

export default DataEntryField;
