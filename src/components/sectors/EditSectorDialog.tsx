import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/contexts/TranslationContext";
import { Region } from "@/types/supabase";
import { EnhancedSector } from "@/types/sector";
import SectorForm from "./SectorForm";

interface EditSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sector: EnhancedSector;
  regions: Region[];
  onSubmit: (sectorData: Partial<EnhancedSector>) => Promise<boolean>;
  isSubmitting?: boolean;
}

const EditSectorDialog: React.FC<EditSectorDialogProps> = ({
  isOpen,
  onClose,
  sector,
  regions,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();

  const handleSubmit = async (data: Partial<EnhancedSector>) => {
    const success = await onSubmit({
      id: sector.id,
      ...data,
      region_name:
        regions.find((r) => r.id === data.region_id)?.name ||
        sector.region_name,
    });
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("sectors.editSector")}</DialogTitle>
        </DialogHeader>
        <SectorForm
          initialData={sector}
          regions={regions}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditSectorDialog;
