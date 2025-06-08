
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchoolDataEntry } from '@/hooks/dataEntry/useSchoolDataEntry';
import { UnifiedDataEntryForm } from '@/components/dataEntry';

interface SchoolDataEntryFormProps {
  categoryId: string;
  schoolId: string;
}

const SchoolDataEntryForm: React.FC<SchoolDataEntryFormProps> = ({
  categoryId,
  schoolId
}) => {
  return (
    <UnifiedDataEntryForm
      categoryId={categoryId}
      entityId={schoolId}
      entityType="school"
      title="Məktəb Məlumatları"
      description="Məktəb kateqoriyası üçün məlumatları daxil edin"
    />
  );
};

export default SchoolDataEntryForm;
