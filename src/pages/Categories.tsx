
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCategoryOperations } from '@/hooks/categories/useCategoryOperations';
import { useCategoryFilters } from '@/hooks/categories/useCategoryFilters';
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

const Categories = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { fetchCategories, addCategory, error } = useCategoryOperations();
  const { 
    filters,
    updateFilter,
    resetFilters,
    searchQuery,
    handleSearchChange,
    date,
    handleDateChange
  } = useCategoryFilters();

  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['categories', filters],
    queryFn: () => fetchCategories(searchQuery || '', filters),
  });

  const handleAddCategory = async (categoryData: any) => {
    try {
      await addCategory(categoryData);
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(t('errorAddingCategory'), {
        description: err.message,
      });
    }
  };

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
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                value={filters.status || 'all'}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.assignment || 'all'}
                onValueChange={(value) => updateFilter('assignment', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('assignment')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allAssignments')}</SelectItem>
                  <SelectItem value="sectors">{t('sectorsOnly')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.deadline || 'all'}
                onValueChange={(value) => updateFilter('deadline', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('deadline')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allDeadlines')}</SelectItem>
                  <SelectItem value="upcoming">{t('upcoming')}</SelectItem>
                  <SelectItem value="past">{t('past')}</SelectItem>
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? t('noSearchResults') : t('noCategories')}
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  onClick={() => handleSearchChange('')}
                  className="mt-2"
                >
                  {t('clearSearch')}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category: Category) => (
                <CategoryCard 
                  key={category.id} 
                  category={category}
                  onView={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
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
