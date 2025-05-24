
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
import { useAuth } from '@/context/auth';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRetries, setLoadingRetries] = useState(0);
  
  const { columns, isLoading: columnsLoading, isError, error: columnsError, refetch: refetchColumns } = useColumns();
  
  // Use the correct hook API for categories
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

  // Load categories and columns with retry logic
  const loadData = useCallback(() => {
    console.log('Loading categories and columns data');
    refetchCategories();
    refetchColumns();
  }, [refetchCategories, refetchColumns]);

  // Retry if data loading fails
  useEffect(() => {
    if ((categoriesError || columnsError) && loadingRetries < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying data fetch (attempt ${loadingRetries + 1})`);
        setLoadingRetries(prev => prev + 1);
        loadData();
      }, Math.pow(2, loadingRetries) * 1000); // Exponential backoff
      return () => clearTimeout(timer);
    }
  }, [categoriesError, columnsError, loadingRetries, loadData]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter columns
  const filteredColumns = React.useMemo(() => {
    if (!columns) return [];
    
    return columns.filter(column => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        column.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = categoryFilter === 'all' || 
        column.category_id === categoryFilter;
      
      // Filter by type
      const matchesType = typeFilter === 'all' || 
        column.type === typeFilter;
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || 
        column.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    }) || [];
  }, [columns, searchQuery, categoryFilter, typeFilter, statusFilter]);

  // Sütun əlavə etmə düyməsinin hadisə işləyicisi
  const handleOpenAddColumnDialog = () => {
    if (!canManageColumns) {
      toast.error(t('noPermission'), {
        description: t('adminPermissionRequired')
      });
      return;
    }
    
    // Əvvəlcə seçilmiş sütunu təmizləyirik
    setSelectedColumn(null);
    
    // Dialoqu açırıq
    console.log('Sütun əlavə et dialoqu açılır...');
    setColumnFormDialogOpen(true);
  };

  // Sütun əlavə etmə
  const handleAddColumn = async (newColumn: Omit<Column, "id"> & { id?: string }): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      console.log('Yeni sütun əlavə edilir:', newColumn);
      
      const result = await createColumn(newColumn);
      
      if (result.success) {
        toast.success(t('columnAdded'), {
          description: t('columnAddedDescription')
        });
        setColumnFormDialogOpen(false);
        refetchColumns();
        return true;
      } else {
        toast.error(t('columnAddFailed'), {
          description: result.error || t('unknownError')
        });
        return false;
      }
    } catch (error) {
      console.error('Sütun əlavə etmə xətası:', error);
      toast.error(t('columnAddFailed'), {
        description: t('unknownError')
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sütun redaktə etmə
  const handleEditColumn = (column: Column) => {
    console.log('Redaktə ediləcək sütun:', column);
    setSelectedColumn(column);
    setColumnFormDialogOpen(true);
  };

  // Sütun yeniləmə
  const handleUpdateColumn = async (updatedColumn: Omit<Column, "id"> & { id?: string }): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      console.log('Sütun yenilənir:', updatedColumn);
      
      const result = await updateColumn(updatedColumn as Column);
      
      if (result.success) {
        toast.success(t('columnUpdated'), {
          description: t('columnUpdatedDescription')
        });
        setColumnFormDialogOpen(false);
        refetchColumns();
        return true;
      } else {
        toast.error(t('columnUpdateFailed'), {
          description: result.error || t('unknownError')
        });
        return false;
      }
    } catch (error) {
      console.error('Sütun yeniləmə xətası:', error);
      toast.error(t('columnUpdateFailed'), {
        description: t('unknownError')
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sütun silmə dialoqu
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

  // Sütun silmə
  const handleDeleteColumn = async () => {
    try {
      setIsSubmitting(true);
      console.log('Sütun silinir:', deleteDialog.column);
      
      const result = await deleteColumn(deleteDialog.column);
      
      if (result.success) {
        toast.success(t('columnDeleted'), {
          description: t('columnDeletedDescription')
        });
        setDeleteDialog({ ...deleteDialog, isOpen: false });
        refetchColumns();
      } else {
        toast.error(t('columnDeleteFailed'), {
          description: result.error || t('unknownError')
        });
      }
    } catch (error) {
      console.error('Sütun silmə xətası:', error);
      toast.error(t('columnDeleteFailed'), {
        description: t('unknownError')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show error message if all retries failed
  if ((categoriesError || columnsError) && loadingRetries >= 3) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title={t('columnsPageTitle')}
          description={t('columnsPageDescription')}
          backButtonUrl="/categories"
        />
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {String(categoriesError || columnsError || t('unknownError'))}
          </AlertDescription>
          <Button variant="outline" size="sm" onClick={loadData} className="ml-auto">
            {t('tryAgain')}
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
          title={t('columnsPageTitle')}
          description={t('columnsPageDescription')}
          backButtonUrl="/categories"
        />
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>{t('loadingColumns')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
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

      {/* Filter bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchColumns")}
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
                <SelectValue placeholder={t("categoryFilter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
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
                <SelectValue placeholder={t("typeFilter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allTypes")}</SelectItem>
                <SelectItem value="text">{t("text")}</SelectItem>
                <SelectItem value="number">{t("number")}</SelectItem>
                <SelectItem value="date">{t("date")}</SelectItem>
                <SelectItem value="select">{t("select")}</SelectItem>
                <SelectItem value="checkbox">{t("checkbox")}</SelectItem>
                <SelectItem value="radio">{t("radio")}</SelectItem>
                <SelectItem value="file">{t("file")}</SelectItem>
                <SelectItem value="image">{t("image")}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={statusFilter || 'all'} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("statusFilter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="active">{t("activeOnly")}</SelectItem>
                <SelectItem value="inactive">{t("inactiveOnly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredColumns.length === 0 && !columnsLoading ? (
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
          columns={filteredColumns}
          categories={categories || []}
          isLoading={columnsLoading || categoriesLoading}
          isError={!!columnsError || !!categoriesError}
          onEditColumn={handleEditColumn}
          onDeleteColumn={(id, name) => handleOpenDeleteDialog(
            id, 
            name, 
            columns?.find(c => c.id === id)?.category_id || ''
          )}
          onUpdateStatus={(id, status) => console.log('Update status:', id, status)}
          canManageColumns={canManageColumns}
        />
      )}

      {/* Sütun əlavə etmə və redaktə dialoqu */}
      <ColumnFormDialog
        isOpen={columnFormDialogOpen}
        onClose={() => setColumnFormDialogOpen(false)}
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
