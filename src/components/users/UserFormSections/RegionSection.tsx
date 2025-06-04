
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
                {regions.map((region) => {
                  // Ensure region has valid ID and value is never empty
                  const regionId = region.id && String(region.id).trim() 
                    ? String(region.id).trim() 
                    : `region-${region.name || Math.random().toString(36).substring(7)}`;
                  
                  return (
                    <SelectItem key={regionId} value={regionId}>
                      {region.name || 'Unknown Region'}
                    </SelectItem>
                  );
                })}
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
