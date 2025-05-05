
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnType } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { Control } from 'react-hook-form';

interface ValidationFieldsProps {
  control: Control<any>;
  type: ColumnType;
}

const ValidationFields: React.FC<ValidationFieldsProps> = ({ 
  control,
  type
}) => {
  const { t } = useLanguage();

  return (
    <>
      <h3 className="text-lg font-medium">{t("validationRules")}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {t("validationDescription")}
      </p>

      {/* Required field */}
      <FormField
        control={control}
        name="is_required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>{t("requiredField")}</FormLabel>
              <p className="text-sm text-muted-foreground">
                {t("requiredFieldDescription")}
              </p>
            </div>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Text fields specific validation */}
      {type === 'text' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            {/* Min Length */}
            <FormField
              control={control}
              name="validation.minLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("minLength")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Length */}
            <FormField
              control={control}
              name="validation.maxLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("maxLength")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="255"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Pattern */}
          <FormField
            control={control}
            name="validation.pattern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pattern")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., ^[a-zA-Z0-9]+$"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  {t("patternDescription")}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {/* Number fields specific validation */}
      {type === 'number' && (
        <div className="grid grid-cols-2 gap-4">
          {/* Min Value */}
          <FormField
            control={control}
            name="validation.minValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("minValue")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Max Value */}
          <FormField
            control={control}
            name="validation.maxValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maxValue")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Date fields specific validation */}
      {type === 'date' && (
        <div className="grid grid-cols-2 gap-4">
          {/* Min Date */}
          <FormField
            control={control}
            name="validation.minValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("minDate")}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Max Date */}
          <FormField
            control={control}
            name="validation.maxValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("maxDate")}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Email, URL, and Phone fields specific validations */}
      {(type === 'email' || type === 'url' || type === 'tel' || type === 'phone') && (
        <>
          <FormField
            control={control}
            name={`validation.${type}`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>
                    {type === 'email' && t("validateEmail")}
                    {type === 'url' && t("validateUrl")}
                    {(type === 'tel' || type === 'phone') && t("validatePhone")}
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {type === 'email' && t("validateEmailDescription")}
                    {type === 'url' && t("validateUrlDescription")}
                    {(type === 'tel' || type === 'phone') && t("validatePhoneDescription")}
                  </p>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Pattern override */}
          <FormField
            control={control}
            name="validation.pattern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("customPattern")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      type === 'email' ? "e.g., ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" :
                      type === 'url' ? "e.g., https?:\\/\\/.+" :
                      "e.g., ^\\+?[0-9]{10,15}$"
                    }
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  {t("customPatternDescription")}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {/* Custom error message */}
      <FormField
        control={control}
        name="validation.customMessage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("customErrorMessage")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("customErrorMessagePlaceholder")}
                {...field}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              {t("customErrorMessageDescription")}
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ValidationFields;
