
import React from 'react';
import { UnifiedDataEntryForm } from '@/components/dataEntry';

interface SectorDataEntryFormProps {
  categoryId: string;
  sectorId: string;
  onComplete?: () => void;
}

const SectorDataEntryForm: React.FC<SectorDataEntryFormProps> = ({
  categoryId,
  sectorId,
  onComplete
}) => {
  return (
    <UnifiedDataEntryForm
      categoryId={categoryId}
      entityId={sectorId}
      entityType="sector"
      title="Sektor Məlumatları"
      description="Sektor kateqoriyası üçün məlumatları daxil edin"
      onSubmit={onComplete}
    />
  );
};

export default SectorDataEntryForm;
