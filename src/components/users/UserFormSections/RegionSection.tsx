import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData } from '@/types/user';
import { Region } from '@/types/supabase';
import { Role } from '@/context/auth/types';

interface RegionSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
  isSuperAdmin: boolean;
  currentUserRole?: Role;
  regions: { id: string; name: string }[];
  hideSection?: boolean;
}

const RegionSection: React.FC<RegionSectionProps> = ({
  form,
  data,
  onFormChange,
  isSuperAdmin,
  currentUserRole,
  regions,
  hideSection = false,
}) => {
  const { t } = useLanguage();

  if (hideSection || !(isSuperAdmin && (data.role === 'regionadmin' || data.role === 'sectoradmin' || data.role === 'schooladmin'))) {
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
            value={data.region_id || "none"}
            onValueChange={(value) => {
              field.onChange(value === "none" ? null : value);
              onFormChange('region_id', value === "none" ? null : value);
            }}
            disabled={(!isSuperAdmin && currentUserRole !== 'regionadmin') || regions.length === 0}
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
