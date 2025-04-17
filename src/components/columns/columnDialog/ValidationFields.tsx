
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

interface ValidationFieldsProps {
  form: UseFormReturn<any>;
  selectedType: ColumnType;
  t: (key: string) => string;
}

const ValidationFields: React.FC<ValidationFieldsProps> = ({ form, selectedType, t }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-sm font-medium">{t("validationRules")}</h3>
        <p className="text-xs text-muted-foreground">{t("validationRulesDescription")}</p>
      </div>

      {(selectedType === "number") && (
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
                    placeholder={t("minValuePlaceholder")}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>{t("minValueDescription")}</FormDescription>
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
                    placeholder={t("maxValuePlaceholder")}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>{t("maxValueDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {(selectedType === "text" || selectedType === "textarea") && (
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
                    placeholder={t("minLengthPlaceholder")}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>{t("minLengthDescription")}</FormDescription>
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
                    placeholder={t("maxLengthPlaceholder")}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>{t("maxLengthDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validationRules.pattern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pattern")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("patternPlaceholder")} {...field} />
                </FormControl>
                <FormDescription>{t("patternDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {selectedType === "date" && (
        <>
          <FormField
            control={form.control}
            name="validationRules.minDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("minDate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>{t("minDateDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validationRules.maxDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maxDate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>{t("maxDateDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      <FormField
        control={form.control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("placeholder")}</FormLabel>
            <FormControl>
              <Input placeholder={t("placeholderPlaceholder")} {...field} />
            </FormControl>
            <FormDescription>{t("placeholderDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="helpText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("helpText")}</FormLabel>
            <FormControl>
              <Input placeholder={t("helpTextPlaceholder")} {...field} />
            </FormControl>
            <FormDescription>{t("helpTextDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ValidationFields;
