
import React from "react";
import { Column } from "@/types/column";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useLanguage } from "@/context/LanguageContext";
import { useColumnForm } from './columnDialog/useColumnForm';
import BasicColumnFields from './columnDialog/BasicColumnFields';
import ValidationFields from './columnDialog/ValidationFields';
import OptionsField from './columnDialog/OptionsField';
import { useToast } from "@/components/ui/use-toast";

interface AddColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddColumn: (newColumn: Omit<Column, "id">) => Promise<boolean>;
  categories: { id: string; name: string }[];
  editColumn?: Column; 
  columns?: Column[];
}

const AddColumnDialog: React.FC<AddColumnDialogProps> = ({
  isOpen,
  onClose,
  onAddColumn,
  categories,
  editColumn,
  columns = [],
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const {
    form, 
    selectedType,
    handleTypeChange,
    options,
    addOption,
    removeOption,
    newOption,
    setNewOption,
    onSubmit,
    isEditMode
  } = useColumnForm(categories, editColumn, onAddColumn);
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      console.log("Form submitted with values:", values);
      
      // Client-side validation
      if (!values.name.trim()) {
        form.setError("name", { message: t("columnNameRequired") });
        return;
      }
      
      if (!values.category_id) {
        form.setError("category_id", { message: t("categoryRequired") });
        return;
      }
      
      // Əlavə options əlavə edirik (select, radio, checkbox üçün)
      if (["select", "radio", "checkbox"].includes(values.type)) {
        values.options = options;
        
        if (options.length === 0) {
          toast({
            title: t("validationError"),
            description: t("optionsRequired"),
            variant: "destructive"
          });
          return;
        }
      }
      
      // onSubmit funksiyasını çağırırıq
      const success = await onSubmit(values);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: t("error"),
        description: t("errorSubmittingForm"),
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("editColumn") : t("addColumn")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t("updateColumnDescription") : t("createColumnDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Əsas sahələr */}
              <BasicColumnFields
                form={form}
                categories={categories}
                columns={columns}
                editColumn={editColumn}
                selectedType={selectedType}
                handleTypeChange={handleTypeChange}
              />

              {/* Validasiya sahələri */}
              <ValidationFields
                form={form}
                selectedType={selectedType}
                t={t}
              />

              {/* Options for select, checkbox, radio */}
              {(selectedType === "select" || selectedType === "checkbox" || selectedType === "radio") && (
                <OptionsField
                  control={form.control}
                  options={options}
                  newOption={newOption}
                  setNewOption={setNewOption}
                  addOption={addOption}
                  removeOption={removeOption}
                />
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button type="submit">
                {isEditMode ? t("saveChanges") : t("addColumn")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddColumnDialog;
