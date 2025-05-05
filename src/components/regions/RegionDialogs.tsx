import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/components/ui/use-toast';
import { useRegions } from '@/hooks/regions/useRegions';
import { RegionFormData } from '@/types/user';
import { toast } from 'sonner';
import RegionAdminDialog from './RegionAdminDialog';

interface AddRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
}

interface EditRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  region: any;
  isSubmitting: boolean;
}

interface DeleteRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  region: any;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const AddRegionDialog: React.FC<AddRegionDialogProps> = ({ isOpen, onClose, isSubmitting }) => {
  const { t } = useLanguage();
  const [name, setName] = React.useState('');
  const regionsStore = useRegions();
  const refreshRegions = regionsStore.refresh;

  const handleSaveRegion = async (data: any) => {
    if (!data) return;

    setIsSubmitting(true);
    try {
      const result = await regionsStore.addRegion(data); // createRegion əvəzinə addRegion

      if (result.success) {
        toast.success(t('regionCreatedSuccess'));
        refreshRegions();
        onClose();
      } else {
        toast.error(t('regionCreationError'), {
          description: result.error
        });
      }
    } catch (error: any) {
      console.error('Region yaradılarkən xəta:', error);
      toast.error(t('regionCreationError'), {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addRegion')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">{t('regionName')}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" onClick={() => handleSaveRegion({ name })} disabled={isSubmitting}>
            {isSubmitting ? t('creating') + '...' : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditRegionDialog: React.FC<EditRegionDialogProps> = ({ isOpen, onClose, region, isSubmitting }) => {
  const { t } = useLanguage();
  const [name, setName] = React.useState(region?.name || '');
  const regionsStore = useRegions();
  const refreshRegions = regionsStore.refresh;

  const handleSaveRegion = async (data: any) => {
    if (!data) return;

    setIsSubmitting(true);
    try {
      const result = await regionsStore.updateRegion(region.id, data);

      if (result.success) {
        toast.success(t('regionUpdatedSuccess'));
        refreshRegions();
        onClose();
      } else {
        toast.error(t('regionUpdateError'), {
          description: result.error
        });
      }
    } catch (error: any) {
      console.error('Region yenilənərkən xəta:', error);
      toast.error(t('regionUpdateError'), {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('editRegion')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">{t('regionName')}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" onClick={() => handleSaveRegion({ name })} disabled={isSubmitting}>
            {isSubmitting ? t('updating') + '...' : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteRegionDialog: React.FC<DeleteRegionDialogProps> = ({ isOpen, onClose, region, onConfirm, isSubmitting }) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('deleteRegion')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>{t('deleteRegionConfirmation')} <strong>{region?.name}</strong>?</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="destructive" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? t('deleting') + '...' : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface RegionAdminDialogProps {
  open: boolean;
  onClose: () => void;
  regionId: string | undefined;
}

const RegionAdminDialog: React.FC<RegionAdminDialogProps> = ({ open, onClose, regionId }) => {
  const { t } = useLanguage();
  const [adminEmail, setAdminEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const regionsStore = useRegions();
  const refreshRegions = regionsStore.refresh;

  const handleAssignAdmin = async () => {
    if (!adminEmail || !regionId) return;

    setIsSubmitting(true);
    try {
      const result = await regionsStore.assignRegionAdmin(regionId, adminEmail);

      if (result.success) {
        toast({
          title: t('adminAssigned'),
          description: t('adminAssignedDescription'),
        });
        refreshRegions();
        onClose();
      } else {
        toast({
          variant: 'destructive',
          title: t('adminAssignmentFailed'),
          description: result.error || t('unknownError'),
        });
      }
    } catch (error: any) {
      console.error('Admin təyin etmə xətası:', error);
      toast({
        variant: 'destructive',
        title: t('adminAssignmentFailed'),
        description: error.message || t('unknownError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('assignAdmin')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">{t('adminEmail')}</Label>
            <Input id="email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" onClick={handleAssignAdmin} disabled={isSubmitting}>
            {isSubmitting ? t('assigning') + '...' : t('assign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface RegionDialogsProps {
  regions: any[];
  loading: boolean;
  error: string;
  fetchRegions: (forceRefresh?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
  addRegion: (regionData: RegionFormData) => Promise<any>;
  updateRegion: (id: string, regionData: Partial<RegionFormData>) => Promise<any>;
  deleteRegion: (id: string) => Promise<any>;
}

const RegionDialogs: React.FC<RegionDialogsProps> = ({ regions, loading, error, fetchRegions, refresh, addRegion, updateRegion, deleteRegion }) => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = React.useState(false);
  const [selectedRegion, setSelectedRegion] = React.useState<any | null>(null);
  const [selectedRegionForAdmin, setSelectedRegionForAdmin] = React.useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleOpenAdminDialog = (regionId: string) => {
    setSelectedRegionForAdmin(regionId);
    setIsAdminDialogOpen(true);
  };

  return (
    <>
      <Button onClick={() => setIsAddDialogOpen(true)} disabled={loading}>
        {t('addRegion')}
      </Button>

      {/* Add Region Dialog */}
      <AddRegionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        isSubmitting={isSubmitting}
      />

      {/* Edit Region Dialog */}
      {selectedRegion && (
        <EditRegionDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          region={selectedRegion}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Region Dialog */}
      {selectedRegion && (
        <DeleteRegionDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          region={selectedRegion}
          onConfirm={async () => {
            if (!selectedRegion?.id) return;
            setIsSubmitting(true);
            try {
              await deleteRegion(selectedRegion.id);
              toast.success(t('regionDeletedSuccess'));
              await refresh();
            } catch (err: any) {
              toast.error(t('regionDeletionError'), {
                description: err.message
              });
            } finally {
              setIsSubmitting(false);
              setIsDeleteDialogOpen(false);
            }
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Region Admin Dialog */}
      {selectedRegionForAdmin && (
        <RegionAdminDialog
          open={isAdminDialogOpen}
          onClose={() => setIsAdminDialogOpen(false)}
          regionId={selectedRegionForAdmin}
        />
      )}

      {/* Actions */}
      {regions.map((region) => (
        <div key={region.id}>
          <Button onClick={() => {
            setSelectedRegion(region);
            setIsEditDialogOpen(true);
          }} disabled={loading}>
            {t('edit')}
          </Button>
          <Button onClick={() => {
            setSelectedRegion(region);
            setIsDeleteDialogOpen(true);
          }} disabled={loading}>
            {t('delete')}
          </Button>
          <Button onClick={() => handleOpenAdminDialog(region.id)} disabled={loading}>
            {t('assignAdmin')}
          </Button>
        </div>
      ))}
    </>
  );
};

export default RegionDialogs;
