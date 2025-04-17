
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from "@/components/ui/button";
import { PlusIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegions } from '@/hooks/useRegions';
import { useAuth } from '@/context/auth';
import { Loader2 } from 'lucide-react';

interface SectorHeaderProps {
  onAddSector: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  onResetFilters: () => void;
}

const SectorHeader: React.FC<SectorHeaderProps> = ({
  onAddSector,
  searchTerm,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedStatus,
  onStatusChange,
  onResetFilters
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { regions, loading: regionsLoading } = useRegions();

  // İstifadəçi regionadmin isə, region seçimi bağlıdır
  const isRegionFixed = user?.role === 'regionadmin' && !!user?.regionId;

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t("sectors")}</h1>
        <Button variant="default" onClick={onAddSector}>
          <PlusIcon className="h-4 w-4 mr-2" />
          {t("addSector")}
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={t("searchSectors")}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        {!isRegionFixed && (
          <div className="w-full sm:w-[200px]">
            <Select
              value={selectedRegion || "all"}
              onValueChange={onRegionChange}
              disabled={regionsLoading || isRegionFixed}
            >
              <SelectTrigger>
                {regionsLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>{t('loading') || 'Yüklənir...'}</span>
                  </div>
                ) : (
                  <SelectValue placeholder={t("selectRegion") || 'Region seçin'} />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allRegions") || 'Bütün regionlar'}</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="w-full sm:w-[200px]">
          <Select
            value={selectedStatus || "all"}
            onValueChange={(value) => onStatusChange(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              <SelectItem value="active">{t("active")}</SelectItem>
              <SelectItem value="inactive">{t("inactive")}</SelectItem>
              <SelectItem value="blocked">{t("blocked")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={onResetFilters}>
          {t("resetFilters")}
        </Button>
      </div>
    </div>
  );
};

export default SectorHeader;
