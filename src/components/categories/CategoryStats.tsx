
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '@/types/category';

export interface CategoryStatsProps {
  categoriesData: Category[];
  isLoading: boolean;
}

const CategoryStats: React.FC<CategoryStatsProps> = ({ categoriesData, isLoading }) => {
  // Yüklənmə halı
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="p-4 pb-2">
              <div className="h-5 w-24 bg-muted rounded"></div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-9 w-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Statistikaları hesablayaq
  const totalCategories = categoriesData.length;
  const activeCategories = categoriesData.filter(cat => cat.status === 'active').length;
  const inactiveCategories = categoriesData.filter(cat => cat.status === 'inactive').length;
  const draftCategories = categoriesData.filter(cat => cat.status === 'draft').length;
  
  // Deadline statuslarını hesablayaq
  const categoriesWithDeadline = categoriesData.filter(cat => cat.deadline);
  const upcomingDeadlines = categoriesWithDeadline.filter(cat => {
    try {
      const deadlineDate = new Date(cat.deadline!);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return deadlineDate >= today;
    } catch (e) {
      return false;
    }
  }).length;
  
  const pastDeadlines = categoriesWithDeadline.length - upcomingDeadlines;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ümumi Kateqoriyalar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{totalCategories}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Aktiv Kateqoriyalar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{activeCategories}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Gələcək Son Tarixlər
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{upcomingDeadlines}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Keçmiş Son Tarixlər
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">{pastDeadlines}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryStats;
