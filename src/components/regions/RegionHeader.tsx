
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

interface RegionHeaderProps {
  onAddRegion: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  onResetFilters: () => void;
}

const RegionHeader: React.FC<RegionHeaderProps> = ({
  onAddRegion,
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onResetFilters
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t("regions")}</h1>
        <Button variant="default" onClick={onAddRegion}>
          <PlusIcon className="h-4 w-4 mr-2" />
          {t("addRegion")}
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={t("searchRegions")}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="w-full sm:w-[200px]">
          <Select
            value={selectedStatus || ""}
            onValueChange={(value) => onStatusChange(value === "" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("allStatuses")}</SelectItem>
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

export default RegionHeader;
