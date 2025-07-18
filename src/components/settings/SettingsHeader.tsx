import React, { useState } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Shield,
  Settings as SettingsIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SettingsHeader: React.FC = () => {
  const { t } = useTranslation();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [loading, setLoading] = useState({
    export: false,
    import: false,
    reset: false,
  });

  // Verilənləri ixrac et
  const handleExport = (format: string) => {
    setLoading((prev) => ({ ...prev, export: true }));

    // Simulyasiya - real sistemdə API sorğusu olacaq
    setTimeout(() => {
      setLoading((prev) => ({ ...prev, export: false }));
      toast.success(t("ui.operation_successful"), {
        description: t("general.export_data"),
      });
    }, 1500);
  };

  // Verilənləri idxal et
  const handleImport = () => {
    toast.info(t("ui.coming_soon"), {
      description: t("general.import_data"),
    });
  };

  // Verilənləri sıfırla
  const handleReset = () => {
    setLoading((prev) => ({ ...prev, reset: true }));

    // Simulyasiya - real sistemdə API sorğusu olacaq
    setTimeout(() => {
      setLoading((prev) => ({ ...prev, reset: false }));
      setResetDialogOpen(false);
      toast.success(t("ui.operation_successful"), {
        description: t("general.reset_data"),
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          {t("navigation.settings")}
        </h2>
        <p className="text-muted-foreground">{t("general.settings_description")}</p>
      </div>

      <div className="flex gap-2 mt-4 sm:mt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
              disabled={loading.export}
            >
              <Download className="h-4 w-4" />
              {loading.export ? t("ui.processing") : t("general.export_data")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("excel")}>
              Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              // CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json")}>
              // JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
          onClick={handleImport}
        >
          <Upload className="h-4 w-4" />
          {t("general.import_data")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 text-destructive"
          onClick={() => setResetDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          {t("general.reset_data")}
        </Button>
      </div>

      {/* Reset Data Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t("ui.are_you_sure")}
            </DialogTitle>
            <DialogDescription>
              {t("general.reset_data")} əməliyyatı geri qaytarıla bilməz. Bütün məlumatlar silinəcək.
            </DialogDescription>
          </DialogHeader>

          <div className="border border-destructive/30 bg-destructive/10 rounded-md p-3 text-sm my-4">
            <p className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive" />
              Bu əməliyyat təhlükəlidir və ehtiyatlı olmaq lazımdır.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              {t("ui.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={loading.reset}
            >
              {loading.reset ? t("ui.processing") : t("ui.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsHeader;
