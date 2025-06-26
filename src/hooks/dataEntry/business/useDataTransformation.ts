
import { useCallback } from 'react';
import { CategoryWithColumns } from '@/types/category';

export interface DataTransformationOptions {
  category?: CategoryWithColumns | null;
}

export interface DataTransformationResult {
  transformForSave: (data: Record<string, any>) => Record<string, any>;
  transformForDisplay: (data: Record<string, any>) => Record<string, any>;
  normalizeValue: (fieldId: string, value: any) => any;
}

export const useDataTransformation = ({
  category
}: DataTransformationOptions): DataTransformationResult => {

  const normalizeValue = useCallback((fieldId: string, value: any) => {
    const column = category?.columns?.find(col => col.id === fieldId);
    if (!column || !value) return value;

    switch (column.type) {
      case 'text': 
      case 'textarea': {
        return typeof value === 'string' ? value.trim() : value;
      }
      
      case 'email': {
        return typeof value === 'string' ? value.toLowerCase().trim() : value;
      }
      
      case 'number': {
        const num = Number(value);
        return isNaN(num) ? value : num;
      }
      
      case 'phone': {
        // Remove non-numeric characters except + and spaces
        return typeof value === 'string' ? 
          value.replace(/[^\d\s\+\-\(\)]/g, '').trim() : value;
      }
      
      case 'url': {
        if (typeof value === 'string' && value && !value.startsWith('http')) {
          return `https://${value}`;
        }
        return value;
      }
      
      default:
        return value;
    }
  }, [category]);

  const transformForSave = useCallback((data: Record<string, any>) => {
    const transformed: Record<string, any> = {};
    
    Object.keys(data).forEach(fieldId => {
      const value = data[fieldId];
      transformed[fieldId] = normalizeValue(fieldId, value);
    });
    
    return transformed;
  }, [normalizeValue]);

  const transformForDisplay = useCallback((data: Record<string, any>) => {
    const transformed: Record<string, any> = {};
    
    Object.keys(data).forEach(fieldId => {
      const value = data[fieldId];
      const column = category?.columns?.find(col => col.id === fieldId);
      
      if (column) {
        switch (column.type) {
          case 'number': {
            // Format numbers for display
            transformed[fieldId] = typeof value === 'number' ? 
              value.toLocaleString() : value;
            break;
          }
          
          case 'date': {
            // Format dates for display
            if (value instanceof Date) {
              transformed[fieldId] = value.toLocaleDateString();
            } else if (typeof value === 'string' && value) {
              const date = new Date(value);
              transformed[fieldId] = isNaN(date.getTime()) ? value : date.toLocaleDateString();
            } else {
              transformed[fieldId] = value;
            }
            break;
          }
          
          default:
            transformed[fieldId] = value;
            break;
        }
      } else {
        transformed[fieldId] = value;
      }
    });
    
    return transformed;
  }, [category]);

  return {
    transformForSave,
    transformForDisplay,
    normalizeValue
  };
};

export default useDataTransformation;
