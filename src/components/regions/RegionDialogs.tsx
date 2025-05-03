import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useRegions } from '@/hooks/regions/useRegions';
import { Region } from '@/types/region';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import RegionAdminDialog from './RegionAdminDialog';

interface AddRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: () => void;
}

export const AddRegionDialog: React.FC<AddRegionDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { addRegion, isLoading, error, setError } = useRegions();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleAddRegion = async () => {
    if (!name) {
      setError('Name is required');
      return;
    }

    const success = await addRegion({ name, description });
    if (success) {
      toast({
        title: t('regionAdded'),
        description: t('regionAddedSuccessfully'),
      });
      onAdd && onAdd();
      onClose();
    } else if (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addRegion')}</DialogTitle>
          <DialogDescription>
            {t('createRegion')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>{t('error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t('cancel')}</Button>
          </DialogClose>
          <Button onClick={handleAddRegion} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('adding')}...
              </>
            ) : (
              t('add')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  region: Region;
  onEdit?: () => void;
}

export const EditRegionDialog: React.FC<EditRegionDialogProps> = ({
  isOpen,
  onClose,
  region,
  onEdit,
}) => {
  const [name, setName] = useState(region.name);
  const [description, setDescription] = useState(region.description || '');
  const { updateRegion, isLoading, error, setError } = useRegions();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleEditRegion = async () => {
    if (!name) {
      setError('Name is required');
      return;
    }

    const success = await updateRegion({ ...region, name, description });
    if (success) {
      toast({
        title: t('regionUpdated'),
        description: t('regionUpdatedSuccessfully'),
      });
      onEdit && onEdit();
      onClose();
    } else if (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('editRegion')}</DialogTitle>
          <DialogDescription>
            {t('updateRegionDetails')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>{t('error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t('cancel')}</Button>
          </DialogClose>
          <Button onClick={handleEditRegion} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('updating')}...
              </>
            ) : (
              t('update')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  region: Region;
  onDelete?: () => void;
}

export const DeleteRegionDialog: React.FC<DeleteRegionDialogProps> = ({
  isOpen,
  onClose,
  region,
  onDelete,
}) => {
  const { deleteRegion, isLoading, error, setError } = useRegions();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleDeleteRegion = async () => {
    const success = await deleteRegion(region.id);
    if (success) {
      toast({
        title: t('regionDeleted'),
        description: t('regionDeletedSuccessfully'),
      });
      onDelete && onDelete();
      onClose();
    } else if (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('deleteRegion')}</DialogTitle>
          <DialogDescription>
            {t('confirmDeleteRegion')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Alert
            variant="default"
            className="my-4"
          >
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>{t('warning')}</AlertTitle>
            <AlertDescription>
              {t('deleteRegionWarning')}
            </AlertDescription>
          </Alert>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>{t('error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t('cancel')}</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDeleteRegion} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('deleting')}...
              </>
            ) : (
              t('delete')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface RegionDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    region: Region;
}

export const RegionDetailsDialog: React.FC<RegionDetailsDialogProps> = ({ isOpen, onClose, region }) => {
    const { t } = useLanguage();
    const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{t('regionDetails')}</DialogTitle>
                    <DialogDescription>
                        {t('regionDetailsDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>{t('name')}</Label>
                        <Input value={region.name} readOnly />
                    </div>
                    <div className="grid gap-2">
                        <Label>{t('description')}</Label>
                        <Textarea value={region.description} readOnly />
                    </div>
                    <div className="border rounded-md p-4">
                        <h4 className="text-sm font-medium">{t('adminDetails')}</h4>
                        {region.admin_email ? (
                            <div className="mt-2">
                                <Label>{t('adminEmail')}</Label>
                                <Input value={region.admin_email} readOnly />
                            </div>
                        ) : (
                            <div className="mt-2">
                                <Alert variant="default">
                                    <AlertDescription>{t('noAdminAssigned')}</AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    {region.admin_email ? (
                        <Button variant="destructive" onClick={() => { }}>
                            {t('removeAdmin')}
                        </Button>
                    ) : (
                        <Button onClick={() => setIsAddAdminDialogOpen(true)}>
                            {t('addAdmin')}
                        </Button>
                    )}
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">{t('close')}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
            <RegionAdminDialog
                isOpen={isAddAdminDialogOpen}
                onClose={() => setIsAddAdminDialogOpen(false)}
                regionId={region.id}
            />
        </Dialog>
    );
};
