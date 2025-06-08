
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSectorDataEntryUnified } from '@/hooks/dataEntry/useSectorDataEntryUnified';
import { UnifiedDataEntryForm } from '@/components/dataEntry';

interface SectorDataEntryFormProps {
  categoryId: string;
  sectorId: string;
}

const SectorDataEntryForm: React.FC<SectorDataEntryFormProps> = ({
  categoryId,
  sectorId
}) => {
  return (
    <UnifiedDataEntryForm
      categoryId={categoryId}
      entityId={sectorId}
      entityType="sector"
      title="Sektor Məlumatları"
      description="Sektor kateqoriyası üçün məlumatları daxil edin"
    />
  );
};

export default SectorDataEntryForm;
