import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid } from '@/components/ui/grid';
import { ScrollArea } from '@/components/ui/scroll-area';
import CategoryCard from './CategoryCard';
import { PlusCircle, Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/categories/useCategories';
import { Category } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';

const FormsPage: React.FC = () => {
  const { categories, isLoading } = useCategories();
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  
  // Filter categories based on search query and status filter
  useEffect(() => {
    let filtered = [...categories];
    
    // Apply search filter
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(lowercaseQuery) || 
        (category.description && category.description.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(category => category.status === statusFilter);
    }
    
    setFilteredCategories(filtered);
  }, [categories, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{currentLanguage === 'az' ? 'Formalar' : 'Forms'}</h1>
        <Button onClick={() => navigate('/categories/new')}>
          <PlusCircle className="mr-2 h-4 w-4" /> 
          {t('createCategory')}
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchForms')}
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allForms')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="approved">{t('approved')}</SelectItem>
              <SelectItem value="draft">{t('draft')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full border-b rounded-none mb-6">
          <TabsTrigger value="all" className="flex-1">{t('allCategories')}</TabsTrigger>
          <TabsTrigger value="active" className="flex-1">{t('activeForms')}</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">{t('pendingForms')}</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
          <CategoriesGrid 
            categories={filteredCategories} 
            isLoading={isLoading} 
          />
        </TabsContent>
        <TabsContent value="active" className="mt-0">
          <CategoriesGrid 
            categories={filteredCategories.filter(c => c.status === 'active' || c.status === 'approved')} 
            isLoading={isLoading} 
          />
        </TabsContent>
        <TabsContent value="pending" className="mt-0">
          <CategoriesGrid 
            categories={filteredCategories.filter(c => c.status === 'draft')} 
            isLoading={isLoading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface CategoriesGridProps {
  categories: Category[];
  isLoading: boolean;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-8">Yüklənir...</div>;
  }
  
  if (categories.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Heç bir kateqoriya tapılmadı</div>;
  }
  
  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <Grid columns={{ default: 1, sm: 2, md: 2, lg: 3 }} className="gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </Grid>
    </ScrollArea>
  );
};

export default FormsPage;
