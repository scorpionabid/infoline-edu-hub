import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import ColumnHeader from '@/components/columns/ColumnHeader';
import ColumnList from '@/components/columns/ColumnList';
import AddColumnDialog from '@/components/columns/AddColumnDialog';
import ImportColumnsDialog from '@/components/columns/ImportColumnsDialog';
import { useColumnsData } from '@/hooks/columns/useColumnsData';
import { useCategoriesData } from '@/hooks/categories/useCategoriesData';

const Columns = () => {
  const { categoryId = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [category, setCategory] = useState(null);

  // Fetch category and columns data
  const { fetchSingleCategory, isLoading: isCategoryLoading, isError: isCategoryError } = useCategoriesData();
  const { columns, isLoading: isColumnsLoading, error: columnsError, fetchColumns, createColumn, updateColumn, deleteColumn } = useColumnsData(categoryId);

  // Fetch category data
  useEffect(() => {
    const loadCategory = async () => {
      if (categoryId) {
        const data = await fetchSingleCategory(categoryId);
        if (data) {
          setCategory(data);
        } else {
          toast({
            title: 'Xəta',
            description: 'Kateqoriya tapılmadı',
            variant: 'destructive'
          });
          navigate('/categories');
        }
      }
    };

    loadCategory();
  }, [categoryId, fetchSingleCategory, navigate, toast]);

  // Handle column creation
  const handleColumnCreate = async (columnData) => {
    try {
      await createColumn(columnData);
      setIsAddDialogOpen(false);
      toast({
        title: 'Sütun əlavə edildi',
        description: `${columnData.name} sütunu uğurla əlavə edildi.`
      });
      return true;
    } catch (error) {
      console.error('Error creating column:', error);
      toast({
        title: 'Xəta baş verdi',
        description: 'Sütun əlavə edilmədi. Xahiş edirik yenidən cəhd edin.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Handle column update
  const handleColumnUpdate = async (columnData) => {
    try {
      await updateColumn(columnData);
      setIsAddDialogOpen(false);
      toast({
        title: 'Sütun yeniləndi',
        description: `${columnData.name} sütunu uğurla yeniləndi.`
      });
      return true;
    } catch (error) {
      console.error('Error updating column:', error);
      toast({
        title: 'Xəta baş verdi',
        description: 'Sütun yenilənmədi. Xahiş edirik yenidən cəhd edin.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Handle column deletion
  const handleColumnDelete = async (columnId) => {
    try {
      await deleteColumn(columnId);
      toast({
        title: 'Sütun silindi',
        description: 'Sütun uğurla silindi.'
      });
      return true;
    } catch (error) {
      console.error('Error deleting column:', error);
      toast({
        title: 'Xəta baş verdi',
        description: 'Sütun silinmədi. Xahiş edirik yenidən cəhd edin.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Open edit dialog
  const openEditDialog = (column) => {
    setSelectedColumn(column);
    setIsAddDialogOpen(true);
  };

  // Handle import from Excel
  const handleImportFromExcel = async (data) => {
    // TODO: Implement Excel import functionality
    toast({
      title: 'Sütunlar idxal edildi',
      description: 'Sütunlar uğurla idxal edildi.'
    });
    setIsImportDialogOpen(false);
    return true;
  };

  // Handle export to Excel
  const handleExportToExcel = () => {
    // TODO: Implement Excel export functionality
    toast({
      title: 'Sütunlar ixrac edildi',
      description: 'Sütunlar Excel formatında ixrac edildi.'
    });
  };

  const isLoading = isCategoryLoading || isColumnsLoading;
  const error = columnsError || isCategoryError;

  return (
    <SidebarLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/categories')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold">
            {category?.name || 'Sütunlar'}
          </h2>
        </div>
        
        <ColumnHeader 
          categoryName={category?.name || 'Sütunlar'} 
          onAddColumn={() => {
            setSelectedColumn(null);
            setIsAddDialogOpen(true);
          }}
          onImportColumns={() => setIsImportDialogOpen(true)}
          onExportColumns={handleExportToExcel}
        />
        
        <ColumnList 
          columns={columns} 
          isLoading={isLoading}
          error={error}
          onEditColumn={openEditDialog}
          onDeleteColumn={handleColumnDelete}
        />
      </div>
      
      {category && (
        <AddColumnDialog 
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          categoryId={categoryId}
          column={selectedColumn}
          onSubmit={selectedColumn ? handleColumnUpdate : handleColumnCreate}
          categoryName={category.name}
        />
      )}
      
      <ImportColumnsDialog 
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportFromExcel}
        categoryId={categoryId}
        categoryName={category?.name || ''}
      />
    </SidebarLayout>
  );
};

export default Columns;
