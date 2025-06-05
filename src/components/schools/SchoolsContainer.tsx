
import React from 'react';
import { useSchoolsQuery } from '@/hooks/api/schools/useSchoolsQuery';
import { SchoolsList } from './SchoolsList';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const SchoolsContainer: React.FC = () => {
  const {
    schools,
    loading,
    isLoading,
    isError,
    error,
    refetch
  } = useSchoolsQuery();

  if (loading || isLoading) {
    return <LoadingSpinner />;
  }

  if (isError && error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading schools: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Mock delete function since it's not available in the hook
  const handleDeleteSchool = async (schoolId: string) => {
    console.log('Delete school called for:', schoolId);
    // This should be implemented when the mutation is added to the hook
  };

  return (
    <SchoolsList 
      schools={schools}
      onDelete={handleDeleteSchool}
    />
  );
};

export default SchoolsContainer;
