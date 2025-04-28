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
import { ColumnType, COLUMN_TYPE_DEFINITIONS } from "@/types/column";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Control } from "react-hook-form";

export interface ValidationFieldsProps {
  control: Control<any>; // form control
  columnType: ColumnType;
  t?: (key: string) => string; // Opsiyonal dil tərcüməsi funksiyası
}

const ValidationFields = ({ control, columnType, t: propT }: ValidationFieldsProps) => {
  const { t: contextT } = useLanguage();
  
  // İstifadə edəcəyimiz tərcümə funksiyası (prop və ya context-dən)
  const t = propT || contextT;
  
  // Seçilmiş tip üçün mümkün validasiyaları müəyyən et
  const availableValidations = COLUMN_TYPE_DEFINITIONS[columnType]?.validations || [];
  
  // Validasiya formunu uyğun şəkildə hazırla
  const renderValidationFields = () => {
    return (
      <div className="space-y-4">
        {availableValidations.includes('minLength') && (
          <FormField
            control={control}
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
            control={control}
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
            control={control}
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
            control={control}
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
            control={control}
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
        {(columnType === 'email' || availableValidations.includes('email')) && (
          <FormField
            control={control}
            name="validation.email"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="validate-email"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <Label htmlFor="validate-email">
                    {t("validateEmail")}
                  </Label>
                  <FormDescription>
                    {t("validateEmailDescription")}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}
        
        {(columnType === 'url' || availableValidations.includes('url')) && (
          <FormField
            control={control}
            name="validation.pattern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('urlPattern')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('urlPatternPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t('urlPatternDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Xüsusi xəta mesajı sahəsi - bütün validasiyalar üçün */}
        <FormField
          control={control}
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
