
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/region';
import { Control } from 'react-hook-form';

interface RegionSectionProps {
  control: Control<any>;
  regions: Region[];
  disabled?: boolean;
}

const RegionSection: React.FC<RegionSectionProps> = ({
  control,
  regions,
  disabled = false,
}) => {
  const { t } = useLanguage();

  return (
    <FormField
      control={control}
      name="region_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('region')}</FormLabel>
          <FormControl>
            <Select
              value={field.value || ''}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectRegion')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('selectRegion')}</SelectItem>
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
};

export default RegionSection;
