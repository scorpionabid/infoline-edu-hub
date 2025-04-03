
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData } from '@/types/user';
import { UserRole } from '@/types/supabase';

interface RegionSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
  isSuperAdmin: boolean;
  currentUserRole?: UserRole;
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
  
  // Only SuperAdmin or RegionAdmin need to pick a region
  // or if the role is regionadmin, sectoradmin or schooladmin
  const shouldShowRegion = !hideSection && 
    (isSuperAdmin || 
     currentUserRole === 'regionadmin' || 
     data.role === 'regionadmin' ||
     data.role === 'sectoradmin' ||
     data.role === 'schooladmin');
  
  if (!shouldShowRegion) {
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
            }}
            disabled={currentUserRole === 'regionadmin' && !!data.regionId}
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
