
import React from 'react';
import { Database } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CategoryCompletionItem {
  name: string;
  completed: number;
}

interface CategoriesTabProps {
  categoryCompletionData: CategoryCompletionItem[];
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({ categoryCompletionData }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const navigateToCategories = () => navigate('/categories');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Kateqoriyalar üzrə tamamlanma</CardTitle>
        <CardDescription>Hər kateqoriya üçün məlumat doldurlması faizi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryCompletionData.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-sm font-medium">{category.completed}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${category.completed}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" onClick={navigateToCategories}>
          <Database className="mr-2 h-4 w-4" />
          Bütün kateqoriyaları göstər
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoriesTab;
