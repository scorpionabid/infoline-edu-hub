
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Column } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithColumns } from '@/types/column.d';

interface CategoryFormProps {
  category: CategoryWithColumns;
  onSubmit: (values: Record<string, string>) => void;
  isLoading?: boolean;
  initialValues?: Record<string, string>;
  readOnly?: boolean;
}

interface TabDefinition {
  id: string;
  title: string;
  columns: Column[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  isLoading = false,
  initialValues = {},
  readOnly = false
}) => {
  const { t } = useLanguage();
  const [formValues, setFormValues] = useState<Record<string, string>>(initialValues);
  
  // Group columns by section (if available)
  const tabs: TabDefinition[] = React.useMemo(() => {
    // Check if columns have section property
    const hasSections = category.columns.some(column => {
      // Using optional chaining for type safety since section may not exist
      return column?.section;
    });
    
    if (!hasSections) {
      // If no sections, use a default tab
      return [{
        id: 'default',
        title: t('generalInformation'),
        columns: category.columns
      }];
    }
    
    // Group columns by section
    const groups = category.columns.reduce((acc, column) => {
      // Safely handle the case where section doesn't exist by using a default value
      const sectionId = column.section || 'default';
      const sectionTitle = column.section || t('generalInformation');
      
      if (!acc[sectionId]) {
        acc[sectionId] = {
          id: sectionId,
          title: sectionTitle,
          columns: []
        };
      }
      
      acc[sectionId].columns.push(column);
      return acc;
    }, {} as Record<string, TabDefinition>);
    
    return Object.values(groups);
  }, [category.columns, t]);

  const handleInputChange = (columnId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  const renderField = (column: Column) => {
    const value = formValues[column.id] || '';
    
    switch (column.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={e => handleInputChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            disabled={isLoading || readOnly}
            className="w-full p-2 border rounded"
            required={column.is_required}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={e => handleInputChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            disabled={isLoading || readOnly}
            className="w-full p-2 border rounded min-h-[100px]"
            required={column.is_required}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={e => handleInputChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            disabled={isLoading || readOnly}
            className="w-full p-2 border rounded"
            required={column.is_required}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={e => handleInputChange(column.id, e.target.value)}
            disabled={isLoading || readOnly}
            className="w-full p-2 border rounded"
            required={column.is_required}
          >
            <option value="">{t('pleaseSelect')}</option>
            {column.options?.map(option => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={e => handleInputChange(column.id, e.target.value)}
            placeholder={column.placeholder}
            disabled={isLoading || readOnly}
            className="w-full p-2 border rounded"
            required={column.is_required}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
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
                    {tab.columns.map(column => (
                      <div key={column.id} className="space-y-2">
                        <label className="font-medium block">
                          {column.name}
                          {column.is_required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {renderField(column)}
                        {column.help_text && (
                          <p className="text-sm text-muted-foreground">
                            {column.help_text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="space-y-4">
              {category.columns.map(column => (
                <div key={column.id} className="space-y-2">
                  <label className="font-medium block">
                    {column.name}
                    {column.is_required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {renderField(column)}
                  {column.help_text && (
                    <p className="text-sm text-muted-foreground">
                      {column.help_text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {!readOnly && (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
              >
                {isLoading ? t('saving') : t('save')}
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CategoryForm;
