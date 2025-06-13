
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface SectorDataEntryFormProps {
  sectorId: string;
  categoryId: string;
}

export const SectorDataEntryForm: React.FC<SectorDataEntryFormProps> = ({ 
  sectorId, 
  categoryId 
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sektor Məlumat Daxiletmə</h1>
        <p className="text-muted-foreground mt-2">
          Sektor məlumatlarınızı daxil edin və idarə edin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sektor Məlumatları</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sektor məlumat daxiletmə formu hazırlanmaqdadır...
          </p>
          <div className="text-sm text-muted-foreground mt-2">
            <p>Sektor ID: {sectorId}</p>
            <p>Kateqoriya ID: {categoryId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
