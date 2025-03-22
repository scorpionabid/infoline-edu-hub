
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRole } from "@/context/AuthContext";

interface CategoryHeaderProps {
  onAddCategory: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  assignmentFilter: string;
  onAssignmentFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  onAddCategory,
  searchQuery,
  onSearchChange,
  assignmentFilter,
  onAssignmentFilterChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const { t } = useLanguage();
  const canManageCategories = useRole(["superadmin", "regionadmin"]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("categories")}</h1>
        {canManageCategories && (
          <Button onClick={onAddCategory}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addCategory")}
          </Button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchCategories")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <Select 
            value={assignmentFilter} 
            onValueChange={onAssignmentFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("assignmentFilter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allAssignments")}</SelectItem>
              <SelectItem value="sectors">{t("sectorsOnly")}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={statusFilter} 
            onValueChange={onStatusFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("statusFilter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              <SelectItem value="active">{t("activeOnly")}</SelectItem>
              <SelectItem value="inactive">{t("inactiveOnly")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader;
