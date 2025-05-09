
import React, { useState, useEffect } from "react";
import { useFormContext, Control } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLanguageSafe } from "@/context/LanguageContext";
import { useRegionsContext } from "@/context/RegionsContext";
import { Sector } from "@/types/school";
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

  const regionId = watch("region_id");
  const sectorId = watch("sector_id");

  // fetchSectorsByRegion funksiyasını burada təyin edirik
  const fetchSectorsByRegion = async (regionId: string) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('region_id', regionId)
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
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
            setValue("sector_id", "");
          }
        } catch (err) {
          console.error("Error loading sectors:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setSectors([]);
        setValue("sector_id", "");
      }
    };
    
    loadSectors();
  }, [regionId, setValue, sectorId]);

  const handleRegionChange = (value: string) => {
    setValue("region_id", value);
    setValue("sector_id", ""); // Clear sector when region changes
    setValue("school_id", ""); // Clear school when region changes
  };

  const handleSectorChange = (value: string) => {
    setValue("sector_id", value);
    setValue("school_id", ""); // Clear school when sector changes
  };

  return (
    <div className="grid gap-4 mb-4">
      <div className="space-y-2">
        <Label htmlFor="region_id">{t("region")}</Label>
        <Select
          value={getValues("region_id") || ""}
          onValueChange={handleRegionChange}
          disabled={disabled}
        >
          <SelectTrigger id="region_id">
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
        <Label htmlFor="sector_id">{t("sector")}</Label>
        <Select
          value={getValues("sector_id") || ""}
          onValueChange={handleSectorChange}
          disabled={disabled || loading || !regionId}
        >
          <SelectTrigger id="sector_id">
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
