
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Column } from "@/types/column";
import { useColumnForm } from "./columnDialog/useColumnForm";
import BasicColumnFields from "./columnDialog/BasicColumnFields";
import ValidationFields from "./columnDialog/ValidationFields";
import OptionsField from "./columnDialog/OptionsField";

interface EditColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEditColumn: (columnData: Omit<Column, "id"> & { id?: string }) => Promise<boolean>;
  column: Column | null;
  isSubmitting: boolean;
  categories: any[];
}

const EditColumnDialog: React.FC<EditColumnDialogProps> = ({
  isOpen,
  onClose,
  onEditColumn,
  column,
  isSubmitting,
  categories
}) => {
  const { t } = useLanguage();
  const { 
    form, 
    selectedType, 
    handleTypeChange, 
    onSubmit: handleFormSubmit,
    isEditMode 
  } = useColumnForm(categories, column);
  
  const { control } = form;

  const onSubmit = async (data: any) => {
    try {
      if (!column) return;
      
      const success = await onEditColumn({
        ...data,
        id: column.id
      });
      
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting column data:', error);
    }
  };

  if (!column) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("editColumn")}</DialogTitle>
          <DialogDescription>
            {t("editColumnDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <BasicColumnFields 
            form={form}
            categories={categories}
            selectedType={selectedType}
            handleTypeChange={handleTypeChange}
          />
          
          {(selectedType === "select" || selectedType === "radio" || selectedType === "checkbox") && (
            <OptionsField 
              control={control}
            />
          )}
          
          <ValidationFields 
            form={form}
            selectedType={selectedType}
            t={t}
          />
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditColumnDialog;
