import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/contexts/TranslationContext";
import { Sector } from "@/types/supabase";

interface SectorAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector?: Sector;
}

export const SectorAdminDialog: React.FC<SectorAdminDialogProps> = ({
  open,
  onOpenChange,
  sector,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("sectorAdmin")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {sector ? (
            <>
              <div>
                <h3 className="font-medium">{t("sectorName")}</h3>
                <p>{sector.name}</p>
              </div>

              <div>
                <h3 className="font-medium">{t("adminEmail")}</h3>
                <p>{sector.admin_email || t("noAdminAssigned")}</p>
              </div>
            </>
          ) : (
            <p>{t("sectorNotSelected")}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SectorAdminDialog;
