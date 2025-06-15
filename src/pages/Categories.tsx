
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCategoryOperations } from '@/hooks/categories/useCategoryOperations';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AddCategoryDialog from '@/components/categories/AddCategoryDialog';
import CategoryCard from '@/components/categories/CategoryCard';
import { toast } from 'sonner';
import { Category } from '@/types/category';
import CategoryList from '@/components/categories/CategoryList';

const Categories = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { fetchCategories, addCategory, error } = useCategoryOperations();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    assignment: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['categories', { searchQuery, ...filters }],
    queryFn: () => fetchCategories(searchQuery || '', filters),
  });

  const handleAddCategory = async (categoryData: any) => {
    try {
      await addCategory(categoryData);
      setIsDialogOpen(false);
      toast.success(t('categoryAdded'), {
        description: t('categoryAddedSuccess')
      });
      refetch();
    } catch (err: any) {
      toast.error(t('errorAddingCategory'), {
        description: err.message,
      });
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({ status: '', assignment: '' });
  };

  const handleCategorySelect = (categoryId: string) => {
    // Navigate to category details page
    window.location.href = `/categories/${categoryId}`;
  };

  useEffect(() => {
    console.log("Categories component rendered");
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('categories')}</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addCategory')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('categoriesList')}</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('search')}
                  className="w-[200px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {t('filters')}
              </Button>
            </div>
          </div>
          
          {isFilterOpen && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('all')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                  <SelectItem value="draft">{t('draft')}</SelectItem>
                  <SelectItem value="archived">{t('archived')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.assignment}
                onValueChange={(value) => updateFilter('assignment', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('assignment')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('allAssignments')}</SelectItem>
                  <SelectItem value="all">{t('allEntities')}</SelectItem>
                  <SelectItem value="sectors">{t('sectorsOnly')}</SelectItem>
                  <SelectItem value="schools">{t('schoolsOnly')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="ml-auto"
              >
                <X className="mr-2 h-4 w-4" />
                {t('resetFilters')}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <CategoryList onCategorySelect={handleCategorySelect} />
        </CardContent>
      </Card>

      <AddCategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleAddCategory}
      />
    </div>
  );
};

export default Categories;
