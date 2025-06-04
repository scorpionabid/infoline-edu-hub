
import React, { useState, useEffect } from "react";
import { useFormContext, Control } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLanguageSafe } from "@/context/LanguageContext";
import { useRegionsContext } from "@/context/RegionsContext";
import { Sector } from "@/types/sector";
import { UserFormData } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

interface SectorSectionProps {
  disabled?: boolean;
}

const SectorSection: React.FC<SectorSectionProps> = ({ disabled = false }) => {
  const { t } = useLanguageSafe();
  const { regions } = useRegionsContext();
  const { getValues, setValue, watch } = useFormContext<UserFormData>();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);

  const regionId = watch("regionId");
  const sectorId = watch("sectorId");

  // fetchSectorsByRegion funksiyasını burada təyin edirik
  const fetchSectorsByRegion = async (regionId: string) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('region_id', regionId)
        .eq('status', 'active');

      if (error) throw error;
      
      // Type assertion to ensure status is correct type
      return (data || []).map(sector => ({
        ...sector,
        status: sector.status as 'active' | 'inactive'
      }));
    } catch (err) {
      console.error('Error fetching sectors:', err);
      return [];
    }
  };

  useEffect(() => {
    const loadSectors = async () => {
      if (regionId) {
        setLoading(true);
        try {
          const sectorsData = await fetchSectorsByRegion(regionId);
          setSectors(sectorsData);
          
          // If current sectorId doesn't exist in the new sectors list, reset it
          if (sectorId && !sectorsData.find(s => s.id === sectorId)) {
            setValue("sectorId", "");
          }
        } catch (err) {
          console.error("Error loading sectors:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setSectors([]);
        setValue("sectorId", "");
      }
    };
    
    loadSectors();
  }, [regionId, setValue, sectorId]);

  const handleRegionChange = (value: string) => {
    setValue("regionId", value);
    setValue("sectorId", ""); // Clear sector when region changes
    setValue("schoolId", ""); // Clear school when region changes
  };

  const handleSectorChange = (value: string) => {
    setValue("sectorId", value);
    setValue("schoolId", ""); // Clear school when sector changes
  };

  return (
    <div className="grid gap-4 mb-4">
      <div className="space-y-2">
        <Label htmlFor="regionId">{t("region")}</Label>
        <Select
          value={getValues("regionId") || ""}
          onValueChange={handleRegionChange}
          disabled={disabled}
        >
          <SelectTrigger id="regionId">
            <SelectValue placeholder={t("selectRegion")} />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id || `region-${region.name || Math.random().toString(36).substring(7)}`}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sectorId">{t("sector")}</Label>
        <Select
          value={getValues("sectorId") || ""}
          onValueChange={handleSectorChange}
          disabled={disabled || loading || !regionId}
        >
          <SelectTrigger id="sectorId">
            <SelectValue placeholder={loading ? t("loading") : t("selectSector")} />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((sector, index) => (
              <SelectItem key={sector.id || `sector-${index}`} value={sector.id || `sector-${sector.name || index}-${Math.random().toString(36).substring(7)}`}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SectorSection;
