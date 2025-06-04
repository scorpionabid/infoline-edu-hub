
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ColumnFormValues } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

interface ColumnAdvancedSettingsProps {
  control: Control<ColumnFormValues>;
}

const ColumnAdvancedSettings: React.FC<ColumnAdvancedSettingsProps> = ({ control }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="is_required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">{t('required')}</FormLabel>
              <div className="text-sm text-muted-foreground">
                {t('makeFieldRequired')}
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="default_value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('defaultValue')}</FormLabel>
            <FormControl>
              <Input placeholder={t('enterDefaultValue')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="order_index"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('displayOrder')}</FormLabel>
            <FormControl>
              <Input 
                type="number"
                placeholder="0"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ColumnAdvancedSettings;
