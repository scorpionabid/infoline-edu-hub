
import React from 'react';
import { EnhancedDataEntryForm } from '@/components/dataEntry/EnhancedDataEntryForm';

interface SchoolDataEntryFormProps {
  categoryId: string;
  schoolId: string;
  onComplete?: () => void;
}

const SchoolDataEntryForm: React.FC<SchoolDataEntryFormProps> = ({
  categoryId,
  schoolId,
  onComplete
}) => {
  return (
    <EnhancedDataEntryForm
      categoryId={categoryId}
      entityId={schoolId}
      entityType="school"
      title="Məktəb Məlumatları"
      description="Məktəb kateqoriyası üçün məlumatları daxil edin"
      onSubmit={onComplete}
    />
  );
};

export default SchoolDataEntryForm;
