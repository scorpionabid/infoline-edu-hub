import React, { useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "@/contexts/TranslationContext";
import useCategoriesQuery from "@/hooks/categories/useCategoriesQuery";
import { useColumns } from "@/hooks/columns/useColumns";
import { useColumnManagement } from "@/hooks/columns/useColumnManagement";
import { useColumnForm } from "@/hooks/columns/useColumnForm";
import ColumnsContainer from "@/components/columns/ColumnsContainer";
import { Column } from "@/types/column";
import { toast } from "sonner";

const Columns = () => {
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | undefined>();

  // Get categories directly from the query
  const { categories = [], isLoading: categoriesLoading } =
    useCategoriesQuery();
  const {
    data: columns = [],
    isLoading: columnsLoading,
    refetch,
  } = useColumns(selectedCategoryId);

  const { archiveColumn, restoreColumn, deleteColumn } = useColumnManagement();

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleCreateColumn = useCallback(() => {
    if (!selectedCategoryId) {
      toast.error(t("columns.selectCategoryFirst"));
      return;
    }
    setIsCreateDialogOpen(true);
  }, [selectedCategoryId, t]);

  const handleEditColumn = useCallback((column: Column) => {
    setSelectedColumn(column);
    setIsEditDialogOpen(true);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    setIsCreateDialogOpen(false);
    refetch();
  }, [refetch]);

  const handleEditSuccess = useCallback(() => {
    setIsEditDialogOpen(false);
    setSelectedColumn(undefined);
    refetch();
  }, [refetch]);

  const handleArchiveColumn = useCallback(
    (column: Column) => {
      archiveColumn(column.id);
    },
    [archiveColumn],
  );

  const handleRestoreColumn = useCallback(
    (column: Column) => {
      restoreColumn(column.id);
    },
    [restoreColumn],
  );

  const handleDeleteColumn = useCallback(
    (column: Column, permanent: boolean = false) => {
      deleteColumn(column.id);
    },
    [deleteColumn],
  );

  const createFormProps = {
    categoryId: selectedCategoryId,
    onSuccess: handleCreateSuccess,
  };

  const editFormProps = selectedColumn
    ? {
        column: selectedColumn,
        categoryId: selectedColumn.category_id,
        onSuccess: handleEditSuccess,
      }
    : undefined;

  return (
    <>
      <Helmet>
        <title>{t("navigation.columns")} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6">
        <ColumnsContainer
          categories={categories}
          columns={columns}
          selectedCategoryId={selectedCategoryId}
          isLoading={categoriesLoading || columnsLoading}
          onCategoryChange={handleCategoryChange}
          onCreateColumn={handleCreateColumn}
          onEditColumn={handleEditColumn}
          onArchiveColumn={handleArchiveColumn}
          onRestoreColumn={handleRestoreColumn}
          onDeleteColumn={handleDeleteColumn}
          isCreateDialogOpen={isCreateDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          onCreateDialogClose={() => setIsCreateDialogOpen(false)}
          onEditDialogClose={() => setIsEditDialogOpen(false)}
          createFormProps={createFormProps}
          editFormProps={editFormProps}
        />
      </div>
    </>
  );
};

export default Columns;
