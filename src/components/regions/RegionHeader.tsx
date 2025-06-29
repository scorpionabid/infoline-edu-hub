import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
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
  onResetFilters,
}) => {
  const { t } = useTranslation();

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


        <div className="w-full sm:w-[200px]">
          <Select
            value={selectedStatus || "all"}
            onValueChange={(value) =>
              onStatusChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("dashboard.filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("dashboard.allStatuses")}</SelectItem>
              <SelectItem value="active">{t("dashboard.active")}</SelectItem>
              <SelectItem value="inactive">{t("dashboard.inactive")}</SelectItem>
              <SelectItem value="blocked">{t("dashboard.blocked")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={onResetFilters}>
          {t("dashboard.resetFilters")}
        </Button>
      </div>
    </div>
  );
};

export default RegionHeader;
