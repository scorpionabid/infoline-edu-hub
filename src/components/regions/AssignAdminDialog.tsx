
import React, { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Region {
  id: string;
  name: string;
}

interface AssignAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignAdmin: (regionId: string, userId: string) => void;
  region: Region | null;
  users: User[];
  isLoading: boolean;
}

const AssignAdminDialog: React.FC<AssignAdminDialogProps> = ({
  isOpen,
  onClose,
  onAssignAdmin,
  region,
  users,
  isLoading,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId('');
    }
  }, [isOpen]);

  const handleAssign = () => {
    if (!region?.id) {
      toast({
        title: 'Error',
        description: 'No region selected',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedUserId) {
      toast({
        title: 'Error',
        description: 'No user selected',
        variant: 'destructive',
      });
      return;
    }

    onAssignAdmin(region.id, selectedUserId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Region Admin</DialogTitle>
          <DialogDescription>
            Assign an admin for the region: {region?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="user">Select User</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading || !selectedUserId}>
            {isLoading ? 'Assigning...' : 'Assign Admin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignAdminDialog;
