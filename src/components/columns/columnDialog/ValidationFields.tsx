
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { ColumnFormValues } from './useColumnForm';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ValidationFieldsProps {
  form: UseFormReturn<ColumnFormValues>;
  selectedType: string;
  t: (key: string) => string;
}

const ValidationFields: React.FC<ValidationFieldsProps> = ({
  form,
  selectedType,
  t
}) => {
  if (selectedType !== "text" && selectedType !== "number") {
    return null;
  }

  return (
    <>
      {/* Validation Rules for number */}
      {selectedType === "number" && (
        <>
          <FormField
            control={form.control}
            name="validationRules.minValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("minValue")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("enterMinValue")}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validationRules.maxValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maxValue")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("enterMaxValue")}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {/* Format for text */}
      {selectedType === "text" && (
        <FormField
          control={form.control}
          name="validationRules.format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("format")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectFormat")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">{t("noFormat")}</SelectItem>
                  <SelectItem value="email">{t("email")}</SelectItem>
                  <SelectItem value="phone">{t("phone")}</SelectItem>
                  <SelectItem value="url">{t("url")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Regex for text */}
      {selectedType === "text" && (
        <FormField
          control={form.control}
          name="validationRules.regex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("regex")}</FormLabel>
              <FormControl>
                <Input placeholder={t("enterRegex")} {...field} />
              </FormControl>
              <FormDescription>
                {t("regexDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Text Length Validation */}
      {selectedType === "text" && (
        <>
          <FormField
            control={form.control}
            name="validationRules.minLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("minLength")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("enterMinLength")}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validationRules.maxLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maxLength")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("enterMaxLength")}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
};

export default ValidationFields;
