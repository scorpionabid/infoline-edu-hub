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
import PageHeader from '@/components/layout/PageHeader';
import DeleteColumnDialog from '@/components/columns/DeleteColumnDialog';
import ColumnFormDialog from '@/components/columns/ColumnFormDialog';
import { useColumns } from '@/hooks/columns';
import ColumnList from '@/components/columns/ColumnList';
import EmptyState from '@/components/common/EmptyState';
import { useCategories } from '@/hooks/categories/useCategories';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useColumnMutations } from '@/hooks/columns/useColumnMutations';
import { useQueryClient } from '@tanstack/react-query';
import { Column } from '@/types/column';

const Columns: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [columnFormDialogOpen, setColumnFormDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { columns, isLoading: columnsLoading, isError, error: columnsError, refetch: refetchColumns } = useColumns();
  
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories
  } = useCategories();
  
  const { userRole } = usePermissions();
  const { createColumn, updateColumn, deleteColumn } = useColumnMutations();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // SuperAdmin və region admini sütun əlavə və redaktə edə bilər
  const canManageColumns = userRole === 'superadmin' || userRole === 'regionadmin';
  
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    column: '',
    columnName: '',
    categoryId: ''
  });

  console.log('Columns page rendered, canManageColumns:', canManageColumns);

  // Filter columns
  const filteredColumns = React.useMemo(() => {
    if (!columns || !Array.isArray(columns)) return [];
    
    return columns.filter(column => {
      const matchesSearch = searchQuery === '' || 
        column.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || 
        column.category_id === categoryFilter;
      
      const matchesType = typeFilter === 'all' || 
        column.type === typeFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        column.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    }) || [];
  }, [columns, searchQuery, categoryFilter, typeFilter, statusFilter]);

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

  // Show error message if retries failed
  if (categoriesError || columnsError) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title={t('columnsPageTitle') || 'Columns'}
          description={t('columnsPageDescription') || 'Manage columns'}
          backButtonUrl="/categories"
        />
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
        <PageHeader
          title={t('columnsPageTitle') || 'Columns'}
          description={t('columnsPageDescription') || 'Manage columns'}
          backButtonUrl="/categories"
        />
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>{t('loadingColumns') || 'Loading columns...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={t('columnsPageTitle') || 'Columns'}
        description={t('columnsPageDescription') || 'Manage columns'}
        backButtonUrl="/categories"
      >
        {canManageColumns && (
          <div className="flex gap-2">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleOpenAddColumnDialog} disabled={!selectedCategoryId}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addColumn') || 'Add Column'}
            </Button>
          </div>
        )}
      </PageHeader>

      {/* Filter bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchColumns") || "Search columns..."}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-2">
            <Select 
              value={categoryFilter || 'all'} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("categoryFilter") || "Category filter"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories") || "All categories"}</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id || `category-${Math.random()}`}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={typeFilter || 'all'} 
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("typeFilter") || "Type filter"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allTypes") || "All types"}</SelectItem>
                <SelectItem value="text">{t("text") || "Text"}</SelectItem>
                <SelectItem value="number">{t("number") || "Number"}</SelectItem>
                <SelectItem value="date">{t("date") || "Date"}</SelectItem>
                <SelectItem value="select">{t("select") || "Select"}</SelectItem>
                <SelectItem value="checkbox">{t("checkbox") || "Checkbox"}</SelectItem>
                <SelectItem value="radio">{t("radio") || "Radio"}</SelectItem>
                <SelectItem value="file">{t("file") || "File"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredColumns.length === 0 && !columnsLoading ? (
        <EmptyState
          icon={<Database className="h-12 w-12" />}
          title={t('noColumnsFound') || 'No columns found'}
          description={t('noColumnsFoundDescription') || 'No columns found for the selected filters'}
          action={canManageColumns && selectedCategoryId ? {
            label: t('addColumn') || 'Add Column',
            onClick: handleOpenAddColumnDialog
          } : undefined}
        />
      ) : (
        <ColumnList
          columns={filteredColumns}
          categories={categories || []}
          isLoading={columnsLoading || categoriesLoading}
          isError={!!columnsError || !!categoriesError}
          onEditColumn={handleEditColumn}
          onDeleteColumn={(id, name) => handleOpenDeleteDialog(
            id, 
            name, 
            Array.isArray(columns) 
              ? columns.find(c => c.id === id)?.category_id || ''
              : ''
          )}
          onUpdateStatus={(id, status) => console.log('Update status:', id, status)}
          canManageColumns={canManageColumns}
        />
      )}

      <ColumnFormDialog
        isOpen={columnFormDialogOpen}
        onClose={() => {
          console.log('Closing column dialog');
          setColumnFormDialogOpen(false);
          setSelectedColumn(null);
        }}
        onSaveColumn={selectedColumn ? handleUpdateColumn : handleAddColumn}
        categories={categories || []}
        editColumn={selectedColumn}
        columns={columns as any[]}
        isSubmitting={isSubmitting}
      />

      {deleteDialog.isOpen && (
        <DeleteColumnDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
          onConfirm={handleDeleteColumn}
          column={deleteDialog.column}
          columnName={deleteDialog.columnName}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default Columns;
