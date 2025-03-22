
// Mock data for the user form
export const mockRegions = [
  { id: 'region-1', name: 'Bakı' },
  { id: 'region-2', name: 'Gəncə' },
  { id: 'region-3', name: 'Sumqayıt' },
];

export const mockSectors = [
  { id: 'sector-1', regionId: 'region-1', name: 'Yasamal' },
  { id: 'sector-2', regionId: 'region-1', name: 'Nəsimi' },
  { id: 'sector-3', regionId: 'region-2', name: 'Kəpəz' },
];

export const mockSchools = [
  { id: 'school-1', sectorId: 'sector-1', name: 'Məktəb #45' },
  { id: 'school-2', sectorId: 'sector-1', name: 'Məktəb #153' },
  { id: 'school-3', sectorId: 'sector-2', name: 'Məktəb #23' },
];

// Function to get filtered sectors by region ID
export const getFilteredSectors = (regionId?: string) => {
  if (!regionId) return [];
  return mockSectors.filter(sector => sector.regionId === regionId);
};

// Function to get filtered schools by sector ID
export const getFilteredSchools = (sectorId?: string) => {
  if (!sectorId) return [];
  return mockSchools.filter(school => school.sectorId === sectorId);
};
