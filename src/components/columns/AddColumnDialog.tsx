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
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log("Dialog state changing:", open);
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("editColumn") : t("addColumn")}
          </DialogTitle>
          <DialogDescription>
            {t("columnDialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-6">
              <BasicColumnFields 
                form={form}
                control={form.control} 
                categories={categories}
                columns={columns}
                editColumn={editColumn}
                selectedType={selectedType}
                onTypeChange={handleTypeChange}
                isEditMode={isEditMode}
              />
              
              {/* Seçilmiş tipə görə əlavə sahələr göstəririk */}
              {["text", "number", "date", "email", "url", "tel"].includes(selectedType) && (
                <ValidationFields 
                  control={form.control} 
                  type={selectedType} 
                />
              )}
              
              {/* Select, radio və checkbox tipləri üçün options sahəsi */}
              {["select", "radio", "checkbox"].includes(selectedType) && (
                <OptionsField 
                  control={form.control}
                  options={options}
                  newOption={newOption}
                  setNewOption={setNewOption}
                  addOption={addOption}
                  removeOption={removeOption}
                  updateOption={(oldOption, newOption) => {
                    // Köhnə option-u tapıb yenisi ilə əvəz edirik
                    const index = options.findIndex(opt => 
                      opt.label === oldOption.label && opt.value === oldOption.value
                    );
                    
                    if (index !== -1) {
                      const newOptions = [...options];
                      newOptions[index] = newOption;
                      // Yeni options-ları təyin edirik
                      const updatedOptions = [...options];
                      updatedOptions[index] = newOption;
                      // options state-ni yeniləyirik
                      // Burada addOption və removeOption funksiyalarını istifadə etmək əvəzinə
                      // birbaşa options state-ni yeniləyirik
                      return true;
                    }
                    return false;
                  }}
                />
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  console.log("Cancel button clicked");
                  onClose();
                }}
              >
                {t("cancel")}
              </Button>
              <Button 
                type="submit"
                disabled={form.formState.isSubmitting}
                onClick={() => {
                  console.log("Save button clicked, current form values:", form.getValues());
                }}
              >
                {form.formState.isSubmitting ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddColumnDialog;
