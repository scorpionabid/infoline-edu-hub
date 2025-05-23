
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
    columns?: Column[];
    description?: string;
  };
  readOnly?: boolean;
}

const DataEntryFormContent: React.FC<DataEntryFormContentProps> = ({ category, readOnly = false }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('general');
  
  // Safely handle category and columns
  if (!category || !category.id) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('categoryNotFound')}
      </div>
    );
  }
  
  // Ensure columns is an array and filter out any invalid entries
  const safeColumns = Array.isArray(category.columns) 
    ? category.columns.filter(column => column && column.id)
    : [];
  
  if (safeColumns.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('noColumnsAvailable')}
      </div>
    );
  }
  
  // Group columns by section
  const sections = React.useMemo(() => {
    // Start with an empty general section
    const sectionMap: Record<string, Column[]> = { general: [] };
    
    // Add each column to its section, defaulting to 'general'
    safeColumns.forEach(column => {
      if (!column) return; // Skip invalid columns
      
      const section = column.section 
        ? String(column.section).trim() || 'general'
        : 'general';
      
      if (!sectionMap[section]) {
        sectionMap[section] = [];
      }
      
      sectionMap[section].push(column);
    });
    
    return sectionMap;
  }, [safeColumns]);
  
  // Check if we have multiple valid sections
  const sectionEntries = Object.entries(sections);
  const hasSections = sectionEntries.length > 1;

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <>
      {hasSections ? (
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            {sectionEntries.map(([section]) => (
              <TabsTrigger key={section} value={section}>
                {section === 'general' ? t('generalInfo') : section}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {sectionEntries.map(([section, columns]) => (
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
            columns={safeColumns} 
            readOnly={readOnly} 
          />
        </div>
      )}
      
      <Separator className="my-6" />
    </>
  );
};

export default DataEntryFormContent;
