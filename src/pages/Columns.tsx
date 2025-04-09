
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Database } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import AddColumnDialog from '@/components/columns/AddColumnDialog';
import DeleteColumnDialog from '@/components/columns/DeleteColumnDialog';
import EditColumnDialog from '@/components/columns/EditColumnDialog';
import { useColumns } from '@/hooks/useColumns';
import ColumnList from '@/components/columns/ColumnList';
import EmptyState from '@/components/common/EmptyState';

const Columns: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { columns, isLoading, isError, error, deleteColumn } = useColumns();
  
  // Müvəqqəti mock categories massivi - bu, sonradan API ilə birləşdiriləcək
  const categories = [
    { id: '1', name: 'Əsas Məlumatlar' },
    { id: '2', name: 'Statistika' },
    { id: '3', name: 'Tədris' }
  ];

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

  const handleOpenEditColumnDialog = (column: any) => {
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

  const handleAddColumn = async (newColumn: any): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Burada normalde createColumn funksiyası çağırılır
      // Müvəqqəti olaraq uğurlu nəticə qaytarırıq
      toast.success(t('columnCreated'));
      handleCloseAddColumnDialog();
      return true;
    } catch (error) {
      console.error("Sütun yaratma xətası:", error);
      toast.error(t('columnCreationFailed'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditColumn = async (columnData: any): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      if (!columnData.id) {
        toast.error(t('columnIdRequired'));
        return false;
      }
      // Burada normalde updateColumn funksiyası çağırılır
      // Müvəqqəti olaraq uğurlu nəticə qaytarırıq
      toast.success(t('columnUpdated'));
      handleCloseEditColumnDialog();
      return true;
    } catch (error) {
      console.error("Sütun redaktə xətası:", error);
      toast.error(t('columnUpdateFailed'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteColumn = async (columnId: string): Promise<boolean> => {
    try {
      // Normalde deleteColumn funksiyası çağırılır
      // Müvəqqəti olaraq uğurlu nəticə qaytarırıq
      toast.success(t('columnDeleted'));
      return true;
    } catch (error) {
      console.error("Sütun silmə xətası:", error);
      toast.error(t('columnDeletionFailed'));
      return false;
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleUpdateColumnStatus = async (id: string, status: 'active' | 'inactive') => {
    // Burada normalde statusu yeniləmək üçün funksiya çağırılır
    toast.success(t('columnStatusUpdated'));
  };

  // Cədvəl boş olduğunda göstəriləcək məzmun
  if (columns?.length === 0 && !isLoading) {
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

        <EmptyState
          icon={<Database className="h-12 w-12" />}
          title={t('noColumnsFound')}
          description={t('noColumnsFoundDescription')}
          action={{
            label: t('addColumn'),
            onClick: handleOpenAddColumnDialog
          }}
        />

        <AddColumnDialog
          isOpen={addColumnDialogOpen}
          onClose={handleCloseAddColumnDialog}
          onAddColumn={handleAddColumn}
          categories={categories || []}
        />
      </>
    );
  }

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

      <ColumnList
        columns={columns || []}
        categories={categories || []}
        isLoading={isLoading}
        isError={!!error}
        onEditColumn={handleOpenEditColumnDialog}
        onDeleteColumn={handleOpenDeleteDialog}
        onUpdateStatus={handleUpdateColumnStatus}
      />

      <AddColumnDialog
        isOpen={addColumnDialogOpen}
        onClose={handleCloseAddColumnDialog}
        onAddColumn={handleAddColumn}
        categories={categories || []}
      />

      <EditColumnDialog
        isOpen={editColumnDialogOpen}
        onClose={handleCloseEditColumnDialog}
        onEditColumn={handleEditColumn}
        column={selectedColumn}
        isSubmitting={isSubmitting}
        categories={categories || []}
      />

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
