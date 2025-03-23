
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileSpreadsheet, HelpCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRole } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CategoryHeaderProps {
  onAddCategory: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  assignmentFilter?: string;
  onAssignmentFilterChange?: (value: string) => void;
  onImportExport?: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  onAddCategory,
  searchQuery,
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  assignmentFilter = "all",
  onAssignmentFilterChange,
  onImportExport,
}) => {
  const { t } = useLanguage();
  const canManageCategories = useRole(["superadmin", "regionadmin"]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("categories")}</h1>
          <p className="text-muted-foreground">{t("categoriesDescription") || "Kateqoriyaları idarə edin"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageCategories && onImportExport && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={onImportExport}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {t("importExport")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("importExportCategoriesDesc")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {canManageCategories && (
            <Button onClick={onAddCategory}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addCategory")}
            </Button>
          )}
        </div>
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
        
        {onStatusFilterChange && (
          <Select
            value={statusFilter}
            onValueChange={onStatusFilterChange}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t("filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              <SelectItem value="active">{t("active")}</SelectItem>
              <SelectItem value="inactive">{t("inactive")}</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        {onAssignmentFilterChange && (
          <Select
            value={assignmentFilter}
            onValueChange={onAssignmentFilterChange}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={t("filterByAssignment")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allAssignments")}</SelectItem>
              <SelectItem value="all-users">{t("allUsers")}</SelectItem>
              <SelectItem value="sectors">{t("sectorsOnly")}</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>{t("categoriesHelpText") || "Kateqoriyalar haqqında məlumat"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default CategoryHeader;
