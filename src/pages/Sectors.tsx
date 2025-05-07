
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSectorsStore } from '@/hooks/useSectorsStore';
import SectorDialog from '@/components/sectors/SectorDialog';
import { SectorAdminDialog } from '@/components/sectors/SectorAdminDialog';
import SectorHeader from '@/components/sectors/SectorHeader';
import SectorsContainer from '@/components/sectors/SectorsContainer';

const Sectors = () => {
  const { t } = useLanguage();
  const { fetchSectors } = useSectorsStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSectors = async () => {
      setIsLoading(true);
      await fetchSectors();
      setIsLoading(false);
    };

    loadSectors();
  }, [fetchSectors]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <SectorHeader />
      <SectorsContainer isLoading={isLoading} />
    </div>
  );
};

export default Sectors;
