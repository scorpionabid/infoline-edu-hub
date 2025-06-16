import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/TranslationContext";
import { Loader2 } from "lucide-react";

interface AdminDialogFooterProps {
  loading: boolean;
  onCancel: () => void;
  onAssign: () => void;
  disabled: boolean;
}

export const AdminDialogFooter: React.FC<AdminDialogFooterProps> = ({
  loading,
  onCancel,
  onAssign,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline" onClick={onCancel} disabled={loading}>
        {t("cancel") || "Ləğv et"}
      </Button>
      <Button onClick={onAssign} disabled={disabled || loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("loading") || "Yüklənir..."}
          </>
        ) : (
          t("assignAdmin") || "Admin təyin et"
        )}
      </Button>
    </div>
  );
};
