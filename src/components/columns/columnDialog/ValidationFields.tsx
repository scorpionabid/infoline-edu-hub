import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ColumnType } from "@/types/column";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const COLUMN_TYPE_DEFINITIONS = {
  text: "Mətn",
  number: "Rəqəm",
  date: "Tarix",
  select: "Seçim",
  checkbox: "Checkbox",
  radio: "Radio",
  textarea: "Açıqlama",
  file: "Fayl",
  image: "Şəkil"
};

interface ValidationFieldsProps {
  form: any;
  selectedType: ColumnType;
  t: (key: string) => string; // Dil tərcüməsi üçün funksiya
}

const ValidationFields: React.FC<ValidationFieldsProps> = ({
  form,
  selectedType,
  t,
}) => {
  // Seçilmiş tip üçün mümkün validasiyaları müəyyən et
  const availableValidations = COLUMN_TYPE_DEFINITIONS[selectedType]?.validations || [];
  
  // Validasiya formunu uyğun şəkildə hazırla
  const renderValidationFields = () => {
    return (
      <div className="space-y-4">
        {availableValidations.includes('minLength') && (
          <FormField
            control={form.control}
            name="validation.minLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("minLength")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("enterMinLength")}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>{t("minLengthDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {availableValidations.includes('maxLength') && (
          <FormField
            control={form.control}
            name="validation.maxLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maxLength")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("enterMaxLength")}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>{t("maxLengthDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {availableValidations.includes('minValue') && (
          <FormField
            control={form.control}
            name="validation.minValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("minValue")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("enterMinValue")}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>{t("minValueDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {availableValidations.includes('maxValue') && (
          <FormField
            control={form.control}
            name="validation.maxValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maxValue")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("enterMaxValue")}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>{t("maxValueDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {availableValidations.includes('pattern') && (
          <FormField
            control={form.control}
            name="validation.pattern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pattern")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("enterPattern")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("patternDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {/* Əlavə validasiyalar */}
        {(selectedType === 'email' || selectedType === 'url') && (
          <FormField
            control={form.control}
            name={`validation.${selectedType}`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id={`validate-${selectedType}`}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <Label htmlFor={`validate-${selectedType}`}>
                    {t(`validate${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`)}
                  </Label>
                  <FormDescription>
                    {t(`validate${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}Description`)}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Xüsusi xəta mesajı sahəsi - bütün validasiyalar üçün */}
        <FormField
          control={form.control}
          name="validation.customMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("customErrorMessage")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("enterCustomErrorMessage")}
                  {...field}
                />
              </FormControl>
              <FormDescription>{t("customErrorMessageDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  };

  // Validasiya sahələri yoxdursa, göstərmə
  if (availableValidations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("validationRules")}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {renderValidationFields()}
      </CardContent>
    </Card>
  );
};

export default ValidationFields;
