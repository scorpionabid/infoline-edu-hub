
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnType } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { Control } from 'react-hook-form';

export interface ValidationFieldsProps {
  type: ColumnType;
  control: any;
}

const ValidationFields: React.FC<ValidationFieldsProps> = ({ type, control }) => {
  const { t } = useLanguage();
  
  // Sütun tipinə görə validasiya sahələri
  if (type === 'text' || type === 'textarea' || type === 'email' || type === 'url' || type === 'richtext') {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          <FormField
            control={control}
            name="validation.minLength"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t("minLength")}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="validation.maxLength"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t("maxLength")}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="255" {...field} min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {(type === 'text' || type === 'textarea') && (
          <FormField
            control={control}
            name="validation.pattern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("pattern")}</FormLabel>
                <FormControl>
                  <Input placeholder="^[A-Za-z]+$" {...field} />
                </FormControl>
                <FormDescription>
                  {t("patternDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {type === 'email' && (
          <FormField
            control={control}
            name="validation.email"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t("validateEmail")}</FormLabel>
                  <FormDescription>
                    {t("validateEmailDescription")}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}
        
        {type === 'url' && (
          <FormField
            control={control}
            name="validation.url"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{t("validateUrl")}</FormLabel>
                  <FormDescription>
                    {t("validateUrlDescription")}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}
      </div>
    );
  }
  
  if (type === 'number' || type === 'range') {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          <FormField
            control={control}
            name="validation.min"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t("minValue")}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="validation.max"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t("maxValue")}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  }
  
  if (type === 'date' || type === 'datetime') {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          <FormField
            control={control}
            name="validation.minDate"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t("minDate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="validation.maxDate"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t("maxDate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  }
  
  if (type === 'phone' || type === 'tel') {
    return (
      <div className="space-y-4">
        <FormField
          control={control}
          name="validation.tel"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t("validatePhone")}</FormLabel>
                <FormDescription>
                  {t("validatePhoneDescription")}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="validation.pattern"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("phonePattern")}</FormLabel>
              <FormControl>
                <Input placeholder="^\+?[0-9]{10,15}$" {...field} />
              </FormControl>
              <FormDescription>
                {t("phonePatternDescription")}
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
