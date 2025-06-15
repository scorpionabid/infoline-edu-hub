
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
    // Navigate to category details page
    window.location.href = `/categories/${categoryId}`;
  };

  const handleSuccess = () => {
    // Refresh the category list when a new category is created
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kateqoriyalar</h1>
          <p className="text-gray-600 mt-1">Təhsil verilənlərini təşkil etmək üçün kateqoriyaları idarə edin</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kateqoriya
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl">Kateqoriyalar Siyahısı</CardTitle>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Kateqoriya axtar..."
                  className="w-full sm:w-[200px] pl-10 border-gray-300 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="border-gray-300 hover:bg-gray-50"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filtrlər
              </Button>
            </div>
          </div>
          
          {isFilterOpen && (
            <div className="flex flex-wrap items-center gap-3 mt-4 p-4 bg-gray-50 rounded-lg">
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Bütün statuslar</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Deaktiv</SelectItem>
                  <SelectItem value="draft">Qaralama</SelectItem>
                  <SelectItem value="archived">Arxivlənmiş</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.assignment}
                onValueChange={(value) => updateFilter('assignment', value)}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Təyinat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Bütün təyinatlar</SelectItem>
                  <SelectItem value="all">Bütün vahidlər</SelectItem>
                  <SelectItem value="sectors">Yalnız sektorlar</SelectItem>
                  <SelectItem value="schools">Yalnız məktəblər</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="ml-auto text-gray-600 hover:text-gray-900"
              >
                <X className="mr-2 h-4 w-4" />
                Filtri sıfırla
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <CategoryList onCategorySelect={handleCategorySelect} />
        </CardContent>
      </Card>

      {/* Create Category Dialog - yalnız bir tənə dialog */}
      <CreateCategoryDialog
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Categories;
