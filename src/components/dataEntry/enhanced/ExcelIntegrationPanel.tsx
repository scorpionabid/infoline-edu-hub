import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileSpreadsheet, MoreHorizontal } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useExcelIntegration } from "@/hooks/exports/useExcelIntegration";
import { cn } from "@/lib/utils";

interface ExcelIntegrationPanelProps {
  category?: any;
  data?: any[];
  onImportComplete?: (data: any[]) => void;
}

const ExcelIntegrationPanel: React.FC<ExcelIntegrationPanelProps> = ({
  category,
  data,
  onImportComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const { t } = useTranslation();
  const [isImporting, setIsImporting] = useState(false);
  const { downloadTemplate, exportData, importFile } =
    useExcelIntegration({
      category,
      data,
    });

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setIsImporting(true);
        const importedData = await importFile(file);
        onImportComplete?.(importedData);
      } catch (error) {
        console.error("Import failed:", error);
      } finally {
        setIsImporting(false);
      }

      // Reset file input
      event.target.value = "";
    },
    [importFile, onImportComplete],
  );

  return (
    <div className="relative inline-block" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1.5 h-8 px-2"
        onClick={toggleMenu}
      >
        <FileSpreadsheet className="h-4 w-4" />
        <span className="hidden sm:inline">{t("excelIntegration")}</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1 z-50 min-w-[200px] bg-white rounded-md shadow-lg border py-1 dark:bg-gray-800">
          <div className="p-2 text-sm font-medium border-b">{t("excelIntegration")}</div>
          <div className="p-2 space-y-2">
        <div className="flex flex-col space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              downloadTemplate();
            }}
            disabled={!category}
            className="flex items-center justify-start gap-2 w-full text-left"
          >
            <Download className="h-4 w-4" />
            {t("downloadTemplate")}
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex items-center justify-start gap-2 text-left"
            >
              <Upload className="h-4 w-4" />
              {t("importData")}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              exportData();
            }}
            disabled={!data || data.length === 0}
            className="flex items-center justify-start gap-2 w-full text-left"
          >
            <Download className="h-4 w-4" />
            {t("exportData")}
          </Button>
        </div>

        </div>
        </div>
      )}
    </div>
  );
};

export default ExcelIntegrationPanel;
