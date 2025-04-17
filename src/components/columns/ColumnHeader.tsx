import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, X, ChevronDown, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { useRole } from "@/context/auth/useRole";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ColumnHeaderProps {
  onAddColumn: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categories: { id: string; name: string }[];
  onExportTemplate: () => void;
  onImportColumns: () => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  onAddColumn,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  categories,
  onExportTemplate,
  onImportColumns,
}) => {
  const { t } = useLanguage();
  const canManageColumns = useRole(["superadmin", "regionadmin"]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("columns")}</h1>
        {canManageColumns && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={onExportTemplate}>
              <FileDown className="mr-2 h-4 w-4" />
              {t("exportTemplate")}
            </Button>
            <Button variant="outline" onClick={onImportColumns}>
              <FileUp className="mr-2 h-4 w-4" />
              {t("importColumns")}
            </Button>
            <Button onClick={onAddColumn}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addColumn")}
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchColumns")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <Select 
            value={categoryFilter} 
            onValueChange={onCategoryFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("categoryFilter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={typeFilter} 
            onValueChange={onTypeFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("typeFilter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTypes")}</SelectItem>
              <SelectItem value="text">{t("text")}</SelectItem>
              <SelectItem value="number">{t("number")}</SelectItem>
              <SelectItem value="date">{t("date")}</SelectItem>
              <SelectItem value="select">{t("select")}</SelectItem>
              <SelectItem value="checkbox">{t("checkbox")}</SelectItem>
              <SelectItem value="radio">{t("radio")}</SelectItem>
              <SelectItem value="file">{t("file")}</SelectItem>
              <SelectItem value="image">{t("image")}</SelectItem>
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

export default ColumnHeader;
