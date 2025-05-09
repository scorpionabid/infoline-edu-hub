
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
}

interface EditRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEditRegion: (id: string, name: string, description: string) => void;
  region: Region | null;
  isLoading: boolean;
}

const EditRegionDialog: React.FC<EditRegionDialogProps> = ({
  isOpen,
  onClose,
  onEditRegion,
  region,
  isLoading,
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    if (region) {
      setName(region.name || '');
      setDescription(region.description || '');
    }
  }, [region]);

  const handleSubmit = () => {
    if (region?.id) {
      onEditRegion(region.id, name, description);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Region</DialogTitle>
          <DialogDescription>
            Update the region details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Region name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Region description"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
            {isLoading ? 'Updating...' : 'Update Region'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRegionDialog;
