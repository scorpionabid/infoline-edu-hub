import React from "react";
import { Control, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/contexts/TranslationContext";
import { ColumnFormValues, ColumnType } from "@/types/column";

interface ColumnTypeSelectorProps {
  control: Control<ColumnFormValues>;
}

const ColumnTypeSelector: React.FC<ColumnTypeSelectorProps> = ({ control }) => {
  const { t } = useTranslation();

  const columnTypes: ColumnType[] = [
    "text",
    "number",
    "email",
    "tel",
    "url",
    "date",
    "datetime-local",
    "time",
    "textarea",
    "select",
    "checkbox",
    "radio",
    "file",
    "boolean",
    "json",
  ];

  return (
    <div className="space-y-2">
      <Label>{t("columnType")}</Label>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectColumnType")} />
            </SelectTrigger>
            <SelectContent>
              {columnTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
};

export default ColumnTypeSelector;
