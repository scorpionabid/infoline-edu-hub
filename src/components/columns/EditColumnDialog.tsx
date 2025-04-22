import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Column } from "@/types/column";
import { useColumnForm } from "./columnDialog/useColumnForm";
import BasicColumnFields from "./columnDialog/BasicColumnFields";
import ValidationFields from "./columnDialog/ValidationFields";
import OptionsField from "./columnDialog/OptionsField";
import { useQueryClient } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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
    isEditMode 
  } = useColumnForm(categories, column, onEditColumn);
  
  // Form değerlerini çütun tipi değiştiğinde güncellemek için useEffect
  useEffect(() => {
    if (column && selectedType) {
      form.setValue("type", selectedType);
    }
  }, [selectedType, column, form]);
  
  const handleSubmit = async (data: any) => {
    try {
      if (!column) {
        toast.error(t("columnNotFound"));
        return false;
      }
      
      console.log("Form data before submission:", data);
      
      // Client-side validation
      if (!data.name.trim()) {
        form.setError("name", { message: t("columnNameRequired") });
        return false;
      }
      
      // Prepare the data for submission
      const submissionData = {
        ...data,
        id: column.id,
        type: selectedType
      };
      
      // Handle options for select, radio, checkbox types
      if (["select", "radio", "checkbox"].includes(selectedType)) {
        if (!options || options.length === 0) {
          toast.error(t("optionsRequired"));
          return false;
        }
        submissionData.options = options;
      }
      
      console.log("Submitting column data:", submissionData);
      
      // Call the onEditColumn function with the prepared data
      const success = await onEditColumn(submissionData);
      
      if (success) {
        console.log("Column updated successfully");
        await queryClient.invalidateQueries({ queryKey: ['columns'] });
        toast.success(t("columnUpdated"));
        onClose();
        return true;
      } else {
        console.error("Failed to update column");
        toast.error(t("columnUpdateFailed"));
        return false;
      }
    } catch (error) {
      console.error('Error submitting column data:', error);
      toast.error(t("errorUpdatingColumn"));
      return false;
    }
  };

  if (!column) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("editColumn")}</DialogTitle>
          <DialogDescription>
            {t("editColumnDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <ScrollArea className="h-[60vh] pr-4">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="basic">{t("basicInfo")}</TabsTrigger>
                  <TabsTrigger value="validation">{t("validation")}</TabsTrigger>
                  <TabsTrigger value="options">{t("options")}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <BasicColumnFields 
                    form={form}
                    control={form.control}
                    categories={categories}
                    columns={[]} 
                    editColumn={column}
                    selectedType={selectedType}
                    onTypeChange={handleTypeChange}
                    isEditMode={true}
                  />
                </TabsContent>
                
                <TabsContent value="validation" className="space-y-4">
                  {["text", "number", "date", "email", "url", "tel"].includes(selectedType) && (
                    <ValidationFields 
                      control={form.control} 
                      type={selectedType} 
                    />
                  )}
                  {!["text", "number", "date", "email", "url", "tel"].includes(selectedType) && (
                    <p className="text-muted-foreground text-sm p-4 text-center">
                      {t("noValidationForType")}
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="options" className="space-y-4">
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
                          const updatedOptions = [...options];
                          updatedOptions[index] = newOption;
                          return true;
                        }
                        return false;
                      }}
                    />
                  )}
                  {!["select", "radio", "checkbox"].includes(selectedType) && (
                    <p className="text-muted-foreground text-sm p-4 text-center">
                      {t("noOptionsForType")}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </form>
          </ScrollArea>
          
          <DialogFooter className="mt-4 pt-4 border-t">
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
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditColumnDialog;
