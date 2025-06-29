import React, { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "@/contexts/TranslationContext";
import useSectorsQuery from "@/hooks/sectors/useSectorsQuery";
import useRegionsQuery from "@/hooks/regions/useRegionsQuery";
import { Sector } from "@/hooks/sectors/useSectors";
import SectorsContainer from "@/components/sectors/SectorsContainer";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RefreshResult {
  sectors: Sector[];
  regions: any[];
}

// Genişləndirilmiş sector tipi
type EnhancedSector = Sector & {
  status: "active" | "inactive";
};

interface RefreshData {
  sectors: EnhancedSector[];
  regions: any[];
}

const Sectors = () => {
  const { t } = useTranslation();
  const { sectors, loading, error, refetch } = useSectorsQuery();
  const { regions, isLoading: regionsLoading, refetch: refetchRegions } = useRegionsQuery();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const refreshData = useCallback(async (): Promise<RefreshData> => {
    try {
      console.log("Məlumatlar yenilənir...");
      await refetch();
      await refetchRegions();

      const enhancedSectors = sectors.map((sector) => ({
        ...sector,
        status:
          sector.status === "inactive"
            ? ("inactive" as const)
            : ("active" as const),
      }));

      console.log("Məlumatlar uğurla yeniləndi", {
        sectorsCount: enhancedSectors.length,
        regionsCount: regions.length
      });

      return {
        sectors: enhancedSectors,
        regions: regions || [],
      };
    } catch (error) {
      console.error("Xəta baş verdi:", error);
      throw error;
    }
  }, [refetch, refetchRegions, sectors, regions]);

  useEffect(() => {
    if (isInitialLoad) {
      console.log("İlkin məlumatlar yüklənir...");
      const loadData = async () => {
        try {
          await refetch();
          await refetchRegions();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Naməlum xəta";
          toast.error("Məlumatlar yüklənərkən xəta baş verdi: " + errorMessage);
        } finally {
          setIsInitialLoad(false);
        }
      };
      loadData();
    }
  }, [isInitialLoad, refetch, refetchRegions]);

  useEffect(() => {
    if (error && !isInitialLoad) {
      console.error("Səhifə xətası:", error);
      toast.error(error);
    }
  }, [error, isInitialLoad]);

  if (isInitialLoad || loading || regionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("navigation.sectors")} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6">
        <SectorsContainer
          sectors={sectors}
          isLoading={loading}
          onRefresh={refreshData}
        />
      </div>
      
      {/* Debug Panel - Müvəqqəti */}

    </>
  );
};

export default Sectors;
