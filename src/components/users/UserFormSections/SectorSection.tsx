
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData } from '@/types/user';
import { Role } from '@/context/AuthContext';

interface SectorSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
  isSuperAdmin: boolean;
  currentUserRole?: Role;
  filteredSectors: { id: string; name: string }[];
  hideSection?: boolean;
}

const SectorSection: React.FC<SectorSectionProps> = ({
  form,
  data,
  onFormChange,
  isSuperAdmin,
  currentUserRole,
  filteredSectors,
  hideSection = false,
}) => {
  const { t } = useLanguage();

  const shouldShow = !hideSection && 
    (((isSuperAdmin && data.regionId) || (currentUserRole === 'regionadmin')) &&
    (data.role === 'sectoradmin' || data.role === 'schooladmin'));

  if (!shouldShow) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="sectorId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('sector')}</FormLabel>
          <Select
            value={data.sectorId || ""}
            onValueChange={(value) => {
              field.onChange(value);
              onFormChange('sectorId', value);
            }}
            disabled={filteredSectors.length === 0}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectSector')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">{t('selectSector')}</SelectItem>
              {filteredSectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
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

export default SectorSection;
