
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sector } from '@/types/sector';

export interface SectorsContainerProps {
  sectors: Sector[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

const SectorsContainer: React.FC<SectorsContainerProps> = ({
  sectors,
  isLoading,
  onRefresh
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sektorlar</h1>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Yenilə
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sectors.map((sector) => (
          <Card key={sector.id}>
            <CardHeader>
              <CardTitle className="text-lg">{sector.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sector.description && (
                  <p className="text-sm text-muted-foreground">{sector.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span>Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    sector.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {sector.status === 'active' ? 'Aktiv' : 'Qeyri-aktiv'}
                  </span>
                </div>
                {sector.completion_rate !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Tamamlanma:</span>
                    <span>{sector.completion_rate}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SectorsContainer;
