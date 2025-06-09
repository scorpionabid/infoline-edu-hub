
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
import ColumnFormDialog from '@/components/columns/ColumnFormDialog';
import { useColumnsQuery } from '@/hooks/api/columns/useColumnsQuery';
import ColumnList from '@/components/columns/ColumnList';
import EmptyState from '@/components/common/EmptyState';
import { useCategories } from '@/hooks/categories/useCategories';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useColumnMutations } from '@/hooks/columns/useColumnMutations';
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

  const handleCreateColumn = async (newColumn: Omit<Column, "id">): Promise<boolean> => {
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
    setEditColumn(column);
  };

  const handleUpdateColumn = async (updatedColumn: Column): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      console.log('Updating column:', updatedColumn);
      
      const result = await updateColumn(updatedColumn);
      
      if (result.success) {
        toast.success(t('columnUpdated') || 'Column updated successfully');
        setEditColumn(null);
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

  const handleDeleteColumn = async (columnId: string, columnName: string) => {
    if (!canManageColumns) {
      toast.error(t('noPermission'), {
        description: t('adminPermissionRequired')
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log('Deleting column:', columnId);
      
      const result = await deleteColumn(columnId);
      
      if (result.success) {
        toast.success(t('columnDeleted') || 'Column deleted successfully');
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
        <ColumnsContainer
          columns={columns}
          categories={categories}
          isLoading={columnsLoading || categoriesLoading}
          onRefresh={refetchColumns}
          onCreate={handleCreateColumn}
          onEdit={handleEditColumn}
          onDelete={handleDeleteColumn}
        />

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
            onOpenChange={(open) => !open && setEditColumn(null)}
            column={editColumn}
            categoryId={editColumn.category_id}
            onSave={handleUpdateColumn}
          />
        )}
      </div>
    </>
  );
};

export default Columns;
