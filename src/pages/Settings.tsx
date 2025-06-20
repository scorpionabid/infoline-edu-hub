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

      toast.success(t("dataReset"), {
        description: t("dataResetSuccess"),
      });

      setIsResetDialogOpen(false);
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error(t("dataResetFailed"), {
        description: t("dataResetFailedDesc"),
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

      toast.success(t("dataExported"), {
        description: t("dataExportSuccess"),
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error(t("dataExportFailed"), {
        description: t("dataExportFailedDesc"),
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

      toast.success(t("dataImported"), {
        description: t("dataImportSuccess"),
      });
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error(t("dataImportFailed"), {
        description: t("dataImportFailedDesc"),
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
            {t("systemSettings")}
          </h2>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-medium">{t("exportData")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("exportDataDesc")}
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
                        {t("exporting")}
                      </>
                    ) : (
                      <>
                        <DatabaseBackup className="mr-2 h-4 w-4" />
                        {t("exportData")}
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-medium">{t("importData")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("importDataDesc")}
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
                        {t("importing")}
                      </>
                    ) : (
                      <>
                        <DatabaseBackup className="mr-2 h-4 w-4" />
                        {t("importData")}
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-medium text-destructive">
                      {t("resetData")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("resetDataDesc")}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="sm:self-end"
                    onClick={() => setIsResetDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("resetData")}
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
            <AlertDialogTitle>{t("confirmReset")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmResetDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResettingData}>
              {t("cancel")}
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
                  {t("resetting")}
                </>
              ) : (
                t("confirmReset")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Settings;
