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
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth';

interface RegionAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  regionId: string;
}

export const RegionAdminDialog: React.FC<RegionAdminDialogProps> = ({
  isOpen,
  onClose,
  regionId,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createUser } = useAuth();
  const { toast } = useToast();

  const handleAddRegionAdmin = async () => {
    try {
      setIsSubmitting(true);
      const result = await createUser({
        email,
        full_name: name,
        password,
        role: 'regionadmin',
        region_id: regionId,
      });

      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Xəta!',
          description: `İstifadəçi yaradıla bilmədi: ${result.error.message}`,
        });
      } else {
        toast({
          title: 'Uğurlu!',
          description: 'İstifadəçi uğurla əlavə edildi.',
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Xəta!',
        description: `Gözlənilməz xəta baş verdi: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Region Admin</DialogTitle>
          <DialogDescription>
            Region admin məlumatlarını daxil edin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input
              id="name"
              placeholder="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="admin@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Şifrə</Label>
            <Input
              id="password"
              placeholder="Şifrə"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Ləğv et</Button>
          </DialogClose>
          <Button onClick={handleAddRegionAdmin} disabled={isSubmitting}>
            {isSubmitting ? 'Yaratılır...' : 'Yarat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
