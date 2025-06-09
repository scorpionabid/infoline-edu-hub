// Development server restart helper
// Last updated: Columns improvement implementation
// Fixed: Corrected file format and escape sequences
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Database, Search, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import ColumnTabs from '@/components/columns/ColumnTabs';
import ArchivedColumnList from '@/components/columns/ArchivedColumnList';
import RestoreColumnDialog from '@/components/columns/RestoreColumnDialog';
import PermanentDeleteDialog from '@/components/columns/PermanentDeleteDialog';
import DeleteColumnDialog from '@/components/columns/DeleteColumnDialog';
// import EnhancedDeleteColumnDialog from '@/components/columns/EnhancedDeleteColumnDialog';
import ColumnFormDialog from '@/components/columns/ColumnFormDialog';
import { useColumnsQuery } from '@/hooks/api/columns/useColumnsQuery';
import ColumnList from '@/components/columns/ColumnList';
import EmptyState from '@/components/common/EmptyState';
import { useCategories } from '@/hooks/categories/useCategories';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useColumnMutations } from '@/hooks/columns/useColumnMutations';
// import { useEnhancedColumnMutations } from '@/hooks/columns/useEnhancedColumnMutations';
import { useQueryClient } from '@tanstack/react-query';
import { Column } from '@/types/column';
import PageHeader from '@/components/layout/PageHeader';
import { Helmet } from 'react-helmet';
import ColumnsContainer from '@/components/columns/ColumnsContainer';
import CreateColumnDialog from '@/components/columns/CreateColumnDialog';

const Columns: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [columnFormDialogOpen, setColumnFormDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editColumn, setEditColumn] = useState<Column | null>(null);
  
  // Fetch all columns (no categoryId filter for this page)
  const { columns, isLoading: columnsLoading, isError, error: columnsError, refetch: refetchColumns } = useColumnsQuery();
  
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories
  } = useCategories();
  
  const { userRole } = usePermissions();
  const { createColumn, updateColumn, deleteColumn, restoreColumn, permanentDeleteColumn, isRestoring, isPermanentDeleting } = useColumnMutations();
  // const { enhancedDeleteColumn, restoreColumn, isEnhancedDeleting } = useEnhancedColumnMutations();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  
  // SuperAdmin və region admini sütun əlavə və redaktə edə bilər
  const canManageColumns = userRole === 'superadmin' || userRole === 'regionadmin';
  
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    column: '',
    columnName: '',
    categoryId: ''
  });

  // Restore column dialog state
  const [restoreDialog, setRestoreDialog] = useState({
    isOpen: false,
    columnId: '',
    columnName: ''
  });

  // Permanent delete column dialog state
  const [permanentDeleteDialog, setPermanentDeleteDialog] = useState({
    isOpen: false,
    column: {
      id: '',
      name: '',
      dataEntriesCount: 0
    }
  });

  // const [enhancedDeleteDialog, setEnhancedDeleteDialog] = useState({
  //   isOpen: false,
  //   column: {
  //     id: '',
  //     name: '',
  //     type: '',
  //     category_name: ''
  //   }
  // });

  console.log('Columns page rendered, canManageColumns:', canManageColumns);

  // Separate active and archived columns
  const activeColumns = React.useMemo(() => {
    return columns?.filter(column => column.status === 'active') || [];
  }, [columns]);
  
  const archivedColumns = React.useMemo(() => {
    return columns?.filter(column => column.status === 'deleted') || [];
  }, [columns]);
  
  // Get current columns based on active tab
  const currentColumns = activeTab === 'active' ? activeColumns : archivedColumns;
  
  // Filter columns (only search)
  const filteredColumns = React.useMemo(() => {
    if (!currentColumns || !Array.isArray(currentColumns)) return [];
    
    return currentColumns.filter(column => {
      const matchesSearch = searchQuery === '' || 
        column.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [currentColumns, searchQuery]);

  // Get the first available category for new columns
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
      console.log('Setting default category:', categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const handleOpenAddColumnDialog = () => {
    console.log('Add column button clicked, canManageColumns:', canManageColumns);
    console.log('Selected category ID:', selectedCategoryId);
    
    if (!canManageColumns) {
      toast.error(t('noPermission'), {
        description: t('adminPermissionRequired')
      });
      return;
    }

    if (!selectedCategoryId && categories && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
    
    setSelectedColumn(null);
    console.log('Opening add column dialog...');
    setColumnFormDialogOpen(true);
  };

  const handleAddColumn = async (newColumn: Omit<Column, "id"> & { id?: string }): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      console.log('Creating new column:', newColumn);
      
      // Ensure category_id is set
      if (!newColumn.category_id && selectedCategoryId) {
        newColumn.category_id = selectedCategoryId;
      }
      
      const result = await createColumn(newColumn);
      
      if (result.success) {
        toast.success(t('columnAdded') || 'Column added successfully');
        setColumnFormDialogOpen(false);
        refetchColumns();
        return true;
      } else {
        toast.error(t('columnAddFailed') || 'Failed to add column');
        return false;
      }
    } catch (error) {
      console.error('Error creating column:', error);
      toast.error(t('columnAddFailed') || 'Failed to add column');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditColumn = (column: Column) => {
    console.log('Editing column:', column);
    setSelectedColumn(column);
    setSelectedCategoryId(column.category_id);
    setColumnFormDialogOpen(true);
  };

  const handleUpdateColumn = async (updatedColumn: Omit<Column, "id"> & { id?: string }): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      console.log('Updating column:', updatedColumn);
      
      const result = await updateColumn(updatedColumn as Column);
      
      if (result.success) {
        toast.success(t('columnUpdated') || 'Column updated successfully');
        setColumnFormDialogOpen(false);
        refetchColumns();
        return true;
      } else {
        toast.error(t('columnUpdateFailed') || 'Failed to update column');
        return false;
      }
    } catch (error) {
      console.error('Error updating column:', error);
      toast.error(t('columnUpdateFailed') || 'Failed to update column');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (columnId: string, columnName: string, categoryId: string) => {
    if (!canManageColumns) {
      toast.error(t('noPermission'), {
        description: t('adminPermissionRequired')
      });
      return;
    }
    
    // Use basic delete dialog for now (Enhanced delete has server issues)
    setDeleteDialog({
      isOpen: true,
      column: columnId,
      columnName,
      categoryId
    });
  };

  const handleDeleteColumn = async () => {
    try {
      setIsSubmitting(true);
      console.log('Deleting column:', deleteDialog.column);
      
      const result = await deleteColumn(deleteDialog.column);
      
      if (result.success) {
        toast.success(t('columnDeleted') || 'Column deleted successfully');
        setDeleteDialog({ ...deleteDialog, isOpen: false });
        refetchColumns();
      } else {
        toast.error(t('columnDeleteFailed') || 'Failed to delete column');
      }
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error(t('columnDeleteFailed') || 'Failed to delete column');
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleEnhancedDeleteColumn = async (options: { hardDelete: boolean; exportData: boolean }) => {
  //   try {
  //     console.log('Enhanced deleting column:', enhancedDeleteDialog.column.id, options);
  //     
  //     await enhancedDeleteColumn(enhancedDeleteDialog.column.id, {
  //       ...options,
  //       confirmation: `DELETE ${enhancedDeleteDialog.column.name}`
  //     });
  //     
  //     setEnhancedDeleteDialog({ ...enhancedDeleteDialog, isOpen: false });
  //     refetchColumns();
  //   } catch (error) {
  //     console.error('Error in enhanced delete:', error);
  //     // Error handling is done in the hook
  //   }
  // };

  // const handleRestoreColumn = async (columnId: string) => {
  //   try {
  //     console.log('Restoring column:', columnId);
  //     await restoreColumn(columnId);
  //     refetchColumns();
  //   } catch (error) {
  //     console.error('Error restoring column:', error);
  //     // Error handling is done in the hook
  //   }
  // };

  // Show error message if retries failed
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

  // Show loading state
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

  return (
    <>
      <Helmet>
        <title>{t('columns')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-destructive text-lg">{t('errorOccurred')}</p>
            <p className="text-muted-foreground">{t('couldNotLoadColumns')}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">{t('columns')}</h1>
                <p className="text-muted-foreground">{t('manageDataColumns')}</p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('createColumn')}
              </Button>
            </div>

            <ColumnsContainer
              columns={columns}
              categories={categories}
              isLoading={loading}
              onRefresh={refetch}
              onCreate={handleCreateColumn}
              onEdit={handleEditColumn}
              onDelete={handleDeleteColumn}
            />
          </>
        )}

        <CreateColumnDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSaveColumn={handleCreateColumn}
          categories={categories}
          columns={columns}
          isSubmitting={isSubmitting}
        />

        {editColumn && (
          <ColumnFormDialog
            open={!!editColumn}
            onClose={() => setEditColumn(null)}
            onSaveColumn={handleEditColumn}
            categories={categories}
            editColumn={editColumn}
            columns={columns}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </>
  );
};

export default Columns;
