
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSector } from '@/types/sector';

export interface SectorsContainerProps {
  sectors: EnhancedSector[];
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

      {sectors.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Heç bir sektor tapılmadı
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Hal-hazırda sistemdə qeydiyyatdan keçmiş sektor yoxdur.
          </p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Yenidən yüklə
          </button>
        </div>
      ) : (
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
                  {(sector.region_name || sector.regionName) && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Region:</span>
                      <span className="text-primary font-medium">
                        {sector.region_name || sector.regionName}
                      </span>
                    </div>
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
      )}
    </div>
  );
};

export default SectorsContainer;
