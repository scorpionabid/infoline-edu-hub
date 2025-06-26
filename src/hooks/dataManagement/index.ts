
import type { Category } from '@/types/category';
import type { Column } from '@/types/column';

export { useDataManagement } from './useDataManagement';
export type { 
  DataManagementStep,
  Category,
  Column,
  SchoolDataEntry,
  DataStats
} from './useDataManagement';

// Define specific types for data management
export type DataManagementStep = 'category' | 'column' | 'data' | 'review';

export interface SchoolDataEntry {
  schoolId: string;
  schoolName: string;
  sectorName: string;
  regionName: string;
  currentValue?: string;
  status: 'pending' | 'approved' | 'rejected' | 'empty';
  lastUpdated?: string;
  submittedBy?: string;
}

export interface DataStats {
  totalSchools: number;
  completedSchools: number;
  pendingSchools: number;
  completionRate: number;
}

// DataManagementState type definition
export type DataManagementState = {
  currentStep: DataManagementStep;
  selectedCategory: Category | null;
  selectedColumn: Column | null;
  schoolData: SchoolDataEntry[];
  isLoading: boolean;
  error: string | null;
};
