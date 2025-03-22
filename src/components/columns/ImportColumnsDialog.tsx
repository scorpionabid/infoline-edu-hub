
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
  isOpen: boolean;
  onClose: () => void;
  onImportColumns: (file: File) => Promise<boolean>;
}

const ImportColumnsDialog: React.FC<ImportColumnsDialogProps> = ({
  isOpen,
  onClose,
  onImportColumns,
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
        setError(t("invalidFileType"));
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

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
      const result = await onImportColumns(file);

      clearInterval(progressInterval);
      
      if (result) {
        setProgress(100);
        setSuccess(true);
        
        // Close dialog after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(t("importFailed"));
        setProgress(0);
      }
    } catch (error) {
      console.error("Import error:", error);
      setError(t("importError"));
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("importColumns")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isUploading && !success && (
            <>
              <div className="flex items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  {t("excelFile")}
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
                  <AlertTitle>{t("error")}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground">
                <p>{t("importColumnsDescription")}</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>{t("importColumnsFormat")}</li>
                  <li>{t("importColumnsWarning")}</li>
                </ul>
              </div>
            </>
          )}

          {isUploading && (
            <div className="space-y-4">
              <p>{t("uploading")}</p>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {success && (
            <Alert className="border-green-500 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>{t("importSuccess")}</AlertTitle>
              <AlertDescription>
                {t("importSuccessDescription")}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isUploading || success}
          >
            <FileUp className="mr-2 h-4 w-4" />
            {t("import")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportColumnsDialog;
