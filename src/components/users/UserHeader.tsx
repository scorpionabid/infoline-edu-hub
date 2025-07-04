import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, UserCheck, UserX } from "lucide-react";
import { UserRole } from "@/types/user";
import { useTranslation } from "@/contexts/TranslationContext";

type EntityType = "region" | "sector" | "school";

interface UserHeaderProps {
  entityTypes: EntityType[];
  onUserAddedOrEdited: () => void;
  currentFilter?: {
    search?: string;
    role?: string | string[];
    status?: string | string[];
    regionId?: string;
    sectorId?: string;
    schoolId?: string;
  };
  onFilterChange?: (filter: any) => void;
  onAddUser?: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  entityTypes = [],
  onUserAddedOrEdited,
  currentFilter = {},
  onFilterChange = () => {},
  onAddUser = () => {},
}) => {
  const safeEntityTypes = Array.isArray(entityTypes) ? entityTypes : [];
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (
    key: string,
    value: string | string[] | undefined,
  ) => {
    console.log(`🔧 UserHeader: Filter change - ${key}:`, value);
    
    const newFilter = {
      ...currentFilter,
      [key]: value || undefined,
    };
    
    console.log('🔧 UserHeader: New filter object:', newFilter);
    onFilterChange(newFilter);
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const handleAddUser = () => {
    onAddUser();
    onUserAddedOrEdited();
  };

  const userRoles = [
    "superadmin",
    "regionadmin",
    "sectoradmin",
    "schooladmin",
  ] as const;
  const userStatuses = ["active", "inactive"] as const;

  const getArrayFromFilter = (
    value: string | string[] | undefined,
  ): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  const getFirstFromFilter = (value: string | string[] | undefined): string => {
    if (!value) return "";
    if (Array.isArray(value)) return value[0] || "";
    return value;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("navigation.users")}</h1>
          <p className="text-muted-foreground">{t("users.usersDescription")}</p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          {t("userManagement.add_user") || "İstifadəçi əlavə et"}
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center space-x-4">
        <Tabs 
          value={getFirstFromFilter(currentFilter.status) || "active"} 
          onValueChange={(value) => {
            const filterValue = value === "all" ? undefined : value;
            handleFilterChange("status", filterValue);
          }}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              {t("users.activeUsers") || "Aktiv İstifadəçilər"}
            </TabsTrigger>
            <TabsTrigger value="inactive" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              {t("users.inactiveUsers") || "Deaktiv İstifadəçilər"}
            </TabsTrigger>
            <TabsTrigger value="all">
              {t("users.allUsers") || "Bütün İstifadəçilər"}
            </TabsTrigger>
            <TabsTrigger value="deleted" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              {t("users.deletedUsers") || "Silinmiš İstifadəçilər"}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("users.searchUsers")}
            value={currentFilter?.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          {t("users.filters")}
        </Button>
        {((currentFilter.role && currentFilter.role.length > 0) ||
          (currentFilter.status && currentFilter.status.length > 0) ||
          currentFilter.schoolId) && (
          <Button variant="ghost" onClick={clearFilters}>
            {t("users.clearFilters")}
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("users.role")}
            </label>
            <Select
              value={
                Array.isArray(currentFilter?.role)
                  ? currentFilter.role[0] || ""
                  : currentFilter?.role || ""
              }
              onValueChange={(value) => {
                // "all_roles" seçildikdə rol filteri təmizlə
                const filterValue = value === 'all_roles' ? undefined : value;
                handleFilterChange("role", filterValue);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("users.selectRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_roles">{t("users.allRoles")}</SelectItem>
                {userRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {t(`roles.${role}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("common.status")}
            </label>
            <Select
              value={getFirstFromFilter(currentFilter.status)}
              onValueChange={(value) => {
                // "all_statuses" seçildikdə status filteri təmizlə
                const filterValue = value === 'all_statuses' ? undefined : value;
                handleFilterChange("status", filterValue);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("users.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">{t("users.allStatuses")}</SelectItem>
                {userStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`common.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("users.school")}
            </label>
            {safeEntityTypes
              .filter((t) => t === "school" || t === "sector")
              .map((type) => (
                <Input
                  key={type}
                  placeholder={t("users.schoolId")}
                  value={currentFilter.schoolId || ""}
                  onChange={(e) =>
                    handleFilterChange("schoolId", e.target.value)
                  }
                />
              ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {getArrayFromFilter(currentFilter?.role).map((role) => (
          <div
            key={role}
            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center"
          >
            {t("users.role")}: {t(`roles.${role}`)}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0"
              onClick={() => {
                const currentRoles = getArrayFromFilter(currentFilter?.role);
                const newRoles = currentRoles.filter((r: string) => r !== role);
                handleFilterChange(
                  "role",
                  newRoles.length ? newRoles : undefined,
                );
              }}
            >
              ×
            </Button>
          </div>
        ))}

        {getArrayFromFilter(currentFilter?.status).map((status) => (
          <div
            key={status}
            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center"
          >
            {t("common.status")}: {t(`common.${status.toLowerCase()}`)}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0"
              onClick={() => {
                const currentStatuses = getArrayFromFilter(
                  currentFilter?.status,
                );
                const newStatuses = currentStatuses.filter(
                  (s: string) => s !== status,
                );
                handleFilterChange(
                  "status",
                  newStatuses.length ? newStatuses : undefined,
                );
              }}
            >
              ×
            </Button>
          </div>
        ))}

        {currentFilter?.schoolId && (
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
            {t("users.school")}: {currentFilter.schoolId}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0"
              onClick={() => handleFilterChange("schoolId", undefined)}
            >
              ×
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHeader;
