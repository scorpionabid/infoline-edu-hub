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
import { supabase } from '@/integrations/supabase/client';
import { columnService } from '@/services/columns/columnService';

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
  
  // Get permissions first before other hooks
  const { userRole } = usePermissions();
  
  // Calculate permissions
  const canManageColumns = userRole === 'superadmin' || userRole === 'regionadmin';
  
  // NEW UNIFIED HOOKS - Fetch ALL columns (including deleted/inactive for admin management)
  const { 
    data: columns = [], 
    isLoading: columnsLoading, 
    error: columnsError, 
    refetch: refetchColumns 
  } = useColumnsQuery({ 
    // Include all statuses for admin management
    status: 'all',
    enabled: true
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
  
  // Debug logging - now after all dependencies are defined
  console.log('📋 Columns Page Debug:', {
    columnsLoading,
    columnsError,
    columnsCount: columns?.length || 0,
    canManageColumns,
    userRole
  });
  
  console.log('📄 Columns page rendered with NEW API:', {
    canManageColumns,
    userRole,
    columnsCount: columns?.length || 0,
    categoriesCount: categories?.length || 0
  });
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    columnId: '',
    columnName: '',
    categoryId: ''
  });

  const [restoreDialog, setRestoreDialog] = useState({
    open: false,
    columnId: '',
    columnName: ''
  });

  const [permanentDeleteDialog, setPermanentDeleteDialog] = useState({
    open: false,
    column: {
      id: '',
      name: '',
      dataEntriesCount: 0
    }
  });

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
      open: true,
      columnId: columnId,
      columnName: columnName,
      categoryId: editColumn?.category_id || ''
    });
  };

  const handleConfirmDelete = async () => {
    try {
      console.log('Deleting column with NEW API:', deleteDialog.columnId);
      
      await deleteColumn({ columnId: deleteDialog.columnId });
      
      toast.success(t('columnDeleted') || 'Column deleted successfully');
      setDeleteDialog({ open: false, columnId: '', columnName: '', categoryId: '' });
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

  // NEW: Handle permanent delete with dependency validation
  const handlePermanentDelete = async (columnId: string) => {
    try {
      console.log('🗑️ Preparing permanent delete for column:', columnId);
      
      // Get column details for confirmation dialog
      const column = columns.find(col => col.id === columnId);
      if (!column) {
        toast.error('Column not found');
        return;
      }

      // Get data entries count for warning
      const { data: dataEntries, error: dataCountError } = await supabase
        .from('data_entries')
        .select('id')
        .eq('column_id', columnId);

      if (dataCountError) {
        console.warn('⚠️ Error getting data entries count:', dataCountError);
      }

      console.log('📊 Found data entries:', dataEntries?.length || 0);

      setPermanentDeleteDialog({
        open: true,
        column: {
          id: columnId,
          name: column.name,
          dataEntriesCount: dataEntries?.length || 0
        }
      });
      
    } catch (error) {
      console.error('❌ Error preparing permanent delete:', error);
      toast.error('Error preparing delete operation');
    }
  };

  // FIXED: Correct permanent delete implementation
  const handleConfirmPermanentDelete = async (columnId: string) => {
    try {
      console.log('🗑️ Confirming permanent delete for column:', columnId);
      
      // Call delete with permanent flag - THIS IS THE KEY FIX
      await deleteColumn({ columnId, permanent: true });
      
      console.log('✅ Permanent delete completed successfully');
      
      setPermanentDeleteDialog({
        open: false,
        column: { id: '', name: '', dataEntriesCount: 0 }
      });
      refetchColumns();
      
    } catch (error) {
      console.error('❌ Error permanently deleting column:', error);
      toast.error('Sütun tam silinərkən xəta baş verdi');
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
          onRestore={handleRestoreColumnFromList}
          onPermanentDelete={handlePermanentDelete}
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
          open={restoreDialog.open}
          onOpenChange={(open) => setRestoreDialog(prev => ({ ...prev, open }))}
          columnId={restoreDialog.columnId}
          columnName={restoreDialog.columnName}
          onConfirm={() => handleRestoreColumnFromList(restoreDialog.columnId, restoreDialog.columnName)}
          isSubmitting={isLoading}
        />

        {/* Delete Dialog */}
        <DeleteColumnDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
          columnId={deleteDialog.columnId}
          columnName={deleteDialog.columnName}
          onConfirm={handleConfirmDelete}
          isSubmitting={isLoading}
        />

        {/* Permanent Delete Dialog */}
        <PermanentDeleteDialog
          open={permanentDeleteDialog.open}
          onOpenChange={(open) => setPermanentDeleteDialog(prev => ({ ...prev, open }))}
          column={permanentDeleteDialog.column}
          onConfirm={handleConfirmPermanentDelete}
          isSubmitting={isLoading}
        />
      </div>
    </>
  );
};

export default Columns;
