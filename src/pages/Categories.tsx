
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useCategories } from '@/hooks/useCategories';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Helmet } from 'react-helmet';
import { Plus, FileText, Calendar, Search, Loader2 } from 'lucide-react';
import CategoryDialog from '@/components/categories/CategoryDialog';
import { Category } from '@/types/category';

const Categories = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { categories, filteredCategories, isLoading, searchQuery, setSearchQuery } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/data-entry/${categoryId}`);
  };

  const handleOpenDialog = (category: Category | null = null) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
  };

  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('categories')} | InfoLine</title>
      </Helmet>
      
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('categories')}</h1>
            <p className="text-muted-foreground mt-1">{t('categoriesDescription')}</p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            {t('createCategory')}
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchCategories')}
            className="pl-8 w-full md:max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((category) => (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    {category.name}
                  </CardTitle>
                  <CardDescription>{category.description || t('noCategoryDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    {category.deadline && (
                      <div className="flex items-center mr-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(category.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDialog(category);
                  }}>
                    {t('view')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">{t('noCategoriesFound')}</h3>
            <p className="text-muted-foreground">{t('tryDifferentSearchOrCreate')}</p>
            <Button className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t('createCategory')}
            </Button>
          </div>
        )}
      </div>
      
      <CategoryDialog 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        category={selectedCategory}
      />
    </SidebarLayout>
  );
};

export default Categories;
