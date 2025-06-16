import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAdvancedReports } from "@/hooks/reports/useAdvancedReports";
import {
  AdvancedReportFilter,
  AdvancedReportConfig,
} from "@/types/advanced-report";
import { FileText, Download, Settings } from "lucide-react";

interface AdvancedReportBuilderProps {
  onReportGenerated?: (reportId: string) => void;
}

const AdvancedReportBuilder: React.FC<AdvancedReportBuilderProps> = ({
  onReportGenerated,
}) => {
  const { t } = useTranslation();
  const { templates, loading, generateReport, exportReport } =
    useAdvancedReports();

  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [filters, setFilters] = useState<AdvancedReportFilter>({});
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(
    null,
  );

  const handleGenerateReport = async () => {
    if (!selectedTemplate || !reportTitle) {
      return;
    }

    const config: AdvancedReportConfig = {
      name: reportTitle,
      type: selectedTemplate,
      filters: filters,
      columns: [],
    };

    const report = await generateReport(config);
    if (report) {
      setGeneratedReportId(report.id);
      if (onReportGenerated) {
        onReportGenerated(report.id);
      }
    }
  };

  const handleExport = async (format: "pdf" | "excel" | "csv" | "png") => {
    if (generatedReportId) {
      await exportReport(generatedReportId, format);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("advancedReportBuilder")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("selectTemplate")}</Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("chooseTemplate")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("chooseTemplate")}</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("reportTitle")}</Label>
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder={t("enterReportTitle")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("description")}</Label>
            <Textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder={t("enterDescription")}
              rows={3}
            />
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("startDate")}</Label>
              <Input
                type="date"
                value={filters.dateRange?.start || ""}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: {
                      start: e.target.value,
                      end: prev.dateRange?.end || "",
                    },
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("endDate")}</Label>
              <Input
                type="date"
                value={filters.dateRange?.end || ""}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: {
                      start: prev.dateRange?.start || "",
                      end: e.target.value,
                    },
                  }));
                }}
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="space-y-2">
            <Label>{t("includeStatus")}</Label>
            <div className="flex flex-wrap gap-4">
              {["approved", "pending", "rejected", "draft"].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={status}
                    checked={filters.status?.includes(status)}
                    onCheckedChange={(checked) => {
                      setFilters((prev) => ({
                        ...prev,
                        status: checked
                          ? [...(prev.status || []), status]
                          : (prev.status || []).filter((s) => s !== status),
                      }));
                    }}
                  />
                  <Label htmlFor={status}>{t(status)}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerateReport}
              disabled={!selectedTemplate || !reportTitle || loading}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {loading ? t("generating") : t("generateReport")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      {generatedReportId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {t("exportOptions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => handleExport("pdf")}>
                {t("exportPDF")}
              </Button>
              <Button variant="outline" onClick={() => handleExport("excel")}>
                {t("exportExcel")}
              </Button>
              <Button variant="outline" onClick={() => handleExport("csv")}>
                {t("exportCSV")}
              </Button>
              <Button variant="outline" onClick={() => handleExport("png")}>
                {t("exportImage")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedReportBuilder;
