
import React, { useState } from 'react';
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
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedAddCategoryDialog from '@/components/categories/EnhancedAddCategoryDialog';
import CategoryList from '@/components/categories/CategoryList';
import { CategoryStatus } from '@/types/category';
import { useCategoryOperations } from '@/hooks/categories/useCategories';

const Categories = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<CategoryStatus>('active');
  const [filters, setFilters] = useState({
    status: '',
    assignment: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { createCategoryAsync, isCreating } = useCategoryOperations();

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({ status: '', assignment: '' });
  };

  const handleCategorySelect = (categoryId: string) => {
    window.location.href = `/categories/${categoryId}`;
  };

  const handleCreateCategory = async (categoryData: any) => {
    try {
      await createCategoryAsync(categoryData);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Modern Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
              Kateqoriyalar
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              Təhsil verilənlərini təşkil etmək və idarə etmək üçün kateqoriyalar sistemi
            </p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 
                     shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-3 text-base font-semibold
                     border-0 rounded-xl transform hover:scale-105"
          >
            <Plus className="mr-2 h-5 w-5" />
            Yeni Kateqoriya
          </Button>
        </div>

        {/* Enhanced Search and Filters Card */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-lg rounded-2xl overflow-hidden">
          <CardHeader className="pb-6 bg-gradient-to-r from-white to-slate-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800 mb-2">Kateqoriya İdarəetməsi</CardTitle>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Kateqoriya axtar..."
                    className="w-full sm:w-[280px] pl-12 pr-4 py-3 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 
                             bg-white/90 backdrop-blur-sm rounded-xl text-base font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
                           px-4 py-3 rounded-xl font-medium"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filtrlər
                </Button>
              </div>
            </div>
            
            {isFilterOpen && (
              <div className="flex flex-wrap items-center gap-6 mt-8 p-6 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 
                            rounded-2xl border border-slate-100/50 backdrop-blur-sm">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Təyinat</label>
                  <Select
                    value={filters.assignment}
                    onValueChange={(value) => updateFilter('assignment', value)}
                  >
                    <SelectTrigger className="w-[200px] bg-white border-slate-200 hover:border-slate-300 rounded-xl">
                      <SelectValue placeholder="Təyinat seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 rounded-xl">
                      <SelectItem value="">Bütün təyinatlar</SelectItem>
                      <SelectItem value="all">Bütün vahidlər</SelectItem>
                      <SelectItem value="sectors">Sektorlar</SelectItem>
                      <SelectItem value="schools">Məktəblər</SelectItem>
                      <SelectItem value="regions">Regionlar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="ml-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 
                           transition-colors self-end px-4 py-2 rounded-xl font-medium"
                >
                  <X className="mr-2 h-4 w-4" />
                  Filtri təmizlə
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-0 px-6 pb-6">
            {/* Unified Tab System */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CategoryStatus)} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100/80 via-blue-100/50 to-indigo-100/50 backdrop-blur-sm p-1 rounded-2xl mb-6">
                <TabsTrigger 
                  value="active"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl font-semibold
                           data-[state=active]:text-blue-700 transition-all duration-200"
                >
                  Aktiv
                </TabsTrigger>
                <TabsTrigger 
                  value="inactive"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl font-semibold
                           data-[state=active]:text-slate-700 transition-all duration-200"
                >
                  Deaktiv
                </TabsTrigger>
                <TabsTrigger 
                  value="draft"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl font-semibold
                           data-[state=active]:text-yellow-700 transition-all duration-200"
                >
                  Qaralama
                </TabsTrigger>
                <TabsTrigger 
                  value="archived"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl font-semibold
                           data-[state=active]:text-red-700 transition-all duration-200"
                >
                  Arxivlənmiş
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <CategoryList 
                  onCategorySelect={handleCategorySelect}
                  searchQuery={searchQuery}
                  filters={{
                    ...filters,
                    status: activeTab // Pass current tab as status filter
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <EnhancedAddCategoryDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleCreateCategory}
          isSubmitting={isCreating}
        />
      </div>
    </div>
  );
};

export default Categories;
