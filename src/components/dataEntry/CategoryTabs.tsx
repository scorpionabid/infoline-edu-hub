
import React from 'react';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { Button } from '@/components/ui/button';

interface CategoryTabsProps {
  categories: CategoryWithColumns[];
  currentCategoryIndex: number;
  entries: CategoryEntryData[];
  onCategoryChange: (index: number) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  currentCategoryIndex,
  entries,
  onCategoryChange
}) => {
  // Tablar üçün genişlik hesablayırıq
  const tabWidth = Math.min(100, Math.floor(100 / Math.min(5, categories.length)));
  
  const handleNextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      onCategoryChange(currentCategoryIndex + 1);
    }
  };
  
  const handlePrevCategory = () => {
    if (currentCategoryIndex > 0) {
      onCategoryChange(currentCategoryIndex - 1);
    }
  };
  
  const getCurrentDate = () => new Date();

  const getStatusIcon = (categoryId: string) => {
    const entry = entries.find(e => e.categoryId === categoryId);
    const category = categories.find(c => c.id === categoryId);
    
    if (!entry) return null;
    
    if (entry.isCompleted) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (category?.deadline && isAfter(getCurrentDate(), new Date(category.deadline))) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (entry.completionPercentage > 0) {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
    
    return null;
  };
  
  const getCompletionBadge = (categoryId: string) => {
    const entry = entries.find(e => e.categoryId === categoryId);
    if (!entry) return null;
    
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "ml-2 text-xs",
          entry.completionPercentage === 100 
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
            : entry.completionPercentage > 0 
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800" 
              : "bg-muted text-muted-foreground"
        )}
      >
        {Math.round(entry.completionPercentage)}%
      </Badge>
    );
  };

  const getDeadlineBadge = (category: CategoryWithColumns) => {
    if (!category.deadline) return null;
    
    const deadlineDate = new Date(category.deadline);
    const now = getCurrentDate();
    const isOverdue = isAfter(now, deadlineDate);
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "ml-2 text-xs",
          isOverdue 
            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
            : daysLeft <= 3 
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
        )}
      >
        {isOverdue 
          ? 'Gecikmiş' 
          : daysLeft === 0 
            ? 'Bugün' 
            : daysLeft === 1 
              ? 'Sabah' 
              : `${daysLeft} gün qalıb`}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Kateqoriyalar</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrevCategory} 
            disabled={currentCategoryIndex === 0}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentCategoryIndex + 1} / {categories.length}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextCategory} 
            disabled={currentCategoryIndex === categories.length - 1}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-auto">
        <Tabs 
          defaultValue={categories[currentCategoryIndex]?.id} 
          value={categories[currentCategoryIndex]?.id}
          onValueChange={(value) => {
            const index = categories.findIndex(cat => cat.id === value);
            if (index !== -1) {
              onCategoryChange(index);
            }
          }}
          className="w-full overflow-x-auto"
        >
          <TabsList className="h-auto p-1 flex flex-nowrap min-w-full">
            {categories.map((category, index) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className={cn(
                  "flex-col h-auto py-2 px-3 w-full text-left flex-nowrap relative data-[state=active]:border-b-2 data-[state=active]:border-primary",
                  "justify-start items-start",
                  tabWidth < 33 ? "min-w-[150px]" : ""
                )}
                style={{ minWidth: tabWidth < 33 ? '150px' : `${tabWidth}%` }}
              >
                <div className="flex items-center w-full">
                  <span className="mr-1 text-muted-foreground">{index + 1}.</span>
                  <span className="flex-1 truncate text-sm">{category.name}</span>
                  {getStatusIcon(category.id)}
                </div>
                <div className="flex flex-wrap gap-1 mt-1 w-full">
                  {getCompletionBadge(category.id)}
                  {getDeadlineBadge(category)}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default CategoryTabs;
