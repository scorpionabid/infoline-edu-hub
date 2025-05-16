
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryWithColumns } from '@/types/category';
import { Column } from '@/types/column';
import FormFields from './FormFields';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { TabDefinition } from '@/types/category';

interface CategoryFormProps {
  category: CategoryWithColumns;
  onSubmit: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  isSubmitting?: boolean;
  errors?: Record<string, string>;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  initialData = {},
  isSubmitting = false,
  errors = {}
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  // Group columns by section if any
  const groupColumnsBySection = (columns: Column[]) => {
    const sections = new Map<string, Column[]>();
    
    columns.forEach(column => {
      const section = column.section || t('defaultSection');
      if (!sections.has(section)) {
        sections.set(section, []);
      }
      sections.get(section)?.push(column);
    });
    
    return sections;
  };

  const sections = groupColumnsBySection(category.columns || []);
  
  // Create tab definitions
  const tabs: TabDefinition[] = [];
  
  if (sections.size > 0) {
    sections.forEach((columns, sectionName) => {
      tabs.push({
        id: sectionName,
        title: sectionName,
        label: sectionName,
        columns: columns
      });
    });
  } else {
    // If no sections defined, create a default tab
    tabs.push({
      id: 'default',
      title: t('generalInfo'),
      label: t('generalInfo'),
      columns: category.columns || []
    });
  }
  
  const handleFieldChange = (columnId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {tabs.length > 1 ? (
            <Tabs defaultValue={tabs[0].id}>
              <TabsList className="mb-4">
                {tabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {tabs.map(tab => (
                <TabsContent key={tab.id} value={tab.id}>
                  <div className="space-y-4">
                    {tab.columns && tab.columns.map(column => (
                      <FormFields
                        key={column.id}
                        column={column}
                        value={formData[column.id] ?? column.default_value ?? ''}
                        onChange={(e) => handleFieldChange(column.id, e.target.value)}
                        onValueChange={(value) => handleFieldChange(column.id, value)}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="space-y-4">
              {tabs[0].columns && tabs[0].columns.map(column => (
                <FormFields
                  key={column.id}
                  column={column}
                  value={formData[column.id] ?? column.default_value ?? ''}
                  onChange={(e) => handleFieldChange(column.id, e.target.value)}
                  onValueChange={(value) => handleFieldChange(column.id, value)}
                />
              ))}
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default CategoryForm;
