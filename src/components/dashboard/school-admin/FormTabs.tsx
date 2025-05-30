
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryItem } from '@/types/dashboard';

interface FormTabsProps {
  categories: CategoryItem[];
  selectedCategory?: string;
  onCategoryChange: (categoryId: string) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}) => {
  return (
    <Tabs 
      value={selectedCategory} 
      onValueChange={onCategoryChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.id}
            className="text-xs"
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="mt-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
            {category.description && (
              <p className="text-muted-foreground mb-4">{category.description}</p>
            )}
            <div className="text-sm text-muted-foreground">
              Completion: {category.completion_rate || 0}%
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default FormTabs;
