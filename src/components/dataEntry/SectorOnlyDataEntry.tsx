
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { UnifiedDataEntryForm } from './UnifiedDataEntryForm';

interface SectorOnlyDataEntryProps {
  sectorId: string;
  categoryId: string;
}

export const SectorOnlyDataEntry: React.FC<SectorOnlyDataEntryProps> = ({
  sectorId,
  categoryId
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Sektor Məlumatları Girişi
          <Badge variant="outline">Sektor səviyyəsində</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UnifiedDataEntryForm
          entityType="sector"
          entityId={sectorId}
          categoryId={categoryId}
        />
      </CardContent>
    </Card>
  );
};

export default SectorOnlyDataEntry;
