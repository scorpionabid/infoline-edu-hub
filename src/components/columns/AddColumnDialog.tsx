
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

interface AddColumnDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (columnData: Omit<Column, "id"> | Column) => Promise<boolean>;
  categoryId?: string;
  column?: Column | null;
  categoryName?: string;
  categories?: { id: string; name: string }[];
  columns?: Column[];
}

const AddColumnDialog: React.FC<AddColumnDialogProps> = ({
  open = false,
  onOpenChange,
  onSubmit,
  categoryId = "",
  column = null,
  categoryName = "",
  categories = [],
  columns = [],
}) => {
  const {
    form,
    selectedType,
    handleTypeChange,
    onSubmit: handleFormSubmit,
    isEditMode,
    t
  } = useColumnForm({
    categories,
    editColumn: column,
    onAddColumn: onSubmit || (async () => false),
  });

  // Handle form submission
  const handleSubmit = async (values: any) => {
    if (await handleFormSubmit(values)) {
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange && onOpenChange(!open)}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? (t("editColumn") || "Sütunu düzəlt") : (t("addColumn") || "Sütun əlavə et")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Əsas sahələr */}
              <BasicColumnFields
                form={form}
                categories={categories}
                columns={columns}
                editColumn={column}
                selectedType={selectedType}
                handleTypeChange={handleTypeChange}
                categoryId={categoryId}
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
              <Button variant="outline" type="button" onClick={() => onOpenChange && onOpenChange(false)}>
                {t("cancel") || "Ləğv et"}
              </Button>
              <Button type="submit">
                {isEditMode ? (t("saveChanges") || "Dəyişiklikləri saxla") : (t("addColumn") || "Sütun əlavə et")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddColumnDialog;
