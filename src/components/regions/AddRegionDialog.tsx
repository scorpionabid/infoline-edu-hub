
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

interface AddRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRegion: (name: string, description: string) => void;
  isLoading: boolean;
}

const AddRegionDialog: React.FC<AddRegionDialogProps> = ({
  isOpen,
  onClose,
  onAddRegion,
  isLoading,
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSubmit = () => {
    onAddRegion(name, description);
    setName('');
    setDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Region</DialogTitle>
          <DialogDescription>
            Enter the details for the new region.
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
            {isLoading ? 'Adding...' : 'Add Region'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRegionDialog;
