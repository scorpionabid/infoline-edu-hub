
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileDown, FileUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRole } from "@/context/AuthContext";

interface ColumnHeaderProps {
  categoryName?: string;
  onAddColumn?: () => void;
  onImportColumns?: () => void;
  onExportColumns?: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (value: string) => void;
  typeFilter?: string;
  onTypeFilterChange?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  categories?: { id: string; name: string }[];
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  categoryName = "Sütunlar",
  onAddColumn,
  onImportColumns,
  onExportColumns,
  searchQuery = "",
  onSearchChange,
  categoryFilter = "all",
  onCategoryFilterChange,
  typeFilter = "all",
  onTypeFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
  categories = [],
}) => {
  const { t } = useLanguage();
  const canManageColumns = useRole(["superadmin", "regionadmin"]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{categoryName}</h1>
        {canManageColumns && (
          <div className="flex gap-2">
            {onExportColumns && (
              <Button variant="outline" onClick={onExportColumns}>
                <FileDown className="mr-2 h-4 w-4" />
                {t("exportTemplate") || "İxrac et"}
              </Button>
            )}
            {onImportColumns && (
              <Button variant="outline" onClick={onImportColumns}>
                <FileUp className="mr-2 h-4 w-4" />
                {t("importColumns") || "İdxal et"}
              </Button>
            )}
            {onAddColumn && (
              <Button onClick={onAddColumn}>
                <Plus className="mr-2 h-4 w-4" />
                {t("addColumn") || "Sütun əlavə et"}
              </Button>
            )}
          </div>
        )}
      </div>
      
      {onSearchChange && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchColumns") || "Sütunları axtar"}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-2">
            {onCategoryFilterChange && categories.length > 0 && (
              <Select 
                value={categoryFilter} 
                onValueChange={onCategoryFilterChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("categoryFilter") || "Kateqoriya"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories") || "Bütün kateqoriyalar"}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {onTypeFilterChange && (
              <Select 
                value={typeFilter} 
                onValueChange={onTypeFilterChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("typeFilter") || "Tip"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allTypes") || "Bütün tiplər"}</SelectItem>
                  <SelectItem value="text">{t("text") || "Mətn"}</SelectItem>
                  <SelectItem value="number">{t("number") || "Rəqəm"}</SelectItem>
                  <SelectItem value="date">{t("date") || "Tarix"}</SelectItem>
                  <SelectItem value="select">{t("select") || "Seçim"}</SelectItem>
                  <SelectItem value="checkbox">{t("checkbox") || "Checkbox"}</SelectItem>
                  <SelectItem value="radio">{t("radio") || "Radio"}</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {onStatusFilterChange && (
              <Select 
                value={statusFilter} 
                onValueChange={onStatusFilterChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("statusFilter") || "Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses") || "Bütün statuslar"}</SelectItem>
                  <SelectItem value="active">{t("activeOnly") || "Aktiv"}</SelectItem>
                  <SelectItem value="inactive">{t("inactiveOnly") || "Qeyri-aktiv"}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnHeader;
