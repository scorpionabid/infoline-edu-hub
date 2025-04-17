import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ColumnType } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

export interface ValidationFieldsProps {
  form: any;
  selectedType: ColumnType;
  t?: (key: string, args?: any) => string;
}

const ValidationFields: React.FC<ValidationFieldsProps> = ({
  form,
  selectedType,
  t: propT
}) => {
  const { t: contextT } = useLanguage();
  const t = propT || contextT;

  if (selectedType === "number") {
    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="validation.minValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("minValue")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                {t("minValueDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="validation.maxValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maxValue")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="100"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                {t("maxValueDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  if (selectedType === "text" || selectedType === "textarea") {
    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="validation.minLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("minLength")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                {t("minLengthDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="validation.maxLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maxLength")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="255"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                {t("maxLengthDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  return null;
};

export default ValidationFields;
