
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import FormFields from './FormFields';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';

interface DataEntryFormContentProps {
  category: {
    id: string;
    name: string;
    columns: Column[];
    description?: string;
  };
  readOnly?: boolean;
}

const DataEntryFormContent: React.FC<DataEntryFormContentProps> = ({ category, readOnly = false }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  
  // Group columns by section
  const sections = React.useMemo(() => {
    if (!category || !category.columns || !Array.isArray(category.columns)) {
      return { general: [] };
    }
    
    // Filter out any null or undefined columns first
    const validColumns = category.columns.filter(column => column != null);
    
    return validColumns.reduce((acc: Record<string, Column[]>, column) => {
      if (!column) return acc;  // Skip null/undefined columns
      
      const section = (column.section || 'general').toString();
      if (!acc[section]) acc[section] = [];
      acc[section].push(column);
      return acc;
    }, { general: [] });
  }, [category]);
  
  // Check if section keys are valid strings
  const validSections = Object.entries(sections).filter(
    ([key]) => typeof key === 'string' && key.length > 0
  );
  
  // Render sections as tabs if multiple valid sections exist
  const hasSections = validSections.length > 1;

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <>
      {hasSections ? (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            {validSections.map(([section]) => (
              <TabsTrigger key={section} value={section}>
                {section === 'general' ? t('generalInfo') : section}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {validSections.map(([section, columns]) => (
            <TabsContent key={section} value={section} className="space-y-4">
              <FormFields 
                columns={columns || []} 
                readOnly={readOnly} 
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-4">
          <FormFields 
            columns={(category.columns || []).filter(col => col != null)} 
            readOnly={readOnly} 
          />
        </div>
      )}
      
      <Separator className="my-6" />
    </>
  );
};

export default DataEntryFormContent;
