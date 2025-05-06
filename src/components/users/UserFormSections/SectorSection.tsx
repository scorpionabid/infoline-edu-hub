
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { useRegions } from '@/context/RegionsContext';
import { UserFormData } from '@/types/user';
import { supabase } from '@/lib/supabase';
import { Sector } from '@/types/sector';

interface SectorSectionProps {
  formData: UserFormData;
  onChange: (name: string, value: any) => void;
  isDisabled?: boolean;
}

export const SectorSection: React.FC<SectorSectionProps> = ({
  formData,
  onChange,
  isDisabled
}) => {
  const { t } = useLanguage();
  const { regions } = useRegions();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Region_id dəyəri dəyişdikdə, sektorları yüklə
  useEffect(() => {
    if (formData.region_id) {
      fetchSectors(formData.region_id);
    } else {
      setSectors([]);
    }
  }, [formData.region_id]);
  
  // Sektorları yükləmək üçün funksiya
  const fetchSectors = async (regionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('region_id', regionId)
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setSectors(data || []);
    } catch (error) {
      console.error('Sektorları yükləyərkən xəta:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="region_id">{t('region')}</Label>
          <Select
            value={formData.region_id || ""}
            onValueChange={(value) => onChange('region_id', value)}
            disabled={isDisabled}
          >
            <SelectTrigger id="region_id">
              <SelectValue placeholder={t('selectRegion')} />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sector_id">{t('sector')}</Label>
          <Select
            value={formData.sector_id || ""}
            onValueChange={(value) => onChange('sector_id', value)}
            disabled={isDisabled || loading || sectors.length === 0 || !formData.region_id}
          >
            <SelectTrigger id="sector_id">
              <SelectValue placeholder={t('selectSector')} />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!formData.region_id && (
            <p className="text-sm text-muted-foreground">{t('selectRegionFirst')}</p>
          )}
          {formData.region_id && sectors.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">{t('noSectorsInRegion')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorSection;
