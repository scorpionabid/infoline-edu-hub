
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from 'react-hook-form';
import { ColumnType, COLUMN_TYPE_DEFINITIONS } from '@/types/column';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ValidationFieldsProps {
  control: Control<any>;
}

// Bu komponent sütunların validasiya qaydalarını konfiqurasiya etmək üçündür
const ValidationFields: React.FC<ValidationFieldsProps> = ({ control }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible defaultValue="numericValidation">
        <AccordionItem value="numericValidation">
          <AccordionTrigger>{t('numericValidation')}</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <FormField
                control={control}
                name="validation.minValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('minValue')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('enterMinValue')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('minValueDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="validation.maxValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('maxValue')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('enterMaxValue')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('maxValueDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="textValidation">
          <AccordionTrigger>{t('textValidation')}</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <FormField
                control={control}
                name="validation.minLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('minLength')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('enterMinLength')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('minLengthDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={control}
                name="validation.maxLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('maxLength')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('enterMaxLength')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('maxLengthDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="patternValidation">
          <AccordionTrigger>{t('patternValidation')}</AccordionTrigger>
          <AccordionContent>
            <FormField
              control={control}
              name="validation.pattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pattern')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('enterPattern')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('patternDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ValidationFields;
