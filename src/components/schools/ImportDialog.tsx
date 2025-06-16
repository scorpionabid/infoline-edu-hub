import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import { Download, Upload, AlertTriangle } from "lucide-react";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const downloadTemplate = () => {
    // Create a template for schools import
    const headers = [
      "name",
      "principal_name",
      "address",
      "region_id",
      "sector_id",
      "phone",
      "email",
      "student_count",
      "teacher_count",
      "status",
      "type",
      "language",
      "admin_email",
    ];

    const csvContent = headers.join(",") + "\n";

    // Create a blob and download it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "schools_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!file) {
      setError(t("pleaseSelectFile"));
      return;
    }

    if (file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
      setError(t("invalidFileType"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Read the CSV file
      const text = await file.text();
      const lines = text.split("\n");

      // Parse headers and validate
      const headers = lines[0].split(",").map((h) => h.trim());
      const requiredHeaders = ["name", "sector_id"];

      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h),
      );
      if (missingHeaders.length > 0) {
        throw new Error(
          `${t("missingRequiredFields")}: ${missingHeaders.join(", ")}`,
        );
      }

      // Process data rows
      const dataRows = lines.slice(1).filter((line) => line.trim());
      const schools = [];
      const errors = [];

      for (let i = 0; i < dataRows.length; i++) {
        try {
          const values = dataRows[i].split(",").map((v) => v.trim());
          if (values.length !== headers.length) {
            errors.push(`${t("row")} ${i + 2}: ${t("invalidColumnCount")}`);
            continue;
          }

          const school: Record<string, any> = {};
          headers.forEach((header, index) => {
            school[header] = values[index];
          });

          // Validate required fields
          if (!school.name || !school.sector_id) {
            errors.push(`${t("row")} ${i + 2}: ${t("missingNameOrSector")}`);
            continue;
          }

          // Convert numeric fields
          if (school.student_count) {
            school.student_count = parseInt(school.student_count);
          }
          if (school.teacher_count) {
            school.teacher_count = parseInt(school.teacher_count);
          }

          schools.push(school);
        } catch (err) {
          errors.push(`${t("row")} ${i + 2}: ${(err as Error).message}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(`${t("validationErrors")}:\n${errors.join("\n")}`);
      }

      // Insert schools into database
      let successCount = 0;
      const failedRows: number[] = [];

      for (let i = 0; i < schools.length; i++) {
        try {
          const { error } = await supabase.from("schools").insert([schools[i]]);

          if (error) throw error;
          successCount++;
        } catch (err) {
          failedRows.push(i + 2); // +2 for 1-indexing and header row
          console.error(`Error on row ${i + 2}:`, err);
        }
      }

      if (failedRows.length > 0) {
        setError(`${t("someRowsFailed")}: ${failedRows.join(", ")}`);
      }

      setResults({
        success: successCount,
        failed: failedRows.length,
      });

      if (successCount > 0) {
        toast({
          title: t("importSuccess"),
          description: `${successCount} ${t("schoolsImported")}${failedRows.length > 0 ? `, ${failedRows.length} ${t("failed")}` : ""}`,
        });

        if (successCount === schools.length) {
          // All schools imported successfully
          onSuccess();
          handleClose();
        }
      } else {
        toast({
          title: t("importFailed"),
          description: t("noSchoolsImported"),
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Import error:", err);
      setError((err as Error).message);

      toast({
        title: t("importFailed"),
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("importSchools")}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {t("downloadTemplate")}
          </Button>

          <div className="border-2 border-dashed rounded-md p-6 text-center">
            <input
              type="file"
              id="file-upload"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium mb-1">
                {file ? file.name : t("clickToUpload")}
              </span>
              <span className="text-xs text-muted-foreground">
                CSV {t("filesOnly")}
              </span>
            </label>
          </div>

          {error && (
            <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20 text-sm text-destructive flex items-start">
              <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div className="whitespace-pre-wrap">{error}</div>
            </div>
          )}

          {results && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200 text-sm">
              <p>
                <strong>{t("importResults")}</strong>
              </p>
              <p className="text-green-600">
                ✓ {results.success} {t("schoolsImportedSuccessfully")}
              </p>
              {results.failed > 0 && (
                <p className="text-red-600">
                  ✗ {results.failed} {t("schoolsFailedToImport")}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? t("importing") : t("import")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
