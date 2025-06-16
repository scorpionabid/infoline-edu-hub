import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Image,
  BarChart3,
  FolderOpen,
  Download,
  Eye,
  Upload,
  Trash2,
  Share,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface SchoolFile {
  id: string;
  name: string;
  type: "document" | "report" | "image" | "other";
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  isShared: boolean;
  permissions: {
    canView: boolean;
    canDownload: boolean;
    canDelete: boolean;
  };
}

interface EnhancedFileBrowserProps {
  schoolId: string;
  canUpload?: boolean;
  canManage?: boolean;
}

export const EnhancedFileBrowser: React.FC<EnhancedFileBrowserProps> = ({
  schoolId,
  canUpload = false,
  canManage = false,
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<SchoolFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("documents");

  // Mock data for demonstration
  useEffect(() => {
    // TODO: Replace with actual API call
    const mockFiles: SchoolFile[] = [
      {
        id: "1",
        name: "Məktəb qaydaları.pdf",
        type: "document",
        size: 1024 * 500, // 500KB
        mimeType: "application/pdf",
        url: "/files/school-rules.pdf",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "Admin",
        isShared: true,
        permissions: {
          canView: true,
          canDownload: true,
          canDelete: canManage,
        },
      },
      {
        id: "2",
        name: "2024 İllik Hesabat.xlsx",
        type: "report",
        size: 1024 * 1024 * 2, // 2MB
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        url: "/files/annual-report-2024.xlsx",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "Region Admin",
        isShared: true,
        permissions: {
          canView: true,
          canDownload: true,
          canDelete: false,
        },
      },
      {
        id: "3",
        name: "məktəb-binası.jpg",
        type: "image",
        size: 1024 * 800, // 800KB
        mimeType: "image/jpeg",
        url: "/files/school-building.jpg",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "School Admin",
        isShared: false,
        permissions: {
          canView: true,
          canDownload: true,
          canDelete: canManage,
        },
      },
    ];

    setTimeout(() => {
      setFiles(mockFiles);
      setIsLoading(false);
    }, 1000);
  }, [schoolId, canManage]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5" />;
      case "report":
        return <BarChart3 className="h-5 w-5" />;
      case "image":
        return <Image className="h-5 w-5" />;
      default:
        return <FolderOpen className="h-5 w-5" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    const labels = {
      document: t("Sənədlər"),
      report: t("Hesabatlar"),
      image: t("Şəkillər"),
      other: t("Digər"),
    };
    return labels[type as keyof typeof labels] || t("Digər");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileAction = (action: string, file: SchoolFile) => {
    switch (action) {
      case "view":
        window.open(file.url, "_blank");
        break;
      case "download":
        // TODO: Implement actual download
        console.log("Downloading file:", file.name);
        break;
      case "delete":
        // TODO: Implement actual deletion
        console.log("Deleting file:", file.name);
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
        break;
      case "share":
        // TODO: Implement sharing
        console.log("Sharing file:", file.name);
        break;
    }
  };

  const filterFilesByType = (type: string) => {
    return files.filter((file) => file.type === type);
  };

  const FileList = ({ fileType }: { fileType: string }) => {
    const filteredFiles = filterFilesByType(fileType);

    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    if (!filteredFiles.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {getFileIcon(fileType)}
          <p className="mt-2">{t("Bu qovluqda heç bir fayl yoxdur")}</p>
          {canUpload && (
            <Button variant="outline" className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              {t("Fayl Yüklə")}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
          >
            <div className="flex items-center space-x-3">
              {getFileIcon(file.type)}
              <div>
                <p className="font-medium">{file.name}</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>
                    {new Date(file.uploadedAt).toLocaleDateString("az")}
                  </span>
                  <span>•</span>
                  <span>{file.uploadedBy}</span>
                  {file.isShared && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">
                        <Share className="h-3 w-3 mr-1" />
                        {t("Paylaşılıb")}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {file.permissions.canView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileAction("view", file)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}

              {file.permissions.canDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileAction("download", file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}

              {canManage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileAction("share", file)}
                >
                  <Share className="h-4 w-4" />
                </Button>
              )}

              {file.permissions.canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileAction("delete", file)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>{t("Fayl İdarəetməsi")}</span>
          </CardTitle>
          {canUpload && (
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              {t("Fayl Yüklə")}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="documents"
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>{t("Sənədlər")}</span>
              <Badge variant="secondary">
                {filterFilesByType("document").length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="reports"
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{t("Hesabatlar")}</span>
              <Badge variant="secondary">
                {filterFilesByType("report").length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger value="images" className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span>{t("Şəkillər")}</span>
              <Badge variant="secondary">
                {filterFilesByType("image").length}
              </Badge>
            </TabsTrigger>

            <TabsTrigger value="other" className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span>{t("Digər")}</span>
              <Badge variant="secondary">
                {filterFilesByType("other").length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-4">
            <FileList fileType="document" />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <FileList fileType="report" />
          </TabsContent>

          <TabsContent value="images" className="mt-4">
            <FileList fileType="image" />
          </TabsContent>

          <TabsContent value="other" className="mt-4">
            <FileList fileType="other" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedFileBrowser;
