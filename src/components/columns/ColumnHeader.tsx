import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";
import { Plus, UploadCloud, ArrowLeft } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

interface ColumnHeaderProps {
  categoryName: string;
  onAddClick: () => void;
  onImportClick?: () => void;
  onBackClick: () => void;
  title?: string;
  subtitle?: string;
}

export function ColumnHeader({
  categoryName,
  onAddClick,
  onImportClick,
  onBackClick,
  title,
  subtitle,
}: ColumnHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 mb-6">
      <Button
        variant="ghost"
        onClick={onBackClick}
        className="flex items-center gap-2 px-2 hover:bg-muted"
      >
        <ArrowLeft size={16} />
        {t("backToCategories")}
      </Button>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <PageHeader
          title={title || categoryName}
          subtitle={subtitle || t("columnsDescription")}
        />

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {onImportClick && (
            <Button
              variant="outline"
              onClick={onImportClick}
              className="flex items-center gap-2"
            >
              <UploadCloud size={16} />
              {t("import")}
            </Button>
          )}

          <Button onClick={onAddClick} className="flex items-center gap-2">
            <Plus size={16} />
            {t("addColumn")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ColumnHeader;
