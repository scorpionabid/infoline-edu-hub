import React, { useState } from "react";
import SettingsHeader from "@/components/settings/SettingsHeader";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { useTranslation } from "@/contexts/TranslationContext";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DatabaseBackup, RefreshCw, Settings2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [isResettingData, setIsResettingData] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [isImportingData, setIsImportingData] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const handleResetData = async () => {
    setIsResettingData(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(t("settings.dataReset") || "Məlumatlar sıfırlandı", {
        description: t("settings.dataResetSuccess") || "Bütün məlumatlar uğurla sıfırlandı",
      });

      setIsResetDialogOpen(false);
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error(t("settings.dataResetFailed") || "Məlumatlar sıfırlanərkən xəta baş verdi", {
        description: t("settings.dataResetFailedDesc") || "Məlumatları sıfırlamaq mümkün olmadı, zəhmət olmasa yenidən cəhd edin",
      });
    } finally {
      setIsResettingData(false);
    }
  };

  const handleExportData = async () => {
    setIsExportingData(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(t("settings.dataExported") || "Məlumatlar ixrac edildi", {
        description: t("settings.dataExportSuccess") || "Bütün məlumatlar uğurla ixrac edildi",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error(t("settings.dataExportFailed") || "Məlumatların ixracı uğursuz oldu", {
        description: t("settings.dataExportFailedDesc") || "Məlumatların ixracı zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin",
      });
    } finally {
      setIsExportingData(false);
    }
  };

  const handleImportData = async () => {
    setIsImportingData(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(t("settings.dataImported") || "Məlumatlar idxal edildi", {
        description: t("settings.dataImportSuccess") || "Məlumatlar uğurla idxal edildi",
      });
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error(t("settings.dataImportFailed") || "Məlumat idxalı uğursuz oldu", {
        description: t("settings.dataImportFailedDesc") || "Məlumatların idxalı zamanı xəta baş verdi. Zəhmət olmasa faylı yoxlayın və yenidən cəhd edin.",
      });
    } finally {
      setIsImportingData(false);
    }
  };

  return (
    <>
      <div className="container max-w-5xl mx-auto py-6 px-4">
        <SettingsHeader />
        <Separator className="my-6" />
        <SettingsTabs />

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Settings2 className="mr-2 h-5 w-5" />
            {t("settings.systemSettings") || "Sistem Tənzimləmələri"}
          </h2>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-medium">{t("settings.exportData") || "Məlumatları ixrac et"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.exportDataDesc") || "Bütün məlumatlarınızı yedəkləmə üçün ixrac edin"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="sm:self-end"
                    onClick={handleExportData}
                    disabled={isExportingData}
                  >
                    {isExportingData ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {t("settings.exporting") || "İxrac edilir..."}
                      </>
                    ) : (
                      <>
                        <DatabaseBackup className="mr-2 h-4 w-4" />
                        {t("settings.exportData") || "Məlumatları ixrac et"}
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-medium">{t("settings.importData") || "Məlumatları idxal et"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.importDataDesc") || "Əvvəlcədən ixrac edilmiş məlumatları idxal edin"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="sm:self-end"
                    onClick={handleImportData}
                    disabled={isImportingData}
                  >
                    {isImportingData ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {t("settings.importing") || "İdxal olunur..."}
                      </>
                    ) : (
                      <>
                        <DatabaseBackup className="mr-2 h-4 w-4" />
                        {t("settings.importData") || "Məlumatları idxal et"}
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-medium text-destructive">
                      {t("settings.resetData") || "Məlumatları sıfırla"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.resetDataDesc") || "Bütün məlumatları orijinal vəziyyətinə qaytarın"}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="sm:self-end"
                    onClick={() => setIsResetDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("settings.resetData") || "Məlumatları sıfırla"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.confirmReset") || "Məlumatları sıfırlamaq istədiyinizə əminsiniz?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.confirmResetDesc") || "Bu əməliyyat geri qaytarıla bilməz. Bütün məlumatlar silinəcək və sistem ilkin vəziyyətinə qaytarılacaq."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResettingData}>
              {t("common.cancel") || "Ləğv et"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleResetData();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isResettingData}
            >
              {isResettingData ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {t("settings.resetting") || "Sıfırlanır..."}
                </>
              ) : (
                t("settings.confirmReset") || "Təsdiq et"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Settings;
