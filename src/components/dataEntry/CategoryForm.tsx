import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryWithColumns, TabDefinition } from '@/types/column';

interface CategoryFormProps {
  category: CategoryWithColumns;
  onSave?: () => Promise<void>;
  onSubmit?: () => Promise<void>;
  isReadOnly?: boolean;
  loading?: boolean;
  submitting?: boolean;
  tabs?: TabDefinition[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSave,
  onSubmit,
  isReadOnly = false,
  loading = false,
  submitting = false,
  tabs = []
}) => {
  const [currentTab, setCurrentTab] = useState(tabs.length > 0 ? tabs[0].id : 'default');

  // Əgər tabs verilməyibs��, kateqoriyanın adı ilə bir tab yaradaq
  const effectiveTabs = tabs.length > 0
    ? tabs
    : [{ id: 'default', label: category?.name || 'Məlumatlar' }];

  return (
    <div className="space-y-6">
      {effectiveTabs.length > 1 ? (
        <Tabs defaultValue={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {effectiveTabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          {effectiveTabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                <CardContent className="pt-6">
                  {/* Tab content would go here */}
                  <p>Tab content for {tab.label}</p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="pt-6">
            {/* Default content when there's only one tab */}
            <p>Form content for {category?.name}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        {onSave && (
          <Button
            onClick={onSave}
            variant="outline"
            disabled={loading || isReadOnly}
          >
            {loading ? 'Saxlanır...' : 'Yadda saxla'}
          </Button>
        )}

        {onSubmit && (
          <Button
            onClick={onSubmit}
            disabled={submitting || isReadOnly}
          >
            {submitting ? 'Göndərilir...' : 'Təsdiqə göndər'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CategoryForm;
