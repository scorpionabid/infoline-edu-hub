import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SidebarLayout from '@/components/layout/SidebarLayout';
import ColumnList from '@/components/columns/ColumnList';
import AddColumnDialog from '@/components/columns/AddColumnDialog';
import EditColumnDialog from '@/components/columns/EditColumnDialog';
import DeleteColumnDialog from '@/components/columns/DeleteColumnDialog';
import { Column } from '@/types/column';
import { useColumns } from '@/hooks/useColumns';
import { useColumnActions } from '@/hooks/useColumnActions';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCategories } from '@/hooks/useCategories';

const Columns: React.FC = () => {
  const { 
    columns, 
    filteredColumns,
    isLoading: isColumnsLoading,
    error: columnsError,
    searchQuery,
    setSearchQuery,
    refetch: refetchColumns
  } = useColumns();
  
  const {
    isActionLoading,
    handleAddColumn,
    handleDeleteColumn,
    handleUpdateColumnStatus
  } = useColumnActions(refetchColumns);
  
  const { t } = useLanguage();
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);

  // Category selection state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Handlers
  const handleAddDialogOpen = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleEditDialogOpen = (column: Column) => {
    setSelectedColumn(column);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteDialogOpen = (column: Column) => {
    setSelectedColumn(column);
    setIsDeleteDialogOpen(true);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  // Filter columns based on selected category
  const categoryFilteredColumns = React.useMemo(() => {
    if (!selectedCategoryId) {
      return filteredColumns;
    }
    return filteredColumns.filter(column => column.categoryId === selectedCategoryId);
  }, [selectedCategoryId, filteredColumns]);

  const { categories, isLoading } = useCategories();
  
  return (
    <SidebarLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="search">{t('search')}:</Label>
            <Input
              type="search"
              id="search"
              placeholder={t('searchColumns')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleAddDialogOpen}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addColumn')}
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">{t('filterByCategory')}</h2>
            <CategorySelect categories={categories} isLoading={isLoading} selectedCategoryId={selectedCategoryId} onCategoryChange={handleCategoryChange} />
          </CardContent>
        </Card>
        
        <ColumnList 
          columns={categoryFilteredColumns}
          isLoading={isColumnsLoading}
          onEdit={handleEditDialogOpen} 
          onDelete={handleDeleteDialogOpen}
          handleStatusChange={handleUpdateColumnStatus}
        />
        
        <AddColumnDialog 
          isOpen={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
          onAddColumn={handleAddColumn}
          isSubmitting={isActionLoading}
          categories={categories}
        />
        
        <EditColumnDialog 
          isOpen={isEditDialogOpen} 
          onClose={() => setIsEditDialogOpen(false)} 
          onEditColumn={handleAddColumn}
          column={selectedColumn}
          isSubmitting={isActionLoading}
          categories={categories}
        />
        
        <DeleteColumnDialog 
          isOpen={isDeleteDialogOpen} 
          onClose={() => setIsDeleteDialogOpen(false)} 
          onConfirm={handleDeleteColumn}
          column={selectedColumn}
          isSubmitting={isActionLoading}
        />
      </div>
    </SidebarLayout>
  );
};

interface CategorySelectProps {
  categories: any[];
  isLoading: boolean;
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string) => void;
}

const CategorySelect: React.FC<CategorySelectProps> = ({ categories, isLoading, selectedCategoryId, onCategoryChange }) => {
  const { t } = useLanguage();

  return (
    <Select onValueChange={onCategoryChange} defaultValue={selectedCategoryId || ""}>
      <SelectTrigger>
        <SelectValue placeholder={t('selectCategory')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">{t('allCategories')}</SelectItem>
        {isLoading ? (
          <SelectItem value="" disabled>{t('loading')}</SelectItem>
        ) : (
          categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default Columns;
