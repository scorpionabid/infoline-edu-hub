
import { useState, useCallback } from 'react';
import { useDataEntryState } from '@/hooks/business/dataEntry/useDataEntryState';
import { useSchoolsQuery } from '@/hooks/api/schools/useSchoolsQuery';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';

export interface UseSectorDataEntryProps {
  categoryId: string;
  sectorId?: string;
}

export interface UseSectorDataEntryResult {
  // School management
  schools: any[];
  selectedSchoolId: string | null;
  setSelectedSchoolId: (schoolId: string | null) => void;
  
  // Data entry for selected school
  entries: DataEntry[];
  isLoading: boolean;
  isSaving: boolean;
  updateEntryValue: (columnId: string, value: any) => void;
  saveEntries: () => Promise<void>;
  submitEntries: () => Promise<void>;
  
  // Progress tracking
  completionPercentage: number;
  hasRequiredData: boolean;
}

export function useSectorDataEntry({
  categoryId,
  sectorId
}: UseSectorDataEntryProps): UseSectorDataEntryResult {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  
  // Load schools for the sector
  const { schools, loading: schoolsLoading } = useSchoolsQuery();
  
  // Filter schools by sector if sectorId is provided
  const filteredSchools = sectorId 
    ? schools.filter(school => school.sector_id === sectorId)
    : schools;
  
  // Load data entry state for selected school
  const {
    entries,
    isLoading: entriesLoading,
    isSaving,
    updateEntryValue,
    saveEntries: saveEntriesRaw,
    updateStatus
  } = useDataEntryState({
    categoryId,
    schoolId: selectedSchoolId || '',
    enabled: !!selectedSchoolId && !!categoryId
  });
  
  // Calculate completion percentage
  const completionPercentage = entries.length > 0 
    ? Math.round((entries.filter(e => e.value && e.value.trim()).length / entries.length) * 100)
    : 0;
  
  // Check if all required data is present
  const hasRequiredData = entries.length > 0 && entries.every(entry => 
    entry.value && entry.value.trim()
  );
  
  // Save entries wrapper
  const saveEntries = useCallback(async () => {
    if (!selectedSchoolId) return;
    
    try {
      await saveEntriesRaw(entries);
      console.log('Entries saved successfully');
    } catch (error) {
      console.error('Failed to save entries:', error);
      throw error;
    }
  }, [selectedSchoolId, entries, saveEntriesRaw]);
  
  // Submit entries for approval
  const submitEntries = useCallback(async () => {
    if (!selectedSchoolId || !hasRequiredData) return;
    
    try {
      await updateStatus(entries, DataEntryStatus.PENDING);
      console.log('Entries submitted for approval');
    } catch (error) {
      console.error('Failed to submit entries:', error);
      throw error;
    }
  }, [selectedSchoolId, hasRequiredData, entries, updateStatus]);
  
  return {
    // School management
    schools: filteredSchools,
    selectedSchoolId,
    setSelectedSchoolId,
    
    // Data entry
    entries,
    isLoading: schoolsLoading || entriesLoading,
    isSaving,
    updateEntryValue,
    saveEntries,
    submitEntries,
    
    // Progress
    completionPercentage,
    hasRequiredData
  };
}

export default useSectorDataEntry;
