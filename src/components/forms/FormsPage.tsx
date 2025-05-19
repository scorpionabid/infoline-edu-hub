
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
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns:category_columns(*)
        `)
        .order('priority', { ascending: false });

      if (error) throw error;

      // Process data to match CategoryWithColumns type
      const processedCategories: CategoryWithColumns[] = data.map(category => ({
        ...category,
        status: category.status as CategoryStatus,
        assignment: category.assignment as CategoryAssignment,
        column_count: category.columns ? category.columns.length : 0,
        columnCount: category.columns ? category.columns.length : 0,
        columns: Array.isArray(category.columns) ? category.columns : []
      }));

      setCategories(processedCategories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
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
