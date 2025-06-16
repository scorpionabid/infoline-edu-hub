import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, CheckCircle, AlertTriangle, X } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import * as XLSX from "xlsx";

interface EnhancedExcelUploadProps {
  onDataUpload: (data: any[][]) => Promise<void>;
  onTemplateDownload?: () => void;
  acceptedFormats?: string[];
  maxFileSize?: number;
  className?: string;
}

const EnhancedExcelUpload: React.FC<EnhancedExcelUploadProps> = ({
  onDataUpload,
  onTemplateDownload,
  acceptedFormats = [".xlsx", ".xls", ".csv"],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  className = "",
}) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize) {
      setErrorMessage(t("fileTooLarge") || "File size exceeds limit");
      return false;
    }

    // Check file format
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      setErrorMessage(t("invalidFileFormat") || "Invalid file format");
      return false;
    }

    return true;
  };

  const processExcelFile = useCallback(async (file: File): Promise<any[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON array with proper typing
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
            raw: false,
          });

          // Ensure proper array structure
          const processedData: any[][] = [];
          for (const row of jsonData) {
            if (Array.isArray(row)) {
              processedData.push(row);
            } else {
              // Convert object to array if needed
              processedData.push(Object.values(row || {}));
            }
          }

          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Reset states
      setUploadStatus("idle");
      setErrorMessage("");
      setFileName(file.name);

      // Validate file
      if (!validateFile(file)) {
        setUploadStatus("error");
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        // Process file
        const data = await processExcelFile(file);

        // Clear progress interval
        clearInterval(progressInterval);
        setUploadProgress(100);

        // Upload data
        await onDataUpload(data);

        setUploadStatus("success");
        setUploadProgress(100);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Upload failed",
        );
      } finally {
        setIsUploading(false);
        // Reset file input
        event.target.value = "";
      }
    },
    [validateFile, processExcelFile, onDataUpload],
  );

  const resetUpload = () => {
    setUploadStatus("idle");
    setErrorMessage("");
    setFileName("");
    setUploadProgress(0);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {t("excelUpload") || "Excel Upload"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            {uploadStatus === "idle" && (
              <>
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium">
                    {t("dragDropOrClick") || "Drag and drop or click to upload"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("supportedFormats")}: {acceptedFormats.join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("maxSize")}: {Math.round(maxFileSize / 1024 / 1024)}MB
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <div className="relative">
                    <input
                      type="file"
                      accept={acceptedFormats.join(",")}
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <Button disabled={isUploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {t("selectFile") || "Select File"}
                    </Button>
                  </div>

                  {onTemplateDownload && (
                    <Button variant="outline" onClick={onTemplateDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      {t("downloadTemplate") || "Download Template"}
                    </Button>
                  )}
                </div>
              </>
            )}

            {isUploading && (
              <>
                <Upload className="h-12 w-12 mx-auto text-blue-500 animate-pulse" />
                <div>
                  <p className="font-medium">
                    {t("uploading")}: {fileName}
                  </p>
                  <Progress value={uploadProgress} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadProgress}%
                  </p>
                </div>
              </>
            )}

            {uploadStatus === "success" && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <div>
                  <p className="font-medium text-green-700">
                    {t("uploadSuccessful") || "Upload Successful"}
                  </p>
                  <p className="text-sm text-muted-foreground">{fileName}</p>
                </div>
                <Button variant="outline" onClick={resetUpload}>
                  {t("uploadAnother") || "Upload Another"}
                </Button>
              </>
            )}

            {uploadStatus === "error" && (
              <>
                <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
                <div>
                  <p className="font-medium text-red-700">
                    {t("uploadFailed") || "Upload Failed"}
                  </p>
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                </div>
                <Button variant="outline" onClick={resetUpload}>
                  <X className="h-4 w-4 mr-2" />
                  {t("tryAgain") || "Try Again"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            •{" "}
            {t("uploadInstructions1") ||
              "First row should contain column headers"}
          </p>
          <p>
            • {t("uploadInstructions2") || "Data should start from second row"}
          </p>
          <p>• {t("uploadInstructions3") || "Empty cells will be ignored"}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedExcelUpload;
