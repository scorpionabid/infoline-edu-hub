
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ColumnFormValues } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

interface ColumnBasicFieldsProps {
  control: Control<ColumnFormValues>;
}

const ColumnBasicFields: React.FC<ColumnBasicFieldsProps> = ({ control }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('columnName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('enterColumnName')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('placeholder')}</FormLabel>
            <FormControl>
              <Input placeholder={t('enterPlaceholder')} {...field} />
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
            <FormLabel>{t('helpText')}</FormLabel>
            <FormControl>
              <Textarea 
                placeholder={t('enterHelpText')}
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ColumnBasicFields;
