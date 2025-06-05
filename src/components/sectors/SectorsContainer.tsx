
import React, { useState } from 'react';
import { useSectorsQuery } from '@/hooks/api/sectors/useSectorsQuery';
import { SectorsList } from './SectorsList';
import { SectorForm } from './SectorForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle } from 'lucide-react';

export const SectorsContainer: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingSector, setEditingSector] = useState<any>(null);

  const {
    sectors,
    loading,
    isLoading,
    isError,
    error,
    refetch
  } = useSectorsQuery();

  if (loading || isLoading) {
    return <LoadingSpinner />;
  }

  if (isError && error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading sectors: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const handleEdit = (sector: any) => {
    setEditingSector(sector);
    setShowForm(true);
  };

  const handleDelete = async (sectorId: string) => {
    console.log('Delete sector called for:', sectorId);
    // This should be implemented when the mutation is added to the hook
  };

  const handleFormSubmit = async (sectorData: any) => {
    try {
      if (editingSector) {
        // Update sector
        console.log('Update sector:', editingSector.id, sectorData);
      } else {
        // Create sector  
        console.log('Create sector:', sectorData);
      }
      
      setShowForm(false);
      setEditingSector(null);
      await refetch();
    } catch (error) {
      console.error('Error submitting sector form:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSector(null);
  };

  if (showForm) {
    return (
      <SectorForm
        sector={editingSector}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sectors</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sector
        </Button>
      </div>
      
      <SectorsList 
        sectors={sectors}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default SectorsContainer;
