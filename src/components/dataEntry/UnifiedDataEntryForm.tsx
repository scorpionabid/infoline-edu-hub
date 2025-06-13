
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UnifiedDataEntryFormProps {
  entityType: 'school' | 'sector';
  entityId: string;
  categoryId: string;
}

export const UnifiedDataEntryForm: React.FC<UnifiedDataEntryFormProps> = ({
  entityType,
  entityId,
  categoryId
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Məlumat Girişi
          <Badge variant="outline">{entityType}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {entityType === 'school' ? 'Məktəb' : 'Sektor'} məlumatları girişi
          </p>
          <div className="text-sm text-muted-foreground">
            Entity ID: {entityId}
          </div>
          <div className="text-sm text-muted-foreground">
            Category ID: {categoryId}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedDataEntryForm;
