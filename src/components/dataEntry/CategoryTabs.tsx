
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';
import { CheckCircle, AlertTriangle, Clock, CircleDashed } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryTabsProps {
  categories: CategoryWithColumns[];
  entries: CategoryEntryData[];
  currentCategoryIndex: number;
  onCategoryChange: (index: number) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  entries,
  currentCategoryIndex,
  onCategoryChange
}) => {
  const { t } = useLanguage();

  const getCategoryStatus = (categoryId: string) => {
    const entry = entries.find(e => e.categoryId === categoryId);
    
    if (!entry) return 'pending';
    
    if (entry.approvalStatus === 'approved') {
      return 'approved';
    } else if (entry.approvalStatus === 'rejected') {
      return 'rejected';
    } else if (entry.isCompleted) {
      return 'completed';
    } else {
      return 'pending';
    }
  };

  // Tab sıraları üçün kateqoriyaları qruplaşdırırıq
  const tabGroups = categories.reduce<CategoryWithColumns[][]>((acc, category, index) => {
    const groupIndex = Math.floor(index / 4); // 4 tab bir sırada
    if (!acc[groupIndex]) acc[groupIndex] = [];
    acc[groupIndex].push(category);
    return acc;
  }, []);

  return (
    <div className="space-y-4">
      {tabGroups.map((group, groupIndex) => (
        <Tabs
          key={`group-${groupIndex}`}
          value={String(categories.indexOf(group[0]) <= currentCategoryIndex && currentCategoryIndex < categories.indexOf(group[0]) + group.length ? currentCategoryIndex : categories.indexOf(group[0]))}
          onValueChange={(value) => onCategoryChange(Number(value))}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 overflow-auto">
            {group.map((category) => {
              const index = categories.indexOf(category);
              const status = getCategoryStatus(category.id);
              
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={String(index)}
                  className="relative py-2 flex items-center justify-center gap-1 data-[state=active]:bg-primary/10 flex-grow"
                >
                  <CategoryTabIcon status={status} />
                  <span className="text-sm truncate max-w-[120px]">{category.name}</span>
                  
                  {/* İndicator progress üçün */}
                  {status === 'pending' && entries.find(e => e.categoryId === category.id)?.completionPercentage ? (
                    <span className="absolute bottom-0 left-0 h-1 bg-primary/50" style={{ 
                      width: `${entries.find(e => e.categoryId === category.id)?.completionPercentage || 0}%` 
                    }}></span>
                  ) : null}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      ))}
    </div>
  );
};

// Tab ikonları funksiyası
const CategoryTabIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'completed':
      return <Clock className="h-4 w-4 text-blue-500" />;
    default:
      return <CircleDashed className="h-4 w-4 text-gray-400" />;
  }
};

export default CategoryTabs;
