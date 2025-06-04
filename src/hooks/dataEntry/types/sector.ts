import { BaseDataEntry } from './common';

// Sector-specific data entry types
export interface SectorDataEntry extends BaseDataEntry {
  sector_id: string;
}

export interface SectorFormData {
  [columnId: string]: any;
}

export interface SectorDataEntryOptions {
  sectorId: string;
  categoryId: string;
  autoSave?: boolean;
  autoApprove?: boolean; // Sector admin can auto-approve
}

export interface SectorSubmissionResult {
  success: boolean;
  entryId?: string;
  status: 'approved' | 'pending' | 'draft';
  message?: string;
  errors?: Record<string, string>;
  autoApproved?: boolean;
}

export interface SectorSchoolManagementOptions {
  sectorId: string;
  includeCompletionRates?: boolean;
  filterByStatus?: 'active' | 'inactive' | 'all';
}

export interface SchoolInSector {
  id: string;
  name: string;
  sector_id: string;
  completion_rate?: number;
  status: string;
  last_updated?: string;
}

export interface BulkDataEntryOptions {
  schoolIds: string[];
  categoryId: string;
  data: Record<string, any>;
  autoApprove?: boolean;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  results: Array<{
    schoolId: string;
    schoolName: string;
    success: boolean;
    error?: string;
  }>;
}
