
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/contexts/TranslationContext";
import { FilterOption, UserFilter } from "./UserSelectParts/types";

interface UserFiltersProps {
  filter: UserFilter;
  setFilter: React.Dispatch<React.SetStateAction<UserFilter>>;
  roleOptions: FilterOption[];
  statusOptions: FilterOption[];
  onSearch: () => void;
  regions?: FilterOption[];
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filter = {},
  setFilter,
  roleOptions = [],
  statusOptions = [],
  onSearch,
  regions = [],
}) => {
  const { t } = useTranslation();

  // Ensure filter is not undefined before accessing properties
  const safeFilter: UserFilter = filter || {};

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ ...safeFilter, search: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFilter({ ...safeFilter, role: value });
  };

  const handleStatusChange = (value: string) => {
    setFilter({ ...safeFilter, status: value });
  };

  const handleRegionChange = (value: string) => {
    setFilter({ ...safeFilter, region_id: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  // Safely access filter properties with fallbacks
  const currentRole = safeFilter.role || "";
  const currentStatus = safeFilter.status || "";
  const currentRegionId = safeFilter.region_id || "";

  return (
    <div className="space-y-4 mb-4">
      {/* Search Input - Full width on mobile */}
      <div className="w-full">
        <Input
          placeholder={t("searchByNameOrEmail")}
          value={safeFilter.search || ""}
          onChange={handleSearchTermChange}
          onKeyDown={handleKeyDown}
          className="w-full"
        />
      </div>

      {/* Filter Selects - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select value={currentRole} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("role")} />
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectItem value="all_roles">{t("allRoles")}</SelectItem>
            {roleOptions.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("status")} />
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectItem value="all_statuses">{t("allStatuses")}</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {regions && regions.length > 0 && (
          <Select value={currentRegionId} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("region")} />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all_regions">{t("allRegions")}</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button onClick={onSearch} className="w-full">
          {t("search")}
        </Button>
      </div>
    </div>
  );
};

export default UserFilters;
