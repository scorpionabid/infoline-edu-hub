import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Category } from '@/types/category';
import { securityLogger } from '@/utils/securityLogger';

interface FormTabsProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({ categories, onCategorySelect }) => {
  const [selectedTab, setSelectedTab] = React.useState<string | null>(null);

  const handleTabClick = (categoryId: string) => {
    setSelectedTab(categoryId);
  };

  const handleViewDetails = (category: Category) => {
    securityLogger.logSecurityEvent('form_tab_view_details', {
      categoryId: category.id,
      userId: 'current-user-id'
    });
    
    onCategorySelect(category);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Card key={category.id} className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
            <CardDescription>{category.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              onClick={() => handleViewDetails(category)}
            >
              View Details
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FormTabs;
