// FormsPage.tsx içərisində sadəcə CategoryStatus tipini düzgün işlətmək lazımdır

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Category, CategoryStatus } from '@/types/category';
import { Grid } from '@/components/ui/grid';
import CategoryCard from './CategoryCard';
import { Filter, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FormsPageProps {
  categories: Category[];
  onAddCategory: () => void;
}

const FormsPage: React.FC<FormsPageProps> = ({ categories, onAddCategory }) => {
  const { t } = useLanguage();
  const { canManageCategories } = usePermissions();
  const [activeTab, setActiveTab] = useState<CategoryStatus>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    console.log('FormsPage categories:', categories);
  }, [categories]);

  // Tip uyğunsuzluqlarının düzəldilməsi üçün isActive funksiyasını yenidən yazaq:

  const isActive = (category: Category, activeTab: CategoryStatus) => {
    if (activeTab === 'active' && category.status === 'active') return true;
    if (activeTab === 'approved' && category.status === 'approved') return true;
    if (activeTab === 'draft' && category.status === 'draft') return true;
    if (activeTab === 'archived' && (category.status === 'archived' || category.status === 'inactive')) return true;
    return false;
  };

  // Grid üçün responsive dəyərlər üçün columnsCount-u düzəlt:

  const columnsCount = {
    default: 1,
    sm: 1,
    md: 2,
    lg: 3
  }; 

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    isActive(category, activeTab)
  );

  return (
    <Container>
      <div className="md:flex items-center justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{t('forms')}</h1>
          <p className="text-muted-foreground">{t('manageForms')}</p>
        </div>
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            {t('filter')}
          </Button>
          {canManageCategories && (
            <Button size="sm" onClick={onAddCategory}>
              <Plus className="w-4 h-4 mr-2" />
              {t('addCategory')}
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="bg-muted p-4 rounded-md mb-4">
          <Input
            type="search"
            placeholder={t('searchCategories')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}

      <Tabs defaultValue="active" className="space-y-4" value={activeTab} onValueChange={(value) => setActiveTab(value as CategoryStatus)}>
        <TabsList>
          <TabsTrigger value="active">{t('active')}</TabsTrigger>
          <TabsTrigger value="approved">{t('approved')}</TabsTrigger>
          <TabsTrigger value="draft">{t('draft')}</TabsTrigger>
          <TabsTrigger value="archived">{t('archived')}</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Grid columns={columnsCount}>
            {filteredCategories?.filter(category => category.status === 'active').map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </Grid>
        </TabsContent>
        <TabsContent value="approved">
          <Grid columns={columnsCount}>
            {filteredCategories?.filter(category => category.status === 'approved').map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </Grid>
        </TabsContent>
        <TabsContent value="draft">
          <Grid columns={columnsCount}>
            {filteredCategories?.filter(category => category.status === 'draft').map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </Grid>
        </TabsContent>
        <TabsContent value="archived">
          <Grid columns={columnsCount}>
            {filteredCategories?.filter(category => category.status === 'archived' || category.status === 'inactive').map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </Grid>
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default FormsPage;
