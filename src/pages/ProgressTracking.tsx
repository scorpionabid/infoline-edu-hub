
import React from 'react';
import { ProgressTracking } from '@/components/progress/ProgressTracking';
import { useNavigate } from 'react-router-dom';

const ProgressTrackingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSchoolClick = (schoolId: string) => {
    // Navigate to school data entry page
    navigate(`/data-entry/${schoolId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <ProgressTracking onSchoolClick={handleSchoolClick} />
    </div>
  );
};

export default ProgressTrackingPage;
