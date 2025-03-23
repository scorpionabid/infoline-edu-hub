
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
  ChevronLeft,
  AlertTriangle,
  FilePlus,
  FileCheck
} from 'lucide-react';
import { format, isAfter, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t } = useLanguage();
  
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

  const getStatusIcon = (categoryId: string, required: boolean = false) => {
    const entry = entries.find(e => e.categoryId === categoryId);
    const category = categories.find(c => c.id === categoryId);
    
    if (!entry) return null;
    
    if (entry.isCompleted) {
      return <CheckCircle className={`h-4 w-4 ${required ? 'ml-1' : ''} text-green-500`} />;
    }
    
    if (category?.deadline && isAfter(getCurrentDate(), new Date(category.deadline))) {
      return <AlertCircle className={`h-4 w-4 ${required ? 'ml-1' : ''} text-red-500`} />;
    }
    
    if (entry.values.some(v => v.errorMessage)) {
      return <AlertTriangle className={`h-4 w-4 ${required ? 'ml-1' : ''} text-amber-500`} />;
    }
    
    if (entry.completionPercentage > 0) {
      return <Clock className={`h-4 w-4 ${required ? 'ml-1' : ''} text-amber-500`} />;
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
    const daysLeft = differenceInDays(deadlineDate, now);
    
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
          ? t('overdue') 
          : daysLeft === 0 
            ? t('today') 
            : daysLeft === 1 
              ? t('tomorrow') 
              : `${daysLeft} ${t('daysLeft')}`}
      </Badge>
    );
  };

  const getStatusBadge = (categoryId: string) => {
    const entry = entries.find(e => e.categoryId === categoryId);
    if (!entry) return null;
    
    if (entry.isSubmitted && entry.approvalStatus === 'approved') {
      return (
        <Badge 
          variant="outline" 
          className="ml-2 text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
        >
          <FileCheck className="h-3 w-3 mr-1" />
          {t('approved')}
        </Badge>
      );
    }
    
    if (entry.isSubmitted && entry.approvalStatus === 'rejected') {
      return (
        <Badge 
          variant="outline" 
          className="ml-2 text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          {t('rejected')}
        </Badge>
      );
    }
    
    if (entry.isSubmitted) {
      return (
        <Badge 
          variant="outline" 
          className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
        >
          <FilePlus className="h-3 w-3 mr-1" />
          {t('submitted')}
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t('categories')}</h3>
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
            {categories.map((category, index) => {
              const isCurrent = index === currentCategoryIndex;
              const entry = entries.find(e => e.categoryId === category.id);
              const hasErrors = entry?.values.some(v => v.errorMessage);
              
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className={cn(
                    "flex-col h-auto py-2 px-3 w-full text-left flex-nowrap relative data-[state=active]:border-b-2 data-[state=active]:border-primary",
                    "justify-start items-start group",
                    hasErrors ? "border-amber-300 dark:border-amber-700" : "",
                    isCurrent ? "border-primary-600 ring-2 ring-primary-100" : "",
                    tabWidth < 33 ? "min-w-[150px]" : ""
                  )}
                  style={{ minWidth: tabWidth < 33 ? '150px' : `${tabWidth}%` }}
                >
                  <div className="flex items-center w-full">
                    <span className={cn(
                      "mr-1", 
                      isCurrent ? "text-primary-600 font-medium" : "text-muted-foreground"
                    )}>
                      {index + 1}.
                    </span>
                    <span className={cn(
                      "flex-1 truncate text-sm",
                      isCurrent ? "font-medium" : ""
                    )}>
                      {category.name}
                    </span>
                    {category.deadline && isAfter(getCurrentDate(), new Date(category.deadline)) && (
                      <Badge variant="outline" className="ml-1 bg-red-50 text-red-600 border-red-200 text-[10px] px-1 py-0">
                        {t('overdue')}
                      </Badge>
                    )}
                    {getStatusIcon(category.id)}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1 w-full">
                    {getCompletionBadge(category.id)}
                    {getDeadlineBadge(category)}
                    {getStatusBadge(category.id)}
                  </div>
                  
                  {/* Hover-da göstəriləcək qısa təsvir tooltip */}
                  {category.description && (
                    <div className="absolute left-0 top-full mt-2 z-50 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg p-3 text-sm border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                      {category.description}
                    </div>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default CategoryTabs;
