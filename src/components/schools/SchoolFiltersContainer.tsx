
import React, { useState } from 'react';
import { SchoolFilters } from './SchoolFilters';
import { useRegionsQuery } from '@/hooks/api/regions/useRegionsQuery';
import { useSectorsQuery } from '@/hooks/api/sectors/useSectorsQuery';

export const SchoolFiltersContainer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  const { regions, loading: loadingRegions } = useRegionsQuery();
  const { sectors, loading: loadingSectors } = useSectorsQuery();

  return (
    <SchoolFilters
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedRegion={selectedRegion}
      setSelectedRegion={setSelectedRegion}
      selectedSector={selectedSector}
      setSelectedSector={setSelectedSector}
      regions={regions}
      sectors={sectors}
      loadingRegions={loadingRegions}
      loadingSectors={loadingSectors}
    />
  );
};

export default SchoolFiltersContainer;
