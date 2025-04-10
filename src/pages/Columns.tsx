
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
import { useColumns } from '@/hooks/columns';
import ColumnList from '@/components/columns/ColumnList';
import EmptyState from '@/components/common/EmptyState';
import { useCategories } from '@/hooks/useCategories';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

const Columns: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { columns, isLoading, isError, error, deleteColumn } = useColumns();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { userRole } = usePermissions();
  
  // Yalnız SuperAdmin sütun əlavə və redaktə edə bilər
  const canManageColumns = userRole === 'superadmin';
  
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    column: '',
    columnName: ''
  });

  const handleOpenAddColumnDialog = () => {
    if (!canManageColumns) {
      toast.error(t('noPermission'), {
        description: t('superAdminPermissionRequired')
      });
      return;
    }
    setAddColumnDialogOpen(true);
  };

  const handleCloseAddColumnDialog = () => {
    setAddColumnDialogOpen(false);
    setSelectedColumn(null);
  };

  const handleOpenEditColumnDialog = (column: any) => {
    if (!canManageColumns) {
      toast.error(t('noPermission'), {
        description: t('superAdminPermissionRequired')
      });
      return;
    }
    setSelectedColumn(column);
    setEditColumnDialogOpen(true);
  };

  const handleCloseEditColumnDialog = () => {
    setEditColumnDialogOpen(false);
    setSelectedColumn(null);
  };

  const handleOpenDeleteDialog = (columnId: string, columnName: string) => {
    if (!canManageColumns) {
      toast.error(t('noPermission'), {
        description: t('superAdminPermissionRequired')
      });
      return;
    }
    setDeleteDialog({
      isOpen: true,
      column: columnId,
      columnName
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      column: '',
      columnName: ''
    });
  };

  const handleAddColumn = async (newColumn: any): Promise<boolean> => {
    if (!canManageColumns) {
      toast.error(t('noPermission'));
      return false;
    }
    
    setIsSubmitting(true);
    try {
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
    if (!canManageColumns) {
      toast.error(t('noPermission'));
      return false;
    }
    
    setIsSubmitting(true);
    try {
      if (!columnData.id) {
        toast.error(t('columnIdRequired'));
        return false;
      }
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
    if (!canManageColumns) {
      toast.error(t('noPermission'));
      return false;
    }
    
    try {
      await deleteColumn.mutate(columnId);
      toast.success(t('columnDeleted'));
      handleCloseDeleteDialog();
      return true;
    } catch (error) {
      console.error("Sütun silmə xətası:", error);
      toast.error(t('columnDeletionFailed'));
      handleCloseDeleteDialog();
      return false;
    }
  };

  const handleUpdateColumnStatus = async (id: string, status: 'active' | 'inactive') => {
    if (!canManageColumns) {
      toast.error(t('noPermission'));
      return;
    }
    
    toast.success(t('columnStatusUpdated'));
  };

  // Əgər kateqoriyalar yüklənməyibsə, useEffectlə yükləyək
  useEffect(() => {
    if (categoriesLoading) {
      // Kateqoriyalar yükləniyor
    }
  }, [categoriesLoading]);

  const content = (
    <>
      <PageHeader
        title={t('columnsPageTitle')}
        description={t('columnsPageDescription')}
        backButtonUrl="/categories"
      >
        {canManageColumns && (
          <Button onClick={handleOpenAddColumnDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addColumn')}
          </Button>
        )}
      </PageHeader>

      {columns?.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Database className="h-12 w-12" />}
          title={t('noColumnsFound')}
          description={t('noColumnsFoundDescription')}
          action={canManageColumns ? {
            label: t('addColumn'),
            onClick: handleOpenAddColumnDialog
          } : undefined}
        />
      ) : (
        <ColumnList
          columns={columns || []}
          categories={categories || []}
          isLoading={isLoading || categoriesLoading}
          isError={!!error}
          onEditColumn={handleOpenEditColumnDialog}
          onDeleteColumn={handleOpenDeleteDialog}
          onUpdateStatus={handleUpdateColumnStatus}
          canManageColumns={canManageColumns}
        />
      )}

      {addColumnDialogOpen && (
        <AddColumnDialog
          isOpen={addColumnDialogOpen}
          onClose={handleCloseAddColumnDialog}
          onAddColumn={handleAddColumn}
          categories={categories || []}
        />
      )}

      {editColumnDialogOpen && (
        <EditColumnDialog
          isOpen={editColumnDialogOpen}
          onClose={handleCloseEditColumnDialog}
          onEditColumn={handleEditColumn}
          column={selectedColumn}
          isSubmitting={isSubmitting}
          categories={categories || []}
        />
      )}

      {deleteDialog.isOpen && (
        <DeleteColumnDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={() => handleDeleteColumn(deleteDialog.column)}
          column={deleteDialog.column}
          columnName={deleteDialog.columnName}
        />
      )}
    </>
  );

  return (
    <SidebarLayout>
      {content}
    </SidebarLayout>
  );
};

export default Columns;
