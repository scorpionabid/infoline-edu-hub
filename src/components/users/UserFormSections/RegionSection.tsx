
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
  
  const shouldShowRegion = !hideSection && (
    data.role === 'regionadmin' || 
    data.role === 'sectoradmin' || 
    data.role === 'schooladmin'
  );
  
  if (!shouldShowRegion) {
    return null;
  }
  
  // SuperAdmin can select region freely
  // RegionAdmin is limited to their own region
  const isRegionSelectable = isSuperAdmin || 
    (currentUserRole === 'regionadmin' && data.role !== 'regionadmin');
  
  // If currentUserRole is regionadmin, they can only assign users to their own region
  const currentUserRegionId = form.getValues('regionId');
  
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
              const newValue = value === "none" ? undefined : value;
              field.onChange(newValue);
              onFormChange('regionId', newValue);
              
              // Clear sector and school when region changes
              if (data.sectorId) {
                onFormChange('sectorId', undefined);
              }
              if (data.schoolId) {
                onFormChange('schoolId', undefined);
              }
            }}
            disabled={!isRegionSelectable}
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
