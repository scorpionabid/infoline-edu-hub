import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSchoolsContext } from '@/context/SchoolsContext';
import { School } from '@/types/school';

interface CreateSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  regionId?: string;
  sectorId?: string;
}

const CreateSchoolDialog: React.FC<CreateSchoolDialogProps> = ({ isOpen, onClose, regionId, sectorId }) => {
  const { createSchool, isLoading } = useSchoolsContext();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    if (!name || !regionId || !sectorId) {
      alert('Name, Region and Sector are required.');
      return;
    }

    const newSchool: Omit<School, 'id'> = {
      name,
      address,
      principalName,
      phone,
      email,
      region_id: regionId,
      sector_id: sectorId,
      status: 'active',
      admin_id: null,
    };

    try {
      await createSchool(newSchool);
      onClose();
    } catch (error) {
      console.error('Error creating school:', error);
      alert('Failed to create school.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create School</DialogTitle>
          <DialogDescription>
            Add a new school to the system. Make sure to fill all the fields.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="principalName" className="text-right">
              Principal Name
            </Label>
            <Input
              id="principalName"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create School'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolDialog;
