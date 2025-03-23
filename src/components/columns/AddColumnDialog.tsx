
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
  isOpen: boolean;
  onClose: () => void;
  onAddColumn: (newColumn: Omit<Column, "id">) => Promise<boolean>;
  categories: { id: string; name: string }[];
  editColumn?: Column; // For edit mode
  columns?: Column[]; // For parent column selection
}

const AddColumnDialog: React.FC<AddColumnDialogProps> = ({
  isOpen,
  onClose,
  onAddColumn,
  categories,
  editColumn,
  columns = [],
}) => {
  const {
    form,
    selectedType,
    options,
    newOption,
    setNewOption,
    handleTypeChange,
    addOption,
    removeOption,
    onSubmit,
    isEditMode,
    t
  } = useColumnForm(categories, editColumn, onAddColumn);

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
            {isEditMode ? t("editColumn") : t("addColumn")}
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
                  options={options}
                  newOption={newOption}
                  setNewOption={setNewOption}
                  addOption={addOption}
                  removeOption={removeOption}
                  t={t}
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
