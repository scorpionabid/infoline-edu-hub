
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sector } from '@/types/sector';
import { EnhancedSector } from '@/types/supabase';
import { SectorCard } from './SectorCard';
import { useSectors } from '@/hooks/useSectors';
import { useAuth } from '@/context/auth';
import SectorFilters from './SectorFilters';

export const SectorsContainer: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const { fetchSectors } = useSectors();
  
  useEffect(() => {
    const loadSectors = async () => {
      setLoading(true);
      try {
        // Get sectors from the hook with region filtering
        const fetchedSectors = await fetchSectors(selectedRegion);
        setSectors(fetchedSectors as Sector[]);
      } catch (error) {
        console.error('Error loading sectors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSectors();
  }, [fetchSectors, selectedRegion]);
  
  const handleRegionChange = (regionId: string | null) => {
    setSelectedRegion(regionId);
  };
  
  // Group sectors by region
  const sectorsByRegion: Record<string, Sector[]> = {};
  
  sectors.forEach(sector => {
    // Safely handle enhanced sectors with region_name property
    const regionName = (sector as EnhancedSector).region_name || 'Unknown Region';
    const regionId = sector.region_id;
    
    if (!sectorsByRegion[regionId]) {
      sectorsByRegion[regionId] = [];
    }
    
    sectorsByRegion[regionId].push(sector);
  });
  
  if (loading) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }
  
  if (sectors.length === 0) {
    return (
      <div className="text-center py-8">
        <SectorFilters onRegionChange={handleRegionChange} />
        <p className="mt-4">{t('noSectorsFound')}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <SectorFilters onRegionChange={handleRegionChange} />
      
      {Object.entries(sectorsByRegion).map(([regionId, regionSectors]) => {
        // Get the region name from the first sector (they all have same region)
        const regionName = (regionSectors[0] as EnhancedSector).region_name || 'Unknown Region';
        
        return (
          <div key={regionId} className="space-y-4">
            <h2 className="text-xl font-semibold">{regionName}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regionSectors.map(sector => (
                <SectorCard 
                  key={sector.id} 
                  sector={sector} 
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SectorsContainer;
