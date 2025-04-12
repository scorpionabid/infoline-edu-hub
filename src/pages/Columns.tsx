
import React, { useState, useEffect } from 'react';
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
import { useCategories } from '@/hooks/useCategories';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useColumnActions } from '@/hooks/useColumnActions';
import { useQueryClient } from '@tanstack/react-query';

const Columns: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { columns, isLoading, isError, error, refetch } = useColumns();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { userRole } = usePermissions();
  const { handleDeleteColumn } = useColumnActions();
  
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
    columnName: ''
  });

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
    setSelectedColumn(null);
  };

  const handleOpenEditColumnDialog = (column: any) => {
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

  const handleOpenDeleteDialog = (columnId: string, columnName: string) => {
    if (!canManageColumns) {
      toast.error(t('noPermission'), {
        description: t('adminPermissionRequired')
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
      // Məlumatları yeniləyirik
      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      await refetch();
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
      // Məlumatları yeniləyirik
      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      await refetch();
      return true;
    } catch (error) {
      console.error("Sütun redaktə xətası:", error);
      toast.error(t('columnUpdateFailed'));
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
    
    try {
      const result = await handleDeleteColumn(columnId);
      if (result) {
        toast.success(t('columnDeleted'));
        handleCloseDeleteDialog();
        // Məlumatları yeniləyirik
        await queryClient.invalidateQueries({ queryKey: ['columns'] });
        await refetch();
        return true;
      } else {
        toast.error(t('columnDeletionFailed'));
        return false;
      }
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
    // Məlumatları yeniləyirik
    await queryClient.invalidateQueries({ queryKey: ['columns'] });
    await refetch();
  };

  // Əgər kateqoriyalar yüklənməyibsə, useEffectlə yükləyək
  useEffect(() => {
    refetch();
  }, [refetch]);

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
