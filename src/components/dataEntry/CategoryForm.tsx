import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Category, CategoryStatus, TabDefinition } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface CategoryFormProps {
  category: Category;
  isSubmitting?: boolean;
  isApproving?: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
  onApprove?: () => void;
}

const CategoryForm = ({
  category,
  isSubmitting = false,
  isApproving = false,
  onSubmit,
  onCancel,
  onApprove
}: CategoryFormProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("general");
  
  // Define tabs with general tab and column tabs if needed
  const tabs: TabDefinition[] = [
    {
      id: "general",
      label: t('general'),
      columns: []
    }
  ];
  
  if (category.columns && category.columns.length > 0) {
    // Group columns by 8 per tab
    const columnGroups = [];
    for (let i = 0; i < category.columns.length; i += 8) {
      const group = category.columns.slice(i, i + 8);
      columnGroups.push(group);
    }
    
    // Create tabs for each column group
    columnGroups.forEach((group, index) => {
      tabs.push({
        id: `columns-${index + 1}`,
        label: `${t('columns')} ${index + 1}`,
        columns: group
      });
    });
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{category.name}</h2>
          {category.description && <p className="text-muted-foreground">{category.description}</p>}
        </div>
        
        <div className="flex items-center space-x-2">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting || isApproving}
            >
              {t('cancel')}
            </Button>
          )}
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting || isApproving}
          >
            {isSubmitting ? t('saving') : t('save')}
          </Button>
          {onApprove && (
            <Button 
              variant="default" 
              onClick={onApprove}
              disabled={isSubmitting || isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? t('approving') : t('approve')}
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">{t('completionStatus')}</span>
          <span className="text-sm font-medium">
            {category.completionRate || 0}%
          </span>
        </div>
        <Progress value={category.completionRate || 0} />
      </div>
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <Card className="p-4">
              {tab.id === "general" ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{t('categoryInformation')}</h3>
                    <p className="text-muted-foreground">{t('categoryInformationDesc')}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">{t('categoryName')}</p>
                      <p className="text-sm text-muted-foreground">{category.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">{t('status')}</p>
                      <p className="text-sm text-muted-foreground">{t(category.status || 'active')}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">{t('deadline')}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.deadline 
                          ? new Date(category.deadline).toLocaleDateString() 
                          : t('noDeadline')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">{t('assignment')}</p>
                      <p className="text-sm text-muted-foreground">{t(category.assignment || 'all')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Column content would go here */}
                  <div>
                    <h3 className="text-lg font-medium">{t('columns')}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {tab.columns.map((column: any) => (
                      <div key={column.id} className="border p-4 rounded-md">
                        <h4 className="font-medium">{column.name}</h4>
                        <p className="text-sm text-muted-foreground">{column.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CategoryForm;
