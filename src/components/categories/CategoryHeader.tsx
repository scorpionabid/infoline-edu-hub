
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRole } from "@/context/AuthContext";

interface CategoryHeaderProps {
  onAddCategory: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  onAddCategory,
  searchQuery,
  onSearchChange,
}) => {
  const { t } = useLanguage();
  const canManageCategories = useRole(["superadmin", "regionadmin"]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("categories")}</h1>
          <p className="text-muted-foreground">{t("categoriesDescription")}</p>
        </div>
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
      </div>
    </div>
  );
};

export default CategoryHeader;
