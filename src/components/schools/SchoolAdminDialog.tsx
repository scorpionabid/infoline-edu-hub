
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { School } from '@/types/school';

interface SchoolAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  onSubmit: (adminData: any) => Promise<void>;
  isSubmitting: boolean;
}

export const SchoolAdminDialog: React.FC<SchoolAdminDialogProps> = ({
  isOpen,
  onClose,
  school,
  onSubmit,
  // isSubmitting
}) => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email: adminEmail, name: adminName, schoolId: school.id });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>"{school.name}" məktəbinə admin təyin et</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="adminName">Admin adı</Label>
            <Input
              id="adminName"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Admin adını daxil edin"
              // required
            />
          </div>
          <div>
            <Label htmlFor="adminEmail">Admin email</Label>
            <Input
              id="adminEmail"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@example.com"
              // required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Təyin edilir...' : 'Təyin et'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolAdminDialog;
