
export { useDataManagement } from './useDataManagement';
export type { 
  DataManagementStep,
  Category,
  Column,
  SchoolDataEntry,
  DataStats
} from './useDataManagement';

// Add the missing DataManagementState type export
export type DataManagementState = {
  currentStep: DataManagementStep;
  selectedCategory: Category | null;
  selectedColumn: Column | null;
  schoolData: SchoolDataEntry[];
  isLoading: boolean;
  error: string | null;
};
