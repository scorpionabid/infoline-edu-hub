import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import FormFields from './FormFields';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';
import { safeArrayFind } from '@/utils/dataIndexing';

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
  if (!category) {
    console.warn('DataEntryFormContent received undefined category');
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('categoryNotFound')}
      </div>
    );
  }

  if (!category.id) {
    console.warn('DataEntryFormContent received category without ID:', category);
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('invalidCategory')}
      </div>
    );
  }
  
  // Ensure columns is an array and filter out any invalid entries
  const safeColumns = React.useMemo(() => {
    try {
      if (!Array.isArray(category.columns)) {
        console.warn('Category columns is not an array:', category.columns);
        return [];
      }
      
      // Filter out invalid columns with detailed warnings
      return category.columns.filter(column => {
        if (!column) {
          console.warn(`Found null/undefined column in category ${category.id}`);
          return false;
        }
        
        if (!column.id) {
          console.warn(`Found column without ID in category ${category.id}:`, column);
          return false;
        }
        
        // Validate UUID format
        if (typeof column.id !== 'string' || column.id.trim() === '') {
          console.warn(`Found column with invalid ID format in category ${category.id}:`, column.id);
          return false;
        }
        
        return true;
      });
    } catch (err) {
      console.error(`Error processing columns for category ${category.id}:`, err);
      return [];
    }
  }, [category]);
  
  if (safeColumns.length === 0) {
    console.log(`No valid columns found for category ${category.id}`);
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('noColumnsAvailable')}
      </div>
    );
  }
  
  // Group columns by section with extensive safety checks
  const sections = React.useMemo(() => {
    try {
      // Start with an empty general section
      const sectionMap: Record<string, Column[]> = { general: [] };
      
      // Add each column to its section, defaulting to 'general'
      safeColumns.forEach(column => {
        if (!column || !column.id) {
          console.warn('Skipping invalid column in section mapping');
          return; // Skip invalid columns
        }
        
        // Generate a stable ID to use as key
        const stableKey = `${column.id}`;
        
        // Safely determine section with fallback to general
        const section = column.section && typeof column.section === 'string' && column.section.trim() !== '' 
          ? column.section.trim().toLowerCase() 
          : 'general';
        
        // Initialize the section array if it doesn't exist
        if (!sectionMap[section]) {
          sectionMap[section] = [];
        }
        
        // Add column to its section
        sectionMap[section].push({
          ...column,
          key: stableKey // Add a stable key for React rendering
        });
      });
      
      return sectionMap;
    } catch (err) {
      console.error(`Error grouping columns by section for category ${category.id}:`, err);
      return { general: safeColumns }; // Fallback to a flat list on error
    }
  }, [safeColumns, category.id]);
  
  // Get array of section names
  const sectionNames = Object.keys(sections);
  
  // Handle missing sections gracefully
  if (sectionNames.length === 0) {
    console.warn(`No sections created for category ${category.id}`);
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('noSectionsAvailable')}
      </div>
    );
  }
  
  // If there's only the general section, render a simpler view
  if (sectionNames.length === 1 && sectionNames[0] === 'general') {
    return (
      <div className="p-6">
        <FormFields columns={sections.general} readOnly={readOnly} />
      </div>
    );
  }
  
  // Otherwise render tabbed interface
  return (
    <Tabs defaultValue="general" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <div className="border-b px-6 py-2">
        <TabsList className="grid grid-flow-col auto-cols-max gap-4">
          {sectionNames.map(section => (
            <TabsTrigger 
              key={section} 
              value={section}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      <div className="p-6">
        {sectionNames.map(section => (
          <TabsContent key={section} value={section} className="mt-0 p-0">
            <FormFields columns={sections[section]} readOnly={readOnly} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

export default DataEntryFormContent;
