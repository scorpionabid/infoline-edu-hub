
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Category } from '@/types/category';
import { Column } from '@/types/column';
import { TabDefinition } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryFormProps {
  category: Category & { columns?: Column[] };
  formData: Record<string, any>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFieldChange?: (columnId: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleSave: () => Promise<void>;
  isSubmitting: boolean;
  isAutoSaving: boolean;
  readonly?: boolean;
  children?: React.ReactNode;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  formData,
  handleInputChange,
  handleFieldChange,
  handleSubmit,
  handleSave,
  isSubmitting,
  isAutoSaving,
  readonly = false,
  children
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Group columns by type to create tabs
  const tabs: TabDefinition[] = [
    {
      id: 'all',
      title: t('allFields'),
      label: t('allFields')
    }
  ];

  // Only generate tabs if columns exist
  if (category.columns && category.columns.length > 0) {
    // Add dynamic tabs based on column types
    const columnsByType: Record<string, Column[]> = {};
    
    category.columns.forEach(column => {
      const type = column.type.toString();
      if (!columnsByType[type]) {
        columnsByType[type] = [];
      }
      columnsByType[type].push(column);
    });
    
    // Add tabs for each type that has multiple columns
    Object.entries(columnsByType).forEach(([type, columns]) => {
      if (columns.length > 0) {
        tabs.push({
          id: type,
          title: t(type + 'Fields', { defaultValue: type }),
          label: t(type + 'Fields', { defaultValue: type }),
          columns
        });
      }
    });
  }

  // Calculate completion percentage
  const requiredColumns = category.columns?.filter(col => col.is_required) || [];
  const completedRequiredFields = requiredColumns.filter(col => {
    const value = formData[col.id];
    return value !== undefined && value !== null && value !== '';
  });
  
  const completionPercent = requiredColumns.length > 0
    ? (completedRequiredFields.length / requiredColumns.length) * 100
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-1.5">
            <CardTitle>{category.name}</CardTitle>
            <CardDescription>{category.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Completion Progress */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                {t('completionProgress')}
              </span>
              <span className="text-sm font-medium">
                {completedRequiredFields.length} / {requiredColumns.length} ({Math.round(completionPercent)}%)
              </span>
            </div>
            <Progress value={completionPercent} className="h-2" />
          </div>

          {/* Form Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                {children}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Actions */}
      {!readonly && (
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSave}
            disabled={isSubmitting || isAutoSaving}
          >
            {isAutoSaving ? t('saving') : t('saveAsDraft')}
          </Button>
          <Button type="submit" disabled={isSubmitting || isAutoSaving}>
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </div>
      )}
    </form>
  );
};

export default CategoryForm;
