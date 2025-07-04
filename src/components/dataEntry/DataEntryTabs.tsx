
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface DataEntryTabsProps {
  categories: any[];
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  children?: React.ReactNode;
}

const DataEntryTabs: React.FC<DataEntryTabsProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  children
}) => {
  return (
    <Tabs value={selectedCategory} onValueChange={onCategoryChange} className="w-full">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 gap-2">
        {categories.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.id}
            className="flex items-center gap-2"
          >
            {category.name}
            <Badge variant="secondary" className="ml-auto">
              {category.column_count || 0}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
};

export default DataEntryTabs;
