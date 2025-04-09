
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  PlusCircle,
  Search,
  SlidersHorizontal,
  RefreshCw,
  CircleOff,
  CheckCircle,
  Trash2,
  Edit,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import CategoryList from '@/components/categories/CategoryList';
import EditCategoryDialog from '@/components/categories/EditCategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import CategoryFilterCard from '@/components/categories/CategoryFilterCard';
import EmptyState from '@/components/common/EmptyState';
import { useCategories } from '@/hooks/useCategories';
import { updateCategoryStatus, deleteCategory } from '@/api/categoryApi';
import { Category, CategoryStatus } from '@/types/category';

const Categories = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Kategori verileri
  const {
    categories,
    filteredCategories,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch,
  } = useCategories();
  
  // Dialoglar üçün dəyişənlər
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    assignment: 'all',
    deadline: 'all',
  });
  
  // Status dəyişdirmə mutasyonu
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CategoryStatus }) => 
      updateCategoryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Status yeniləndi',
        description: 'Kateqoriya statusu uğurla yeniləndi.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Xəta!',
        description: 'Status yeniləmək mümkün olmadı.',
      });
      console.error('Status yeniləmə xətası:', error);
    },
  });
  
  // Silmə mutasyonu
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Kateqoriya silindi',
        description: 'Kateqoriya uğurla silindi.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Xəta!',
        description: 'Kateqoriyanı silmək mümkün olmadı.',
      });
      console.error('Kateqoriya silinmə xətası:', error);
    },
  });
  
  // Redaktə dialoqunu aç
  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };
  
  // Silmə dialoqunu aç
  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };
  
  // Status dəyişmə
  const handleStatusChange = async (id: string, status: CategoryStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Kateqoriyanı yeniləmə
  const handleEditCategory = async (category: Category) => {
    try {
      // Burada kateqoriya yeniləmə API çağırışı olmalıdır
      // Aşağıdakı kod sadəcə taymaut ilə simulyasiya edir
      await new Promise(resolve => setTimeout(resolve, 500));
      
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Kateqoriya yeniləndi',
        description: 'Kateqoriya uğurla yeniləndi.',
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Xəta!',
        description: 'Kateqoriyanı yeniləmək mümkün olmadı.',
      });
      console.error('Kateqoriya yeniləmə xətası:', error);
      return false;
    }
  };
  
  // Kateqoriyanı silmə
  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Filter dəyişikliyi
  const handleFilterChange = (newFilter: any) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };
  
  // Filtrlə
  const applyFilters = (categories: Category[]) => {
    return categories.filter(category => {
      // Status filtri
      if (filter.status !== 'all' && category.status !== filter.status) {
        return false;
      }
      
      // Assignment filtri
      if (filter.assignment !== 'all' && category.assignment !== filter.assignment) {
        return false;
      }
      
      // Deadline filtri
      if (filter.deadline !== 'all') {
        if (!category.deadline) return false;
        
        const deadlineDate = new Date(category.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (
          filter.deadline === 'upcoming' && deadlineDate < today ||
          filter.deadline === 'past' && deadlineDate >= today
        ) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Filtrlənmiş və axtarış edilmiş kateqoriyalar
  const displayedCategories = applyFilters(filteredCategories);
  
  if (error) {
    return (
      <div className="container py-6">
        <PageHeader
          title={t('categories')}
          description={t('categoriesDescription')}
        />
        <EmptyState
          icon={<CircleOff className="h-12 w-12 text-muted-foreground" />}
          title="Xəta baş verdi"
          description="Kateqoriyaları yükləmək mümkün olmadı. Yenidən cəhd edin."
          action={<Button onClick={() => refetch()}>Yenidən cəhd et</Button>}
        />
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      <PageHeader
        title={t('categories')}
        description={t('categoriesDescription')}
      />
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchCategories')}
              className="w-full sm:w-[300px] pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filterlər</h4>
                <CategoryFilterCard 
                  filter={filter} 
                  onFilterChange={handleFilterChange} 
                />
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <Button onClick={() => navigate('/categories/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni kateqoriya
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-[250px]" />
                  <Skeleton className="h-4 w-[350px]" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <CategoryList
          categories={displayedCategories}
          isLoading={isLoading}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          handleStatusChange={handleStatusChange}
        />
      )}
      
      {/* Redaktə dialoqu */}
      {editingCategory && (
        <EditCategoryDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onEditCategory={handleEditCategory}
          category={editingCategory}
          isSubmitting={updateStatusMutation.isPending}
        />
      )}
      
      {/* Silmə dialoqu */}
      {deletingCategory && (
        <DeleteCategoryDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteCategory}
          category={deletingCategory}
          isSubmitting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default Categories;
