import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useExcelIntegration } from "@/hooks/exports/useExcelIntegration";

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
  const { t } = useTranslation();
  const { downloadTemplate, exportData, importFile, isProcessing } =
    useExcelIntegration({
      category,
      data,
    });

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const importedData = await importFile(file);
        onImportComplete?.(importedData);
      } catch (error) {
        console.error("Import failed:", error);
      }

      // Reset file input
      event.target.value = "";
    },
    [importFile, onImportComplete],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          {t("excelIntegration")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={isProcessing || !category}
            className="flex items-center gap-2"
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
              disabled={isProcessing}
            />
            <Button
              variant="outline"
              disabled={isProcessing}
              className="w-full flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {t("importData")}
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={exportData}
            disabled={isProcessing || !data || data.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t("exportData")}
          </Button>
        </div>

        {isProcessing && (
          <div className="text-center text-sm text-muted-foreground">
            {t("processingFile")}...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelIntegrationPanel;
