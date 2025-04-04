
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SidebarLayout from '@/components/layout/SidebarLayout';
import CategoryList from '@/components/categories/CategoryList';
import CategoryFilterCard from '@/components/categories/CategoryFilterCard';
import CategoryStats from '@/components/categories/CategoryStats';
import CategoryChart from '@/components/categories/CategoryChart';
import AddCategoryDialog from '@/components/categories/AddCategoryDialog';
import EditCategoryDialog from '@/components/categories/EditCategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import { Category, CategoryFilter, CategoryStatus } from '@/types/category';
import { useCategories } from '@/hooks/useCategories';

const Categories: React.FC = () => {
  const { categories, loading, error, refetch } = useCategories();
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter state
  const [filter, setFilter] = useState<CategoryFilter>({
    search: '',
    status: 'all',
    assignment: '',
    deadline: ''
  });
  
  // Error handling
  useEffect(() => {
    if (error) {
      toast.error('Kateqoriyaları əldə edərkən xəta baş verdi', {
        description: error.message
      });
    }
  }, [error]);
  
  // Filter categories
  const filteredCategories = categories.filter(category => {
    // Search filter
    if (filter.search && !category.name.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (filter.status && filter.status !== 'all' && category.status !== filter.status) {
      return false;
    }
    
    // Assignment filter
    if (filter.assignment && category.assignment !== filter.assignment) {
      return false;
    }
    
    // Deadline filter
    if (filter.deadline) {
      if (!category.deadline) return false;
      
      const deadlineDate = new Date(category.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filter.deadline === 'upcoming' && deadlineDate < today) {
        return false;
      } else if (filter.deadline === 'past' && deadlineDate >= today) {
        return false;
      }
    }
    
    return true;
  });
  
  // Handlers
  const handleAddDialogOpen = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleEditDialogOpen = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteDialogOpen = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };
  
  const handleFilterChange = (newFilter: CategoryFilter) => {
    setFilter(newFilter);
  };
  
  // Category CRUD operations
  const handleAddCategory = async (categoryData: Omit<Category, 'id'> & { id?: string }): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Burada verilənlər bazasına kategoriyanın əlavə edilməsi əməliyyatını simule edirik
      // Real layihədə burada API sorğusu olacaq
      
      // Generate fake ID - real layihədə API qaytaracaq
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Bu fake implementasiyadır, real layihədə API sorğusu olacaq
      // const { data, error } = await supabase.from('categories').insert(categoryData).select('*').single();
      
      // Fake API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add to local state
      // Əsl layihədə kateqoriyaları yenidən əldə etmək üçün refetch() funksiyasını çağıracağıq
      
      toast.success('Kateqoriya uğurla əlavə edildi', {
        description: `${categoryData.name} kateqoriyası əlavə edildi`
      });
      
      return true;
    } catch (error: any) {
      console.error('Error adding category:', error);
      
      toast.error('Kateqoriya əlavə edilərkən xəta baş verdi', {
        description: error.message
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditCategory = async (categoryData: Category): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Burada verilənlər bazasında kategoriyanın yenilənməsi əməliyyatını simule edirik
      // Real layihədə burada API sorğusu olacaq
      
      // Fake API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update in local state
      // Əsl layihədə kateqoriyaları yenidən əldə etmək üçün refetch() funksiyasını çağıracağıq
      
      toast.success('Kateqoriya uğurla yeniləndi', {
        description: `${categoryData.name} kateqoriyası yeniləndi`
      });
      
      return true;
    } catch (error: any) {
      console.error('Error editing category:', error);
      
      toast.error('Kateqoriya yenilənərkən xəta baş verdi', {
        description: error.message
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCategory = async (categoryId: string): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Burada verilənlər bazasından kategoriyanın silinməsi əməliyyatını simule edirik
      // Real layihədə burada API sorğusu olacaq
      
      // Fake API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Delete from local state
      // Əsl layihədə kateqoriyaları yenidən əldə etmək üçün refetch() funksiyasını çağıracağıq
      
      toast.success('Kateqoriya uğurla silindi');
      
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      
      toast.error('Kateqoriya silinərkən xəta baş verdi', {
        description: error.message
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStatusChange = async (id: string, status: CategoryStatus): Promise<boolean> => {
    try {
      // Burada verilənlər bazasında kategoriyanın statusunun dəyişdirilməsi əməliyyatını simule edirik
      // Real layihədə burada API sorğusu olacaq
      
      // Fake API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update in local state
      // Əsl layihədə kateqoriyaları yenidən əldə etmək üçün refetch() funksiyasını çağıracağıq
      
      const statusText = status === 'active' ? 'aktiv' : (status === 'inactive' ? 'deaktiv' : 'qaralama');
      
      toast.success(`Kateqoriya ${statusText} edildi`);
      
      return true;
    } catch (error: any) {
      console.error('Error changing category status:', error);
      
      toast.error('Kateqoriya statusu dəyişdirilərkən xəta baş verdi', {
        description: error.message
      });
      
      return false;
    }
  };
  
  return (
    <SidebarLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Kateqoriyalar</h1>
          <Button className="flex items-center gap-1" onClick={handleAddDialogOpen}>
            <Plus className="h-4 w-4" />
            Yeni Kateqoriya
          </Button>
        </div>
        
        <CategoryStats 
          categoriesData={categories} 
          isLoading={loading} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategoryChart 
            categoriesData={categories} 
            loading={loading} 
          />
          
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">Kateqoriya Filtirləri</h2>
              <CategoryFilterCard 
                filter={filter} 
                onFilterChange={handleFilterChange} 
              />
            </CardContent>
          </Card>
        </div>
        
        <CategoryList 
          categories={filteredCategories} 
          isLoading={loading}
          onEdit={handleEditDialogOpen} 
          onDelete={handleDeleteDialogOpen}
          handleStatusChange={handleStatusChange}
        />
        
        <AddCategoryDialog 
          isOpen={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
          onAddCategory={handleAddCategory}
          isSubmitting={isSubmitting}
        />
        
        <EditCategoryDialog 
          isOpen={isEditDialogOpen} 
          onClose={() => setIsEditDialogOpen(false)} 
          onEditCategory={handleEditCategory}
          category={selectedCategory}
          isSubmitting={isSubmitting}
        />
        
        <DeleteCategoryDialog 
          isOpen={isDeleteDialogOpen} 
          onClose={() => setIsDeleteDialogOpen(false)} 
          onConfirm={handleDeleteCategory}
          category={selectedCategory}
          isSubmitting={isSubmitting}
        />
      </div>
    </SidebarLayout>
  );
};

export default Categories;
