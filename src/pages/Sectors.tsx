import React, { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "@/contexts/TranslationContext";
import { useSectorsStore, type EnhancedSector } from "@/hooks/useSectorsStore";
import SectorsContainer from "@/components/sectors/SectorsContainer";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RefreshResult {
  sectors: EnhancedSector[];
  regions: any[];
}

const Sectors = () => {
  const { t } = useTranslation();
  const { sectors, loading, error, refetch: storeRefetch } = useSectorsStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const refetch = useCallback(async (): Promise<RefreshResult> => {
    try {
      console.log("Məlumatlar yenilənir...");
      const result = await storeRefetch();

      const enhancedSectors = result.sectors.map((sector) => ({
        ...sector,
        status:
          sector.status === "inactive"
            ? ("inactive" as const)
            : ("active" as const),
      }));

      console.log("Məlumatlar uğurla yeniləndi", {
        sectorsCount: enhancedSectors.length,
        regionsCount: result.regions?.length,
      });

      return {
        sectors: enhancedSectors,
        regions: result.regions || [],
      };
    } catch (error) {
      console.error("Xəta baş verdi:", error);
      throw error;
    }
  }, [storeRefetch]);

  useEffect(() => {
    if (isInitialLoad) {
      console.log("İlkin məlumatlar yüklənir...");
      const loadData = async () => {
        try {
          await refetch();
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
  }, [isInitialLoad, refetch]);

  useEffect(() => {
    if (error && !isInitialLoad) {
      console.error("Səhifə xətası:", error);
      toast.error(error);
    }
  }, [error, isInitialLoad]);

  if (isInitialLoad) {
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
          onRefresh={refetch}
        />
      </div>
      
      {/* Debug Panel - Müvəqqəti */}

    </>
  );
};

export default Sectors;
