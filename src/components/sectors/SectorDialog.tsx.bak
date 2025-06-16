
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from '@/context/LanguageContext';
import { Sector } from '@/types/supabase';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectorId?: string;
}

const SectorDialog: React.FC<SectorDialogProps> = ({ 
  open, 
  onOpenChange,
  sectorId
}) => {
  const { t } = useLanguage();
  const [sector, setSector] = React.useState<Sector | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && sectorId) {
      loadSector(sectorId);
    }
  }, [open, sectorId]);

  const loadSector = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSector(data);
    } catch (error: any) {
      console.error('Error loading sector:', error);
      toast.error(t('errorLoadingSector'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {sectorId ? t('viewSector') : t('addSector')}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {sector ? (
              <>
                <div>
                  <h3 className="font-medium">{t('name')}</h3>
                  <p>{sector.name}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">{t('description')}</h3>
                  <p>{sector.description || t('noDescription')}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">{t('status')}</h3>
                    <p>{t(sector.status || 'active')}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">{t('completionRate')}</h3>
                    <p>{sector.completion_rate || 0}%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">{t('createdAt')}</h3>
                    <p>{new Date(sector.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">{t('updatedAt')}</h3>
                    <p>{sector.updated_at ? new Date(sector.updated_at).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
              </>
            ) : !sectorId ? (
              <p>{t('addSectorDescription')}</p>
            ) : (
              <p>{t('sectorNotFound')}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SectorDialog;
