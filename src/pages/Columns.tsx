
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Database, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import PageHeader from '@/components/layout/PageHeader';
import AddColumnDialog from '@/components/columns/AddColumnDialog';
import DeleteColumnDialog from '@/components/columns/DeleteColumnDialog';
import EditColumnDialog from '@/components/columns/EditColumnDialog';
import { useColumns } from '@/hooks/columns';
import ColumnList from '@/components/columns/ColumnList';
import EmptyState from '@/components/common/EmptyState';
import useCategories from '@/hooks/categories/useCategories';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useColumnMutations } from '@/hooks/columns/useColumnMutations';
import { useQueryClient } from '@tanstack/react-query';
import { Column } from '@/types/column';

const Columns: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { columns, isLoading, isError, error, refetch } = useColumns();
  const { categories, isLoading: categoriesLoading, getCategories } = useCategories();
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

  // Kategoriyaları yükləyin
  useEffect(() => {
    getCategories();
  }, [getCategories]);

  // Sütunları yükləyin
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Filter columns
  const filteredColumns = React.useMemo(() => {
    return columns?.filter(column => {
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

  const handleOpenAddColumnDialog = () => {
    if (!canManageColumns) {
      toast.error(t('noPermission'), {
        description: t('adminPermissionRequired')
      });
      return;
    }
    setAddColumnDialogOpen(true);
  };

  const handleCloseAddColumnDialog = () => {
    setAddColumnDialogOpen(false);
  };

  const handleOpenEditColumnDialog = (column: Column) => {
    if (!canManageColumns) {
      toast.error(t('noPermission'), {
        description: t('adminPermissionRequired')
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

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      column: '',
      columnName: '',
      categoryId: ''
    });
  };

  const handleAddColumn = async (newColumn: Omit<Column, "id">): Promise<boolean> => {
    if (!canManageColumns) {
      toast.error(t('noPermission'));
      return false;
    }
    
    setIsSubmitting(true);
    try {
      console.log("handleAddColumn called with:", newColumn);
      const result = await createColumn(newColumn);
      
      if (result.success) {
        console.log("Column created successfully:", result.data);
        // Refresh data
        await queryClient.invalidateQueries({ queryKey: ['columns'] });
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
        await refetch();
        return true;
      } else {
        console.error("Error creating column:", result.error);
        toast.error(t('columnCreationFailed'), {
          description: result.error
        });
        return false;
      }
    } catch (error: any) {
      console.error("Column creation error:", error);
      toast.error(t('columnCreationFailed'), {
        description: error.message
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditColumn = async (columnData: Partial<Column>): Promise<boolean> => {
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
      
      const result = await updateColumn(columnData);
      
      if (result.success) {
        // Refresh data
        await queryClient.invalidateQueries({ queryKey: ['columns'] });
        await refetch();
        return true;
      } else {
        toast.error(t('columnUpdateFailed'), {
          description: result.error
        });
        return false;
      }
    } catch (error: any) {
      console.error("Column update error:", error);
      toast.error(t('columnUpdateFailed'), {
        description: error.message
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteColumn = async (columnId: string): Promise<boolean> => {
    if (!canManageColumns) {
      toast.error(t('noPermission'));
      return false;
    }
    
    setIsSubmitting(true);
    try {
      const categoryId = deleteDialog.categoryId || 
        columns?.find(c => c.id === columnId)?.category_id || '';
      
      const result = await deleteColumn(columnId, categoryId);
      
      if (result.success) {
        // Refresh data
        await queryClient.invalidateQueries({ queryKey: ['columns'] });
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
        await refetch();
        handleCloseDeleteDialog();
        return true;
      } else {
        toast.error(t('columnDeletionFailed'), {
          description: result.error
        });
        return false;
      }
    } catch (error: any) {
      console.error("Column deletion error:", error);
      toast.error(t('columnDeletionFailed'), {
        description: error.message
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateColumnStatus = async (id: string, status: 'active' | 'inactive') => {
    if (!canManageColumns) {
      toast.error(t('noPermission'));
      return;
    }
    
    try {
      setIsSubmitting(true);
      const column = columns?.find(c => c.id === id);
      
      if (!column) {
        toast.error(t('columnNotFound'));
        return;
      }
      
      const result = await updateColumn({
        ...column,
        status
      });
      
      if (result.success) {
        toast.success(t('columnStatusUpdated'));
        // Refresh data
        await queryClient.invalidateQueries({ queryKey: ['columns'] });
        await refetch();
      } else {
        toast.error(t('columnStatusUpdateFailed'), {
          description: result.error
        });
      }
    } catch (error: any) {
      console.error("Column status update error:", error);
      toast.error(t('columnStatusUpdateFailed'), {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
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
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("categoryFilter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={typeFilter} 
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
              value={statusFilter} 
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

      {filteredColumns.length === 0 && !isLoading ? (
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
          isLoading={isLoading || categoriesLoading}
          isError={!!error}
          onEditColumn={handleOpenEditColumnDialog}
          onDeleteColumn={(id, name) => handleOpenDeleteDialog(
            id, 
            name, 
            columns?.find(c => c.id === id)?.category_id || ''
          )}
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
          columns={columns || []}
        />
      )}

      {editColumnDialogOpen && selectedColumn && (
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
          onConfirm={() => onDeleteColumn(deleteDialog.column)}
          column={deleteDialog.column}
          columnName={deleteDialog.columnName}
          isSubmitting={isSubmitting}
        />
      )}
    </SidebarLayout>
  );
};

export default Columns;
