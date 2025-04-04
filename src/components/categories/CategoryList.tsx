import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { 
  MoreHorizontal, 
  Calendar, 
  BarChart, 
  FileText, 
  Users, 
  AlertCircle 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Category } from '@/types/category';
import { cn } from '@/utils/cn';

interface CategoryListProps {
  categories: Category[];
  userRole?: string;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, userRole }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/columns/${categoryId}`);
  };

  const handleEditCategory = (categoryId: string) => {
    // Redaktə funksiyası
    console.log(`Redaktə edildi: ${categoryId}`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Silmə funksiyası
    console.log(`Silindi: ${categoryId}`);
  };

  const getCategoryIcon = (category: Category) => {
    switch (category.name) {
      case 'Təqvim':
        return <Calendar className="mr-2 h-4 w-4" />;
      case 'Statistika':
        return <BarChart className="mr-2 h-4 w-4" />;
      case 'Hesabatlar':
        return <FileText className="mr-2 h-4 w-4" />;
      case 'İstifadəçilər':
        return <Users className="mr-2 h-4 w-4" />;
      case 'Xəbərdarlıqlar':
        return <AlertCircle className="mr-2 h-4 w-4" />;
      default:
        return <FileText className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <div 
          key={category.id} 
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                {getCategoryIcon(category)}
                <span onClick={() => handleCategoryClick(category.id)} className="cursor-pointer">{category.name}</span>
              </h3>
              {userRole === 'superadmin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Menunu aç</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditCategory(category.id)}>
                      {t('edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)}>
                      {t('delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600">{category.description}</p>
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleCategoryClick(category.id)}
            >
              {t('viewColumns')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
