
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { Sector, EnhancedSector } from '@/types/supabase';
import SectorCard from './SectorCard';
import { toast } from 'sonner';
import SectorFilters from './SectorFilters';

const SectorsContainer: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch sectors from the API
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoading(true);
        // Simulate API call
        const mockSectors: EnhancedSector[] = [
          {
            id: '1',
            name: 'Sector 1',
            description: 'First sector description',
            region_id: 'region1',
            region_name: 'Region A',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'active',
            school_count: 15,
            completion_rate: 75
          },
          {
            id: '2',
            name: 'Sector 2',
            description: 'Second sector description',
            region_id: 'region1',
            region_name: 'Region A', 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'inactive',
            school_count: 8,
            completion_rate: 45
          }
        ];
        
        // Fixed: properly set the state with the loaded sectors
        setSectors(mockSectors);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sectors:', error);
        toast.error('Failed to load sectors');
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  // Filter sectors based on search query and status filter
  const filteredSectors = sectors.filter(sector => {
    const matchesSearch = sector.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sector.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddSector = () => {
    toast.info('Add sector functionality not implemented yet');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sectors</h1>
        <Button onClick={handleAddSector}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Sector
        </Button>
      </div>

      <SectorFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {filteredSectors.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No sectors found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSectors.map((sector) => (
            <SectorCard 
              key={sector.id} 
              sector={sector} 
              onClick={() => toast.info(`Clicked on ${sector.name}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SectorsContainer;
