
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useDataEntryState } from '@/hooks/dataEntry/useDataEntryState';

// Import components
import { DataEntryTabs } from './DataEntryTabs';
import { DataEntryContent } from './DataEntryContent';
import { DataEntryLoading } from './DataEntryLoading';

export const DataEntryContainer: React.FC = () => {
  const user = useAuthStore(selectUser);
  const permissions = usePermissions();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const categoryIdFromUrl = queryParams.get('categoryId');
  const schoolIdFromUrl = queryParams.get('schoolId');
  
  const isSectorAdmin = permissions?.isSectorAdmin === true;
  
  const {
    loading,
    tabValue,
    setTabValue,
    selectedSchoolId,
    setSelectedSchoolId,
    selectedSchoolName,
    setSelectedSchoolName,
    displayCategories,
    overallProgress,
    categoryStats
  } = useDataEntryState({
    user,
    isSectorAdmin,
    categoryIdFromUrl,
    schoolIdFromUrl
  });

  if (loading) {
    return <DataEntryLoading />;
  }

  return (
    <div className="container py-6 space-y-6">
      {isSectorAdmin ? (
        <DataEntryTabs
          tabValue={tabValue}
          setTabValue={setTabValue}
          selectedSchoolId={selectedSchoolId}
          setSelectedSchoolId={setSelectedSchoolId}
          selectedSchoolName={selectedSchoolName}
          setSelectedSchoolName={setSelectedSchoolName}
          displayCategories={displayCategories}
          overallProgress={overallProgress}
          categoryStats={categoryStats}
          user={user}
        />
      ) : (
        <DataEntryContent
          displayCategories={displayCategories}
          selectedSchoolId={user?.school_id}
          selectedSchoolName={user?.school_name || user?.name || ''}
          overallProgress={overallProgress}
          categoryStats={categoryStats}
          isSectorAdmin={false}
        />
      )}
    </div>
  );
};

export default DataEntryContainer;
