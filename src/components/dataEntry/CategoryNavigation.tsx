import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CategoryNavigationProps {
  categories: Array<{
    id: string;
    name: string;
    completed_fields?: number;
    required_fields?: number;
    status?: string;
  }>;
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
}

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect
}) => {
  const getCompletionRate = (category: any) => {
    if (!category.required_fields || category.required_fields === 0) return 0;
    return Math.round((category.completed_fields || 0) / category.required_fields * 100);
  };

  const getStatusColor = (category: any) => {
    const rate = getCompletionRate(category);
    if (rate === 100) return "text-green-600 bg-green-50";
    if (rate > 0) return "text-blue-600 bg-blue-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kateqoriyalar</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="space-y-1 p-2">
            {categories.map((category, index) => {
              const isSelected = selectedCategoryId === category.id;
              const completionRate = getCompletionRate(category);
              const statusColor = getStatusColor(category);

              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-auto p-3",
                    isSelected && "font-medium",
                    !isSelected && statusColor
                  )}
                  onClick={() => onCategorySelect(category.id)}
                >
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex-1 text-sm">{category.name}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="outline" className="text-xs">
                          {completionRate}%
                        </Badge>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          completionRate === 100 ? "bg-green-500" :
                          completionRate > 0 ? "bg-blue-500" : "bg-gray-400"
                        )}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {category.completed_fields || 0}/{category.required_fields || 0} sahə
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};