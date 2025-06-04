
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/region';
import { Control, FieldValues, Path } from 'react-hook-form';

interface RegionSectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name?: Path<TFieldValues>;
  regions: Region[];
  disabled?: boolean;
}

function RegionSection<TFieldValues extends FieldValues>({
  control,
  name = 'region_id' as Path<TFieldValues>,
  regions,
  disabled = false,
}: RegionSectionProps<TFieldValues>) {
  const { t } = useLanguage();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('region')}</FormLabel>
          <FormControl>
            <Select
              value={field.value || 'NONE'}
              onValueChange={(value) => field.onChange(value === 'NONE' ? null : value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectRegion')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">{t('selectRegion')}</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default RegionSection;
