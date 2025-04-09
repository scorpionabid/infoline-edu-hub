import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithColumns, Column } from '@/types/column';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import AddColumnDialog from '@/components/columns/AddColumnDialog';
import DeleteColumnDialog from '@/components/columns/DeleteColumnDialog';
import EditColumnDialog from '@/components/columns/EditColumnDialog';
import { useColumns } from '@/hooks/useColumns';
import PageHeader from '@/components/layout/PageHeader';

const Columns: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [deleteColumnDialogOpen, setDeleteColumnDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { columns, categories, createColumn, updateColumn, deleteColumn, isLoading, error } = useColumns();

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    columnId: '',
    columnName: ''
  });

  const handleOpenAddColumnDialog = () => {
    setAddColumnDialogOpen(true);
  };

  const handleCloseAddColumnDialog = () => {
    setAddColumnDialogOpen(false);
    setSelectedColumn(null);
  };

  const handleOpenEditColumnDialog = (column: Column) => {
    setSelectedColumn(column);
    setEditColumnDialogOpen(true);
  };

  const handleCloseEditColumnDialog = () => {
    setEditColumnDialogOpen(false);
    setSelectedColumn(null);
  };

  const handleOpenDeleteDialog = (columnId: string, columnName: string) => {
    setDeleteDialog({
      isOpen: true,
      columnId: columnId,
      columnName: columnName
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      columnId: '',
      columnName: ''
    });
  };

  const handleAddColumn = async (newColumn: Omit<Column, "id">): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const success = await createColumn(newColumn);
      if (success) {
        toast.success(t('columnCreated'));
        handleCloseAddColumnDialog();
        return true;
      } else {
        toast.error(t('columnCreationFailed'));
        return false;
      }
    } catch (error) {
      console.error("Sütun yaratma xətası:", error);
      toast.error(t('columnCreationFailed'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditColumn = async (columnData: Omit<Column, "id"> & { id?: string }): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      if (!columnData.id) {
        toast.error(t('columnIdRequired'));
        return false;
      }
      const success = await updateColumn(columnData.id, columnData);
      if (success) {
        toast.success(t('columnUpdated'));
        handleCloseEditColumnDialog();
        return true;
      } else {
        toast.error(t('columnUpdateFailed'));
        return false;
      }
    } catch (error) {
      console.error("Sütun redaktə xətası:", error);
      toast.error(t('columnUpdateFailed'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteColumn = async (columnId: string): Promise<void> => {
    try {
      await deleteColumn(columnId);
      toast.success(t('columnDeleted'));
    } catch (error) {
      console.error("Sütun silmə xətası:", error);
      toast.error(t('columnDeletionFailed'));
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const columnsDef = React.useMemo(() => [
    {
      accessorKey: 'name',
      header: t('name'),
    },
    {
      accessorKey: 'type',
      header: t('type'),
    },
    {
      accessorKey: 'category_id',
      header: t('category'),
      cell: ({ row }) => {
        const category = categories?.find(c => c.id === row.original.category_id);
        return category ? category.name : t('unknown');
      },
    },
    {
      accessorKey: 'status',
      header: t('status'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleOpenEditColumnDialog(row.original)}>
            {t('edit')}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteDialog(row.original.id, row.original.name)}>
            {t('delete')}
          </Button>
        </div>
      ),
    },
  ], [t, categories]);

  return (
    <>
      <PageHeader
        title={t('columnsPageTitle')}
        description={t('columnsPageDescription')}
        backButtonUrl="/categories"
      >
        <Button onClick={handleOpenAddColumnDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addColumn')}
        </Button>
      </PageHeader>

      <DataTableViewOptions table={null} />
      <DataTable columns={columnsDef} data={columns || []} isLoading={isLoading} error={error} />

      {/* Əlavə etmə dialoqu */}
      <AddColumnDialog
        isOpen={addColumnDialogOpen}
        onClose={handleCloseAddColumnDialog}
        onAddColumn={handleAddColumn}
        categories={categories || []}
      />

      {/* Redaktə etmə dialoqu */}
      <EditColumnDialog
        isOpen={editColumnDialogOpen}
        onClose={handleCloseEditColumnDialog}
        onEditColumn={handleEditColumn}
        column={selectedColumn}
        isSubmitting={isSubmitting}
        categories={categories || []}
      />

      {/* Silmə dialoqu */}
      {deleteDialog.isOpen && (
        <DeleteColumnDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDeleteColumn}
          columnId={deleteDialog.columnId}
          columnName={deleteDialog.columnName}
        />
      )}
    </>
  );
};

export default Columns;
