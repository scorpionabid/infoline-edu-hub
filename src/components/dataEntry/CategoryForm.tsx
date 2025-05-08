import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Category, CategoryWithColumns, TabDefinition } from '@/types/column';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CategoryFormProps {
  categoryId?: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ categoryId }) => {
  const { t } = useLanguage();
  const [category, setCategory] = useState<CategoryWithColumns | null>(null);
  const [tabs, setTabs] = useState<TabDefinition[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  
  // useEffect to fetch category data
  useEffect(() => {
    // This would normally fetch data from an API
    const fetchCategoryData = async () => {
      if (!categoryId) return;
      
      setLoading(true);
      try {
        // Mock data for now
        const mockCategory: CategoryWithColumns = {
          id: categoryId,
          name: 'Sample Category',
          description: 'This is a sample category for data entry',
          status: 'active',
          // We need to add completionRate to CategoryWithColumns interface
          columns: [
            {
              id: 'col1',
              name: 'Full Name',
              type: 'text',
              category_id: categoryId,
              is_required: true,
              status: 'active'
            },
            {
              id: 'col2',
              name: 'Age',
              type: 'number',
              category_id: categoryId,
              is_required: true,
              status: 'active'
            }
          ]
        };
        
        setCategory(mockCategory);
        
        // Generate tabs from columns
        if (mockCategory.columns) {
          const generatedTabs: TabDefinition[] = [
            {
              id: 'general',
              label: t('general'),
              columns: mockCategory.columns.filter(col => !col.order_index || col.order_index < 5)
            }
          ];
          
          setTabs(generatedTabs);
          setActiveTab('general');
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [categoryId, t]);
  
  // Handle input change
  const handleChange = (columnId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [columnId]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // This would submit data to an API
      console.log('Form values to submit:', formValues);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }
  
  if (!category) {
    return <div className="flex justify-center p-8">Category not found</div>;
  }
  
  // Make sure to set completionRate as a property when needed
  const categoryWithCompletionRate: CategoryWithColumns = {
    ...category,
    completionRate: category.completionRate || 0
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{categoryWithCompletionRate.name}</h1>
        <p className="text-gray-500">{categoryWithCompletionRate.description}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {tabs.length > 0 ? (
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {tabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {tabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                {tab.columns.map(column => (
                  <div key={column.id} className="space-y-2">
                    <label className="block text-sm font-medium">
                      {column.name} {column.is_required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={column.type === 'number' ? 'number' : 'text'}
                      className="w-full p-2 border rounded"
                      placeholder={column.placeholder}
                      value={formValues[column.id] || ''}
                      onChange={(e) => handleChange(column.id, e.target.value)}
                      required={column.is_required}
                    />
                    {column.help_text && (
                      <p className="text-xs text-gray-500">{column.help_text}</p>
                    )}
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="p-4 bg-yellow-50 rounded">
            {t('noColumnsFound')}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline">
            {t('cancel')}
          </Button>
          <Button type="submit">
            {t('submit')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
