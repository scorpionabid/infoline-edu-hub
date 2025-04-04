
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { UserRole } from '@/types/supabase';

interface SectorSectionProps {
  form: UseFormReturn<any>;
  data: any;
  onFormChange: (field: string, value: any) => void;
  filteredSectors: any[];
  isSuperAdmin?: boolean;
  currentUserRole?: UserRole;
  hideSection?: boolean;
}

const SectorSection: React.FC<SectorSectionProps> = ({
  form,
  data,
  onFormChange,
  filteredSectors,
  isSuperAdmin = false,
  currentUserRole,
  hideSection = false
}) => {
  const { t } = useLanguage();
  
  // İstifadəçi rolu əsasında sektor seçimini məhdudlaşdıraq
  const canSelectSector = isSuperAdmin || currentUserRole === 'superadmin' || currentUserRole === 'regionadmin';
  
  if (hideSection || (!canSelectSector && !data.sectorId && data.role !== 'sectoradmin')) {
    return null;
  }
  
  // Əgər region seçilməyibsə və sektorların sayı sıfırdırsa, sektoru göstərməyək
  if (!data.regionId && filteredSectors.length === 0) {
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
            value={field.value || ''}
            onValueChange={(value) => {
              field.onChange(value);
              onFormChange('sectorId', value);
            }}
            disabled={!canSelectSector && data.role !== 'sectoradmin'}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectSector')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {filteredSectors.map(sector => (
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
