import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/contexts/TranslationContext";
import SchoolForm from "./SchoolForm";
import { School, Region, Sector } from "@/types/school";

export interface AddSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<School, "id">) => Promise<void>;
  isSubmitting: boolean;
  regions: Region[];
  sectors: Sector[];
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
}

const AddSchoolDialog: React.FC<AddSchoolDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  regions,
  sectors,
  regionNames,
  sectorNames,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("addSchool")}</DialogTitle>
          <DialogDescription>{t("addSchoolDescription")}</DialogDescription>
        </DialogHeader>
        <SchoolForm
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          regions={regions}
          sectors={sectors}
          regionNames={regionNames}
          sectorNames={sectorNames}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddSchoolDialog;
