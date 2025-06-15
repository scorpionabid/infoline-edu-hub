
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CreateCategoryDialog from '@/components/categories/CreateCategoryDialog';
import CategoryList from '@/components/categories/CategoryList';

const Categories = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    assignment: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const handleSuccess = () => {
    // Refresh işlemi CategoryList tərəfindən idarə olunur
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Modern Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">
              Kateqoriyalar
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Təhsil verilənlərini təşkil etmək və idarə etmək üçün kateqoriyalar sistemi
            </p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                     shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-base font-medium"
          >
            <Plus className="mr-2 h-5 w-5" />
            Yeni Kateqoriya
          </Button>
        </div>

        {/* Enhanced Search and Filters Card */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-slate-800">Kateqoriyalar Siyahısı</CardTitle>
                <CardDescription className="text-slate-600 mt-1">
                  Bütün kateqoriyaları görün və idarə edin
                </CardDescription>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Kateqoriya axtar..."
                    className="w-full sm:w-[250px] pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 
                             bg-white/90 backdrop-blur-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filtrlər
                </Button>
              </div>
            </div>
            
            {isFilterOpen && (
              <div className="flex flex-wrap items-center gap-4 mt-6 p-5 bg-gradient-to-r from-slate-50 to-blue-50 
                            rounded-xl border border-slate-100">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => updateFilter('status', value)}
                  >
                    <SelectTrigger className="w-[180px] bg-white border-slate-200 hover:border-slate-300">
                      <SelectValue placeholder="Status seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="">Bütün statuslar</SelectItem>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="inactive">Deaktiv</SelectItem>
                      <SelectItem value="draft">Qaralama</SelectItem>
                      <SelectItem value="archived">Arxivlənmiş</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Təyinat</label>
                  <Select
                    value={filters.assignment}
                    onValueChange={(value) => updateFilter('assignment', value)}
                  >
                    <SelectTrigger className="w-[180px] bg-white border-slate-200 hover:border-slate-300">
                      <SelectValue placeholder="Təyinat seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
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
                  className="ml-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100 
                           transition-colors self-end"
                >
                  <X className="mr-2 h-4 w-4" />
                  Filtri təmizlə
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <CategoryList 
              onCategorySelect={handleCategorySelect}
              searchQuery={searchQuery}
              filters={filters}
            />
          </CardContent>
        </Card>

        <CreateCategoryDialog
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default Categories;
