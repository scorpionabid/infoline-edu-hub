
import { useState, useCallback } from 'react';
import { useSchoolsQuery } from '@/hooks/api/schools/useSchoolsQuery';
import { toast } from 'sonner';

interface UseSchoolManagementProps {
  sectorId?: string;
  onDataEntry?: (schoolId: string) => void;
}

export const useSchoolManagement = ({ sectorId, onDataEntry }: UseSchoolManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedSchoolForDataEntry, setSelectedSchoolForDataEntry] = useState<string | null>(null);
  const [isDataEntryModalOpen, setIsDataEntryModalOpen] = useState(false);
  const [isBulkNotificationOpen, setIsBulkNotificationOpen] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  // Get schools data
  const { schools, isLoading, isError, error } = useSchoolsQuery({
    sectorId,
    enabled: !!sectorId
  });

  // Filter schools based on search term
  const filteredSchools = schools.filter(school => 
    !searchTerm || 
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (school.principal_name && school.principal_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate statistics
  const stats = {
    total: schools.length,
    avgCompletion: schools.length > 0 
      ? Math.round(schools.reduce((sum, s) => sum + (s.completion_rate || 0), 0) / schools.length)
      : 0,
    highCompletion: schools.filter(s => (s.completion_rate || 0) >= 80).length,
    lowCompletion: schools.filter(s => (s.completion_rate || 0) < 40).length
  };

  // Selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedSchools(filteredSchools.map(s => s.id));
    } else {
      setSelectedSchools([]);
    }
  }, [filteredSchools]);

  const handleSelectSchool = useCallback((schoolId: string, checked: boolean) => {
    if (checked) {
      setSelectedSchools(prev => [...prev, schoolId]);
    } else {
      setSelectedSchools(prev => prev.filter(id => id !== schoolId));
    }
  }, []);

  // Data entry handlers
  const handleDataEntry = useCallback((schoolId: string) => {
    setSelectedSchoolForDataEntry(schoolId);
    setIsDataEntryModalOpen(true);
    if (onDataEntry) {
      onDataEntry(schoolId);
    }
  }, [onDataEntry]);

  const handleDataEntryComplete = useCallback(() => {
    setIsDataEntryModalOpen(false);
    setSelectedSchoolForDataEntry(null);
    // Could trigger a refresh here if needed
  }, []);

  // Bulk notification handlers
  const handleBulkNotification = useCallback(() => {
    setIsBulkNotificationOpen(true);
  }, []);

  const sendBulkNotification = useCallback(async (data: { message: string }) => {
    setIsNotificationLoading(true);
    try {
      // TODO: Implement actual bulk notification API
      console.log('Sending bulk notification to schools:', selectedSchools, data.message);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${selectedSchools.length} məktəbə bildiriş göndərildi`);
      setIsBulkNotificationOpen(false);
      setSelectedSchools([]);
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      toast.error('Bildiriş göndərilərkən xəta baş verdi');
    } finally {
      setIsNotificationLoading(false);
    }
  }, [selectedSchools]);

  // Completion badge helper
  const getCompletionBadge = useCallback((rate: number) => {
    if (rate >= 80) {
      return { text: `${rate}%`, className: 'bg-green-100 text-green-800', variant: 'secondary' };
    } else if (rate >= 40) {
      return { text: `${rate}%`, className: 'bg-yellow-100 text-yellow-800', variant: 'secondary' };
    } else {
      return { text: `${rate}%`, className: 'bg-red-100 text-red-800', variant: 'secondary' };
    }
  }, []);

  return {
    // Data
    schools,
    filteredSchools,
    stats,
    isLoading,
    isError,
    error,

    // Search and filtering
    searchTerm,
    setSearchTerm,

    // Selection
    selectedSchools,
    handleSelectAll,
    handleSelectSchool,

    // Data entry
    handleDataEntry,
    handleDataEntryComplete,
    selectedSchoolForDataEntry,
    isDataEntryModalOpen,
    setIsDataEntryModalOpen,

    // Bulk operations
    handleBulkNotification,
    isBulkNotificationOpen,
    setIsBulkNotificationOpen,
    isNotificationLoading,
    sendBulkNotification,

    // Helpers
    getCompletionBadge
  };
};

export default useSchoolManagement;
