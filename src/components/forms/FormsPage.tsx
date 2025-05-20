
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { CategoryWithColumns, CategoryStatus, CategoryAssignment, CategoryFilter } from '@/types/category';
import CategoryFilterComponent from './CategoryFilterComponent';
import CategoryList from './CategoryList';
import CreateCategoryDialog from './CreateCategoryDialog';

const FormsPage: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [filters, setFilters] = useState<CategoryFilter>({
    search: '',
    status: '',
    assignment: ''
  });

  const handleFilterChange = (newFilters: Partial<CategoryFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching categories...');
      // First, get all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: false });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }

      console.log('Categories fetched:', categoriesData?.length);

      // Process data to match CategoryWithColumns type
      const processedCategories: CategoryWithColumns[] = [];
      
      if (categoriesData) {
        for (const category of categoriesData) {
          try {
            // For each category, fetch its columns
            const { data: columnsData, error: columnsError } = await supabase
              .from('columns')
              .select('*')
              .eq('category_id', category.id)
              .order('order_index', { ascending: true });
            
            if (columnsError) {
              console.error('Error fetching columns for category:', category.id, columnsError);
              throw columnsError;
            }
            
            // Process columns to ensure JSON fields are parsed
            const columns = (columnsData || []).map(column => {
              // Add missing fields to match interface requirements
              const processedColumn = {
                ...column,
                description: column.description || '',
                section: column.section || '',
                color: column.color || '',
              };
              
              const processedOptions = column.options ? 
                (typeof column.options === 'string' ? JSON.parse(column.options) : column.options) : 
                [];
                
              const processedValidation = column.validation ? 
                (typeof column.validation === 'string' ? JSON.parse(column.validation) : column.validation) : 
                null;
                
              return {
                ...processedColumn,
                options: processedOptions,
                validation: processedValidation
              };
            });
            
            processedCategories.push({
              ...category,
              status: category.status as CategoryStatus,
              assignment: category.assignment as CategoryAssignment,
              column_count: columns.length,
              columnCount: columns.length, // Add alias for compatibility
              columns: columns
            });
          } catch (error) {
            console.error('Error processing category:', category.id, error);
            // Still add the category even if there was an error fetching its columns
            processedCategories.push({
              ...category,
              status: category.status as CategoryStatus,
              assignment: category.assignment as CategoryAssignment,
              column_count: 0,
              columnCount: 0,
              columns: []
            });
          }
        }
      }

      console.log('Categories processed:', processedCategories.length);
      setCategories(processedCategories);
    } catch (error: any) {
      console.error('Error in fetchCategories:', error);
      toast({
        title: t('error'),
        description: t('errorFetchingCategories'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refreshCategories = async () => {
    await fetchCategories();
  };

  const filteredCategories = categories.filter(category => {
    // Filter by search term
    if (filters.search && !category.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Filter by status
    if (filters.status && category.status !== filters.status) {
      return false;
    }

    // Filter by assignment
    if (filters.assignment && category.assignment !== filters.assignment) {
      return false;
    }

    return true;
  });

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('forms')}</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('addCategory')}
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <CategoryFilterComponent 
            filters={filters}
            onChange={handleFilterChange}
            showAssignmentFilter={true}
          />
        </CardContent>
      </Card>
      
      <CategoryList 
        categories={filteredCategories} 
        isLoading={isLoading} 
        onRefresh={refreshCategories}
        onEditCategory={(category) => {
          // Navigate to category edit page
          window.location.href = `/categories/${category.id}/edit`;
        }}
        onDeleteCategory={async (category) => {
          if (window.confirm(t('confirmDeleteCategory'))) {
            try {
              const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', category.id);
              
              if (error) throw error;
              
              toast({
                title: t('success'),
                description: t('categoryDeleted'),
              });
              
              refreshCategories();
            } catch (error: any) {
              toast({
                title: t('error'),
                description: error.message || t('errorDeletingCategory'),
                variant: 'destructive',
              });
            }
          }
        }}
        onViewDetails={(category) => {
          // Navigate to category details page
          window.location.href = `/categories/${category.id}`;
        }}
      />
      
      <CreateCategoryDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCategoryCreated={refreshCategories}
      />
    </div>
  );
};

export default FormsPage;
