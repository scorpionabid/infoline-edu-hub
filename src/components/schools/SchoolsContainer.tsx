
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Region } from '@/types/region';
import { Sector } from '@/types/sector';
import { School } from '@/types/supabase';

export interface SchoolsContainerProps {
  schools: School[];
  regions: Region[];
  sectors: Sector[];
  isLoading: boolean;
  error?: string | null;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onSchoolUpdate: () => void;
  onSchoolDelete: () => void;
  searchQuery: string;
  filters: {
    region: string;
    sector: string;
    type: string;
    status: string;
  };
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
}

const SchoolsContainer: React.FC<SchoolsContainerProps> = ({
  schools,
  regions,
  sectors,
  isLoading,
  error,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onSchoolUpdate,
  onSchoolDelete,
  searchQuery,
  filters,
  regionNames,
  sectorNames
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p>Xəta baş verdi: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Məktəblər</h1>
      </div>

      {schools.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Heç bir məktəb tapılmadı
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Hal-hazırda sistemdə qeydiyyatdan keçmiş məktəb yoxdur.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <Card key={school.id}>
              <CardHeader>
                <CardTitle className="text-lg">{school.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {school.principal_name && (
                    <p className="text-sm text-muted-foreground">Direktor: {school.principal_name}</p>
                  )}
                  {school.region_id && regionNames[school.region_id] && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Region:</span>
                      <span className="text-primary font-medium">
                        {regionNames[school.region_id]}
                      </span>
                    </div>
                  )}
                  {school.sector_id && sectorNames[school.sector_id] && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Sektor:</span>
                      <span className="text-primary font-medium">
                        {sectorNames[school.sector_id]}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      school.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {school.status === 'active' ? 'Aktiv' : 'Qeyri-aktiv'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolsContainer;
