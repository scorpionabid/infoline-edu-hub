
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
        
        // Safely determine section with fallback to general
        const sectionKey = 'general'; // Default to general initially
        
        let section = column.section;
        if (section !== undefined && section !== null) {
          // Convert to string safely and trim
          section = String(section).trim();
          // Only use non-empty strings
          if (section) {
            // Create section if it doesn't exist
            if (!sectionMap[section]) {
              sectionMap[section] = [];
            }
            
            // Add column to the section
            sectionMap[section].push(column);
            return; // Skip adding to general section
          }
        }
        
        // Add to general section if no valid section is specified
        sectionMap[sectionKey].push(column);
      });
      
      // Clean up any empty sections
      return Object.fromEntries(
        Object.entries(sectionMap)
          .filter(([_, columns]) => columns.length > 0)
      );
    } catch (err) {
      console.error(`Error grouping columns by section for category ${category.id}:`, err);
      // Fall back to all columns in general section if error
      return { general: safeColumns };
    }
  }, [safeColumns, category.id]);
  
  // Safely get section entries and check for valid sections
  const sectionEntries = Object.entries(sections);
  const hasSections = sectionEntries.length > 1;

  // Handle tab change with safety check
  const handleTabChange = (value: string) => {
    if (!value) {
      console.warn('Attempted to set tab to empty value');
      return;
    }
    
    // Verify the tab exists before setting
    if (!sections[value]) {
      console.warn(`Attempted to set tab to non-existent section: ${value}`);
      return;
    }
    
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
