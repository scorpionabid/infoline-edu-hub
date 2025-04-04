
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

interface RegionSectionProps {
  form: UseFormReturn<any>;
  data: any;
  onFormChange: (field: string, value: any) => void;
  regions: any[];
  isSuperAdmin?: boolean;
  currentUserRole?: UserRole;
  hideSection?: boolean;
}

const RegionSection: React.FC<RegionSectionProps> = ({
  form,
  data,
  onFormChange,
  regions,
  isSuperAdmin = false,
  currentUserRole,
  hideSection = false
}) => {
  const { t } = useLanguage();
  
  // Istifadəçi rolu əsasında region seçimini məhdudlaşdıraq
  const canSelectRegion = isSuperAdmin || currentUserRole === 'superadmin';
  
  if (hideSection || (!canSelectRegion && !data.regionId && data.role !== 'regionadmin')) {
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
            value={field.value || ''}
            onValueChange={(value) => {
              field.onChange(value);
              onFormChange('regionId', value);
            }}
            disabled={!canSelectRegion && data.role !== 'regionadmin'}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('selectRegion')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {regions.map(region => (
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
