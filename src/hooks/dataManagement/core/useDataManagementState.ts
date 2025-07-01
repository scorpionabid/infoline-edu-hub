
import { useState } from 'react';
import type { Category, Column } from '@/types/column';
import type { SchoolDataEntry, DataManagementStep } from '../types';

export const useDataManagementState = () => {
  const [currentStep, setCurrentStep] = useState<DataManagementStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [schoolData, setSchoolData] = useState<SchoolDataEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setCurrentStep('category');
    setSelectedCategory(null);
    setSelectedColumn(null);
    setSchoolData([]);
    setError(null);
  };

  const clearError = () => setError(null);

  return {
    // State
    currentStep,
    selectedCategory,
    selectedColumn,
    schoolData,
    error,
    
    // Actions
    setCurrentStep,
    setSelectedCategory,
    setSelectedColumn,
    setSchoolData,
    setError,
    resetState,
    clearError
  };
};
