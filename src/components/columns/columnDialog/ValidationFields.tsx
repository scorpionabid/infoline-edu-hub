
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

const ValidationFields: React.FC<ValidationFieldsProps> = ({ control, type }) => {
  const { t } = useLanguage();

  // Nömrə sahələri üçün validasiya
  const renderNumberValidation = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="validation.minValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("minValue")}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder={t("minValuePlaceholder")} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="validation.maxValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maxValue")}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder={t("maxValuePlaceholder")} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );

  // Mətn sahələri üçün validasiya
  const renderTextValidation = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="validation.minLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("minLength")}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder={t("minLengthPlaceholder")} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="validation.maxLength"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maxLength")}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder={t("maxLengthPlaceholder")} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="validation.pattern"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("pattern")}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t("patternPlaceholder")} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  // Validasiya tipini təyin edirik
  const renderValidationByType = () => {
    if (type === 'number') {
      return renderNumberValidation();
    }
    
    if (type === 'text' || type === 'textarea' || type === 'email' || type === 'url') {
      return renderTextValidation();
    }
    
    return <p>{t("noValidationForType")}</p>;
  };

  return (
    <div className="space-y-4">
      {renderValidationByType()}
    </div>
  );
};

export default ValidationFields;
