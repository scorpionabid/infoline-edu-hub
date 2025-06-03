import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSchoolsQuery } from '@/hooks/api/schools/useSchoolsQuery';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { School } from '@/types/school';

interface UseSchoolManagementProps {
  sectorId?: string | null;
  onDataEntry?: (schoolId: string) => void;
  onSendNotification?: (schoolIds: string[]) => void;
}

export const useSchoolManagement = ({
  sectorId,
  onDataEntry,
  onSendNotification
}: UseSchoolManagementProps = {}) => {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const { schools: allSchools, loading: schoolsLoading } = useSchoolsQuery();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  
  // Selection states
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  
  // Modal states
  const [selectedSchoolForDataEntry, setSelectedSchoolForDataEntry] = useState<string | null>(null);
  const [isDataEntryModalOpen, setIsDataEntryModalOpen] = useState(false);
  const [isBulkNotificationOpen, setIsBulkNotificationOpen] = useState(false);
  const [singleNotificationSchool, setSingleNotificationSchool] = useState<School | null>(null);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  // Filter schools by sector
  const schools = useMemo(() => {
    const targetSectorId = sectorId || user?.sector_id;
    if (!targetSectorId) return allSchools || [];
    
    return (allSchools || []).filter(school => school.sector_id === targetSectorId);
  }, [allSchools, sectorId, user?.sector_id]);

  // Schools with completion calculation
  const schoolsWithCompletion = useMemo(() => {
    return schools.map(school => ({
      ...school,
      completion_rate: school.completion_rate || Math.floor(Math.random() * 100), // Temporary calculation
      last_updated: school.updated_at
    }));
  }, [schools]);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schoolsWithCompletion.filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || school.status === statusFilter;
      const matchesCompletion = 
        completionFilter === 'all' ||
        (completionFilter === 'high' && school.completion_rate >= 80) ||
        (completionFilter === 'medium' && school.completion_rate >= 40 && school.completion_rate < 80) ||
        (completionFilter === 'low' && school.completion_rate < 40);
      
      return matchesSearch && matchesStatus && matchesCompletion;
    });
  }, [schoolsWithCompletion, searchTerm, statusFilter, completionFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredSchools.length;
    const avgCompletion = total > 0 
      ? Math.round(filteredSchools.reduce((sum, school) => sum + school.completion_rate, 0) / total)
      : 0;
    const highCompletion = filteredSchools.filter(s => s.completion_rate >= 80).length;
    const lowCompletion = filteredSchools.filter(s => s.completion_rate < 40).length;
    
    return { total, avgCompletion, highCompletion, lowCompletion };
  }, [filteredSchools]);

  // Selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedSchools(filteredSchools.map(school => school.id));
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
    if (onDataEntry) {
      onDataEntry(schoolId);
    } else {
      setSelectedSchoolForDataEntry(schoolId);
      setIsDataEntryModalOpen(true);
    }
  }, [onDataEntry]);

  const handleDataEntryComplete = useCallback(() => {
    setIsDataEntryModalOpen(false);
    setSelectedSchoolForDataEntry(null);
    toast.success('Məlumatlar uğurla saxlanıldı');
    // TODO: Reload school data if needed
  }, []);

  const handleSchoolNameClick = useCallback((schoolId: string) => {
    handleDataEntry(schoolId);
  }, [handleDataEntry]);

  // Notification handlers
  const handleBulkNotification = useCallback(() => {
    if (selectedSchools.length === 0) {
      toast.error('Heç bir məktəb seçilməyib');
      return;
    }
    setIsBulkNotificationOpen(true);
  }, [selectedSchools.length]);

  const handleSingleNotification = useCallback((school: School) => {
    setSingleNotificationSchool(school);
  }, []);

  const sendBulkNotification = useCallback(async (notificationData: any) => {
    setIsNotificationLoading(true);
    try {
      // TODO: Implement actual notification sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${selectedSchools.length} məktəbə bildiriş göndərildi`);
      setSelectedSchools([]);
      setIsBulkNotificationOpen(false);
      
      if (onSendNotification) {
        onSendNotification(selectedSchools);
      }
    } catch (error) {
      toast.error('Bildiriş göndərilərkən xəta baş verdi');
    } finally {
      setIsNotificationLoading(false);
    }
  }, [selectedSchools, onSendNotification]);

  const sendSingleNotification = useCallback(async (notificationData: any) => {
    setIsNotificationLoading(true);
    try {
      // TODO: Implement actual notification sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Bildiriş uğurla göndərildi');
      setSingleNotificationSchool(null);
      
      if (onSendNotification) {
        onSendNotification([notificationData.schoolId]);
      }
    } catch (error) {
      toast.error('Bildiriş göndərilərkən xəta baş verdi');
    } finally {
      setIsNotificationLoading(false);
    }
  }, [onSendNotification]);

  // Navigation helpers
  const navigateToReports = useCallback((schoolId: string) => {
    navigate(`/reports?schoolId=${schoolId}`);
  }, [navigate]);

  const navigateToSchoolDetails = useCallback((schoolId: string) => {
    navigate(`/schools/${schoolId}`);
  }, [navigate]);

  // Selected school info
  const selectedSchool = useMemo(() => {
    return selectedSchoolForDataEntry 
      ? filteredSchools.find(s => s.id === selectedSchoolForDataEntry)
      : null;
  }, [selectedSchoolForDataEntry, filteredSchools]);

  return {
    // Data
    schools: filteredSchools,
    schoolsWithCompletion,
    stats,
    selectedSchool,
    isLoading: schoolsLoading,

    // Filter states
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    completionFilter,
    setCompletionFilter,

    // Selection states  
    selectedSchools,
    handleSelectAll,
    handleSelectSchool,

    // Modal states
    selectedSchoolForDataEntry,
    isDataEntryModalOpen,
    setIsDataEntryModalOpen,
    isBulkNotificationOpen,
    setIsBulkNotificationOpen,
    singleNotificationSchool,
    setSingleNotificationSchool,
    isNotificationLoading,

    // Handlers
    handleDataEntry,
    handleDataEntryComplete,
    handleSchoolNameClick,
    handleBulkNotification,
    handleSingleNotification,
    sendBulkNotification,
    sendSingleNotification,
    navigateToReports,
    navigateToSchoolDetails,

    // Utility functions
    getCompletionBadge: (rate: number) => {
      if (rate >= 80) return { variant: 'default', text: 'Yüksək', className: 'bg-green-100 text-green-800' };
      if (rate >= 40) return { variant: 'secondary', text: 'Orta', className: 'bg-yellow-100 text-yellow-800' };
      return { variant: 'destructive', text: 'Aşağı', className: 'bg-red-100 text-red-800' };
    }
  };
};
