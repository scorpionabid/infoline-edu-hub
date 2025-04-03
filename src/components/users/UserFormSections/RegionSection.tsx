
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData } from '@/types/user';

interface RegionSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
  regions: { id: string; name: string }[];
  hideSection?: boolean;
}

const RegionSection: React.FC<RegionSectionProps> = ({
  form,
  data,
  onFormChange,
  regions,
  hideSection = false,
}) => {
  const { t } = useLanguage();

  if (hideSection || data.role === 'superadmin') {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="regionId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('region')}</FormLabel>
          <Select
            value={data.regionId || "none"}
            onValueChange={(value) => {
              field.onChange(value === "none" ? undefined : value);
              onFormChange('regionId', value === "none" ? undefined : value);
              // Reset sector and school when region changes
              if (data.sectorId) {
                onFormChange('sectorId', undefined);
              }
              if (data.schoolId) {
                onFormChange('schoolId', undefined);
              }
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectRegion')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">{t('selectRegion')}</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RegionSection;
