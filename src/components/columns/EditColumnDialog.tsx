
import React from "react";
import { Column } from "@/types/column";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

// Refaktorlanmış komponentlər
import { useColumnForm } from './columnDialog/useColumnForm';
import BasicColumnFields from './columnDialog/BasicColumnFields';
import ValidationFields from './columnDialog/ValidationFields';
import OptionsField from './columnDialog/OptionsField';

interface EditColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEditColumn: (column: Column) => Promise<boolean>;
  column: Column | null;
  categories: { id: string; name: string }[];
  isSubmitting?: boolean;
}

const EditColumnDialog: React.FC<EditColumnDialogProps> = ({
  isOpen,
  onClose,
  onEditColumn,
  column,
  categories,
  isSubmitting = false,
}) => {
  const {
    form,
    selectedType,
    handleTypeChange,
    onSubmit,
    isEditMode,
    t
  } = useColumnForm(categories, column, onEditColumn);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    if (await onSubmit(values)) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("editColumn")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Əsas sahələr */}
              <BasicColumnFields
                form={form}
                categories={categories}
                editColumn={column}
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
                />
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {t("saveChanges")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditColumnDialog;
