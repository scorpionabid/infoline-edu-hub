
import React, { useEffect, useState } from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguageSafe } from "@/context/LanguageContext";
import { RegionsContext } from "@/context/RegionsContext";
import { useRegionsContext } from "@/context/RegionsContext";
import { useControl } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sector } from "@/types/school";

interface SectorSectionProps {
  form: any;
  disabled?: boolean;
}

const SectorSection: React.FC<SectorSectionProps> = ({ form, disabled = false }) => {
  const { t } = useLanguageSafe();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regionId = form.watch("region_id");

  // Region seçildiyində sektorları yükləyək
  useEffect(() => {
    const fetchSectors = async () => {
      if (!regionId) {
        setSectors([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('*')
          .eq('region_id', regionId)
          .order('name', { ascending: true });

        if (error) throw new Error(error.message);
        
        setSectors(data || []);
      } catch (err: any) {
        console.error('Error fetching sectors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, [regionId]);

  return (
    <FormField
      control={form.control}
      name="sector_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("sector")}</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              // Sektoru seçəndə məktəbi sıfırlayırıq, çünki bir başqa sektora qeçdik
              form.setValue("school_id", "");
            }}
            value={field.value || ""}
            disabled={disabled || !regionId}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectSector")} />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("loading")}
                </div>
              ) : error ? (
                <div className="p-4 text-center text-destructive">{error}</div>
              ) : !sectors.length ? (
                <div className="p-4 text-center text-muted-foreground">
                  {regionId
                    ? t("noSectorsInRegion")
                    : t("pleaseSelectRegion")}
                </div>
              ) : (
                sectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};

export default SectorSection;
