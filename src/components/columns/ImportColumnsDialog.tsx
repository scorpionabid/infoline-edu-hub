
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FileUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportColumnsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onImport?: (file: File) => Promise<boolean>;
  categoryId?: string;
  categoryName?: string;
}

const ImportColumnsDialog: React.FC<ImportColumnsDialogProps> = ({
  open = false,
  onOpenChange,
  onImport,
  categoryId,
  categoryName,
}) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if it's an Excel file
      if (
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError(t("invalidFileType") || "Yalnız Excel faylları (.xlsx, .xls) dəstəklənir.");
      }
    }
  };

  const handleImport = async () => {
    if (!file || !onImport) return;

    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);
      setSuccess(false);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      // Perform import
      const result = await onImport(file);

      clearInterval(progressInterval);
      
      if (result) {
        setProgress(100);
        setSuccess(true);
        
        // Close dialog after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(t("importFailed") || "İdxal əməliyyatı uğursuz oldu.");
        setProgress(0);
      }
    } catch (error) {
      console.error("Import error:", error);
      setError(t("importError") || "İdxal zamanı xəta yarandı.");
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setSuccess(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("importColumns") || `${categoryName || ''} Sütunları İdxal Et`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isUploading && !success && (
            <>
              <div className="flex items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  {t("excelFile") || "Excel faylı"}
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("error") || "Xəta"}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground">
                <p>{t("importColumnsDescription") || "Excel faylı vasitəsilə bir neçə sütunu bir dəfəyə idxal edə bilərsiniz."}</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>{t("importColumnsFormat") || "Excel faylı düzgün formatda olmalıdır."}</li>
                  <li>{t("importColumnsWarning") || "İdxal əməliyyatı mövcud sütun parametrlərini dəyişə bilər."}</li>
                </ul>
              </div>
            </>
          )}

          {isUploading && (
            <div className="space-y-4">
              <p>{t("uploading") || "Yüklənir..."}</p>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {success && (
            <Alert className="border-green-500 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>{t("importSuccess") || "İdxal uğurla tamamlandı"}</AlertTitle>
              <AlertDescription>
                {t("importSuccessDescription") || "Sütunlar uğurla idxal edildi."}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {t("cancel") || "Ləğv et"}
          </Button>
          {onImport && (
            <Button
              onClick={handleImport}
              disabled={!file || isUploading || success}
            >
              <FileUp className="mr-2 h-4 w-4" />
              {t("import") || "İdxal et"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportColumnsDialog;
