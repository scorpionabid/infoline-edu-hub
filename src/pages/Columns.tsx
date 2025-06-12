// Development server restart helper
// Last updated: Columns improvement implementation - REFACTORED TO NEW API
// Fixed: Migration to unified hooks API
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RestoreColumnDialog from '@/components/columns/RestoreColumnDialog';
import PermanentDeleteDialog from '@/components/columns/PermanentDeleteDialog';
import DeleteColumnDialog from '@/components/columns/DeleteColumnDialog';
import ColumnsContainer from '@/components/columns/ColumnsContainer';
// NEW UNIFIED COMPONENT
import ColumnDialog from '@/components/columns/unified/ColumnDialog';
import { useCategories } from '@/hooks/categories/useCategories';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Column } from '@/types/column';
import PageHeader from '@/components/layout/PageHeader';
import { Helmet } from 'react-helmet';

// NEW UNIFIED API
import { useColumnsQuery, useColumnMutations } from '@/hooks/columns';

const Columns: React.FC = () => {
  const { t } = useLanguage();
  
  // State management
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [columnDialogMode, setColumnDialogMode] = useState<'create' | 'edit'>('create');
  const [editColumn, setEditColumn] = useState<Column | null>(null);
  
  // NEW UNIFIED HOOKS - Fetch ALL columns (including deleted ones for archive tab)
  const { 
    data: columns = [], 
    isLoading: columnsLoading, 
    error: columnsError, 
    refetch: refetchColumns 
  } = useColumnsQuery({ 
    // Include deleted columns so ColumnsContainer can show them in Archive tab
    includeDeleted: true
  });
  
  const {
    createColumn,
    updateColumn, 
    deleteColumn,
    restoreColumn,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError
  } = useColumnMutations();
  
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories
  } = useCategories();
  
  const { userRole } = usePermissions();
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    column: '',
    columnName: '',
    categoryId: ''
  });

  const [restoreDialog, setRestoreDialog] = useState({
    isOpen: false,
    columnId: '',
    columnName: ''
  });

  const [permanentDeleteDialog, setPermanentDeleteDialog] = useState({
    isOpen: false,
    column: {
      id: '',
      name: '',
      dataEntriesCount: 0
    }
  });

  // Permissions
  const canManageColumns = userRole === 'superadmin' || userRole === 'regionadmin';
  
  console.log('Columns page rendered with NEW API, canManageColumns:', canManageColumns);

  // Get the first available category for new columns
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
      console.log('Setting default category:', categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Handler functions with NEW API
  const handleCreateColumn = () => {
    setColumnDialogMode('create');
    setEditColumn(null);
    setColumnDialogOpen(true);
  };

  const handleEditColumn = (column: Column) => {
    console.log('Editing column with NEW API:', column);
    setColumnDialogMode('edit');
    setEditColumn(column);
    setColumnDialogOpen(true);
  };

  const handleSaveColumn = async (formData: any): Promise<boolean> => {
    try {
      if (columnDialogMode === 'create') {
        console.log('Creating new column with NEW API:', formData);
        
        await createColumn({
          categoryId: formData.category_id,
          data: formData
        });
        
        toast.success(t('columnAdded') || 'Column added successfully');
      } else {
        console.log('Updating column with NEW API:', formData);
        
        await updateColumn({
          columnId: editColumn!.id,
          data: formData
        });
        
        toast.success(t('columnUpdated') || 'Column updated successfully');
      }
      
      refetchColumns();
      return true;
      
    } catch (error) {
      console.error('Error saving column:', error);
      const message = columnDialogMode === 'create' 
        ? (t('columnAddFailed') || 'Failed to add column')
        : (t('columnUpdateFailed') || 'Failed to update column');
      toast.error(message);
      return false;
    }
  };

  const handleDeleteColumn = async (columnId: string, columnName: string) => {
    if (!canManageColumns) {
      toast.error(t('noPermission'), {
        description: t('adminPermissionRequired')
      });
      return;
    }
    
    // Show delete confirmation dialog instead of deleting directly
    setDeleteDialog({
      isOpen: true,
      column: columnId,
      columnName: columnName,
      categoryId: editColumn?.category_id || ''
    });
  };

  const handleConfirmDelete = async () => {
    try {
      console.log('Deleting column with NEW API:', deleteDialog.column);
      
      await deleteColumn({ columnId: deleteDialog.column });
      
      toast.success(t('columnDeleted') || 'Column deleted successfully');
      setDeleteDialog({ isOpen: false, column: '', columnName: '', categoryId: '' });
      refetchColumns();
      
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error(t('columnDeleteFailed') || 'Failed to delete column');
    }
  };

  const handleRestoreColumnFromList = async (columnId: string, columnName: string) => {
    try {
      console.log('Restoring column with NEW API:', columnId);
      
      await restoreColumn(columnId);
      
      toast.success(t('columnRestored') || 'Column restored successfully');
      refetchColumns();
      
    } catch (error) {
      console.error('Error restoring column:', error);
      toast.error(t('columnRestoreFailed') || 'Failed to restore column');
    }
  };

  // Error handling
  if (categoriesError || columnsError) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {String(categoriesError || columnsError || t('unknownError'))}
          </AlertDescription>
          <Button variant="outline" size="sm" onClick={() => {
            refetchCategories();
            refetchColumns();
          }} className="ml-auto">
            {t('tryAgain') || 'Try Again'}
          </Button>
        </Alert>
      </div>
    );
  }

  // Loading state
  if ((columnsLoading || categoriesLoading) && !columnsError && !categoriesError) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>{t('loadingColumns') || 'Loading columns...'}</p>
        </div>
      </div>
    );
  }

  // Show loading indicators for mutations
  const isLoading = isCreating || isUpdating || isDeleting;

  return (
    <>
      <Helmet>
        <title>{t('columns')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6">
        {/* Display any mutation errors */}
        {(createError || updateError || deleteError) && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {String(createError || updateError || deleteError)}
            </AlertDescription>
          </Alert>
        )}

        <ColumnsContainer
          columns={columns}
          categories={categories}
          isLoading={columnsLoading || categoriesLoading || isLoading}
          onRefresh={refetchColumns}
          onCreate={handleCreateColumn}
          onEdit={handleEditColumn}
          onDelete={handleDeleteColumn}
          onRestore={handleRestoreColumnFromList} // NEW: Restore handler
        />

        {/* UNIFIED COLUMN DIALOG */}
        <ColumnDialog
          mode={columnDialogMode}
          open={columnDialogOpen}
          onOpenChange={setColumnDialogOpen}
          onSave={handleSaveColumn}
          column={editColumn || undefined}
          categories={categories}
          isLoading={isLoading}
        />

        {/* Restore Dialog */}
        <RestoreColumnDialog
          open={restoreDialog.isOpen}
          onOpenChange={(open) => setRestoreDialog(prev => ({ ...prev, isOpen: open }))}
          columnId={restoreDialog.columnId}
          columnName={restoreDialog.columnName}
          onConfirm={() => handleRestoreColumnFromList(restoreDialog.columnId, restoreDialog.columnName)}
        />

        {/* Delete Dialog */}
        <DeleteColumnDialog
          open={deleteDialog.isOpen}
          onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}
          columnId={deleteDialog.column}
          columnName={deleteDialog.columnName}
          onConfirm={handleConfirmDelete}
        />

        {/* Permanent Delete Dialog */}
        <PermanentDeleteDialog
          open={permanentDeleteDialog.isOpen}
          onOpenChange={(open) => setPermanentDeleteDialog(prev => ({ ...prev, isOpen: open }))}
          column={permanentDeleteDialog.column}
          onConfirm={(columnId) => {
            // Implement permanent delete with NEW API if needed
            console.log('Permanent delete:', columnId);
          }}
        />
      </div>
    </>
  );
};

export default Columns;
