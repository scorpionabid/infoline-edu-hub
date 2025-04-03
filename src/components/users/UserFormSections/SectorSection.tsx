
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData } from '@/types/user';
import { UserRole } from '@/types/supabase';

interface SectorSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
  filteredSectors: { id: string; name: string }[];
  hideSection?: boolean;
}

const SectorSection: React.FC<SectorSectionProps> = ({
  form,
  data,
  onFormChange,
  filteredSectors,
  hideSection = false,
}) => {
  const { t } = useLanguage();
  
  // Don't show sector for superadmin or if region is not selected or if section is hidden
  if (hideSection || data.role === 'superadmin' || data.role === 'regionadmin' || !data.regionId) {
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
              // Reset school when sector changes
              if (data.schoolId) {
                onFormChange('schoolId', undefined);
              }
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
