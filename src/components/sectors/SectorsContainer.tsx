
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, RefreshCw } from 'lucide-react';
import { EnhancedSector } from '@/types/sector';
import { useToast } from '@/components/ui/use-toast';
import { useSectorsStore } from '@/hooks/useSectorsStore';
import { useTranslation } from '@/contexts/TranslationContext';
import AddSectorDialog from './AddSectorDialog';
import EditSectorDialog from './EditSectorDialog';
import DeleteSectorDialog from './DeleteSectorDialog';
import { Region } from '@/types/supabase';

interface RefreshResult {
  sectors: EnhancedSector[];
  regions: any[];
}

interface SectorActionHandlers {
  onEdit: (sector: EnhancedSector) => void;
  onDelete: (sector: EnhancedSector) => void;
}

export interface SectorsContainerProps {
  sectors: EnhancedSector[];
  isLoading: boolean;
  onRefresh: () => Promise<RefreshResult>;
}

const SectorsContainer: React.FC<SectorsContainerProps> = React.memo(function SectorsContainer({
  sectors: initialSectors,
  isLoading,
  onRefresh
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { createSector, updateSector, deleteSector } = useSectorsStore();
  
  const [sectors, setSectors] = useState<EnhancedSector[]>(initialSectors);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<EnhancedSector | null>(null);
  const [deletingSector, setDeletingSector] = useState<EnhancedSector | null>(null);

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { sectors: freshSectors, regions: freshRegions } = await onRefresh();
        setSectors(freshSectors);
        if (freshRegions) {
          setRegions(freshRegions);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: t('error'),
          description: t('sectors.loadError'),
          variant: 'destructive',
        });
      }
    };

    loadInitialData();
  }, [onRefresh, t]);

  // Memoize the refresh handler to prevent unnecessary re-renders
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const { sectors: freshSectors, regions: freshRegions } = await onRefresh();
      setSectors(freshSectors);
      if (freshRegions) {
        setRegions(freshRegions);
      }
    } catch (error) {
      console.error('Error refreshing sectors:', error);
      toast({
        title: t('error'),
        description: t('sectors.refreshError'),
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, t]);

  // Update local state when props change (in case parent re-renders with new data)
  useEffect(() => {
    setSectors(initialSectors);
  }, [initialSectors]);

  // handleRefresh moved to useCallback above

  const handleAddSector = async (sectorData: Partial<EnhancedSector>) => {
    try {
      const newSector = await createSector(sectorData as Omit<EnhancedSector, 'id' | 'created_at' | 'updated_at'>);
      setSectors(prev => [...prev, newSector]);
      toast({
        title: t('success'),
        description: t('sectors.createSuccess'),
      });
      return true;
    } catch (error) {
      console.error('Error adding sector:', error);
      toast({
        title: t('error'),
        description: t('sectors.createError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleUpdateSector = async (sectorData: Partial<EnhancedSector>) => {
    if (!sectorData.id) return false;
    try {
      const { id, ...updates } = sectorData;
      const updatedSector = await updateSector(id, updates);
      setSectors(prevSectors => 
        prevSectors.map(sector => sector.id === id ? updatedSector : sector)
      );
      setEditingSector(null);
      toast({
        title: t('success'),
        description: t('sectors.updateSuccess'),
      });
      return true;
    } catch (error) {
      console.error('Error updating sector:', error);
      toast({
        title: t('error'),
        description: t('sectors.updateError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleDeleteSector = async () => {
    if (!deletingSector) return false;
    
    try {
      await deleteSector(deletingSector.id);
      setSectors(prevSectors => prevSectors.filter(s => s.id !== deletingSector.id));
      setDeletingSector(null);
      toast({
        title: t('success'),
        description: t('sectors.deleteSuccess'),
      });
      return true;
    } catch (error) {
      console.error('Error deleting sector:', error);
      toast({
        title: t('error'),
        description: t('sectors.deleteError'),
        variant: 'destructive',
      });
      return false;
    }
  };

  if (isLoading || isRefreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Sector Dialog */}
      <AddSectorDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        regions={regions}
        onSubmit={handleAddSector}
        isSubmitting={isSubmitting}
      />

      {/* Edit Sector Dialog */}
      {editingSector && (
        <EditSectorDialog
          isOpen={!!editingSector}
          onClose={() => setEditingSector(null)}
          sector={editingSector}
          regions={regions}
          onSubmit={handleUpdateSector}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingSector && (
        <DeleteSectorDialog
          isOpen={!!deletingSector}
          onClose={() => setDeletingSector(null)}
          sector={deletingSector}
          onConfirm={handleDeleteSector}
          isSubmitting={isSubmitting}
        />
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('sectors.title')}</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('sectors.addSector')}
          </Button>
        </div>
      </div>

      {sectors.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            {t('sectors.noSectorsFound')}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t('sectors.noSectorsDescription')}
          </p>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('common.retry')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector) => (
            <Card key={sector.id} className="flex flex-col">
              <CardHeader className="flex-1">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{sector.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingSector(sector)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">{t('common.edit')}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingSector(sector)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t('common.delete')}</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2">
                  {sector.description && (
                    <p className="text-sm text-muted-foreground">{sector.description}</p>
                  )}
                  {sector.region_name && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Region:</span>
                      <span className="text-primary font-medium">{sector.region_name}</span>
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
});

SectorsContainer.displayName = 'SectorsContainer';

export default SectorsContainer;
