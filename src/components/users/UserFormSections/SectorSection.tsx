
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData } from '@/types/user';
import { Role } from '@/context/auth/types';
import { supabase } from '@/lib/supabase';
import { useRegions } from '@/context/RegionsContext';
import { Sector } from '@/types/sector';

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
  const { regions } = useRegions();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  
  const regionId = form.watch('region_id');
  
  // regionId değiştiğinde sektörleri yükle
  useEffect(() => {
    async function fetchSectors() {
      if (regionId) {
        setLoading(true);
        try {
          const { data } = await supabase
            .from('sectors')
            .select('*')
            .eq('region_id', regionId)
            .eq('status', 'active');
          
          setSectors(data || []);
        } catch (error) {
          console.error('Error fetching sectors:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSectors([]);
      }
    }
    
    fetchSectors();
  }, [regionId]);
  
  const shouldShow = !hideSection && 
    (((isSuperAdmin && data.region_id) || (currentUserRole === 'regionadmin')) &&
    (data.role === 'sectoradmin' || data.role === 'schooladmin'));

  const isFiltering = !!data.region_id;

  if (!shouldShow) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="sector_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('sector')}</FormLabel>
          <Select
            value={data.sector_id || "none"}
            onValueChange={(value) => {
              field.onChange(value === "none" ? null : value);
              onFormChange('sector_id', value === "none" ? null : value);
            }}
            disabled={!isFiltering || filteredSectors.length === 0}
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
              {filteredSectors.length === 0 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  {t('noSectorsFound') || 'Sektor tapılmadı'}
                </div>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SectorSection;
