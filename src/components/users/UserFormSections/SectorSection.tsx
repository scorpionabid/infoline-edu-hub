
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
}

const SectorSection: React.FC<SectorSectionProps> = ({
  form,
  data,
  onFormChange,
  isSuperAdmin,
  currentUserRole,
  filteredSectors,
}) => {
  const { t } = useLanguage();

  if (!(((isSuperAdmin && data.regionId) || (currentUserRole === 'regionadmin')) &&
       (data.role === 'sectoradmin' || data.role === 'schooladmin'))) {
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
            value={data.sectorId || "none"}
            onValueChange={(value) => {
              field.onChange(value === "none" ? undefined : value);
              onFormChange('sectorId', value === "none" ? undefined : value);
            }}
            disabled={filteredSectors.length === 0}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectSector')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">{t('selectSector')}</SelectItem>
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
