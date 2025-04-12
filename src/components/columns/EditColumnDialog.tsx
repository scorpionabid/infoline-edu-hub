
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Column, ColumnOption } from "@/types/column";
import { useColumnForm } from "./columnDialog/useColumnForm";
import BasicColumnFields from "./columnDialog/BasicColumnFields";
import ValidationFields from "./columnDialog/ValidationFields";
import OptionsField from "./columnDialog/OptionsField";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  
  const { 
    form, 
    selectedType, 
    handleTypeChange, 
    options,
    addOption,
    removeOption,
    newOption,
    setNewOption,
    onSubmit: handleFormSubmit,
    isEditMode 
  } = useColumnForm(categories, column);
  
  // Form değerlerini çütun tipi değiştiğinde güncellemek için useEffect
  useEffect(() => {
    if (column && selectedType) {
      form.setValue("type", selectedType);
    }
  }, [selectedType, column, form]);
  
  const onSubmit = async (data: any) => {
    try {
      if (!column) return false;
      
      // Client-side validation
      if (!data.name.trim()) {
        form.setError("name", { message: t("columnNameRequired") });
        return false;
      }
      
      // Əlavə options əlavə edirik (select, radio, checkbox üçün)
      if (["select", "radio", "checkbox"].includes(data.type)) {
        data.options = options;
      }
      
      const success = await onEditColumn({
        ...data,
        id: column.id
      });
      
      if (success) {
        await queryClient.invalidateQueries({ queryKey: ['columns'] });
        onClose();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error submitting column data:', error);
      return false;
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
            columns={[]} // Boş array veririk, çünki parent column-ları üçün hazırda təyin etməyək
            editColumn={column}
            selectedType={selectedType}
            handleTypeChange={handleTypeChange}
          />
          
          {(selectedType === "select" || selectedType === "radio" || selectedType === "checkbox") && (
            <OptionsField 
              control={form.control}
              options={options}
              newOption={newOption}
              setNewOption={setNewOption}
              addOption={addOption}
              removeOption={removeOption}
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
