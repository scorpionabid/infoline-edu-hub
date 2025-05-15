import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/context/LanguageContext";
import { ColumnType } from '@/types/column';
import { ColumnTypeSelector } from "@/components/columns/columnDialog/ColumnTypeSelector";

interface BasicColumnFieldsProps {
  control: Control<any>;
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
  isEditMode?: boolean;
}

const BasicColumnFields: React.FC<BasicColumnFieldsProps> = ({
  control,
  selectedType,
  onTypeChange,
  isEditMode
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnName")}</FormLabel>
            <FormControl>
              <Input placeholder={t("columnName")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("description")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("description")}
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("columnType")}</FormLabel>
            <ColumnTypeSelector
              value={selectedType}
              onValueChange={onTypeChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("placeholder")}</FormLabel>
            <FormControl>
              <Input placeholder={t("placeholder")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="help_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("helpText")}</FormLabel>
            <FormControl>
              <Input placeholder={t("helpText")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="is_required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-sm">{t("isRequired")}</FormLabel>
              <FormDescription>
                {t("isRequiredDescription")}
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isEditMode}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicColumnFields;
