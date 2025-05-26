
import React, { useEffect } from "react";
import { Column, ColumnType } from "@/types/column";
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
import { useColumnForm } from '@/hooks/columns/useColumnForm';
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

  // Log when dialog is opened or closed for debugging
  useEffect(() => {
    console.log(`ColumnFormDialog ${isOpen ? 'opened' : 'closed'}`, { editColumn, isEditMode });
  }, [isOpen, editColumn, isEditMode]);

  // Form submission handler with detailed logging
  const handleSubmit = async (values: any) => {
    console.log("Form submit started:", values);
    console.log("Form state:", { isEditMode, isLoading, isSubmitting });
    
    try {
      // Log more details for debugging
      console.log("Category ID:", values.category_id);
      console.log("Form type:", values.type);
      console.log("Selected type:", selectedType);
      
      // Make sure category_id is set
      if (!values.category_id && categories.length > 0) {
        values.category_id = categories[0].id;
        form.setValue('category_id', values.category_id);
        console.log("Auto-set category_id to:", values.category_id);
      }
      
      const result = await onSubmit(values);
      console.log("Form submit result:", result);
      
      if (result) {
        toast.success(isEditMode ? t("columnUpdated") : t("columnAdded"));
        console.log("Success! Closing dialog...");
        onClose();
      } else {
        console.error("Form submit failed");
        toast.error(t("errorOccurred"));
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(t("errorOccurred") + (error instanceof Error ? `: ${error.message}` : ''));
    }
  };

  // Handle add button click
  const handleAddButtonClick = () => {
    console.log("Add button clicked! Triggering form submit...");
    console.log("Form validation state:", form.formState);
    
    // Check if category exists in form and set it if available
    const currentCategory = form.getValues('category_id');
    console.log("Current category_id:", currentCategory);
    if (!currentCategory && categories.length > 0) {
      form.setValue('category_id', categories[0].id);
      console.log("Auto-set category_id to:", categories[0].id);
    }
    
    // Check if selectedType is set correctly
    const currentType = form.getValues('type');
    if (currentType !== selectedType) {
      console.log(`Type mismatch: form has ${currentType} but selectedType is ${selectedType}`);
      form.setValue('type', selectedType);
    }
    
    // Validate form before submitting
    form.handleSubmit(
      (data) => {
        console.log("Form validation passed, submitting:", data);
        handleSubmit(data);
      },
      (errors) => {
        console.error("Form validation failed:", errors);
        // Show more specific error messages
        if (errors.category_id) {
          toast.error(`Category field error: ${errors.category_id.message}`);
        } else if (errors.name) {
          toast.error(`Name field error: ${errors.name.message}`);
        } else if (errors.type) {
          toast.error(`Type field error: ${errors.type.message}`);
        } else {
          toast.error("Form validation failed. Please check all fields.");
        }
      }
    )();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("Dialog onOpenChange:", open);
      if (!open) {
        console.log("Closing dialog via onOpenChange");
        onClose();
      }
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
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              console.log("Form onSubmit triggered");
              handleAddButtonClick();
            }}>
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
                    errors={form.formState.errors}
                    watch={form.watch}
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
              onClick={() => {
                console.log("Cancel button clicked");
                onClose();
              }}
              disabled={isSubmitting || isLoading}
            >
              {t("cancel")}
            </Button>
            <Button 
              type="button"
              onClick={() => {
                console.log("Add/Save button clicked directly");
                // Log form state for debugging
                console.log("Form values before submit:", form.getValues());
                console.log("Form errors:", form.formState.errors);
                
                // Try to handle validation issues
                if (!form.getValues('category_id') && categories.length > 0) {
                  form.setValue('category_id', categories[0].id);
                }
                
                handleAddButtonClick();
              }}
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
