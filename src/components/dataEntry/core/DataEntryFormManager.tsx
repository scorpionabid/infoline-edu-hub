
import React, { useState, useEffect, useCallback } from 'react';
import { Column } from '@/types/column';
import { CategoryWithColumns } from '@/types/category';
import DataEntryFormContent from './DataEntryFormContent';
import { toast } from 'sonner';

interface DataEntryFormManagerProps {
  category: CategoryWithColumns;
  schoolId?: string;
  readOnly?: boolean;
  onSubmit?: () => void;
}

const DataEntryFormManager: React.FC<DataEntryFormManagerProps> = ({
  category,
  schoolId,
  readOnly = false,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleFieldChange = useCallback((columnId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [columnId]: value
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // Save logic will be implemented
      toast.success('Data saved successfully');
    } catch (error) {
      toast.error('Failed to save data');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  return (
    <div className="space-y-6">
      <DataEntryFormContent
        columns={category.columns || []}
        category={category}
        readOnly={readOnly}
      />
      
      {!readOnly && (
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Submit
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DataEntryFormManager;
