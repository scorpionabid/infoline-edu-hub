
import React, { useEffect } from "react";
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
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColumnFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveColumn: (columnData: Omit<Column, "id"> & { id?: string }) => Promise<boolean>;
  categories: { id: string; name: string }[];
  editColumn?: Column | null; 
  columns?: Column[];
  isSubmitting?: boolean;
}

const ColumnFormDialog: React.FC<ColumnFormDialogProps> = ({
  isOpen,
  onClose,
  onSaveColumn,
  categories,
  editColumn = null,
  columns = [],
  isSubmitting = false,
}) => {
  const { t } = useLanguage();
  
  const {
    form, 
    selectedType,
    onTypeChange,
    options,
    addOption,
    removeOption,
    newOption,
    setNewOption,
    onSubmit,
    isEditMode,
    setOptions,
    isLoading,
  } = useColumnForm({
    column: editColumn,
    categoryId: editColumn?.category_id,
    onSave: onSaveColumn
  });

  // Log when dialog is opened or closed
  useEffect(() => {
    console.log(`Dialog ${isOpen ? 'opened' : 'closed'}`, { editColumn });
  }, [isOpen, editColumn]);

  // Form submission handler
  const handleSubmit = async (values: any) => {
    console.log("Form submitted:", values);
    
    try {
      const result = await onSubmit(values);
      
      if (result) {
        toast.success(isEditMode ? t("columnUpdated") : t("columnAdded"));
        onClose();
      } else {
        toast.error(t("errorOccurred"));
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(t("errorOccurred"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("Dialog onOpenChange:", open);
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("editColumn") : t("addNewColumn")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? t("editColumnDescription") 
              : t("addColumnDescription")}
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
                    columns={columns}
                    editColumn={editColumn}
                    selectedType={selectedType}
                    onTypeChange={onTypeChange}
                    isEditMode={isEditMode}
                  />
                </TabsContent>
                
                <TabsContent value="validation" className="space-y-4">
                  {["text", "number", "date", "email", "url", "tel", "phone"].includes(selectedType) && (
                    <ValidationFields 
                      control={form.control} 
                      type={selectedType} 
                    />
                  )}
                  {!["text", "number", "date", "email", "url", "tel", "phone"].includes(selectedType) && (
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
                      newOption={{
                        id: '', 
                        ...newOption, 
                        label: newOption.label || '',
                        value: newOption.value || ''
                      }}
                      setNewOption={setNewOption}
                      addOption={addOption}
                      removeOption={removeOption}
                      updateOption={(oldOption, newOption) => {
                        const index = options.findIndex(opt => opt.id === oldOption.id);
                        
                        if (index !== -1) {
                          const updatedOptions = [...options];
                          updatedOptions[index] = newOption;
                          setOptions(updatedOptions);
                          form.setValue('options', updatedOptions);
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
              disabled={isSubmitting || isLoading}
            >
              {t("cancel")}
            </Button>
            <Button 
              type="submit"
              onClick={form.handleSubmit(handleSubmit)}
              disabled={form.formState.isSubmitting || isSubmitting || isLoading}
            >
              {form.formState.isSubmitting || isSubmitting || isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("loading")}
                </span>
              ) : isEditMode ? t("save") : t("add")}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnFormDialog;
