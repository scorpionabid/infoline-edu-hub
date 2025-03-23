
import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';

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
  return (
    <div className="mb-6">
      <div className="flex overflow-x-auto pb-2 space-x-1 sm:space-x-2">
        {categories.map((category, index) => {
          const entryData = entries.find(entry => entry.categoryId === category.id);
          const isActive = index === currentCategoryIndex;
          const isCompleted = entryData?.isCompleted || false;
          const isSubmitted = entryData?.isSubmitted || false;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(index)}
              className={`
                px-4 py-2 text-sm font-medium rounded-md flex-shrink-0 
                transition-colors focus:outline-none focus:ring-2 focus:ring-ring 
                flex items-center space-x-2
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : isCompleted
                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    : 'bg-background hover:bg-muted text-foreground border border-input'
                }
                ${isSubmitted && !isActive ? 'opacity-70' : ''}
              `}
            >
              <span>{category.name}</span>
              {isCompleted && (
                <Check className="h-4 w-4 text-green-600" />
              )}
              {!isCompleted && entryData && entryData.completionPercentage > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  {Math.round(entryData.completionPercentage)}%
                </span>
              )}
              {!isCompleted && entryData?.completionPercentage === 0 && (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
