import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Axtarış filtri
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm.trim()) return categories;
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    return categories.filter(category => 
      category.name.toLowerCase().includes(normalizedSearch) ||
      (category.description?.toLowerCase().includes(normalizedSearch))
    );
  }, [categories, searchTerm]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Kateqoriya seçin</h3>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Kateqoriyalar üzrə axtar..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="h-[400px] overflow-y-auto pr-2 mt-4">
        <RadioGroup 
          value={selectedCategoryId || undefined} 
          onValueChange={onCategorySelect}
        >
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-start space-x-2 mb-3 p-3 rounded-md border hover:bg-muted/50"
              >
                <RadioGroupItem value={category.id} id={`category-${category.id}`} className="mt-1" />
                <Label 
                  htmlFor={`category-${category.id}`} 
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </div>
                  )}
                </Label>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Axtarış kriteriyalarına uyğun kateqoriya tapılmadı.
            </div>
          )}
        </RadioGroup>
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Heç bir kateqoriya tapılmadı.
        </div>
      )}
    </div>
  );
};
