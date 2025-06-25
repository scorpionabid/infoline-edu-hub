
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, FileText, Settings } from 'lucide-react';
import { Category } from '@/types/category';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
  isLoading?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  isLoading = false
}) => {
  const { t } = useTranslation();

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('təhsil') || name.includes('education')) return BookOpen;
    if (name.includes('şagird') || name.includes('student')) return Users;
    if (name.includes('hesabat') || name.includes('report')) return FileText;
    return Settings;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kateqoriyalar yüklənir...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kateqoriya seçin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Heç bir kateqoriya tapılmadı.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Kateqoriya seçin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {categories.map((category) => {
          const IconComponent = getCategoryIcon(category.name);
          const isSelected = selectedCategoryId === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              className={`w-full justify-start h-auto p-4 ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground">
                        {category.description}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant={isSelected ? "secondary" : "outline"}>
                  {category.columns?.length || 0} sütun
                </Badge>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default CategorySelector;
