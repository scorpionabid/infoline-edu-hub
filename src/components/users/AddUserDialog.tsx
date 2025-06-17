import React, { useState } from 'react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { UserRole } from '@/types/user';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner';
import { createUser } from '@/services/users/userService';
import { useToast } from '@/components/ui/use-toast';

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { tSafe } = useLanguageSafe();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createUser({
        full_name: fullName,
        email: email,
        password: password,
        role: role,
      });

      toast({
        title: tSafe('userCreated'),
        description: tSafe('userCreatedSuccessfully'),
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: tSafe('error'),
        description: error.message || tSafe('userCreationFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tSafe('createUser')}</DialogTitle>
          <DialogDescription>
            {tSafe('createUserDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{tSafe('fullName')}</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={tSafe('fullNamePlaceholder')}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{tSafe('email')}</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tSafe('emailPlaceholder')}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{tSafe('password')}</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tSafe('passwordPlaceholder')}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">{tSafe('role')}</Label>
            <Select onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder={tSafe('selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">{tSafe('superadmin')}</SelectItem>
                <SelectItem value="regionadmin">{tSafe('regionadmin')}</SelectItem>
                <SelectItem value="sectoradmin">{tSafe('sectoradmin')}</SelectItem>
                <SelectItem value="schooladmin">{tSafe('schooladmin')}</SelectItem>
                <SelectItem value="teacher">{tSafe('teacher')}</SelectItem>
                <SelectItem value="user">{tSafe('user')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? tSafe('creating') : tSafe('createUser')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
